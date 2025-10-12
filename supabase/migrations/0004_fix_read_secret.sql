-- Fix ambiguous column reference in read_secret function
create or replace function read_secret(secret_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  secret_value text;
begin
  select vault.decrypted_secrets.decrypted_secret into secret_value
  from vault.decrypted_secrets
  where vault.decrypted_secrets.id = secret_id;
  
  return secret_value;
end;
$$;

