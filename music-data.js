// yourmusic — Mock 음악 추천 데이터
// 회전초밥 위 접시(앨범커버)와 추천 결과 배너에 사용

window.MUSIC_DATA = [
  {
    id: 1,
    artist: 'Mariya Takeuchi',
    title: 'Plastic Love',
    cover: '🌃',
    coverImage: 'https://picsum.photos/seed/plastic-love-citypop/320/320',
    coverColor: '#FF6B9D',
    mood: 'nostalgic',
    scene: '한밤중 도쿄 시부야 횡단보도, 네온사인 아래 혼자 걷는 기분',
    lyric: '突然のキスや熱いまなざしで',
    recommender: { name: '유진', age: 28, city: '서울' },
  },
  {
    id: 2,
    artist: 'Tatsuro Yamashita',
    title: 'Ride on Time',
    cover: '🌅',
    coverImage: 'https://picsum.photos/seed/ride-on-time-sunset/320/320',
    coverColor: '#FFB088',
    mood: 'uplifting',
    scene: '여름 해변도로를 차로 달리며 창문 내릴 때',
    lyric: 'Ride on time 時よ止まれ',
    recommender: { name: 'Hiro', age: 31, city: '도쿄' },
  },
  {
    id: 3,
    artist: '검정치마',
    title: 'Antifreeze',
    cover: '❄️',
    coverImage: 'https://picsum.photos/seed/antifreeze-winter/320/320',
    coverColor: '#7DD3FC',
    mood: 'melancholy',
    scene: '겨울밤 한강 산책로, 입김이 보이는 거리',
    lyric: '얼지말고 있어줘',
    recommender: { name: '민지', age: 25, city: '부산' },
  },
  {
    id: 4,
    artist: 'Anri',
    title: 'Last Summer Whisper',
    cover: '🌊',
    coverImage: 'https://picsum.photos/seed/last-summer-whisper/320/320',
    coverColor: '#00D4FF',
    mood: 'summer',
    scene: '오키나와 해변에서 수평선 너머 일몰을 바라볼 때',
    lyric: 'Last summer whisper, 風になりたい',
    recommender: { name: '소희', age: 27, city: '제주' },
  },
  {
    id: 5,
    artist: '새소년',
    title: '난춘',
    cover: '🌸',
    coverImage: 'https://picsum.photos/seed/nanchun-spring/320/320',
    coverColor: '#FFB6C1',
    mood: 'romantic',
    scene: '벚꽃 흩날리는 봄날 오후, 친구와 자전거 타는 길',
    lyric: '봄이 와도 그 곳은 여전한가요',
    recommender: { name: '재현', age: 24, city: '서울' },
  },
  {
    id: 6,
    artist: 'Miki Matsubara',
    title: 'Stay With Me',
    cover: '🌙',
    coverImage: 'https://picsum.photos/seed/stay-with-me-night/320/320',
    coverColor: '#C084FC',
    mood: 'late-night',
    scene: '12시가 넘은 도쿄 야경을 호텔 창문에서 바라볼 때',
    lyric: '真夜中のドアをたたき',
    recommender: { name: '유나', age: 29, city: '인천' },
  },
  {
    id: 7,
    artist: '잔나비',
    title: '주저하는 연인들을 위해',
    cover: '☕',
    coverImage: 'https://picsum.photos/seed/jannabi-cafe-rain/320/320',
    coverColor: '#FFF4D6',
    mood: 'warm',
    scene: '비 오는 날 오래된 LP 카페에서 따뜻한 커피 한 잔',
    lyric: '나는 읽기 쉬운 마음이야',
    recommender: { name: '도윤', age: 26, city: '대구' },
  },
  {
    id: 8,
    artist: 'Casiopea',
    title: 'Asayake',
    cover: '🌇',
    coverImage: 'https://picsum.photos/seed/asayake-dawn-city/320/320',
    coverColor: '#FF1493',
    mood: 'energetic',
    scene: '새벽 5시, 도시의 첫 해가 빌딩 사이로 떠오를 때',
    lyric: '(instrumental)',
    recommender: { name: 'Kenji', age: 33, city: '오사카' },
  },
];

// 회전초밥 접시 6개에 노래 6개를 매핑 (8개 중 앞의 6개 사용)
window.SUSHI_PLATES = window.MUSIC_DATA.slice(0, 6);

// 노래 검색용 lookup (가수+제목 부분 매칭, 화면 2 미리보기에 사용)
// 문자열 또는 { artist, title } 입력을 모두 지원한다.
window.findSongs = function (query) {
  const rawQuery =
    typeof query === 'object' && query !== null
      ? `${query.artist || ''} ${query.title || ''}`
      : query || '';
  const tokens = rawQuery
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return [];

  return window.MUSIC_DATA.filter((s) => {
    const haystack = `${s.artist} ${s.title}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
};
