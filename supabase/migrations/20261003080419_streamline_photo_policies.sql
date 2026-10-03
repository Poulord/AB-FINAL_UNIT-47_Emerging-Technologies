drop policy "Published photographs" on public.photos;
drop policy "Administrators manage photographs" on public.photos;
create policy "Visitors read published photographs" on public.photos for select to anon using (published);
create policy "Members read permitted photographs" on public.photos for select to authenticated
  using (published or exists(select 1 from public.site_admins where user_id = (select auth.uid())));
create policy "Administrators insert photographs" on public.photos for insert to authenticated
  with check (exists(select 1 from public.site_admins where user_id = (select auth.uid())));
create policy "Administrators update photographs" on public.photos for update to authenticated
  using (exists(select 1 from public.site_admins where user_id = (select auth.uid())))
  with check (exists(select 1 from public.site_admins where user_id = (select auth.uid())));
create policy "Administrators delete photographs" on public.photos for delete to authenticated
  using (exists(select 1 from public.site_admins where user_id = (select auth.uid())));
