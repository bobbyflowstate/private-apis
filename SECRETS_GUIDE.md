# Secrets Management with Supabase Vault ✅

Your app now has **fully functional secret management** using Supabase Vault for encrypted storage!

---

## ✅ What's Working

1. **Supabase Vault** - Enabled and ready
2. **Secret Storage** - Encrypted at rest in the database
3. **Secret Management UI** - Add, view, and delete secrets
4. **Edge Function Integration** - Secrets automatically injected into requests

---

## 🔐 How to Use Secrets

### Step 1: Add a Secret

1. Go to **Settings** page (`/settings`)
2. Find the "Secrets Vault" section
3. Click **"Add Secret"**
4. Fill in the form:
   - **Secret Name**: Use UPPERCASE_WITH_UNDERSCORES (e.g., `API_KEY`, `OAUTH_TOKEN`)
   - **Secret Value**: The actual API key or token
   - **Description**: Optional note about what this secret is for

5. Click **"Add Secret"**

The secret is now encrypted and stored in Supabase Vault! 🔒

### Step 2: Reference Secrets in Requests

When creating or editing a request, you can reference secrets using the same `{{SECRET_NAME}}` syntax:

**Example 1: In Headers**
```
Authorization: Bearer {{API_KEY}}
X-API-Token: {{OAUTH_TOKEN}}
```

**Example 2: In URL**
```
https://api.example.com/data?key={{API_KEY}}
```

**Example 3: In Request Body**
```json
{
  "apiKey": "{{API_KEY}}",
  "clientSecret": "{{CLIENT_SECRET}}"
}
```

### Step 3: Execute the Request

When you run the request, the Edge Function will:
1. ✅ Look up the secret from Vault
2. ✅ Decrypt it securely
3. ✅ Substitute `{{API_KEY}}` with the actual value
4. ✅ Make the API request
5. ✅ **The secret never appears in logs or responses!**

---

## 🧪 Testing with Secrets

### Test with httpbin.org:

1. **Add a test secret:**
   - Name: `TEST_API_KEY`
   - Value: `my-secret-key-12345`
   - Description: Testing secret substitution

2. **Create a request:**
   - **URL**: `https://httpbin.org/headers`
   - **Method**: GET
   - **Headers**: `X-API-Key` = `{{TEST_API_KEY}}`

3. **Run the request**

4. **Check the response** - you should see your secret value in the headers!

---

## 🔒 Security Features

### ✅ What's Secure:
- **Encrypted at rest** - Secrets are encrypted in the database
- **Decrypted only when needed** - Only the Edge Function can decrypt
- **Never logged** - Secrets don't appear in execution logs
- **User-isolated** - Each user can only access their own secrets
- **RLS protected** - Row Level Security policies enforce access

### ⚠️ Important Notes:
- **Secrets are one-way** - Once stored, you can't view the original value (only delete and re-add)
- **Use unique names** - Secret names must be unique per user
- **Edge Function only** - Secrets can only be accessed by the Edge Function, not client-side code

---

## 📝 Example Use Cases

### 1. API Key Authentication
```
Headers:
  X-API-Key: {{WEATHER_API_KEY}}
```

### 2. Bearer Token Authentication
```
Headers:
  Authorization: Bearer {{GITHUB_TOKEN}}
```

### 3. OAuth Client Credentials
```
Body:
{
  "client_id": "{{OAUTH_CLIENT_ID}}",
  "client_secret": "{{OAUTH_CLIENT_SECRET}}",
  "grant_type": "client_credentials"
}
```

### 4. Multiple Secrets in One Request
```
URL: https://api.example.com/data

Headers:
  Authorization: Bearer {{ACCESS_TOKEN}}
  X-API-Key: {{API_KEY}}
  X-Client-ID: {{CLIENT_ID}}
```

---

## 🔄 Secret Lifecycle

### Adding a Secret
1. User enters secret in UI
2. Frontend calls `store_secret` RPC function
3. Supabase Vault encrypts and stores the value
4. Metadata saved with owner_id and vault_id

### Using a Secret
1. Request contains `{{SECRET_NAME}}`
2. Edge Function looks up secret by alias
3. Vault decrypts the secret
4. Value substituted into request
5. Request sent with real secret value

### Deleting a Secret
1. User clicks delete button
2. Metadata row deleted from database
3. Vault entry remains (but unusable)
4. Secret can no longer be referenced

---

## 🐛 Troubleshooting

### Secret not being substituted?
- ✅ Check the secret name matches exactly (case-sensitive)
- ✅ Ensure secret was created successfully (check Settings page)
- ✅ Verify syntax is correct: `{{SECRET_NAME}}` (double curly braces)

### "Failed to store secret" error?
- ✅ Check you're logged in
- ✅ Ensure Vault extension is enabled (`supabase db push`)
- ✅ Try a different secret name (must be unique)

### Secret showing as encrypted but not working?
- ✅ Edge Function must be redeployed with Vault support
- ✅ Check Edge Function logs: `supabase functions logs execute_request`

---

## 🎯 Next Steps

Now that secrets are working:

1. ✅ Add your real API keys to the Vault
2. ✅ Update your requests to use `{{SECRET_NAME}}` instead of hardcoded keys
3. ✅ Test with real APIs that require authentication
4. ✅ Share the app with team members (each has their own secrets)

---

## 📚 Technical Details

### Database Schema:
```sql
-- Secrets metadata (what you see in the UI)
secret_metadata
  - alias (text, primary key)
  - owner_id (uuid, references profiles)
  - vault_id (uuid, references vault.secrets)
  - description (text)
  - created_at, updated_at (timestamptz)

-- Actual encrypted secrets (managed by Vault)
vault.secrets
  - id (uuid)
  - secret (text, encrypted)
  - ...
```

### RPC Functions:
- `store_secret(secret_name, secret_value)` - Encrypts and stores
- `read_secret(secret_id)` - Decrypts and returns value

### Row Level Security:
- Users can only see/manage their own secrets
- Edge Function uses service role to decrypt (has full access)

---

**Status:** ✅ Fully Implemented
**Security:** 🔒 Vault Encrypted
**Ready to Use:** 🚀 Yes!

