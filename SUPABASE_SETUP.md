# Supabase setup

1. Create a Supabase project.
2. Apply the migrations in `supabase/migrations/` in filename order. Existing projects should also apply `202605020001_add_spotify_preview_url.sql`.
3. Deploy both Edge Functions:
   - `submit-song`
   - `recommend-songs`
4. Set Edge Function secrets:
   - `PROJECT_URL`
   - `PROJECT_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - Optional: `OPENAI_MODEL`
   - Optional, but required for Spotify embeds on newly submitted or lazily enriched songs: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
   - Optional: `SPOTIFY_MARKET` (defaults to `KR`)
5. Copy the public project values into `config.js`:

```js
window.YOURMUSIC_CONFIG = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabaseAnonKey: 'your-supabase-anon-key',
};
```

If `config.js` is left empty, the app uses the local mock songs in `music-data.js`.

Use `PROJECT_URL` and `PROJECT_SERVICE_ROLE_KEY` for Edge Function secrets because Supabase does not allow custom secret names that start with `SUPABASE_`.
