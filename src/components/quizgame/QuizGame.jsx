import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  doc, getDoc, addDoc, updateDoc, deleteDoc, collection, onSnapshot, query, orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { getCategory } from '../../data/categories';
import Avatar, { AVATARS } from '../avatar/Avatar';
import AIEvaluation from '../ai/AIEvaluation';
import Wheel, { rotationForIndex } from '../ppt/Wheel';
import { playSpin, playCorrect, playWrong, playWin, playTick, playGo } from '../ppt/sounds';
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
  const [avatar, setAvatar]       = useState(location.state?.avatar || 'moose');
  const [playerId, setPlayerId]   = useState(null);
  const [board, setBoard]         = useState([]);         // jonli reyting
  const [log, setLog]             = useState([]);         // AI tahlil uchun javoblar
  const [showAI, setShowAI]       = useState(false);      // AI tahlil modali

  // Baraban rejimi (interaktiv testlar uchun)
  const [done, setDone]           = useState([]);         // qaysi savollar tugagani
  const [wheelPhase, setWheelPhase] = useState('spin');   // spin | answer
  const [rotation, setRotation]   = useState(0);
  const [spinning, setSpinning]   = useState(false);

  // Jonli (host) lobbi + sanoq
  const hosted = !!location.state?.live;                  // PIN orqali kirgan jonli sessiya
  const [hostStarted, setHostStarted] = useState(false);  // o'qituvchi boshladimi
  const [count, setCount]         = useState(3);          // 3..1 sanoq

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
  const isWheel = !!test?.wheel;

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

    if (isRight) playCorrect(); else playWrong();   // ovoz
    setLastGain(gained);
    if (isRight) setCorrect(p => p + 1);

    // AI tahlil uchun javobni yozib boramiz
    setLog(prev => [...prev, {
      question: currentCard?.question || '',
      studentAnswer: idx == null ? null : (currentCard?.answers?.[idx] ?? `variant ${idx + 1}`),
      correct: currentCard?.answers?.[currentCard?.correct] ?? `variant ${(currentCard?.correct ?? 0) + 1}`,
      isRight,
    }]);

    const newScore = score + gained;
    if (gained) setScore(newScore);
    if (playerId) {
      updateDoc(doc(db, 'tests', testId, 'players', playerId), { score: newScore })
        .catch(() => {});
    }

    setTimeout(() => {
      if (isWheel) {
        const nd = done.slice();
        nd[qIdx] = true;
        setDone(nd);
        if (nd.every(Boolean)) { playWin(); setPhase('finish'); }
        else setWheelPhase('spin');
      } else if (qIdx + 1 < test.cards.length) {
        startQuestion(qIdx + 1);
      } else {
        playWin();
        setPhase('finish');
      }
    }, 1800);
  }, [selected, currentCard, qIdx, test, startQuestion, timeLeft, score, playerId, testId, isWheel, done]);

  /* ── O'yinni boshlash: o'yinchini reytingga qo'shish ── */
  /* O'yinni haqiqiy boshlash (sanoqdan keyin) */
  const beginNow = useCallback(() => {
    if (test?.wheel) { setSelected(null); setRotation(0); setWheelPhase('spin'); setPhase('question'); }
    else startQuestion(0);
  }, [test, startQuestion]);

  /* 1-2-3 sanoq fazasiga o'tish */
  const startPlay = useCallback(() => {
    setCount(3);
    setPhase('countdown');
  }, []);

  const beginGame = useCallback(async () => {
    if (!name.trim()) return;
    setScore(0); setCorrect(0); setLastGain(null); setLog([]);
    setDone(Array(test.cards.length).fill(false));
    try {
      const ref = await addDoc(collection(db, 'tests', testId, 'players'), {
        username: name.trim(),
        avatar,
        score: 0,
        joinedAt: Date.now(),
        lastActive: Date.now(),
      });
      setPlayerId(ref.id);
    } catch { /* reyting yozilmasa ham o'yin davom etadi */ }
    if (hosted) setPhase('waiting');   // o'qituvchi boshlashini kutamiz
    else startPlay();
  }, [name, avatar, testId, test, hosted, startPlay]);

  /* ── Barabanni aylantirish: bo'sh savolga tushadi → savol chiqadi ── */
  const spinWheel = useCallback(() => {
    if (spinning) return;
    const remaining = done.map((d, i) => (d ? null : i)).filter(i => i !== null);
    if (remaining.length === 0) return;
    const target = remaining[Math.floor(Math.random() * remaining.length)];
    const newRot = rotationForIndex(rotation, target, test.cards.length, 4);
    setSpinning(true);
    setRotation(newRot);
    playSpin(3.2);
    setTimeout(() => {
      setSpinning(false);
      setQIdx(target);
      setSelected(null);
      setTimeLeft(test.time ?? 30);
      setWheelPhase('answer');
    }, 3300);
  }, [spinning, done, rotation, test]);

  /* ── Qayta urinish ── */
  const retry = useCallback(() => {
    setScore(0); setCorrect(0); setLastGain(null); setLog([]);
    setDone(Array(test.cards.length).fill(false));
    if (playerId) {
      updateDoc(doc(db, 'tests', testId, 'players', playerId), { score: 0 }).catch(() => {});
    }
    startPlay();
  }, [playerId, testId, startPlay, test]);

  /* ── Jonli reyting (onSnapshot) + eski o'yinchilarni tozalash ── */
  useEffect(() => {
    const qy = query(collection(db, 'tests', testId, 'players'), orderBy('score', 'desc'));
    const unsub = onSnapshot(qy, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBoard(all);
      // Tashlab ketilgan (60 soniyadan beri faolsiz) o'yinchilarni o'chiramiz
      const staleBefore = Date.now() - 60000;
      all.forEach(p => {
        const t = p.lastActive ?? p.joinedAt ?? 0;
        if (t && t < staleBefore) {
          deleteDoc(doc(db, 'tests', testId, 'players', p.id)).catch(() => {});
        }
      });
    }, () => {});
    return () => unsub();
  }, [testId]);

  /* ── Heartbeat: o'ynayotganda har 8 soniyada faollikni yangilab turamiz ── */
  useEffect(() => {
    if (!playerId) return;
    const beat = () => updateDoc(doc(db, 'tests', testId, 'players', playerId), { lastActive: Date.now() }).catch(() => {});
    beat();
    const iv = setInterval(beat, 8000);
    return () => clearInterval(iv);
  }, [playerId, testId]);

  /* ── Chiqib ketganda o'yinchini reytingdan o'chiramiz ── */
  const playerIdRef = useRef(null);
  useEffect(() => { playerIdRef.current = playerId; }, [playerId]);
  useEffect(() => () => {
    const id = playerIdRef.current;
    if (id) deleteDoc(doc(db, 'tests', testId, 'players', id)).catch(() => {});
  }, [testId]);

  /* ── 3. Timer (handleAnswer'dan KEYIN) ── */
  useEffect(() => {
    if (phase !== 'question' || selected !== null) return;
    if (isWheel && wheelPhase !== 'answer') return;   // baraban aylanayotganda timer yo'q
    if (timeLeft <= 0) { handleAnswer(null); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, selected, handleAnswer, isWheel, wheelPhase]);

  /* ── O'qituvchi "Boshlash" ni bosganini kuzatish (jonli) ── */
  useEffect(() => {
    if (!hosted) return;
    const unsub = onSnapshot(doc(db, 'tests', testId), snap => {
      setHostStarted(!!snap.data()?.started);
    }, () => {});
    return () => unsub();
  }, [hosted, testId]);

  useEffect(() => {
    if (hosted && hostStarted && phase === 'waiting') startPlay();
  }, [hosted, hostStarted, phase, startPlay]);

  /* ── 1-2-3 sanoq ── */
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count <= 0) { playGo(); beginNow(); return; }
    playTick();
    const t = setTimeout(() => setCount(c => c - 1), 850);
    return () => clearTimeout(t);
  }, [phase, count, beginNow]);

  /* ── Fon style ── */
  const bgStyle = () => {
    if (!test) return {};
    if (test.bgImage) return { backgroundImage: `url(${test.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    return { background: PRESET_BGS[test.bg] ?? PRESET_BGS.g1 };
  };

  const timerPct = test ? (timeLeft / (test.time ?? 30)) * 100 : 100;

  /* ── Faqat hozir o'ynayotgan o'yinchilar (20s ichida faol) ── */
  const liveBoard = board.filter(p => Date.now() - (p.lastActive ?? p.joinedAt ?? 0) < 20000);
  const myRank = liveBoard.findIndex(p => p.id === playerId);
  const renderBoard = (compact) => (
    <div className={`qg-board ${compact ? 'compact' : ''}`}>
      <div className="qg-board-title">🏆 Reyting</div>
      {liveBoard.length === 0 && <div className="qg-board-empty">Hali o'yinchi yo'q</div>}
      {liveBoard.slice(0, compact ? 5 : 20).map((p, i) => (
        <div key={p.id} className={`qg-board-row ${p.id === playerId ? 'me' : ''}`}>
          <span className="qg-board-rank">{i + 1}</span>
          <span className="qg-board-av"><Avatar id={p.avatar || 'moose'} size={22} /></span>
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
        <div className="qg-avatar-label">Personajingizni tanlang</div>
        <div className="qg-avatars">
          {AVATARS.map(a => (
            <button
              key={a.id}
              type="button"
              className={`qg-avatar ${avatar === a.id ? 'selected' : ''}`}
              onClick={() => setAvatar(a.id)}
              title={a.label}
            >
              <Avatar id={a.id} size={46} />
            </button>
          ))}
        </div>

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
        {liveBoard.length > 0 && (
          <p className="qg-intro-joined">{liveBoard.length} o'yinchi qatnashmoqda</p>
        )}
      </div>
    </div>
  );

  /* FINISH */
  if (phase === 'finish') return (
    <div className="qg-slide" style={bgStyle()}>
      <div className="qg-overlay" />
      <div className="qg-finish-wrap">
        <h2 className="qg-finish-head">🏆 Natijalar</h2>

        {/* ── Podium (o'suvchi diagramma) ── */}
        <div className="qg-podium">
          {[
            { p: liveBoard[1], place: 2 },
            { p: liveBoard[0], place: 1 },
            { p: liveBoard[2], place: 3 },
          ].filter(x => x.p).map(({ p, place }, i) => (
            <div key={p.id} className={`qg-pod-col place-${place}`}>
              <div className="qg-pod-avatar" style={{ animationDelay: `${i * 0.25}s` }}>
                <Avatar id={p.avatar || 'moose'} size={76} />
              </div>
              <div className="qg-pod-bar">
                <div className={`qg-pod-badge badge-${place}`}>{place}</div>
                <div className="qg-pod-name">{p.username}</div>
                <div className="qg-pod-score">{p.score} ball</div>
              </div>
            </div>
          ))}
        </div>

        {myRank >= 3 && (
          <p className="qg-finish-self">Siz: {myRank + 1}-o'rin · {score} ball</p>
        )}

        <div className="qg-finish-btns">
          <button className="qg-ai-btn" onClick={() => setShowAI(true)}>
            🤖 AI bilim tahlili
          </button>
          <button className="qg-start-btn" onClick={retry}>
            Qayta urinish
          </button>
          <button className="qg-outline-btn" onClick={() => navigate('/')}>
            Chiqish
          </button>
        </div>
      </div>
      {showAI && (
        <AIEvaluation
          payload={{
            title: test.title,
            subject: getCategory(test.category)?.label || 'Umumiy',
            score,
            correctCount,
            total: test.cards.length,
            items: log,
          }}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );

  /* WAITING — o'qituvchi boshlashini kutish */
  if (phase === 'waiting') return (
    <div className="qg-slide" style={bgStyle()}>
      <div className="qg-overlay" />
      <div className="qg-intro-card">
        <div className="qg-wait-me"><Avatar id={avatar} size={64} /></div>
        <h2 className="qg-intro-title">{name}</h2>
        <p className="qg-intro-meta">O'qituvchi boshlashini kuting...</p>
        <div className="qg-wait-dots"><span /><span /><span /></div>
        {liveBoard.length > 0 && (
          <p className="qg-intro-joined">{liveBoard.length} ishtirokchi qo'shildi</p>
        )}
      </div>
    </div>
  );

  /* COUNTDOWN — 1,2,3 */
  if (phase === 'countdown') return (
    <div className="qg-slide" style={bgStyle()}>
      <div className="qg-overlay" />
      <div key={count} className="qg-countdown">{count > 0 ? count : '🚀'}</div>
    </div>
  );

  /* QUESTION */
  return (
    <div className="qg-slide" style={bgStyle()}>
      <div className="qg-overlay" />

      {/* Jonli reyting (chap-yuqori) */}
      <div className="qg-board-float">{renderBoard(true)}</div>

      {isWheel && wheelPhase === 'spin' ? (
        <div className="qg-wheel-area">
          <p className="qg-wheel-q">{done.filter(Boolean).length} / {test.cards.length} · Barabanni aylantiring</p>
          <Wheel count={test.cards.length} rotation={rotation} spinning={spinning} done={done} />
          <button className="qg-spin-btn" onClick={spinWheel} disabled={spinning}>
            {spinning ? 'Aylanmoqda...' : '🎡 Aylantirish'}
          </button>
          <span className="qg-score-chip">{score} ball</span>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default QuizGame;