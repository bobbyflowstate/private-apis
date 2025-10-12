# Test the Edge Function

Now that the Edge Function is deployed, let's test it with a real API request!

## Option 1: Test with httpbin.org (Recommended for First Test)

1. **Create a new request in your app** at `/requests/new`:
   
   **Basic Information:**
   - **Name:** Test HTTPBin GET
   - **Method:** GET
   - **URL:** `https://httpbin.org/get`
   - **Timeout:** 10000 ms (default)
   
   **Headers:**
   - Add a header: `User-Agent` = `Private-APIs-App`
   
   **Query Parameters:** (leave empty)
   
   **Body:** (not needed for GET)

2. Click "Create Request"
3. On the request detail page, click "Run Request"
4. You should see a successful response with your request details! 🎉

## Option 2: Test with Parameters

Create another request to test parameter substitution:

**Basic Information:**
- **Name:** Test HTTPBin with Parameters
- **Method:** GET  
- **URL:** `https://httpbin.org/anything/{{userId}}`

**Headers:**
- `X-Custom-Header` = `{{customValue}}`

**Query Parameters:**
- `search` = `{{searchTerm}}`

When you execute this request, you'll be prompted to provide values for:
- `userId`: `12345`
- `customValue`: `test-value`
- `searchTerm`: `hello`

The final URL will become: `https://httpbin.org/anything/12345?search=hello` and the custom header will be added.

## Option 3: Test POST Request

**Basic Information:**
- **Name:** Test HTTPBin POST
- **Method:** POST
- **URL:** `https://httpbin.org/post`

**Headers:**
- `Content-Type` = `application/json`

**Body:**
```json
{
  "message": "Hello from Private APIs!",
  "timestamp": "{{timestamp}}",
  "user": "{{userName}}"
}
```

When executing, provide:
- `timestamp`: `2025-10-12T10:00:00Z`
- `userName`: `yourname`

## What to Expect

✅ **Success Response:**
```json
{
  "success": true,
  "status": "success",
  "executionId": "uuid-here",
  "httpStatus": 200,
  "duration": 543,
  "data": { /* API response */ }
}
```

❌ **Error Response:**
```json
{
  "success": false,
  "status": "error",
  "executionId": "uuid-here",
  "httpStatus": 500,
  "duration": 123,
  "error": "Error message"
}
```

## Check Execution History

After running requests, go to the **History** page to see:
- Execution status (success/failure/error/timeout)
- Response time
- HTTP status code
- Response excerpt
- Parameters used

## Next Steps After Testing

Once you confirm the Edge Function works:

1. ✅ Test with your own API endpoints
2. 🔐 Set up Supabase Vault for secrets (Phase 2)
3. 📊 Enhance history view with filtering
4. ⏰ Add request scheduling
5. 🎨 Polish the UI further

---

**Note:** The Edge Function now supports:
- ✅ GET, POST, PUT, DELETE, PATCH methods
- ✅ Parameter substitution with `{{paramName}}`
- ✅ Custom headers
- ✅ Query parameters
- ✅ Request body (JSON)
- ✅ Timeout handling (default 10s)
- ✅ Execution logging
- ⏳ Secret substitution (coming in Phase 2)

