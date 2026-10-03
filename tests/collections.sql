-- Run only in the development project via an owner SQL connection. All fixtures roll back.
begin;
select set_config('request.jwt.claim.sub',(select user_id::text from public.site_admins limit 1),true);
set local role authenticated;
do $$
declare a uuid; b uuid; p uuid; affected integer;
begin
  insert into public.photo_collections(category_slug,name,title) values('weddings','QA rollback','Wedding QA') returning id into a;
  insert into public.photo_collections(category_slug,section,name) values('lifestyle',1,'QA other category') returning id into b;
  insert into public.photos(category_slug,collection_id,storage_path,alt,width,height)
    values('weddings',a,'qa-rollback/'||a,'QA',100,100) returning id into p;
  update public.photo_collections set section=1 where id=a;
  if not exists(select 1 from public.photos where id=p and section=1) then raise exception 'Zone did not cascade'; end if;
  begin
    update public.photos set collection_id=b where id=p;
    raise exception 'Cross-category assignment accepted';
  exception when foreign_key_violation then null; end;
  update public.photos set collection_id=b,category_slug='lifestyle' where id=p;
  if not exists(select 1 from public.photos where id=p and collection_id=b and section=1) then raise exception 'Move failed'; end if;
  begin
    delete from public.photo_collections where id=b;
    raise exception 'Occupied group deleted';
  exception when foreign_key_violation then null; end;
  begin
    insert into public.photo_collections(category_slug,name) values('weddings','   ');
    raise exception 'Empty name accepted';
  exception when check_violation then null; end;
  insert into public.photos(category_slug,section,storage_path,alt,width,height)
    values('weddings',0,'qa-legacy/'||a,'Legacy import',100,100);
  if exists(select 1 from public.photos where storage_path='qa-legacy/'||a and collection_id is null) then raise exception 'Legacy import lost group'; end if;
  delete from public.photos where id=p;
  delete from public.photo_collections where id=b;
end $$;
reset role;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
set local role authenticated;
do $$
declare affected integer;
begin
  begin
    insert into public.photo_collections(category_slug,name) values('weddings','Unauthorized');
    raise exception 'Non-admin inserted group';
  exception when insufficient_privilege then null; end;
  update public.photo_collections set title='Unauthorized'; get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Non-admin updated groups'; end if;
  delete from public.photo_collections; get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Non-admin deleted groups'; end if;
  if exists(select 1 from public.photo_collections g where not exists(select 1 from public.photos p where p.collection_id=g.id and p.published)) then raise exception 'Non-admin sees draft-only group'; end if;
end $$;
reset role;
set local role anon;
do $$
begin
  if exists(select 1 from public.photo_collections g where not exists(select 1 from public.photos p where p.collection_id=g.id and p.published)) then raise exception 'Visitor sees draft-only group'; end if;
  begin
    insert into public.photo_collections(category_slug,name) values('weddings','Unauthorized');
    raise exception 'Visitor inserted group';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'PASS: grouping, category consistency, zone moves, legacy import, deletion constraints, admin and visitor permissions; fixtures rolled back' as result;
