-- Add columns to store full response details for request executions
-- This allows users to view complete request/response details in the history

alter table public.request_executions
add column if not exists response_body text,
add column if not exists response_headers jsonb,
add column if not exists request_headers jsonb,
add column if not exists request_body text,
add column if not exists final_url text;

-- Add comment explaining the columns
comment on column public.request_executions.response_body is 'Full response body (truncated to 100KB for storage)';
comment on column public.request_executions.response_headers is 'Response headers as received from the API';
comment on column public.request_executions.request_headers is 'Headers sent with the request (including runtime values)';
comment on column public.request_executions.request_body is 'Body sent with the request (including runtime values)';
comment on column public.request_executions.final_url is 'Final URL after parameter substitution';

