-- Enable Supabase Vault for secure secret storage
-- Vault encrypts secrets at rest and only decrypts them when needed

-- Enable the vault extension
create extension if not exists supabase_vault with schema vault cascade;

-- Create a function to store secrets in the vault
create or replace function store_secret(secret_name text, secret_value text)
returns uuid
language plpgsql
security definer
as $$
declare
  secret_id uuid;
begin
  secret_id := vault.create_secret(secret_value, secret_name);
  return secret_id;
end;
$$;

-- Create a function to read secrets from the vault
create or replace function read_secret(secret_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  decrypted_secret text;
begin
  select decrypted_secret into decrypted_secret
  from vault.decrypted_secrets
  where id = secret_id;
  
  return decrypted_secret;
end;
$$;

-- Update the secret_metadata table to store vault IDs
alter table secret_metadata
add column if not exists vault_id uuid references vault.secrets(id);

-- Add index for better performance
create index if not exists idx_secret_metadata_vault_id 
on secret_metadata(vault_id);

-- Grant execute permissions
grant execute on function store_secret to authenticated;
grant execute on function read_secret to service_role;

