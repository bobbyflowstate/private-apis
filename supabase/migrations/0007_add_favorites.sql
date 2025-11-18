alter table api_requests
  add column if not exists is_favorite boolean not null default false;

comment on column api_requests.is_favorite is 'Marks requests that should appear in quick access grids.';
