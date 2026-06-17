import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './TugGame.css';

/* ── Namuna savollar ── */
const QUESTIONS = [
  { q: '5 × 6 = ?',                          a: ['30', '35', '11', '25'],                 c: 0 },
  { q: "O'zbekiston poytaxti qaysi shahar?", a: ['Samarqand', 'Toshkent', 'Buxoro', 'Xiva'], c: 1 },
  { q: '12 + 19 = ?',                        a: ['31', '29', '32', '21'],                 c: 0 },
  { q: 'Bir yilda nechta oy bor?',           a: ['10', '11', '12', '13'],                 c: 2 },
  { q: 'Suvning kimyoviy belgisi?',          a: ['CO₂', 'O₂', 'H₂O', 'NaCl'],             c: 2 },
  { q: '9 × 9 = ?',                          a: ['81', '72', '99', '89'],                 c: 0 },
  { q: 'Quyosh qaysi tomondan chiqadi?',     a: ["G'arb", 'Shimol', 'Sharq', 'Janub'],    c: 2 },
  { q: '100 − 37 = ?',                       a: ['73', '63', '67', '53'],                 c: 1 },
];

const WIN = 6;          // g'alaba uchun qadamlar soni
const STEP_PX = 22;     // har qadam uchun siljish (px)

/* ── Arqon tortish sahnasi (rasm + animatsiya) ── */
const TugScene = ({ knot, pulling }) => (
  <div className="tug-scene">
    <div className="tug-shift" style={{ transform: `translateX(${knot * STEP_PX}px)` }}>
      <img
        className={`tug-img tug-wobble ${pulling ? 'tug-yank' : ''}`}
        src="/tug-game.png"
        alt="Arqon tortish"
        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
      />
    </div>
  </div>
);

const TugGame = () => {
  const navigate = useNavigate();
  const [knot, setKnot]         = useState(0);     // - ko'k tomon, + qizil tomon
  const [turn, setTurn]         = useState('blue');
  const [qi, setQi]             = useState(0);
  const [selected, setSelected] = useState(null);
  const [winner, setWinner]     = useState(null);
  const [pulling, setPulling]   = useState(false);

  const q = QUESTIONS[qi];

  const handleAnswer = useCallback((idx) => {
    if (selected !== null || winner) return;
    setSelected(idx);
    const correct = idx === q.c;
    // to'g'ri → o'z tomoniga; noto'g'ri → raqib tomoniga
    const dir = turn === 'blue' ? -1 : 1;
    const delta = correct ? dir : -dir;
    const newKnot = Math.max(-WIN, Math.min(WIN, knot + delta));
    setKnot(newKnot);
    setPulling(true);

    setTimeout(() => {
      setPulling(false);
      if (Math.abs(newKnot) >= WIN) {
        setWinner(newKnot < 0 ? 'blue' : 'red');
      } else {
        setTurn(t => (t === 'blue' ? 'red' : 'blue'));
        setQi(i => (i + 1) % QUESTIONS.length);
        setSelected(null);
      }
    }, 1300);
  }, [selected, winner, q, turn, knot]);

  const restart = () => {
    setKnot(0); setTurn('blue'); setQi(0); setSelected(null); setWinner(null); setPulling(false);
  };

  const teamName = (t) => (t === 'blue' ? "Ko'k jamoa" : 'Qizil jamoa');

  return (
    <div className="tug-page">
      <div className="tug-top">
        <button className="tug-back" onClick={() => navigate(-1)}>← Orqaga</button>
        <h1 className="tug-title">Arqon tortish</h1>
        <div className="tug-spacer" />
      </div>

      {/* Hisob ko'rsatkichi */}
      <div className="tug-bar">
        <div className="tug-bar-team blue">Ko'k</div>
        <div className="tug-bar-track">
          <div className="tug-bar-fill" style={{ left: `${50 + (knot / WIN) * 50}%` }} />
        </div>
        <div className="tug-bar-team red">Qizil</div>
      </div>

      <TugScene knot={knot} pulling={pulling} />

      {!winner && (
        <>
          <div className={`tug-turn ${turn}`}>{teamName(turn)} navbati</div>
          <div className="tug-question">{q.q}</div>
          <div className="tug-answers">
            {q.a.map((ans, i) => {
              let state = '';
              if (selected !== null) {
                if (i === q.c) state = 'correct';
                else if (i === selected) state = 'wrong';
                else state = 'dim';
              }
              return (
                <button
                  key={i}
                  className={`tug-ans ${turn} ${state}`}
                  onClick={() => handleAnswer(i)}
                  disabled={selected !== null}
                >
                  {ans}
                </button>
              );
            })}
          </div>
        </>
      )}

      {winner && (
        <div className="tug-win-overlay">
          <div className={`tug-win-card ${winner}`}>
            <div className="tug-win-emoji">🏆</div>
            <h2>{teamName(winner)} g'olib!</h2>
            <div className="tug-win-btns">
              <button className="tug-win-again" onClick={restart}>Qaytadan</button>
              <button className="tug-win-exit" onClick={() => navigate('/dashboard')}>Chiqish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TugGame;
