insert into storage.buckets (id, name, public) values ('article-images', 'article-images', true) on conflict (id) do nothing;

create policy "article images public read"
on storage.objects for select
using (bucket_id = 'article-images');

create policy "admins upload article images"
on storage.objects for insert
with check (bucket_id = 'article-images' and public.has_role(auth.uid(), 'admin'));

create policy "admins update article images"
on storage.objects for update
using (bucket_id = 'article-images' and public.has_role(auth.uid(), 'admin'));

create policy "admins delete article images"
on storage.objects for delete
using (bucket_id = 'article-images' and public.has_role(auth.uid(), 'admin'));