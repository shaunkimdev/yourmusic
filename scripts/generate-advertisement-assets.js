const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'advertisement');
fs.mkdirSync(outDir, { recursive: true });

const C = {
  ink: '#1A1A2E',
  soft: '#3D3D5C',
  magenta: '#FF1493',
  pink: '#FF6B9D',
  cyan: '#00D4FF',
  sky: '#7DD3FC',
  lavender: '#C084FC',
  peach: '#FFB088',
  yellow: '#FCD34D',
  cream: '#FFF4D6',
  paper: '#FFFFFF',
  spotify: '#1DB954',
  youtube: '#FF0033',
};

const font = "'Galmuri11','Apple SD Gothic Neo','Noto Sans KR',monospace";
const enFont = "'Press Start 2P','Galmuri11',monospace";

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function svg(width, height, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="citypop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${C.pink}"/>
      <stop offset="50%" stop-color="${C.lavender}"/>
      <stop offset="100%" stop-color="${C.sky}"/>
    </linearGradient>
    <linearGradient id="night" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1A1A2E"/>
      <stop offset="50%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#00D4FF"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="8" dy="8" stdDeviation="0" flood-color="${C.ink}" flood-opacity="1"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#citypop)"/>
  ${body}
</svg>`;
}

function text(x, y, value, size, color = C.ink, opts = {}) {
  const weight = opts.weight || 900;
  const anchor = opts.anchor || 'start';
  const family = opts.en ? enFont : font;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${color}" letter-spacing="0">${esc(value)}</text>`;
}

function multiline(x, y, lines, size, color = C.ink, opts = {}) {
  const lineHeight = opts.lineHeight || Math.round(size * 1.55);
  return lines.map((line, index) => text(x, y + lineHeight * index, line, size, color, opts)).join('\n');
}

function pixelHeart(x, y, s = 8, color = C.magenta) {
  const rows = ['0110110', '1111111', '1111111', '1111111', '0111110', '0011100', '0001000'];
  const rects = [];
  rows.forEach((row, yy) => row.split('').forEach((cell, xx) => {
    if (cell === '1') rects.push(`<rect x="${x + xx * s}" y="${y + yy * s}" width="${s}" height="${s}" fill="${color}"/>`);
  }));
  return `<g filter="url(#shadow)">${rects.join('')}</g>`;
}

function pixelIcon(type, x, y, s = 8) {
  const patterns = {
    kakao: ['001111100', '011111110', '111111111', '110101011', '111111111', '011111110', '001111000', '000010000'],
    copy: ['001111110', '001000010', '111111010', '100001010', '101111110', '101000000', '101111100', '100000100', '111111100'],
    play: ['100000', '111000', '111110', '111111', '111110', '111000', '100000'],
  };
  const rows = patterns[type] || patterns.copy;
  const color = type === 'kakao' ? '#3A2A00' : C.ink;
  const rects = [];
  rows.forEach((row, yy) => row.split('').forEach((cell, xx) => {
    if (cell === '1') rects.push(`<rect x="${x + xx * s}" y="${y + yy * s}" width="${s}" height="${s}" fill="${color}"/>`);
  }));
  return `<g>${rects.join('')}</g>`;
}

function button(x, y, w, h, label, fill, color = C.paper, icon = '') {
  return `<g>
    <rect x="${x + 8}" y="${y + 8}" width="${w}" height="${h}" fill="${C.ink}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.ink}" stroke-width="6"/>
    ${icon}
    ${text(x + w / 2 + (icon ? 22 : 0), y + h / 2 + 9, label, 22, color, { anchor: 'middle', en: true })}
  </g>`;
}

function dialog(x, y, w, h, body, fill = C.paper) {
  return `<g>
    <rect x="${x + 8}" y="${y + 8}" width="${w}" height="${h}" fill="${C.ink}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.ink}" stroke-width="8"/>
    <rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" fill="none" stroke="${C.ink}" stroke-width="2"/>
    ${body}
  </g>`;
}

function phone(x, y, screenBody, opts = {}) {
  const w = opts.w || 390;
  const h = opts.h || 844;
  const screenScale = (w - 20) / 370;
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="${w}" height="${h}" rx="44" fill="${C.ink}"/>
    <rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="36" fill="url(#citypop)"/>
    <rect x="145" y="20" width="100" height="10" rx="5" fill="${C.ink}" opacity="0.9"/>
    <g transform="translate(10 24) scale(${screenScale})">${screenBody}</g>
  </g>`;
}

function album(x, y, size, fill, label = '♪') {
  return `<g>
    <rect x="${x + 8}" y="${y + 8}" width="${size}" height="${size}" fill="${C.ink}"/>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" stroke="${C.ink}" stroke-width="8"/>
    <circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size * 0.28}" fill="${C.paper}" opacity="0.34"/>
    ${text(x + size / 2, y + size / 2 + 14, label, size * 0.28, C.paper, { anchor: 'middle' })}
  </g>`;
}

function homeScreen() {
  return `
    ${text(185, 80, '도키도키송', 28, C.ink, { anchor: 'middle' })}
    ${text(185, 112, '당신의 음악기억이 궁금해요', 16, C.soft, { anchor: 'middle' })}
    ${dialog(18, 155, 334, 190, `
      ${multiline(42, 205, ['지금 당신의 기분은', '어떠신가요?'], 18)}
      <rect x="42" y="260" width="286" height="42" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
      ${text(55, 288, '예: 일요일 오후, 조금 나른한', 13, '#777')}
      ${button(42, 325, 286, 50, 'SONG START', C.magenta, C.paper)}
    `)}
    ${dialog(18, 375, 334, 150, `
      ${multiline(42, 425, ['내가 이런 기분일때 들었던', '좋은 노래가 있나요?'], 17)}
      ${button(42, 465, 286, 46, 'RECOMMEND', C.cyan, C.paper)}
    `)}
    ${text(185, 585, '공유하기', 18, C.ink, { anchor: 'middle' })}
    ${button(38, 610, 138, 46, 'KAKAO', C.yellow, C.ink, pixelIcon('kakao', 54, 622, 3))}
    ${button(196, 610, 138, 46, 'COPY', C.paper, C.ink, pixelIcon('copy', 214, 618, 3))}
  `;
}

function beltScreen() {
  const plates = [
    [64, 218, C.pink], [152, 190, C.yellow], [238, 222, C.sky],
    [238, 330, C.lavender], [152, 368, C.peach], [64, 330, C.cyan],
  ];
  return `
    ${text(28, 50, '노래 고르기', 22, C.ink)}
    ${dialog(18, 82, 334, 72, `${text(42, 126, '레일 위 접시에서 끌리는 앨범을 골라보세요.', 13)}`, C.cream)}
    <ellipse cx="185" cy="300" rx="132" ry="98" fill="none" stroke="${C.ink}" stroke-width="16"/>
    ${plates.map((p, i) => album(p[0], p[1], 58, p[2], i % 2 ? '♫' : '♪')).join('\n')}
    ${album(113, 180, 144, C.magenta, 'LP')}
    ${dialog(42, 420, 286, 76, `${multiline(185, 450, ['이 곡이 마음에 든다면', '아래 하트   를 눌러주세요'], 15, C.ink, { anchor: 'middle' })}${pixelHeart(221, 456, 3)}`, C.cream)}
    ${dialog(18, 548, 334, 128, `
      ${album(42, 582, 54, C.magenta, '♪')}
      ${text(112, 595, 'THIS SONG', 12, C.magenta, { en: true })}
      ${text(112, 623, 'Plastic Love', 16, C.ink)}
      ${button(250, 582, 72, 38, '12', C.cream, C.magenta, pixelHeart(260, 590, 3))}
      ${text(112, 650, '♪ Mariya Takeuchi', 13, C.soft)}
    `)}
  `;
}

function detailScreen() {
  return `
    ${text(28, 50, 'THIS SONG', 22, C.ink, { en: true })}
    ${album(105, 88, 160, C.magenta, 'LP')}
    ${text(185, 282, 'Plastic Love', 18, C.paper, { anchor: 'middle' })}
    ${text(185, 312, 'Mariya Takeuchi', 18, C.paper, { anchor: 'middle' })}
    <g transform="translate(142 328)">${pixelHeart(0, 0, 4)}${text(72, 28, '12', 20, C.magenta, { en: true })}</g>
    ${dialog(18, 390, 334, 240, `
      ${text(42, 432, '♥ THE SCENE', 12, C.magenta, { en: true })}
      ${multiline(42, 468, ['한밤중 도쿄 시부야 횡단보도,', '네온사인 아래 혼자 걷는 기분'], 14)}
      <rect x="42" y="520" width="286" height="58" fill="#191414" stroke="${C.ink}" stroke-width="5"/>
      ${text(62, 555, '30 SEC PREVIEW', 10, C.spotify, { en: true })}
      ${text(185, 612, '전체곡 들으러가기', 15, C.ink, { anchor: 'middle' })}
      ${button(42, 630, 136, 38, 'YOUTUBE', C.youtube, C.paper)}
      ${button(192, 630, 136, 38, 'SPOTIFY', C.spotify, C.ink)}
    `, C.cream)}
    ${button(56, 704, 258, 54, '되돌아가기', C.magenta, C.paper)}
  `;
}

function formScreen() {
  return `
    ${text(28, 50, 'RECOMMEND', 22, C.ink, { en: true })}
    ${dialog(18, 85, 334, 80, `${text(42, 128, '추첨을 통해 선물을 드립니다', 16)}${text(310, 128, '🎁', 20)}`, C.yellow)}
    ${dialog(18, 190, 334, 168, `
      ${text(42, 232, '♪ SONG INFO', 12, C.magenta, { en: true })}
      <rect x="42" y="255" width="286" height="38" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
      ${text(54, 280, '가수', 13, C.soft)}
      <rect x="42" y="305" width="286" height="38" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
      ${text(54, 330, '노래 제목', 13, C.soft)}
    `, C.cream)}
    ${dialog(18, 382, 334, 190, `
      ${text(42, 425, 'YOUR SCENE', 12, C.lavender, { en: true })}
      ${multiline(42, 458, ['이 노래를 들었을때 떠오르는', '장면 또는 개인적인 경험담'], 14)}
      <rect x="42" y="505" width="286" height="44" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>
    `)}
    ${button(44, 630, 282, 56, '제출하기', C.magenta, C.paper)}
  `;
}

function save(name, width, height, body) {
  fs.writeFileSync(path.join(outDir, name), svg(width, height, body));
}

save('page-01-home.svg', 1080, 1920, `
  ${text(540, 160, '첫 화면', 46, C.paper, { anchor: 'middle' })}
  ${text(540, 225, '기분을 입력하고 음악 추천을 시작하는 진입점', 30, C.cream, { anchor: 'middle' })}
  ${phone(345, 310, homeScreen(), { w: 390, h: 844 })}
`);

save('page-02-pick-song.svg', 1080, 1920, `
  ${text(540, 150, '노래 고르기', 46, C.paper, { anchor: 'middle' })}
  ${text(540, 215, '회전초밥처럼 지나가는 앨범에서 마음에 드는 곡 선택', 30, C.cream, { anchor: 'middle' })}
  ${phone(345, 300, beltScreen(), { w: 390, h: 844 })}
`);

save('page-03-song-detail.svg', 1080, 1920, `
  ${text(540, 150, '이 노래는...', 46, C.paper, { anchor: 'middle' })}
  ${text(540, 215, '하트 수, 장면 설명, 미리듣기, 전체곡 링크까지 한 화면에', 29, C.cream, { anchor: 'middle' })}
  ${phone(345, 300, detailScreen(), { w: 390, h: 844 })}
`);

save('page-04-recommend-form.svg', 1080, 1920, `
  ${text(540, 150, '내 노래도 추천하기', 46, C.paper, { anchor: 'middle' })}
  ${text(540, 215, '사용자의 음악기억을 입력받아 새로운 추천으로 저장', 29, C.cream, { anchor: 'middle' })}
  ${phone(345, 300, formScreen(), { w: 390, h: 844 })}
`);

save('ad-closeup-heart.svg', 1080, 1080, `
  <rect width="1080" height="1080" fill="url(#night)"/>
  ${text(80, 130, '마음에 든다면', 58, C.paper)}
  ${text(80, 205, '하트 한 번', 74, C.cream)}
  <g transform="translate(620 180) scale(2.2)">${pixelHeart(0, 0, 10)}</g>
  ${dialog(90, 430, 900, 300, `
    ${album(140, 500, 140, C.magenta, 'LP')}
    ${text(330, 535, 'THIS SONG', 24, C.magenta, { en: true })}
    ${text(330, 590, '지금 기분에 맞는 한 곡', 42, C.ink)}
    ${button(730, 510, 150, 78, '24', C.cream, C.magenta, pixelHeart(752, 532, 6))}
  `)}
  ${text(540, 850, '추천받은 곡에 감정을 남기는 가장 짧은 방법', 34, C.paper, { anchor: 'middle' })}
`);

save('ad-remote-hero.svg', 1600, 900, `
  <rect width="1600" height="900" fill="url(#night)"/>
  <circle cx="1180" cy="200" r="88" fill="${C.yellow}" opacity="0.95"/>
  ${text(110, 180, '도키도키송', 76, C.paper)}
  ${multiline(110, 280, ['지금 기분을 적으면', '음악 기억이 접시 위로 돌아와요'], 46, C.cream)}
  ${phone(1010, 70, beltScreen(), { w: 390, h: 844 })}
  ${album(760, 230, 145, C.magenta, 'LP')}
  ${album(875, 395, 100, C.cyan, '♪')}
  ${album(730, 540, 112, C.yellow, '♫')}
  ${button(110, 650, 360, 76, 'START', C.magenta, C.paper)}
  ${text(110, 805, '기분 기반 음악 추천 · 하트 · 공유 · 사용자 추천', 30, C.paper)}
`);

save('ad-feature-flow.svg', 1600, 1200, `
  ${text(800, 95, '한 장면에서 시작되는 음악 추천', 58, C.paper, { anchor: 'middle' })}
  ${text(800, 155, '입력 → 선택 → 하트 → 전체곡 듣기 → 공유', 32, C.cream, { anchor: 'middle' })}
  ${phone(110, 250, homeScreen(), { w: 300, h: 650 })}
  ${phone(470, 250, beltScreen(), { w: 300, h: 650 })}
  ${phone(830, 250, detailScreen(), { w: 300, h: 650 })}
  ${phone(1190, 250, formScreen(), { w: 300, h: 650 })}
  ${text(260, 980, '기분 입력', 32, C.paper, { anchor: 'middle' })}
  ${text(620, 980, '앨범 선택', 32, C.paper, { anchor: 'middle' })}
  ${text(980, 980, '하트와 듣기', 32, C.paper, { anchor: 'middle' })}
  ${text(1340, 980, '내 노래 추천', 32, C.paper, { anchor: 'middle' })}
`);

save('ad-share-closeup.svg', 1080, 1080, `
  <rect width="1080" height="1080" fill="url(#citypop)"/>
  ${text(540, 135, '친구에게 바로 공유', 60, C.paper, { anchor: 'middle' })}
  ${text(540, 205, '카톡 공유와 URL 복사까지', 36, C.cream, { anchor: 'middle' })}
  ${dialog(150, 350, 780, 330, `
    ${text(540, 420, '공유하기', 44, C.ink, { anchor: 'middle' })}
    ${button(230, 490, 280, 92, 'KAKAO', C.yellow, C.ink, pixelIcon('kakao', 270, 518, 7))}
    ${button(570, 490, 280, 92, 'COPY', C.paper, C.ink, pixelIcon('copy', 615, 512, 7))}
  `)}
  ${text(540, 820, '추천받은 음악 경험을 한 번에 전달하세요', 36, C.paper, { anchor: 'middle' })}
`);

save('ad-remote-wide.svg', 1920, 1080, `
  <rect width="1920" height="1080" fill="url(#night)"/>
  ${text(130, 180, '기분이 음악이 되는 순간', 74, C.paper)}
  ${multiline(130, 285, ['도키도키송은 오늘의 감정과', '누군가의 음악 기억을 연결합니다.'], 40, C.cream)}
  ${phone(1230, 90, detailScreen(), { w: 390, h: 844 })}
  <g transform="translate(760 240) rotate(-8)">${album(0, 0, 190, C.magenta, 'LP')}</g>
  <g transform="translate(930 560) rotate(8)">${album(0, 0, 140, C.cyan, '♪')}</g>
  ${button(130, 745, 420, 84, 'LISTEN NOW', C.magenta, C.paper)}
  ${text(130, 900, '스마트폰 화면, SNS 배너, 행사 안내 이미지에 바로 사용 가능', 31, C.paper)}
`);

fs.writeFileSync(path.join(outDir, 'README.md'), `# Advertisement assets

Generated SVG image set for 도키도키송 advertising.

- page-01-home.svg: 첫 페이지 스마트폰 화면
- page-02-pick-song.svg: 노래 고르기 페이지 스마트폰 화면
- page-03-song-detail.svg: 상세 페이지 스마트폰 화면
- page-04-recommend-form.svg: 추천 작성 페이지 스마트폰 화면
- ad-closeup-heart.svg: 하트 기능 근접샷
- ad-remote-hero.svg: 앱 목적과 분위기를 보여주는 원격샷
- ad-feature-flow.svg: 주요 기능 흐름 설명 이미지
- ad-share-closeup.svg: 카톡 공유/COPY 기능 근접샷
- ad-remote-wide.svg: 와이드 광고 배너용 원격샷
`);

console.log(`Generated advertisement assets in ${outDir}`);
