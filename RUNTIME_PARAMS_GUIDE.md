# Runtime Dynamic Parameters - Usage Guide

## Overview

You can now mark specific headers, query parameters, and the request body to be **prompted at runtime** instead of having static values. This is useful when you need to provide different values each time you execute a request.

---

## Key Concepts

- **`{{SECRET_NAME}}`**: Reserved for secrets stored in Supabase Vault (e.g., `{{API_KEY}}`)
- **Prompt at Runtime**: Checkbox option to provide values when executing the request
- **Last Value Memory**: Values are automatically saved in your browser and restored next time
- **Paste Button**: Quickly paste values from your clipboard

---

## Creating a Request with Runtime Parameters

### Step 1: Define Your Request

Navigate to `/requests/new` and fill in the basic information (name, method, URL).

### Step 2: Configure Headers

For each header:
1. Enter the header name (e.g., `Authorization`)
2. Either:
   - **Static value**: Enter the value (e.g., `Bearer {{API_KEY}}`)
   - **Runtime prompt**: Check "Prompt at runtime" (value field will be disabled)

**Example:**
```
Header Name: Authorization
☑ Prompt at runtime
```

### Step 3: Configure Query Parameters

Same process as headers:
1. Enter the parameter name (e.g., `userId`)
2. Either enter a static value or check "Prompt at runtime"

**Example:**
```
Parameter Name: orderId
☑ Prompt at runtime
```

### Step 4: Configure Request Body (POST/PUT/PATCH/DELETE only)

At the top of the body section, you'll see a checkbox:
- **Unchecked**: Provide a static JSON template now
- **Checked**: Body will be prompted at runtime

**Example - Static with secrets:**
```json
{
  "apiKey": "{{MY_API_KEY}}",
  "action": "create"
}
```

**Example - Runtime prompt:**
```
☑ Prompt at runtime
(Body field is disabled - you'll provide it when executing)
```

---

## Executing a Request with Runtime Parameters

### The Execution Panel

When you visit a request detail page (`/requests/{id}`), the right panel will show:

1. **All runtime fields** you configured
2. **Last used values** (auto-loaded from localStorage)
3. **Paste buttons** for each field

### Providing Values

#### For Headers and Query Params:
```
Header: Authorization                  [runtime]
[Bearer token_12345...        ] [📋 Paste]
```

#### For Body:
```
Request Body (JSON)                    [runtime]
┌────────────────────────────────────┐
│ {                                  │
│   "userId": "123",                 │
│   "action": "update"               │
│ }                                  │
└────────────────────────────────────┘
                            [📋 Paste]
```

### Using the Paste Button

1. Copy your value to clipboard
2. Click the **📋 Paste** button
3. Value is automatically inserted

### Executing

Click **Run Request** - the Edge Function will:
1. Merge runtime values with static configuration
2. Resolve `{{SECRET_NAME}}` placeholders from Vault
3. Execute the HTTP request
4. Save your runtime values for next time

---

## Examples

### Example 1: API with Dynamic Authorization Token

**Setup:**
- URL: `https://api.example.com/users`
- Header: `Authorization` ☑ Prompt at runtime
- Header: `Content-Type` = `application/json` (static)

**Execution:**
```
Header: Authorization
[Bearer eyJhbGc...] [Paste]

[Run Request]
```

### Example 2: REST API with Dynamic User ID

**Setup:**
- URL: `https://api.example.com/users/{{userId}}`  ← This uses a secret!
- Query Param: `orderId` ☑ Prompt at runtime
- Method: GET

**Execution:**
```
Param: orderId
[ORD-12345] [Paste]

[Run Request]
```

The Edge Function will:
- Replace `{{userId}}` with secret from Vault
- Add `?orderId=ORD-12345` to URL

### Example 3: Dynamic JSON Body

**Setup:**
- URL: `https://api.example.com/actions`
- Method: POST
- Body: ☑ Prompt at runtime

**Execution:**
```
Request Body (JSON)
{
  "action": "transfer",
  "from": "account_123",
  "to": "account_456",
  "amount": 100.50
}
[Paste]

[Run Request]
```

---

## Tips

### Combining Static, Runtime, and Secrets

You can mix all three in one request:

- **Static headers**: `Content-Type: application/json`
- **Secret headers**: `X-API-Key: {{PROD_API_KEY}}`
- **Runtime headers**: `Authorization` (checked for runtime)

### localStorage Persistence

- Runtime values are saved per-request in `localStorage`
- Key format: `runtime-values-{requestId}`
- Survives browser refresh
- Cleared when you clear browser data

### When to Use Runtime vs Secrets

| Use Runtime When | Use Secrets When |
|------------------|------------------|
| Values change per execution | Value rarely changes |
| Testing different inputs | API keys, tokens |
| User IDs, Order IDs | OAuth tokens |
| Temporary data | Production credentials |
| Copy-paste from elsewhere | Sensitive information |

---

## Troubleshooting

### "Will prompt at runtime" shows in disabled field

✅ This is correct! The field is disabled because you'll provide the value when executing.

### My values aren't saving

- Check browser localStorage is enabled
- Values are per-request (different requests have separate storage)
- Values don't sync across browsers/devices

### Body must be valid JSON

- When providing runtime body, ensure it's valid JSON
- Use a JSON validator if needed
- The Edge Function will try to parse it

---

## Architecture Notes

### How It Works

1. **Request Creation**: `runtime_prompts` column stores `{ headers: [...], queryParams: [...], body: true/false }`
2. **Execution Panel**: Reads `runtime_prompts` and builds form fields dynamically
3. **localStorage**: Auto-saves/loads values using `runtime-values-{requestId}` key
4. **Edge Function**: Receives `{ requestId, parameters: { headers: {...}, queryParams: {...}, body: {...} } }`
5. **Substitution**: Runtime values and secrets are merged before HTTP request

### Data Flow

```
User Input → Form State → localStorage (save)
                       ↓
              Submit Handler (build parameters)
                       ↓
              Edge Function (merge with static config)
                       ↓
              HTTP Request (with all values)
```

---

Happy automating! 🚀

