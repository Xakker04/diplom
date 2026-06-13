import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './QuizGame.css';

const LABELS = ['A', 'B', 'C', 'D'];
const COLORS  = ['#e84d4d', '#1368ce', '#d89e00', '#26890c'];
const SHAPES  = ['▲', '◆', '●', '■'];

const PRESET_BGS = {
  g1: 'linear-gradient(135deg,#1a1a2e,#16213e)',
  g2: 'linear-gradient(135deg,#0f3460,#533483)',
  g3: 'linear-gradient(135deg,#134e5e,#71b280)',
  g4: 'linear-gradient(135deg,#c94b4b,#4b134f)',
  g5: 'linear-gradient(135deg,#f7971e,#ffd200)',
  g6: 'linear-gradient(135deg,#4776e6,#8e54e9)',
  g7: 'linear-gradient(135deg,#11998e,#38ef7d)',
  g8: 'linear-gradient(135deg,#373b44,#4286f4)',
  g9: 'linear-gradient(135deg,#fc5c7d,#6a3093)',
};

/* ── Loading ── */
const Loader = () => (
  <div className="qg-loader">
    <div className="qg-spinner" />
    <p>Test yuklanmoqda...</p>
  </div>
);

/* ── QuizGame ── */
const QuizGame = () => {
  const { testId } = useParams();
  const navigate   = useNavigate();

  const [test, setTest]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [phase, setPhase]         = useState('intro');   // intro | question | result | finish
  const [qIdx, setQIdx]           = useState(0);
  const [selected, setSelected]   = useState(null);      // null | answer index
  const [timeLeft, setTimeLeft]   = useState(0);
  const [score, setScore]         = useState(0);

  /* ── Firebase dan test yuklash ── */
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'tests', testId));
        if (!snap.exists()) { setError("Test topilmadi."); return; }
        const data = snap.data();
        setTest(data);
        setTimeLeft(data.time ?? 30);
      } catch {
        setError("Testni yuklashda xatolik. Internet aloqasini tekshiring.");
      } finally {
        setLoading(false);
      }
    })();
  }, [testId]);

  const currentCard = test?.cards?.[qIdx];

  /* ── 1. Savol boshlash (handleAnswer'dan OLDIN) ── */
  const startQuestion = useCallback((idx) => {
    setQIdx(idx);
    setSelected(null);
    setTimeLeft(test.time ?? 30);
    setPhase('question');
  }, [test]);

  /* ── 2. Javob tanlash (startQuestion'dan KEYIN) ── */
  const handleAnswer = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = currentCard?.correct;
    const isRight = idx === correct;
    if (isRight) setScore(p => p + 1);
    setTimeout(() => {
      if (qIdx + 1 < test.cards.length) {
        startQuestion(qIdx + 1);
      } else {
        setPhase('finish');
      }
    }, 1500);
  }, [selected, currentCard, qIdx, test, startQuestion]);

  /* ── 3. Timer (handleAnswer'dan KEYIN) ── */
  useEffect(() => {
    if (phase !== 'question' || selected !== null) return;
    if (timeLeft <= 0) { handleAnswer(null); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, selected, handleAnswer]);

  /* ── Fon style ── */
  const bgStyle = () => {
    if (!test) return {};
    if (test.bgImage) return { backgroundImage: `url(${test.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    return { background: PRESET_BGS[test.bg] ?? PRESET_BGS.g1 };
  };

  const timerPct = test ? (timeLeft / (test.time ?? 30)) * 100 : 100;

  /* ── Render ── */
  if (loading) return <Loader />;
  if (error)   return (
    <div className="qg-loader">
      <p className="qg-error">{error}</p>
      <button className="qg-btn" onClick={() => navigate('/')}>Bosh sahifaga</button>
    </div>
  );

  /* INTRO */
  if (phase === 'intro') return (
    <div className="qg-slide" style={bgStyle()}>
      <div className="qg-overlay" />
      <div className="qg-intro-card">
        <div className="qg-intro-emoji">📝</div>
        <h1 className="qg-intro-title">{test.title}</h1>
        <p className="qg-intro-meta">{test.cards.length} ta savol · {test.time ?? 30} sek/savol</p>
        <button className="qg-start-btn" onClick={() => startQuestion(0)}>Boshlash</button>
      </div>
    </div>
  );

  /* FINISH */
  if (phase === 'finish') return (
    <div className="qg-slide" style={bgStyle()}>
      <div className="qg-overlay" />
      <div className="qg-intro-card">
        <div className="qg-intro-emoji">
          {score === test.cards.length ? '🏆' : score >= test.cards.length / 2 ? '🎉' : '😔'}
        </div>
        <h2 className="qg-intro-title">Test tugadi!</h2>
        <p className="qg-finish-score">
          {score} / {test.cards.length}
        </p>
        <p className="qg-intro-meta">
          {score === test.cards.length
            ? "Mukammal natija! Barcha savollarga to'g'ri javob berdingiz!"
            : score >= test.cards.length / 2
            ? "Yaxshi natija! Davom eting."
            : "Ko'proq mashq qiling!"}
        </p>
        <div className="qg-finish-btns">
          <button className="qg-start-btn" onClick={() => { setScore(0); startQuestion(0); }}>
            Qayta urinish
          </button>
          <button className="qg-outline-btn" onClick={() => navigate('/')}>
            Chiqish
          </button>
        </div>
      </div>
    </div>
  );

  /* QUESTION */
  return (
    <div className="qg-slide" style={bgStyle()}>
      <div className="qg-overlay" />

      <div className="qg-question-wrap">

        {/* Yuqori panel: progress + timer */}
        <div className="qg-topbar">
          <span className="qg-progress">{qIdx + 1} / {test.cards.length}</span>
          <div className="qg-timer-track">
            <div
              className={`qg-timer-bar ${timeLeft <= 5 ? 'urgent' : ''}`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
          <span className={`qg-timer-num ${timeLeft <= 5 ? 'urgent' : ''}`}>{timeLeft}</span>
        </div>

        {/* Savol matni */}
        <div className="qg-question-box">
          <p className="qg-question-text">{currentCard?.question || `${qIdx + 1}-savol`}</p>
        </div>

        {/* Javoblar 2×2 */}
        <div className="qg-answers-grid">
          {currentCard?.answers.map((ans, ai) => {
            let state = 'idle';
            if (selected !== null) {
              if (ai === currentCard.correct) state = 'correct';
              else if (ai === selected)       state = 'wrong';
              else                            state = 'dim';
            }
            return (
              <button
                key={ai}
                className={`qg-answer-btn qg-state-${state}`}
                style={{ '--ans-color': COLORS[ai] }}
                onClick={() => handleAnswer(ai)}
                disabled={selected !== null}
              >
                <span className="qg-ans-shape">{SHAPES[ai]}</span>
                <span className="qg-ans-text">{ans || `${LABELS[ai]} variant`}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizGame;