-- Groups sit inside the existing visual zones; photographs retain their composition.
create table public.photo_collections (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null references public.categories(slug),
  section integer not null default 0 check (section in (0,1)),
  name text not null check (length(trim(name)) between 1 and 100),
  title text not null default '' check (length(title) <= 100),
  position integer not null default 0 check (position >= 0),
  unique (id, category_slug, section)
);
alter table public.photo_collections enable row level security;
grant select on public.photo_collections to anon, authenticated;
grant insert, update, delete on public.photo_collections to authenticated;

alter table public.photos add column collection_id uuid;
insert into public.photo_collections(category_slug,section,name,position)
select c.slug, s.section,
  case c.slug when 'weddings' then 'Boda' when 'lifestyle' then 'Sesión'
    when 'personal-brands' then 'Cliente / campaña' when 'wellness-retreats' then 'Retiro'
    else 'Campaña' end || ' ' || (s.section + 1), s.section
from public.categories c cross join (values(0),(1)) as s(section);
update public.photos p set collection_id = g.id from public.photo_collections g
where g.category_slug=p.category_slug and g.section=p.section;
alter table public.photos alter column collection_id set not null;
alter table public.photos add constraint photos_collection_zone_fk
  foreign key(collection_id,category_slug,section)
  references public.photo_collections(id,category_slug,section) on update cascade on delete restrict;
create index photos_collection_order on public.photos(collection_id,category_slug,section,position,id);
create index collections_category_order on public.photo_collections(category_slug,section,position,id);

-- Compatibility for original portfolio imports. The invoker retains photo RLS.
create function public.assign_default_collection() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.collection_id is null then
    select id into new.collection_id from public.photo_collections
    where category_slug = new.category_slug and section = new.section order by position,id limit 1;
  end if;
  return new;
end $$;
revoke all on function public.assign_default_collection() from public,anon,authenticated;
create trigger photos_default_collection before insert on public.photos
for each row execute function public.assign_default_collection();

create policy "Visitors read nonempty collections" on public.photo_collections for select to anon
using (exists(select 1 from public.photos p where p.collection_id=photo_collections.id and p.published));
create policy "Members read permitted collections" on public.photo_collections for select to authenticated
using (exists(select 1 from public.site_admins where user_id=(select auth.uid()))
  or exists(select 1 from public.photos p where p.collection_id=photo_collections.id and p.published));
create policy "Administrators insert collections" on public.photo_collections for insert to authenticated
with check (exists(select 1 from public.site_admins where user_id=(select auth.uid())));
create policy "Administrators update collections" on public.photo_collections for update to authenticated
using (exists(select 1 from public.site_admins where user_id=(select auth.uid())))
with check (exists(select 1 from public.site_admins where user_id=(select auth.uid())));
create policy "Administrators delete empty collections" on public.photo_collections for delete to authenticated
using (exists(select 1 from public.site_admins where user_id=(select auth.uid())));

