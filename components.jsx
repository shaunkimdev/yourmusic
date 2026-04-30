// yourmusic — 공유 컴포넌트 + 디자인 토큰
// 도키도키트립 패턴: window.* 로 export하여 메인 HTML에서 사용

// ── Design Tokens (시티팝 + 픽셀 게임 팔레트) ────────────────
const T = {
  // 시티팝 그라디언트
  bgGradient: 'linear-gradient(180deg, #FF6B9D 0%, #C084FC 50%, #7DD3FC 100%)',
  bgGradientDark: 'linear-gradient(180deg, #FF1493 0%, #7C3AED 60%, #1E3A8A 100%)',

  // 액센트
  magenta: '#FF1493',
  pink: '#FF6B9D',
  cyan: '#00D4FF',
  skyblue: '#7DD3FC',
  lavender: '#C084FC',
  peach: '#FFB088',
  yellow: '#FCD34D',

  // 카드/UI
  cream: '#FFF4D6',       // 시티팝 페이퍼 톤
  paper: '#FFFFFF',       // 카드 배경
  ink: '#1A1A2E',         // 픽셀 텍스트
  shadow: '#7C3AED',      // 픽셀 그림자
  inkSoft: '#3D3D5C',
  border: '#1A1A2E',

  // 폰트
  fontEn: "'Pokemon GB', monospace",
  fontKr: "'Galmuri11', 'Pokemon GB', monospace",
};

// ── Pixel Animation Keyframes ────────────────────────────────
// (메인 HTML <style>에서도 정의 — 여기서는 참조용)
//   @keyframes orbitPath    { from { offset-distance:0%; } to { offset-distance:100%; } }
//   @keyframes beltFlow     { from { background-position:0 0; } to { background-position:48px 0; } }
//   @keyframes blink        { 0%,50%{opacity:1} 51%,100%{opacity:0} }

// ── Status Bar (모바일 목업 분위기) ──────────────────────────
function StatusBar() {
  return (
    <div style={{
      height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 14px', background: 'transparent', flexShrink: 0,
      fontFamily: T.fontEn, fontSize: 11, color: T.ink, letterSpacing: '0.05em',
    }}>
      <span>10:39</span>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <span style={{ fontSize: 10 }}>▮▮▮▯</span>
        <span>♥</span>
      </span>
    </div>
  );
}

// ── Top Nav (픽셀 스타일) ────────────────────────────────────
function TopNav({ title, subtitle, onBack }) {
  return (
    <div style={{
      padding: '8px 12px 12px', display: 'flex', alignItems: 'center', gap: 8,
      flexShrink: 0,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 36, height: 36, background: T.paper, border: `3px solid ${T.ink}`,
          boxShadow: `3px 3px 0 ${T.ink}`, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fontEn, fontSize: 14, color: T.ink, padding: 0,
        }}>
          ◀
        </button>
      )}
      <div style={{ flex: 1, lineHeight: 1.1 }}>
        <div style={{ fontFamily: T.fontEn, fontSize: 16, color: T.ink, letterSpacing: '0.02em' }}>{title}</div>
        {subtitle && (
          <div style={{ fontFamily: T.fontKr, fontSize: 11, color: T.inkSoft, marginTop: 4 }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ── Pixel Dialog Box (포켓몬 대화창) ─────────────────────────
function PixelDialog({ children, color = T.paper, textColor = T.ink, blinkArrow = false, style, contentStyle }) {
  return (
    <div style={{
      background: color, border: `4px solid ${T.ink}`,
      boxShadow: `4px 4px 0 ${T.ink}`,
      padding: '14px 14px 16px', position: 'relative',
      fontFamily: T.fontKr, fontSize: 12.5, lineHeight: 1.7,
      color: textColor, wordBreak: 'keep-all',
      ...style,
    }}>
      {/* Inner double border (포켓몬 GB 다이얼로그 특유의 안쪽 라인) */}
      <div style={{
        position: 'absolute', inset: 4,
        border: `1.5px solid ${T.ink}`, pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', ...contentStyle }}>{children}</div>
      {blinkArrow && (
        <span style={{
          position: 'absolute', right: 10, bottom: 6,
          fontFamily: T.fontEn, color: T.ink,
          animation: 'blink 0.8s steps(1) infinite',
        }}>▼</span>
      )}
    </div>
  );
}

// ── Pixel Button ─────────────────────────────────────────────
function PixelButton({ children, onClick, color = T.magenta, textColor = '#fff', size = 'md', style }) {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 11 },
    md: { padding: '12px 18px', fontSize: 13 },
    lg: { padding: '16px 22px', fontSize: 15 },
  };
  const [pressed, setPressed] = React.useState(false);
  const offset = pressed ? 0 : 4;
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        background: color, color: textColor,
        border: `3px solid ${T.ink}`,
        boxShadow: `${offset}px ${offset}px 0 ${T.ink}`,
        transform: pressed ? 'translate(4px, 4px)' : 'translate(0,0)',
        fontFamily: T.fontEn, fontWeight: 'normal',
        cursor: 'pointer', letterSpacing: '0.04em',
        transition: 'transform 0.05s, box-shadow 0.05s',
        ...sizes[size],
        ...style,
      }}
    >{children}</button>
  );
}

// ── Pixel Input / Textarea ───────────────────────────────────
function PixelInput({ value, onChange, placeholder, type = 'text', style }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        width: '100%', height: 38,
        background: T.paper, border: `3px solid ${T.ink}`,
        boxShadow: `2px 2px 0 ${T.ink}`,
        padding: '0 10px',
        fontFamily: T.fontKr, fontSize: 12, color: T.ink,
        outline: 'none', boxSizing: 'border-box',
        ...style,
      }}
    />
  );
}

function PixelTextarea({ value, onChange, placeholder, rows = 3, style }) {
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{
        width: '100%',
        background: T.paper, border: `3px solid ${T.ink}`,
        boxShadow: `2px 2px 0 ${T.ink}`,
        padding: '8px 10px',
        fontFamily: T.fontKr, fontSize: 12, color: T.ink, lineHeight: 1.5,
        outline: 'none', boxSizing: 'border-box', resize: 'none',
        ...style,
      }}
    />
  );
}

const PLATE_SPRITES = [
  '접시_분홍.png',
  '접시_초록.png',
  '접시_크림.png',
  '접시_파랑.png',
];

// ── Album Plate (접시 위 앨범커버) ──────────────────────────
// 접시 이미지와 앨범커버를 별도 레이어로 올려 둘 다 비율 유지
function AlbumPlate({ song, size = 80, plateImage, onClick }) {
  const plateWidth = size * 1.64;
  const plateHeight = size;
  const coverSize = size * 0.48;
  return (
    <div
      onClick={onClick}
      style={{
        width: plateWidth, height: plateHeight, position: 'relative', cursor: 'pointer',
        filter: 'drop-shadow(2px 3px 0 rgba(0,0,0,0.35))',
      }}
    >
      {plateImage ? (
        <img
          src={plateImage}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
          }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: T.paper,
          border: `3px solid ${T.ink}`,
          borderRadius: '50%',
        }} />
      )}
      {/* 앨범커버 (사각 픽셀 카드) */}
      <div style={{
        position: 'absolute',
        top: '41%', left: '50%',
        width: coverSize, height: coverSize,
        transform: 'translate(-50%, -50%) rotate(-2deg)',
        overflow: 'visible',
        zIndex: 3,
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: song.coverColor,
          border: `2.5px solid ${T.ink}`,
          boxShadow: `2px 2px 0 rgba(26,26,46,0.48)`,
          overflow: 'hidden',
          fontSize: size * 0.28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {song.coverImage ? (
            <img
              src={song.coverImage}
              alt={`${song.artist} - ${song.title}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {song.cover}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sushi Belt (회전초밥 컨베이어) ──────────────────────────
// 배경 이미지는 정사각형으로 유지하고, 접시는 motion path로 타원 궤도 이동
function SushiBelt({ plates, onPlateClick, onActiveSongChange, radius = 110, plateSize = 76 }) {
  const beltSize = (radius + plateSize / 2) * 2 + 28;
  const cx = beltSize / 2;
  const cy = beltSize * 0.52;
  const rx = beltSize * 0.32;
  const ry = beltSize * 0.22;
  const duration = 60;
  const orbitPath = [
    `M ${cx - rx} ${cy}`,
    `C ${cx - rx} ${cy - ry * 0.5523} ${cx - rx * 0.5523} ${cy - ry} ${cx} ${cy - ry}`,
    `C ${cx + rx * 0.5523} ${cy - ry} ${cx + rx} ${cy - ry * 0.5523} ${cx + rx} ${cy}`,
    `C ${cx + rx} ${cy + ry * 0.5523} ${cx + rx * 0.5523} ${cy + ry} ${cx} ${cy + ry}`,
    `C ${cx - rx * 0.5523} ${cy + ry} ${cx - rx} ${cy + ry * 0.5523} ${cx - rx} ${cy}`,
    'Z',
  ].join(' ');
  const plateSpriteOrder = React.useMemo(
    () => plates.map(() => PLATE_SPRITES[Math.floor(Math.random() * PLATE_SPRITES.length)]),
    [plates]
  );

  React.useEffect(() => {
    if (!onActiveSongChange || !plates.length) return;
    let activeId = null;
    const startedAt = performance.now();
    const updateActiveSong = () => {
      const elapsed = ((performance.now() - startedAt) / 1000) % duration;
      const base = (elapsed / duration) * 100;
      let closest = plates[0];
      let bestDistance = Infinity;

      plates.forEach((song, i) => {
        const distanceOnPath = (base + (i * 100) / plates.length) % 100;
        const delta = Math.abs(distanceOnPath - 75);
        const wrappedDelta = Math.min(delta, 100 - delta);
        if (wrappedDelta < bestDistance) {
          bestDistance = wrappedDelta;
          closest = song;
        }
      });

      if (closest && closest.id !== activeId) {
        activeId = closest.id;
        onActiveSongChange(closest);
      }
    };

    updateActiveSong();
    const timer = window.setInterval(updateActiveSong, 250);
    return () => window.clearInterval(timer);
  }, [plates, onActiveSongChange]);

  return (
    <div style={{
      position: 'relative',
      width: beltSize, height: beltSize,
      margin: '0 auto',
      backgroundImage: 'url("회전초밥_접시제거.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      border: `4px solid ${T.ink}`,
      boxShadow: `5px 5px 0 ${T.ink}`,
      overflow: 'hidden',
      imageRendering: 'pixelated',
    }}>
      {/* 움직이는 레일 하이라이트 */}
      <div style={{
        position: 'absolute',
        left: cx - rx,
        top: cy - ry,
        width: rx * 2,
        height: ry * 2,
        borderRadius: '50%',
        background: 'repeating-linear-gradient(90deg, rgba(255,244,214,0.26) 0 12px, rgba(26,26,46,0.12) 12px 24px)',
        backgroundSize: '48px 100%',
        animation: 'beltFlow 1.2s linear infinite',
        mixBlendMode: 'screen',
        opacity: 0.42,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        left: cx - rx,
        top: cy - ry,
        width: rx * 2,
        height: ry * 2,
        border: `3px solid rgba(255,244,214,0.86)`,
        borderRadius: '50%',
        boxShadow: `0 0 0 3px rgba(26,26,46,0.42)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        left: cx - rx * 0.62,
        top: cy - ry * 0.58,
        width: rx * 1.24,
        height: ry * 1.16,
        border: `2px solid rgba(26,26,46,0.55)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      {/* 접시와 앨범커버는 같은 motion path를 따라 이동하되 비율은 고정 */}
      <div style={{
        position: 'absolute',
        inset: 0,
      }}>
        {plates.map((song, i) => (
          (() => {
            const delay = `${(-duration / plates.length) * i}s`;
            return (
          <div
            key={song.id}
            style={{
              position: 'absolute',
              width: plateSize * 1.64,
              height: plateSize,
              offsetPath: `path("${orbitPath}")`,
              offsetRotate: '0deg',
              offsetAnchor: '50% 50%',
              animation: `orbitPath ${duration}s linear infinite`,
              animationDelay: delay,
              zIndex: 10 + i,
            }}
          >
            <AlbumPlate
              song={song}
              size={plateSize}
              plateImage={plateSpriteOrder[i]}
              onClick={() => onPlateClick && onPlateClick(song)}
            />
          </div>
            );
          })()
        ))}
      </div>
    </div>
  );
}

// ── 시티팝 픽셀 데코 (배경 별/구름) ─────────────────────────
function CityPopBackground({ children }) {
  return (
    <div style={{
      flex: 1, position: 'relative', overflow: 'hidden',
      background: T.bgGradient,
    }}>
      {/* 픽셀 별 데코 */}
      <div style={{
        position: 'absolute', top: 14, right: 16,
        fontFamily: T.fontEn, fontSize: 10, color: '#fff', opacity: 0.85,
        textShadow: `1px 1px 0 ${T.ink}`,
      }}>★ ✦ ✧</div>
      <div style={{
        position: 'absolute', top: 90, left: 14,
        fontFamily: T.fontEn, fontSize: 8, color: '#fff', opacity: 0.7,
        textShadow: `1px 1px 0 ${T.ink}`,
      }}>✦</div>
      <div style={{
        position: 'absolute', bottom: 200, right: 22,
        fontFamily: T.fontEn, fontSize: 9, color: '#fff', opacity: 0.6,
        textShadow: `1px 1px 0 ${T.ink}`,
      }}>✧ ★</div>
      {/* 콘텐츠 */}
      <div style={{ position: 'relative', height: '100%', overflowY: 'auto' }} className="scroll-area">
        {children}
      </div>
    </div>
  );
}

// ── Export to window ─────────────────────────────────────────
Object.assign(window, {
  T,
  StatusBar, TopNav,
  PixelDialog, PixelButton, PixelInput, PixelTextarea,
  AlbumPlate, SushiBelt,
  CityPopBackground,
});
