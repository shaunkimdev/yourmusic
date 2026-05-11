import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getRequiredEnv(...names: string[]) {
  for (const name of names) {
    const value = Deno.env.get(name);
    if (value) return value;
  }
  throw new Error(`Missing environment variable: ${names.join(' or ')}`);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { songId } = await req.json();
    if (!songId) return json({ error: 'song_id_required' }, 400);

    const supabase = createClient(
      getRequiredEnv('PROJECT_URL', 'SUPABASE_URL'),
      getRequiredEnv('PROJECT_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'),
    );

    const { data, error } = await supabase.rpc('increment_song_heart', {
      target_song_id: songId,
    });

    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;

    return json({
      songId: row?.song_id || songId,
      heartCount: Number(row?.heart_count || 0),
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
