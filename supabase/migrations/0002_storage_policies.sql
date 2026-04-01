-- Allow authenticated users to manage files in the employee-documents bucket

create policy "authenticated_can_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'employee-documents');

create policy "authenticated_can_read"
on storage.objects for select
to authenticated
using (bucket_id = 'employee-documents');

create policy "authenticated_can_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'employee-documents');
