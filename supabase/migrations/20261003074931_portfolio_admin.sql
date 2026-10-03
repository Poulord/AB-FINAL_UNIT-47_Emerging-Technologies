-- Isolated development project. Authentication is managed by Supabase Auth.
create table public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.site_admins enable row level security;
grant select on public.site_admins to authenticated;
create policy "Read own administrator membership" on public.site_admins
  for select to authenticated using (user_id = (select auth.uid()));

create table public.categories (
  slug text primary key check (slug in ('weddings','lifestyle','personal-brands','wellness-retreats','content-creation')),
  name text not null check (length(name) between 1 and 100),
  position integer not null default 0
);
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null references public.categories(slug),
  storage_path text not null unique,
  alt text not null default '' check (length(alt) <= 500),
  width integer not null check (width > 0), height integer not null check (height > 0),
  position integer not null default 0,
  section integer not null default 0 check (section between 0 and 1),
  layout text not null default 'portrait span-4' check (layout in ('portrait span-3','portrait span-4','portrait span-6','landscape span-3','landscape span-4','landscape span-6')),
  published boolean not null default false,
  is_cover boolean not null default false,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  check (not is_cover or published)
);
create unique index one_cover_per_category on public.photos(category_slug) where is_cover;
create index photos_category_order on public.photos(category_slug, position, id);
create index photos_creator on public.photos(created_by);
alter table public.categories enable row level security;
alter table public.photos enable row level security;
grant select on public.categories, public.photos to anon, authenticated;
grant insert, update, delete on public.photos to authenticated;
grant update on public.categories to authenticated;
create policy "Public categories" on public.categories for select to anon, authenticated using (true);
create policy "Administrators edit categories" on public.categories for update to authenticated
  using (exists(select 1 from public.site_admins where user_id = (select auth.uid())))
  with check (exists(select 1 from public.site_admins where user_id = (select auth.uid())));
create policy "Published photographs" on public.photos for select to anon, authenticated using (published);
create policy "Administrators manage photographs" on public.photos for all to authenticated
  using (exists(select 1 from public.site_admins where user_id = (select auth.uid())))
  with check (exists(select 1 from public.site_admins where user_id = (select auth.uid())));
insert into public.categories(slug,name,position) values
  ('weddings','Weddings',0), ('lifestyle','Lifestyle',1), ('personal-brands','Personal Brands',2),
  ('wellness-retreats','Wellness & Retreats',3), ('content-creation','Content Creation',4);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
  values ('portfolio','portfolio',false,10485760,array['image/jpeg','image/png','image/webp']);
create policy "Read published portfolio files" on storage.objects for select to anon, authenticated
  using (bucket_id = 'portfolio' and exists(select 1 from public.photos where storage_path = name and published));
create policy "Administrators manage portfolio files" on storage.objects for all to authenticated
  using (bucket_id = 'portfolio' and exists(select 1 from public.site_admins where user_id = (select auth.uid())))
  with check (bucket_id = 'portfolio' and exists(select 1 from public.site_admins where user_id = (select auth.uid())));

-- Invoker RPC keeps cover switching atomic and enforces table RLS.
create function public.set_photo_cover(photo_id uuid) returns void language plpgsql security invoker set search_path = '' as $$
declare target_category text;
begin
  if not exists(select 1 from public.site_admins where user_id = (select auth.uid())) then
    raise exception 'Administrator access required';
  end if;
  select category_slug into target_category from public.photos where id = photo_id and published;
  if target_category is null then raise exception 'Publish the photo first'; end if;
  perform 1 from public.categories where slug = target_category for update;
  update public.photos set is_cover = false where category_slug = target_category and is_cover;
  update public.photos set is_cover = true where id = photo_id;
end $$;
revoke all on function public.set_photo_cover(uuid) from public, anon;
grant execute on function public.set_photo_cover(uuid) to authenticated;
