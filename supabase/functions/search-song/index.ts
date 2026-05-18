const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function clean(value: unknown) {
  return String(value || '').trim();
}

function getOutputText(response: any): string {
  if (typeof response.output_text === 'string') return response.output_text;
  const item = response.output?.find((part: any) => Array.isArray(part.content));
  const content = item?.content?.find((part: any) => typeof part.text === 'string');
  return content?.text || '';
}

async function getSearchRewrites(artist: string, title: string): Promise<string[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  const input = [artist, title].filter(Boolean).join(' ').trim();
  if (!apiKey || !input) return [];

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content:
            'Convert Korean pronunciation, Hangul artist names, and informal song queries into likely music search queries. Return only high-confidence candidates.',
        },
        {
          role: 'user',
          content:
            `Artist input: ${artist || '(empty)'}\n` +
            `Title input: ${title || '(empty)'}\n` +
            'Examples: 키스오브라이프 + 스티키 -> KISS OF LIFE Sticky. 뉴진스 + 하입보이 -> NewJeans Hype Boy.',
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'song_search_rewrites',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['queries'],
            properties: {
              queries: {
                type: 'array',
                maxItems: 5,
                items: { type: 'string' },
              },
            },
          },
        },
      },
    }),
  }).catch(() => null);

  if (!response || !response.ok) return [];

  try {
    const data = await response.json();
    const parsed = JSON.parse(getOutputText(data));
    return Array.isArray(parsed.queries) ? parsed.queries.map(clean).filter(Boolean) : [];
  } catch (_error) {
    return [];
  }
}

async function getSpotifyAccessToken() {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
  if (!clientId || !clientSecret) return null;

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  }).catch(() => null);

  if (!response || !response.ok) return null;
  const data = await response.json();
  return typeof data.access_token === 'string' ? data.access_token : null;
}

function uniq(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildQueries(artist: string, title: string, rewrites: string[]) {
  return uniq([
    artist && title ? `track:"${title}" artist:"${artist}"` : '',
    artist && title ? `${artist} ${title}` : '',
    title ? `track:"${title}"` : '',
    title,
    artist,
    ...rewrites,
  ].map(clean).filter(Boolean));
}

function mapSpotifyTrack(track: any) {
  const image = track.album?.images?.[0]?.url || track.album?.images?.[1]?.url || '';
  return {
    id: `spotify:${track.id}`,
    artist: (track.artists || []).map((artist: any) => artist.name).filter(Boolean).join(', '),
    title: track.name,
    album: track.album?.name || '',
    cover: '🎵',
    coverImage: image,
    coverColor: '#C084FC',
    spotifyTrackId: track.id,
    spotifyPreviewUrl: track.preview_url || '',
    source: 'spotify',
  };
}

function mapItunesTrack(item: any) {
  const artwork = typeof item.artworkUrl100 === 'string' ? item.artworkUrl100.replace('100x100bb', '600x600bb') : '';
  return {
    id: `itunes:${item.trackId}`,
    artist: item.artistName || '',
    title: item.trackName || '',
    album: item.collectionName || '',
    cover: '🎵',
    coverImage: artwork,
    coverColor: '#C084FC',
    spotifyTrackId: '',
    spotifyPreviewUrl: item.previewUrl || '',
    source: 'itunes',
  };
}

async function searchSpotify(queries: string[], limit: number) {
  const token = await getSpotifyAccessToken();
  if (!token) return [];

  const market = Deno.env.get('SPOTIFY_MARKET') || 'KR';
  const results: any[] = [];

  for (const query of queries) {
    if (results.length >= limit) break;
    const url = new URL('https://api.spotify.com/v1/search');
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'track');
    url.searchParams.set('limit', String(Math.min(10, limit)));
    url.searchParams.set('market', market);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
    if (!response || !response.ok) continue;

    const data = await response.json().catch(() => null);
    const items = data?.tracks?.items || [];
    results.push(...items.map(mapSpotifyTrack));
  }

  return results;
}

async function searchItunes(queries: string[], limit: number) {
  const results: any[] = [];

  for (const query of queries) {
    if (results.length >= limit) break;
    const url = new URL('https://itunes.apple.com/search');
    url.searchParams.set('term', query);
    url.searchParams.set('entity', 'song');
    url.searchParams.set('limit', String(Math.min(10, limit)));
    url.searchParams.set('country', Deno.env.get('ITUNES_COUNTRY') || 'KR');

    const response = await fetch(url).catch(() => null);
    if (!response || !response.ok) continue;

    const data = await response.json().catch(() => null);
    results.push(...(data?.results || []).map(mapItunesTrack));
  }

  return results;
}

function dedupeSongs(songs: any[], limit: number) {
  const seen = new Set<string>();
  const output: any[] = [];

  for (const song of songs) {
    const artist = clean(song.artist);
    const title = clean(song.title);
    if (!artist && !title) continue;

    const key = `${artist}|${title}`.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    output.push({ ...song, artist: artist || 'Unknown Artist', title: title || 'Untitled' });
    if (output.length >= limit) break;
  }

  return output;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json();
    const artist = clean(body.artist);
    const title = clean(body.title);
    const limit = Math.max(1, Math.min(10, Number(body.limit || 8)));

    if (!artist && !title) return json({ error: 'artist_or_title_required' }, 400);

    const rewrites = await getSearchRewrites(artist, title);
    const queries = buildQueries(artist, title, rewrites);
    const spotify = await searchSpotify(queries, limit);
    const itunes = await searchItunes(queries, limit);
    const songs = dedupeSongs([...spotify, ...itunes], limit);

    return json({
      songs,
      usedAiRewrite: rewrites.length > 0,
      queries,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
