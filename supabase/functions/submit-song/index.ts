import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const moodKeys = [
  'nostalgic',
  'uplifting',
  'melancholy',
  'summer',
  'romantic',
  'late-night',
  'warm',
  'energetic',
] as const;

type MoodKey = typeof moodKeys[number];

const moodKeywords: Record<MoodKey, string[]> = {
  nostalgic: ['그리', '추억', '옛', '레트로', '네온', '시부야', 'nostalgic', 'retro'],
  uplifting: ['상쾌', '기분전환', '드라이브', '달리', '바람', '가벼', 'uplifting', 'drive'],
  melancholy: ['쓸쓸', '외로', '우울', '슬프', '겨울', '혼자', 'melancholy', 'lonely'],
  summer: ['여름', '바다', '해변', '휴가', '햇살', '수평선', 'summer', 'beach'],
  romantic: ['사랑', '연애', '설렘', '봄', '벚꽃', 'romantic', 'love'],
  'late-night': ['밤', '새벽', '야경', '자정', '잠', 'late night', 'midnight'],
  warm: ['따뜻', '포근', '비', '카페', '커피', '위로', 'warm', 'rain'],
  energetic: ['신나', '활기', '에너지', '운동', '출근', '빠른', 'energetic', 'energy'],
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

function clean(value: unknown) {
  return String(value || '').trim();
}

function ruleClassifyMood(input: string): { moodKey: MoodKey; confidence: number; source: 'rule' } {
  const text = String(input || '').toLowerCase();
  const scores = moodKeys.map((key) => ({
    key,
    score: moodKeywords[key].reduce((sum, keyword) => sum + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);
  const [best, second] = scores;
  if (!text.trim()) return { moodKey: 'warm', confidence: 0.35, source: 'rule' };
  if (best.score === 0) return { moodKey: 'warm', confidence: 0.4, source: 'rule' };
  const confidence = second && best.score === second.score ? 0.55 : Math.min(0.95, 0.62 + best.score * 0.12);
  return { moodKey: best.key, confidence, source: 'rule' };
}

function getOutputText(response: any): string {
  if (typeof response.output_text === 'string') return response.output_text;
  const item = response.output?.find((part: any) => Array.isArray(part.content));
  const content = item?.content?.find((part: any) => typeof part.text === 'string');
  return content?.text || '';
}

async function aiClassifyMood(input: string): Promise<{ moodKey: MoodKey; confidence: number; source: 'ai' } | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey || !input.trim()) return null;

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
            'Classify the Korean or English song scene into exactly one mood key for music recommendation.',
        },
        {
          role: 'user',
          content: `Mood keys: ${moodKeys.join(', ')}\nSong context: ${input}`,
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'mood_classification',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['mood_key', 'confidence', 'reason_ko'],
            properties: {
              mood_key: { type: 'string', enum: moodKeys },
              confidence: { type: 'number', minimum: 0, maximum: 1 },
              reason_ko: { type: 'string' },
            },
          },
        },
      },
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const parsed = JSON.parse(getOutputText(data));
  if (!moodKeys.includes(parsed.mood_key as MoodKey)) return null;
  return {
    moodKey: parsed.mood_key as MoodKey,
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
    source: 'ai',
  };
}

function isValidContact(type: string, value: string) {
  if (!value) return false;
  if (type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (type === 'instagram') return /^@?[a-zA-Z0-9._]{2,30}$/.test(value);
  if (type === 'phone') return /^01[016789]-?\d{3,4}-?\d{4}$/.test(value);
  return value.length >= 2;
}

function mapSong(row: any) {
  return {
    id: row.id,
    artist: row.artist,
    title: row.title,
    cover: row.cover,
    coverImage: row.cover_image,
    coverColor: row.cover_color,
    mood: row.mood_key,
    scene: row.scene,
    lyric: row.lyric,
    spotifyTrackId: row.spotify_track_id || '',
    recommender: {
      name: row.recommender_name || '',
      age: row.recommender_age || '',
      city: row.recommender_city || '',
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json();
    const artist = clean(body.artist);
    const title = clean(body.title);
    const scene = clean(body.scene);
    const lyric = clean(body.lyric);
    const contactType = clean(body.contact?.type);
    const contactValue = clean(body.contact?.value);
    const privacyAgreed = body.privacyAgreed === true;

    if (!artist && !title) return json({ error: 'artist_or_title_required' }, 400);
    if (!scene) return json({ error: 'scene_required' }, 400);
    if (!privacyAgreed) return json({ error: 'privacy_required' }, 400);
    if (!isValidContact(contactType, contactValue)) return json({ error: 'invalid_contact' }, 400);

    const ruleResult = ruleClassifyMood(`${scene} ${lyric} ${artist} ${title}`);
    const classification =
      ruleResult.confidence < 0.72
        ? (await aiClassifyMood(`${scene} ${lyric} ${artist} ${title}`).catch(() => null)) || ruleResult
        : ruleResult;

    const supabase = createClient(
      getRequiredEnv('PROJECT_URL', 'SUPABASE_URL'),
      getRequiredEnv('PROJECT_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'),
    );

    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        artist: artist || 'Unknown Artist',
        title: title || 'Untitled',
        cover: body.cover || '🎵',
        cover_image: body.coverImage || null,
        cover_color: body.coverColor || '#C084FC',
        mood_key: classification.moodKey,
        scene,
        lyric: lyric || null,
        spotify_track_id: clean(body.spotifyTrackId),
        recommender_name: clean(body.recommender?.name) || null,
        recommender_age: clean(body.recommender?.age) ? Number(clean(body.recommender?.age)) : null,
        recommender_city: clean(body.recommender?.city) || null,
        status: 'active',
        source: 'user',
      })
      .select(
        'id,artist,title,cover,cover_image,cover_color,mood_key,scene,lyric,spotify_track_id,recommender_name,recommender_age,recommender_city',
      )
      .single();

    if (songError) throw songError;

    const { error: contactError } = await supabase.from('song_contacts').insert({
      song_id: song.id,
      contact_type: contactType,
      contact_value: contactValue,
      privacy_agreed: privacyAgreed,
    });

    if (contactError) throw contactError;

    return json({
      moodKey: classification.moodKey,
      confidence: classification.confidence,
      source: classification.source,
      song: mapSong(song),
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
