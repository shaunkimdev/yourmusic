update public.songs
set mood_key = case id
  when '62cf3e2a-dfc7-4bca-b470-b8d3535019cc' then 'melancholy'
  when 'b014be99-b481-4bcf-bb8e-e63b5e553c0f' then 'melancholy'
  when 'f8d3325a-e4d6-419b-a644-ad13530f9895' then 'energetic'
  when 'c740b96d-9fcc-480f-a8d0-fd1c6bb08ccd' then 'romantic'
  else mood_key
end
where id in (
  '62cf3e2a-dfc7-4bca-b470-b8d3535019cc',
  'b014be99-b481-4bcf-bb8e-e63b5e553c0f',
  'f8d3325a-e4d6-419b-a644-ad13530f9895',
  'c740b96d-9fcc-480f-a8d0-fd1c6bb08ccd'
);
