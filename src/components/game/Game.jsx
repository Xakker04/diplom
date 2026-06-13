import { useState, useEffect, useRef, useCallback } from 'react';
import './Game.css';

const WIN_THRESHOLD = 0.88;
const PRESS_FORCE = 0.045;
const DECAY = 0.993;
const GAME_DURATION = 30;

const getCharStyle = (side, isActive) => {
  const lean = 'rotate(-10deg) translateX(-4px)';
  if (side === 'left') {
    return {
      transform: isActive ? lean : 'none',
      transition: isActive ? 'transform 0.07s ease-out' : 'transform 0.2s ease-in-out',
    };
  }
  return {
    transform: isActive ? `scaleX(-1) ${lean}` : 'scaleX(-1)',
    transition: isActive ? 'transform 0.07s ease-out' : 'transform 0.2s ease-in-out',
  };
};

/* ── Uzbek atlas ikat + doppi character ─────────────────── */
const Character = ({ side, isActive, uid }) => {
  const isLeft = side === 'left';
  const S = `c${uid}`;

  /* colour palettes */
  const shirtBg   = isLeft ? '#0e45c0' : '#c01208';
  const wave1     = isLeft ? '#5ba8ff' : '#ffc200';
  const wave2     = isLeft ? '#3870e8' : '#ff8000';
  const waveHi    = isLeft ? '#b8d8ff' : '#ffe880';
  const shoeCol   = isLeft ? '#0b3490' : '#8a0a0a';
  const shoeHi    = isLeft ? '#1e60d8' : '#d82020';
  const skin      = '#d4956b';
  const skinDark  = '#b87040';
  const pants     = '#0d1230';

  return (
    <div className="char-wrap" style={getCharStyle(side, isActive)}>
      <svg viewBox="0 0 100 172" width="88" height="151">
        <defs>
          {/* Shirt body clip */}
          <clipPath id={`${S}-sh`}>
            <path d="M12 57 L60 57 L76 108 L34 108 Z" />
          </clipPath>
          {/* Doppi clip */}
          <clipPath id={`${S}-dp`}>
            <ellipse cx="33" cy="16" rx="22" ry="15" />
          </clipPath>
        </defs>

        {/* ══ BACK LEG ══ */}
        <path d="M42 108 Q34 133 22 161"
          stroke={pants} strokeWidth="17" strokeLinecap="round" fill="none" />

        {/* ══ BACK ARM ══ */}
        <path d="M17 65 Q7 78 4 89"
          stroke={skin} strokeWidth="13" strokeLinecap="round" fill="none" />
        <circle cx="4" cy="91" r="7.5" fill={skinDark} />

        {/* ══ ATLAS SHIRT ══ */}
        {/* base fill */}
        <path d="M12 57 L60 57 L76 108 L34 108 Z" fill={shirtBg} />
        {/* ikat wave bands (clipped) */}
        <g clipPath={`url(#${S}-sh)`}>
          {[-8, 5, 18, 31, 44, 57, 70, 83, 96].map((x, i) => (
            <path key={i}
              d={`M${x} 38 C${x - 6} 58 ${x + 6} 78 ${x} 98 C${x - 6} 118 ${x + 6} 138 ${x} 158`}
              stroke={i % 2 === 0 ? wave1 : wave2}
              strokeWidth={i % 2 === 0 ? 8 : 5}
              fill="none" strokeLinecap="round" opacity="0.88"
            />
          ))}
          {/* highlight shimmer */}
          {[-8, 18, 44, 70, 96].map((x, i) => (
            <path key={i}
              d={`M${x} 38 C${x - 6} 58 ${x + 6} 78 ${x} 98 C${x - 6} 118 ${x + 6} 138 ${x} 158`}
              stroke={waveHi} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"
            />
          ))}
        </g>
        {/* shirt edge shadow */}
        <path d="M12 57 L60 57 L76 108 L34 108 Z"
          fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
        {/* V-collar */}
        <path d="M33 57 L36 68 L40 57"
          fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" />

        {/* ══ FRONT ARM ══ */}
        <path d="M56 64 Q78 77 86 89"
          stroke={skin} strokeWidth="14" strokeLinecap="round" fill="none" />
        {/* fist */}
        <circle cx="87" cy="91" r="8.5" fill={skinDark} />
        <path d="M80 88 Q87 85 94 88"
          stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" fill="none" />

        {/* ══ FRONT LEG ══ */}
        <path d="M64 108 Q74 137 82 163"
          stroke={pants} strokeWidth="17" strokeLinecap="round" fill="none" />

        {/* ══ BACK SHOE ══ */}
        <ellipse cx="20" cy="163" rx="17" ry="9" fill={shoeCol} />
        <ellipse cx="17" cy="160" rx="11" ry="4" fill={shoeHi} opacity="0.45" />

        {/* ══ NECK ══ */}
        <path d="M28 54 Q36 49 44 54 L45 64 Q36 61 29 64 Z" fill={skin} />

        {/* ══ HEAD ══ */}
        <circle cx="33" cy="36" r="22" fill={skin} />
        {/* jaw shadow */}
        <ellipse cx="33" cy="54" rx="14" ry="5" fill={skinDark} opacity="0.35" />
        {/* ear */}
        <ellipse cx="12" cy="37" rx="5.5" ry="6.5" fill={skinDark} />
        <ellipse cx="13" cy="37" rx="2.8" ry="4" fill="#b06838" opacity="0.5" />

        {/* eyebrows */}
        <path d="M21 28 Q27 24 33 27"
          stroke="#3e2006" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M35 27 Q41 23 47 26"
          stroke="#3e2006" strokeWidth="2.8" fill="none" strokeLinecap="round" />

        {/* eye whites */}
        <ellipse cx="27" cy="34" rx="6" ry="6" fill="white" />
        <ellipse cx="39" cy="33" rx="6" ry="6" fill="white" />
        {/* irises */}
        <circle cx="28.5" cy="35" r="3.8" fill="#111" />
        <circle cx="40.5" cy="34" r="3.8" fill="#111" />
        {/* eye shine */}
        <circle cx="30" cy="33.2" r="1.5" fill="white" />
        <circle cx="42" cy="32.2" r="1.5" fill="white" />

        {/* nose */}
        <ellipse cx="29" cy="42" rx="2" ry="1.4" fill={skinDark} opacity="0.55" />
        <ellipse cx="37" cy="42" rx="2" ry="1.4" fill={skinDark} opacity="0.55" />
        <path d="M30 43 Q33 46 37 43"
          stroke={skinDark} strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* mouth */}
        <path
          d={isActive ? 'M26 49 Q33 55 40 49' : 'M27 49 Q33 52 39 49'}
          stroke="#7a2e08" strokeWidth="2.3" fill="none" strokeLinecap="round"
        />
        {/* cheek blush */}
        <ellipse cx="19" cy="41" rx="5.5" ry="3.5" fill="#e06040" opacity="0.14" />
        <ellipse cx="47" cy="40" rx="5.5" ry="3.5" fill="#e06040" opacity="0.14" />

        {/* ══ DOPPI (Uzbek skullcap) ══ */}
        <ellipse cx="33" cy="17" rx="23" ry="15" fill="#111" />
        <ellipse cx="33" cy="14" rx="18" ry="11" fill="#1a1a1a" />
        {/* white embroidery grid (clipped) */}
        <g clipPath={`url(#${S}-dp)`}>
          {[12, 18, 24, 30, 36, 42, 48].map(x =>
            [3, 9, 15, 21].map(y => (
              <rect key={`${x}-${y}`}
                x={x} y={y} width="4" height="4"
                fill="white" opacity="0.7" rx="0.5"
              />
            ))
          )}
          {/* small diamond motifs */}
          {[20, 33, 46].map((x, i) => (
            <polygon key={i}
              points={`${x},6 ${x + 3},9 ${x},12 ${x - 3},9`}
              fill="white" opacity="0.45"
            />
          ))}
        </g>
        {/* brim line */}
        <path d="M10 23 Q33 30 56 23"
          stroke="#060606" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* ══ FRONT SHOE ══ */}
        <ellipse cx="83" cy="165" rx="17" ry="9" fill={shoeCol} />
        <ellipse cx="80" cy="162" rx="11" ry="4" fill={shoeHi} opacity="0.45" />
      </svg>
    </div>
  );
};

/* ── Game component ─────────────────────────────────────── */
const Game = () => {
  const [ropePos, setRopePos]     = useState(0);
  const [gameState, setGameState] = useState('idle');
  const [winner, setWinner]       = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft]   = useState(GAME_DURATION);
  const [leftActive, setLeftActive]   = useState(false);
  const [rightActive, setRightActive] = useState(false);

  const ropePosRef   = useRef(0);
  const gameStateRef = useRef('idle');
  const leftTimerRef  = useRef(null);
  const rightTimerRef = useRef(null);
  const loopRef  = useRef(null);
  const timerRef = useRef(null);

  const finishGame = useCallback((pos) => {
    if (gameStateRef.current === 'finished') return;
    gameStateRef.current = 'finished';
    setGameState('finished');
    clearInterval(loopRef.current);
    clearInterval(timerRef.current);
    if (pos < -0.05) setWinner('left');
    else if (pos > 0.05) setWinner('right');
    else setWinner('draw');
  }, []);

  const press = useCallback((side) => {
    if (gameStateRef.current !== 'playing') return;
    if (side === 'left') {
      ropePosRef.current = Math.max(-1, ropePosRef.current - PRESS_FORCE);
      setLeftActive(true);
      clearTimeout(leftTimerRef.current);
      leftTimerRef.current = setTimeout(() => setLeftActive(false), 130);
    } else {
      ropePosRef.current = Math.min(1, ropePosRef.current + PRESS_FORCE);
      setRightActive(true);
      clearTimeout(rightTimerRef.current);
      rightTimerRef.current = setTimeout(() => setRightActive(false), 130);
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      if (e.key === 'a' || e.key === 'A') press('left');
      if (e.key === 'l' || e.key === 'L') press('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press]);

  const startGame = () => {
    clearInterval(loopRef.current);
    clearInterval(timerRef.current);
    ropePosRef.current = 0;
    gameStateRef.current = 'idle';
    setRopePos(0);
    setWinner(null);
    setLeftActive(false);
    setRightActive(false);
    setTimeLeft(GAME_DURATION);

    let count = 3;
    setCountdown(count);
    setGameState('countdown');
    gameStateRef.current = 'countdown';

    const countInt = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(countInt);
        setGameState('playing');
        gameStateRef.current = 'playing';

        loopRef.current = setInterval(() => {
          ropePosRef.current *= DECAY;
          const p = ropePosRef.current;
          setRopePos(p);
          if (p <= -WIN_THRESHOLD || p >= WIN_THRESHOLD) finishGame(p);
        }, 16);

        let t = GAME_DURATION;
        timerRef.current = setInterval(() => {
          t--;
          setTimeLeft(t);
          if (t <= 0) finishGame(ropePosRef.current);
        }, 1000);
      }
    }, 1000);
  };

  const flagLeft  = `${50 + ropePos * 43}%`;
  const leftFill  = ropePos < 0 ? Math.abs(ropePos) * 100 : 0;
  const rightFill = ropePos > 0 ? ropePos * 100 : 0;

  return (
    <div className="game-page">
      <h1 className="game-title">Arqon Tortish</h1>
      <p className="game-desc">
        Chap jamoa: <b className="key-hint blue-key">A</b>
        &nbsp;|&nbsp;
        O'ng jamoa: <b className="key-hint red-key">L</b>
      </p>

      <div className="game-box">
        <div className="team team-left">
          <Character side="left" isActive={leftActive} uid="a" />
          <Character side="left" isActive={leftActive} uid="b" />
        </div>

        <div className="rope-zone">
          <div className="center-dashed" />
          <div className="rope-track">
            <div className="rope-flag" style={{ left: flagLeft }} />
          </div>
          <div className="zone-label left-label">Ko'k</div>
          <div className="zone-label right-label">Qizil</div>
        </div>

        <div className="team team-right">
          <Character side="right" isActive={rightActive} uid="c" />
          <Character side="right" isActive={rightActive} uid="d" />
        </div>
      </div>

      <div className="score-row">
        <span className="team-label blue-label">Ko'k</span>
        <div className="bar-track">
          <div className="bar-blue" style={{ width: `${leftFill}%` }} />
          <div className="bar-red"  style={{ width: `${rightFill}%` }} />
          <div className="bar-mid" />
        </div>
        <span className="team-label red-label">Qizil</span>
      </div>

      {gameState === 'playing' && (
        <div className={`timer-box ${timeLeft <= 5 ? 'urgent' : ''}`}>{timeLeft}</div>
      )}

      <div className="press-row">
        <button className="press-btn press-blue"
          onClick={() => press('left')}
          onTouchStart={(e) => { e.preventDefault(); press('left'); }}>
          <span className="btn-key">A</span>
          <span className="btn-sub">Ko'k jamoa</span>
        </button>
        <button className="press-btn press-red"
          onClick={() => press('right')}
          onTouchStart={(e) => { e.preventDefault(); press('right'); }}>
          <span className="btn-key">L</span>
          <span className="btn-sub">Qizil jamoa</span>
        </button>
      </div>

      {gameState === 'idle' && (
        <div className="overlay">
          <div className="overlay-card">
            <div className="overlay-icon">🪢</div>
            <h2>Arqon Tortish</h2>
            <p>
              Ikki kishi o'ynaydi.<br />
              Chap: <b>A</b> tugmasini tez bos &nbsp;|&nbsp; O'ng: <b>L</b> tugmasini tez bos.<br />
              Bayroqni o'z tomonga tortgan g'olib!
            </p>
            <button className="start-btn" onClick={startGame}>O'yinni boshlash</button>
          </div>
        </div>
      )}

      {gameState === 'countdown' && (
        <div className="overlay overlay-dark">
          <div className="countdown-wrap">
            <div className="countdown-num" key={countdown}>{countdown}</div>
            <div className="countdown-label">tayyor bo'ling!</div>
          </div>
        </div>
      )}

      {gameState === 'finished' && winner && (
        <div className="overlay overlay-dark">
          <div className="overlay-card">
            {winner === 'left'  && <><div className="win-icon">🔵</div><div className="win-text blue-win">Ko'k jamoa g'alaba qozondi!</div></>}
            {winner === 'right' && <><div className="win-icon">🔴</div><div className="win-text red-win">Qizil jamoa g'alaba qozondi!</div></>}
            {winner === 'draw'  && <><div className="win-icon">🤝</div><div className="win-text draw-win">Durrang!</div></>}
            <button className="start-btn" onClick={startGame}>Qayta o'ynash</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
