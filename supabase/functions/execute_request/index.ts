import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

interface ExecutePayload {
  requestId: string;
  parameters: Record<string, unknown>;
  runtimeHeaders?: Record<string, string>;
  runtimeQueryParams?: Record<string, string>;
  runtimeBody?: any;
}

interface ApiRequest {
  id: string;
  owner_id: string;
  name: string;
  method: string;
  url: string;
  headers: Record<string, string> | null;
  query_params: Record<string, string> | null;
  body_template: any;
  timeout_ms: number;
  secret_bindings: Record<string, string> | null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Substitutes placeholders like {{paramName}} or {{MY-SECRET-KEY}} with actual values
 */
function substitutePlaceholders(
  template: string,
  parameters: Record<string, unknown>,
  secrets: Record<string, string> = {}
): string {
  // Match letters, numbers, underscores, and hyphens
  return template.replace(/\{\{([\w-]+)\}\}/g, (match, key) => {
    if (key in parameters) {
      return String(parameters[key]);
    }
    if (key in secrets) {
      return secrets[key];
    }
    // Keep placeholder if no value found
    return match;
  });
}

/**
 * Extracts all placeholder names from templates (e.g., {{SECRET_NAME}} or {{MY-SECRET-KEY}})
 */
function extractPlaceholders(templates: string[]): Set<string> {
  const placeholders = new Set<string>();
  // Match letters, numbers, underscores, and hyphens
  const regex = /\{\{([\w-]+)\}\}/g;
  
  for (const template of templates) {
    let match;
    while ((match = regex.exec(template)) !== null) {
      placeholders.add(match[1]);
    }
  }
  
  return placeholders;
}

/**
 * Redacts secret values from a string by replacing them with [REDACTED]
 */
function redactSecrets(text: string, secrets: Record<string, string>): string {
  let redacted = text;
  
  // Replace each secret value with [REDACTED]
  Object.entries(secrets).forEach(([key, value]) => {
    if (value) {
      // Escape special regex characters in the secret value
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedValue, 'g');
      redacted = redacted.replace(regex, `[REDACTED:${key}]`);
    }
  });
  
  return redacted;
}

/**
 * Fetches all user secrets and returns them as a lookup map
 */
async function resolveSecrets(
  supabaseClient: any,
  ownerId: string,
  placeholderNames: Set<string>
): Promise<Record<string, string>> {
  if (placeholderNames.size === 0) return {};
  
  const secrets: Record<string, string> = {};
  const aliases = Array.from(placeholderNames);
  
  // Fetch secret metadata including vault IDs for all potential secret names
  const { data: secretMetadata, error } = await supabaseClient
    .from("secret_metadata")
    .select("alias, vault_id")
    .eq("owner_id", ownerId)
    .in("alias", aliases);
  
  if (error) {
    console.error("Failed to fetch secret metadata:", error);
    return {};
  }
  
  if (!secretMetadata || secretMetadata.length === 0) {
    console.log("No secrets found for placeholders:", aliases);
    return {};
  }
  
  // Fetch decrypted secrets from vault
  for (const meta of secretMetadata) {
    if (!meta.vault_id) continue;
    
    const { data: decryptedData, error: vaultError } = await supabaseClient
      .rpc("read_secret", { secret_id: meta.vault_id });
    
    if (!vaultError && decryptedData) {
      secrets[meta.alias] = decryptedData;
      console.log(`Resolved secret: ${meta.alias}`);
    } else {
      console.error(`Failed to read secret ${meta.alias}:`, vaultError);
    }
  }
  
  return secrets;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405,
      headers: corsHeaders,
    });
  }

  const startTime = Date.now();
  let executionId: string | null = null;

  try {
    const payload = (await req.json()) as ExecutePayload;
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }), 
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    // Fetch request definition
    const { data: requestDefinition, error: fetchError } = await supabaseClient
      .from("api_requests")
      .select("*")
      .eq("id", payload.requestId)
      .maybeSingle();

    if (fetchError || !requestDefinition) {
      return new Response(
        JSON.stringify({ error: fetchError?.message ?? "Request not found" }), 
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const apiRequest = requestDefinition as ApiRequest;

    // Extract all placeholders from URL, headers, query params, and body
    const templateStrings: string[] = [apiRequest.url];
    
    if (apiRequest.headers) {
      templateStrings.push(...Object.values(apiRequest.headers));
    }
    if (apiRequest.query_params) {
      templateStrings.push(...Object.values(apiRequest.query_params));
    }
    if (apiRequest.body_template) {
      templateStrings.push(JSON.stringify(apiRequest.body_template));
    }
    
    const placeholders = extractPlaceholders(templateStrings);
    console.log("Extracted placeholders:", Array.from(placeholders));
    
    // Resolve secrets from Vault (automatically looks up all placeholders)
    const secrets = await resolveSecrets(
      supabaseClient,
      apiRequest.owner_id,
      placeholders
    );
    
    console.log("Resolved secrets count:", Object.keys(secrets).length);

    // Build the URL with substituted parameters and query params
    let targetUrl = substitutePlaceholders(
      apiRequest.url, 
      payload.parameters, 
      secrets
    );

    // Add query parameters if present (merge static + runtime)
    if (apiRequest.query_params || payload.runtimeQueryParams) {
      const url = new URL(targetUrl);
      
      // First add static query params with substitution
      if (apiRequest.query_params) {
        Object.entries(apiRequest.query_params).forEach(([key, value]) => {
          const substitutedValue = substitutePlaceholders(
            value, 
            payload.parameters, 
            secrets
          );
          url.searchParams.set(key, substitutedValue);
        });
      }
      
      // Then add/override with runtime query params
      if (payload.runtimeQueryParams) {
        Object.entries(payload.runtimeQueryParams).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }
      
      targetUrl = url.toString();
    }

    // Build headers (merge static + runtime)
    const requestHeaders = new Headers();
    
    // First add static headers with substitution
    if (apiRequest.headers) {
      Object.entries(apiRequest.headers).forEach(([key, value]) => {
        const substitutedValue = substitutePlaceholders(
          value, 
          payload.parameters, 
          secrets
        );
        requestHeaders.set(key, substitutedValue);
      });
    }
    
    // Then add/override with runtime headers
    if (payload.runtimeHeaders) {
      Object.entries(payload.runtimeHeaders).forEach(([key, value]) => {
        requestHeaders.set(key, value);
      });
    }

    // Build request body (runtime takes precedence)
    let requestBody: string | undefined;
    if (apiRequest.method !== "GET") {
      if (payload.runtimeBody) {
        // Use runtime body if provided
        requestBody = typeof payload.runtimeBody === "string" 
          ? payload.runtimeBody 
          : JSON.stringify(payload.runtimeBody);
      } else if (apiRequest.body_template) {
        // Use static body template with substitution
        const bodyString = JSON.stringify(apiRequest.body_template);
        const substitutedBody = substitutePlaceholders(
          bodyString, 
          payload.parameters, 
          secrets
        );
        requestBody = substitutedBody;
      }
      
      // Set content-type if not already set and we have a body
      if (requestBody && !requestHeaders.has("content-type")) {
        requestHeaders.set("content-type", "application/json");
      }
    }

    // Execute the HTTP request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(), 
      apiRequest.timeout_ms || 10000
    );

    let response: Response;
    let httpError: Error | null = null;

    try {
      response = await fetch(targetUrl, {
        method: apiRequest.method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      });
    } catch (error) {
      httpError = error as Error;
      
      // Create a fake response for timeout/network errors
      response = new Response(
        JSON.stringify({ 
          error: httpError.name === "AbortError" 
            ? "Request timeout" 
            : httpError.message 
        }),
        { 
          status: httpError.name === "AbortError" ? 408 : 500,
          headers: { "content-type": "application/json" }
        }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Read response body
    const responseText = await response.text();
    let responseData: any;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    const duration = Date.now() - startTime;

    // Determine execution status
    const isSuccess = response.ok && !httpError;
    const status = httpError?.name === "AbortError" 
      ? "timeout" 
      : isSuccess 
        ? "success" 
        : response.status >= 500 
          ? "error" 
          : "failure";

    // Convert response headers to JSON object
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Convert request headers to JSON object and REDACT SECRETS
    const requestHeadersObj: Record<string, string> = {};
    requestHeaders.forEach((value, key) => {
      // Redact any secret values from headers before storing
      requestHeadersObj[key] = redactSecrets(value, secrets);
    });

    // Truncate response body to 100KB for storage (roughly 100,000 chars)
    const maxBodyLength = 100000;
    const responseBodyToStore = responseText.length > maxBodyLength
      ? responseText.substring(0, maxBodyLength) + "\n\n... [Response truncated]"
      : responseText;
    
    // REDACT secrets from URL before storing
    const redactedUrl = redactSecrets(targetUrl, secrets);
    
    // REDACT secrets from request body before storing
    const redactedRequestBody = requestBody ? redactSecrets(requestBody, secrets) : null;

    // Log execution to database (with secrets REDACTED)
    const { data: execution } = await supabaseClient
      .from("request_executions")
      .insert({
        request_id: apiRequest.id,
        owner_id: apiRequest.owner_id,
        status,
        http_status: response.status,
        duration_ms: duration,
        response_excerpt: typeof responseData === "string" 
          ? responseData.substring(0, 500)
          : JSON.stringify(responseData).substring(0, 500),
        response_body: responseBodyToStore,
        response_headers: responseHeaders,
        request_headers: requestHeadersObj,  // Already redacted
        request_body: redactedRequestBody,    // Redacted
        final_url: redactedUrl,               // Redacted
        error_message: httpError?.message || (!isSuccess ? `HTTP ${response.status}` : null),
        parameters_used: payload.parameters,
      })
      .select("id")
      .single();

    executionId = execution?.id;

    // Return response to client
    return new Response(
      JSON.stringify({
        success: isSuccess,
        status,
        executionId,
        httpStatus: response.status,
        duration,
        data: responseData,
        error: httpError?.message,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: (error as Error).message,
        executionId,
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
