import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  doc, getDoc, addDoc, updateDoc, collection, onSnapshot, query, orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import Character3D from '../character/Character3D';
import { getCharacter } from '../character/characters';
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
  const location   = useLocation();

  const [test, setTest]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [phase, setPhase]         = useState('intro');   // intro | question | finish
  const [qIdx, setQIdx]           = useState(0);
  const [selected, setSelected]   = useState(null);      // null | answer index
  const [timeLeft, setTimeLeft]   = useState(0);
  const [score, setScore]         = useState(0);          // jami ball
  const [correctCount, setCorrect]= useState(0);          // to'g'ri javoblar soni
  const [lastGain, setLastGain]   = useState(null);       // oxirgi savolda olingan ball

  const [name, setName]           = useState(location.state?.username || '');
  const [playerId, setPlayerId]   = useState(null);
  const [board, setBoard]         = useState([]);         // jonli reyting

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

    /* Ball: to'g'ri javob 500..1000 (tez = ko'p), noto'g'ri/javobsiz = 0 */
    const isRight = idx !== null && idx === currentCard?.correct;
    const total   = test.time ?? 30;
    const gained  = isRight ? 500 + Math.round((500 * Math.max(0, timeLeft)) / total) : 0;

    setLastGain(gained);
    if (isRight) setCorrect(p => p + 1);

    const newScore = score + gained;
    if (gained) setScore(newScore);
    if (playerId) {
      updateDoc(doc(db, 'tests', testId, 'players', playerId), { score: newScore })
        .catch(() => {});
    }

    setTimeout(() => {
      if (qIdx + 1 < test.cards.length) startQuestion(qIdx + 1);
      else setPhase('finish');
    }, 1800);
  }, [selected, currentCard, qIdx, test, startQuestion, timeLeft, score, playerId, testId]);

  /* ── O'yinni boshlash: o'yinchini reytingga qo'shish ── */
  const beginGame = useCallback(async () => {
    if (!name.trim()) return;
    setScore(0); setCorrect(0); setLastGain(null);
    try {
      const ref = await addDoc(collection(db, 'tests', testId, 'players'), {
        username: name.trim(),
        score: 0,
        joinedAt: Date.now(),
      });
      setPlayerId(ref.id);
    } catch { /* reyting yozilmasa ham o'yin davom etadi */ }
    startQuestion(0);
  }, [name, testId, startQuestion]);

  /* ── Qayta urinish ── */
  const retry = useCallback(() => {
    setScore(0); setCorrect(0); setLastGain(null);
    if (playerId) {
      updateDoc(doc(db, 'tests', testId, 'players', playerId), { score: 0 }).catch(() => {});
    }
    startQuestion(0);
  }, [playerId, testId, startQuestion]);

  /* ── Jonli reyting (onSnapshot) ── */
  useEffect(() => {
    const qy = query(collection(db, 'tests', testId, 'players'), orderBy('score', 'desc'));
    const unsub = onSnapshot(qy, snap => {
      setBoard(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [testId]);

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

  /* ── Personaj (mascot) ── */
  const charId = getCharacter(test?.character)?.id;
  const Mascot = charId ? (
    <div className="qg-mascot">
      <Character3D variant={charId} />
    </div>
  ) : null;

  /* ── Reyting ── */
  const myRank = board.findIndex(p => p.id === playerId);
  const renderBoard = (compact) => (
    <div className={`qg-board ${compact ? 'compact' : ''}`}>
      <div className="qg-board-title">🏆 Reyting</div>
      {board.length === 0 && <div className="qg-board-empty">Hali o'yinchi yo'q</div>}
      {board.slice(0, compact ? 5 : 20).map((p, i) => (
        <div key={p.id} className={`qg-board-row ${p.id === playerId ? 'me' : ''}`}>
          <span className="qg-board-rank">{i + 1}</span>
          <span className="qg-board-name">{p.username}</span>
          <span className="qg-board-score">{p.score}</span>
        </div>
      ))}
    </div>
  );

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
        <input
          className="qg-name-input"
          type="text"
          placeholder="Ismingiz"
          value={name}
          onChange={e => setName(e.target.value.slice(0, 20))}
          onKeyDown={e => e.key === 'Enter' && beginGame()}
          maxLength={20}
        />
        <button className="qg-start-btn" onClick={beginGame} disabled={!name.trim()}>
          Boshlash
        </button>
        {board.length > 0 && (
          <p className="qg-intro-joined">{board.length} o'yinchi qatnashmoqda</p>
        )}
      </div>
      {Mascot}
    </div>
  );

  /* FINISH */
  if (phase === 'finish') return (
    <div className="qg-slide" style={bgStyle()}>
      <div className="qg-overlay" />
      <div className="qg-intro-card qg-finish-card">
        <div className="qg-intro-emoji">
          {correctCount === test.cards.length ? '🏆' : correctCount >= test.cards.length / 2 ? '🎉' : '😔'}
        </div>
        <h2 className="qg-intro-title">Test tugadi!</h2>
        <p className="qg-finish-score">{score}</p>
        <p className="qg-intro-meta">
          {correctCount} / {test.cards.length} to'g'ri javob
          {myRank >= 0 && ` · ${myRank + 1}-o'rin`}
        </p>

        {renderBoard(false)}

        <div className="qg-finish-btns">
          <button className="qg-start-btn" onClick={retry}>
            Qayta urinish
          </button>
          <button className="qg-outline-btn" onClick={() => navigate('/')}>
            Chiqish
          </button>
        </div>
      </div>
      {Mascot}
    </div>
  );

  /* QUESTION */
  return (
    <div className="qg-slide" style={bgStyle()}>
      <div className="qg-overlay" />

      {/* Jonli reyting (chap-yuqori) */}
      <div className="qg-board-float">{renderBoard(true)}</div>

      <div className="qg-question-wrap">

        {/* Yuqori panel: progress + timer + ball */}
        <div className="qg-topbar">
          <span className="qg-progress">{qIdx + 1} / {test.cards.length}</span>
          <div className="qg-timer-track">
            <div
              className={`qg-timer-bar ${timeLeft <= 5 ? 'urgent' : ''}`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
          <span className={`qg-timer-num ${timeLeft <= 5 ? 'urgent' : ''}`}>{timeLeft}</span>
          <span className="qg-score-chip">{score}</span>
        </div>

        {/* Savol matni */}
        <div className="qg-question-box">
          <p className="qg-question-text">{currentCard?.question || `${qIdx + 1}-savol`}</p>
          {selected !== null && (
            <p className={`qg-gain ${lastGain > 0 ? 'win' : 'zero'}`}>
              {lastGain > 0 ? `+${lastGain} ball!` : 'Ball yo\'q'}
            </p>
          )}
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
      {Mascot}
    </div>
  );
};

export default QuizGame;