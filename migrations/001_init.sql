create table if not exists vault_meta (
  owner_sub text not null,
  stage text not null,
  salt text not null,
  verifier_ciphertext text not null,
  verifier_iv text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_sub, stage)
);

create table if not exists vault_credentials (
  id text primary key,
  owner_sub text not null,
  stage text not null,
  platform text not null,
  label text not null default '',
  ciphertext text not null,
  iv text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_sub, stage, platform)
);

create index if not exists vault_credentials_owner_idx
  on vault_credentials (owner_sub, stage);

create table if not exists hub_links (
  id text primary key,
  owner_sub text not null,
  stage text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists hub_links_owner_idx
  on hub_links (owner_sub, stage);
