-- Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (new.id, 'owner', coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$;

-- Create a trigger to automatically create a profile for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create profiles for any existing users that don't have one
insert into public.profiles (id, role, display_name)
select 
  u.id,
  'owner' as role,
  coalesce(u.raw_user_meta_data->>'display_name', u.email) as display_name
from auth.users u
left join public.profiles p on u.id = p.id
where p.id is null
on conflict (id) do nothing;

