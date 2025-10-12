-- Seed data for local development

insert into profiles (id, role, display_name)
values
  ('00000000-0000-0000-0000-000000000001', 'owner', 'Primary Owner')
  on conflict (id) do update set updated_at = now();

insert into api_categories (id, owner_id, name, icon, sort_order)
values
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Utilities', 'bolt', 1),
  (uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', 'Finance', 'banknote', 2)
  on conflict do nothing;

-- Example request placeholder
insert into api_requests (id, owner_id, name, description, method, url, headers, query_params, body_template)
values
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000001',
    'Check Weather',
    'Fetch current weather from OpenWeather API',
    'GET',
    'https://api.openweathermap.org/data/2.5/weather',
    jsonb_build_object('Content-Type', 'application/json'),
    jsonb_build_object('q', '{{city}}'),
    null
  )
  on conflict do nothing;
