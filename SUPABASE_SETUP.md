# Supabase setup

1. Create a Supabase project.
2. Apply the migration in `supabase/migrations/202604300001_create_music_recommendation_schema.sql`.
3. Deploy both Edge Functions:
   - `submit-song`
   - `recommend-songs`
4. Set Edge Function secrets:
   - `PROJECT_URL`
   - `PROJECT_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - Optional: `OPENAI_MODEL`
5. Copy the public project values into `config.js`:

```js
window.YOURMUSIC_CONFIG = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabaseAnonKey: 'your-supabase-anon-key',
};
```

If `config.js` is left empty, the app uses the local mock songs in `music-data.js`.

Use `PROJECT_URL` and `PROJECT_SERVICE_ROLE_KEY` for Edge Function secrets because Supabase does not allow custom secret names that start with `SUPABASE_`.
