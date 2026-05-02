const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'dist');
const files = [
  'index.html',
  'components.jsx',
  'config.js',
  'music-data.js',
  '접시.png',
  '접시_분홍.png',
  '접시_초록.png',
  '접시_크림.png',
  '접시_파랑.png',
  '회전초밥.png',
  '회전초밥_접시제거.png',
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(outDir, file));
}

