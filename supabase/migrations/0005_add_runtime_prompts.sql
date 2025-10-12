-- Add runtime_prompts column to store which fields should prompt at runtime
-- Structure: { headers: ["Authorization"], queryParams: ["orderId"], body: true }

alter table api_requests
add column if not exists runtime_prompts jsonb default '{}'::jsonb;

-- Add comment for documentation
comment on column api_requests.runtime_prompts is 'Configuration for fields that should prompt for values at runtime. Format: { headers: string[], queryParams: string[], body: boolean }';

