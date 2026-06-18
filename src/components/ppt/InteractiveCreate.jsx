import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/categories';
import './InteractiveCreate.css';

const LABELS = ['A', 'B', 'C', 'D'];
const SLICE_COLORS = ['#ef5350', '#42a5f5', '#ffca28', '#66bb6a', '#ab47bc', '#26c6da', '#ff7043', '#5c6bc0', '#26a69a', '#ec407a'];

const polar = (cx, cy, r, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};
const slicePath = (i, n, r = 95, cx = 100, cy = 100) => {
  const ang = 360 / n;
  const [x1, y1] = polar(cx, cy, r, i * ang);
  const [x2, y2] = polar(cx, cy, r, (i + 1) * ang);
  const large = ang > 180 ? 1 : 0;
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
};

const blankForm = () => ({ question: '', answers: ['', '', '', ''], correct: 0 });

const InteractiveCreate = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [title, setTitle]       = useState('');
  const [category, setCategory] = useState('matematika');
  const [count, setCount]       = useState(6);
  const [cards, setCards]       = useState(Array(6).fill(null));   // har bo'lak: card yoki null

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const [modalIdx, setModalIdx] = useState(null);
  const [form, setForm]         = useState(blankForm());

  const [saving, setSaving]     = useState(false);
  const [hosting, setHosting]   = useState(false);
  const [hostPin, setHostPin]   = useState(null);

  const filled = cards.filter(Boolean).length;
  const allFilled = filled === count && count > 0;

  /* Savollar sonini o'zgartirish */
  const changeCount = (n) => {
    const v = Math.max(3, Math.min(10, n));
    setCount(v);
    setCards(prev => Array.from({ length: v }, (_, i) => prev[i] ?? null));
  };

  /* Modalni ochish */
  const openModal = (i) => {
    setForm(cards[i] ? { ...cards[i], answers: [...cards[i].answers] } : blankForm());
    setModalIdx(i);
  };

  /* Barabanni aylantirish → bo'sh bo'lakka tushadi → modal */
  const spin = () => {
    if (spinning) return;
    const empties = cards.map((c, i) => (c ? null : i)).filter(i => i !== null);
    if (empties.length === 0) return;
    const target = empties[Math.floor(Math.random() * empties.length)];
    const ang = 360 / count;
    const desired = (((-(target + 0.5) * ang) % 360) + 360) % 360;
    const delta = (((desired - (rotation % 360)) % 360) + 360) % 360;
    const newRot = rotation + 360 * 4 + delta;
    setSpinning(true);
    setRotation(newRot);
    setTimeout(() => {
      setSpinning(false);
      openModal(target);
    }, 3300);
  };

  /* Savolni saqlash (modal) */
  const saveQuestion = () => {
    if (!form.question.trim()) { alert('Savol matnini kiriting!'); return; }
    if (form.answers.some(a => !a.trim())) { alert("Barcha 4 ta variantni to'ldiring!"); return; }
    setCards(prev => prev.map((c, i) => (i === modalIdx ? { ...form } : c)));
    setModalIdx(null);
  };

  const generatePin = async () => {
    let code, exists = true;
    while (exists) {
      code = String(Math.floor(100000 + Math.random() * 900000));
      const snap = await getDocs(query(collection(db, 'tests'), where('pin', '==', code)));
      exists = !snap.empty;
    }
    return code;
  };

  const validate = () => {
    if (!title.trim()) { alert('Test sarlavhasini kiriting!'); return false; }
    if (!allFilled) { alert("Barcha bo'laklarni (savollarni) to'ldiring!"); return false; }
    return true;
  };

  const saveTest = async () => {
    const ref = await addDoc(collection(db, 'tests'), {
      title: title.trim(),
      cards: cards.map(c => ({ question: c.question, answers: c.answers, correct: c.correct })),
      bg: 'g6',
      bgImage: null,
      time: 30,
      category,
      wheel: true,
      pin: null,
      live: false,
      ownerEmail: currentUser?.email ?? null,
      ownerName: currentUser?.name ?? null,
      createdAt: Date.now(),
    });
    return ref.id;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try { await saveTest(); navigate('/dashboard'); }
    catch (e) { alert('Xatolik: ' + e.message); }
    finally { setSaving(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, category, cards, allFilled, navigate]);

  const handleHostLive = useCallback(async () => {
    if (!validate()) return;
    setHosting(true);
    try {
      const id = await saveTest();
      const code = await generatePin();
      await updateDoc(doc(db, 'tests', id), { pin: code, live: true, hostedAt: Date.now() });
      setHostPin({ code, testId: id });
    } catch (e) { alert('Xatolik: ' + e.message); }
    finally { setHosting(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, category, cards, allFilled]);

  return (
    <div className="ic-page">
      {/* ── Navbar ── */}
      <div className="ic-top">
        <button className="ic-back" onClick={() => navigate(-1)}>← Orqaga</button>
        <input
          className="ic-title-input"
          placeholder="Test sarlavhasi..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button className="ic-host-btn" onClick={handleHostLive} disabled={hosting || saving}>
          {hosting ? '...' : '🔴 Host Live'}
        </button>
        <button className="ic-save-btn" onClick={handleSave} disabled={saving || hosting}>
          {saving ? '...' : 'Saqlash'}
        </button>
      </div>

      {/* ── Sozlamalar ── */}
      <div className="ic-controls">
        <div className="ic-control">
          <span>Savollar soni:</span>
          <button onClick={() => changeCount(count - 1)} disabled={count <= 3}>−</button>
          <b>{count}</b>
          <button onClick={() => changeCount(count + 1)} disabled={count >= 10}>+</button>
        </div>
        <div className="ic-control">
          <span>Fan:</span>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
        </div>
        <div className="ic-progress">{filled} / {count} to'ldirildi</div>
      </div>

      {/* ── Baraban ── */}
      <div className="ic-wheel-area">
        <div className="ic-wheel-wrap">
          <div className="ic-pointer" />
          <div
            className="ic-wheel"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 3.2s cubic-bezier(.17,.67,.25,1)' : 'none',
            }}
          >
            <svg viewBox="0 0 200 200">
              {Array.from({ length: count }).map((_, i) => {
                const ang = 360 / count;
                const mid = (i + 0.5) * ang;
                const [lx, ly] = polar(100, 100, 62, mid);
                const done = !!cards[i];
                return (
                  <g key={i} onClick={() => openModal(i)} style={{ cursor: 'pointer' }}>
                    <path
                      d={slicePath(i, count)}
                      fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                      stroke="#fff"
                      strokeWidth="2"
                      opacity={done ? 1 : 0.55}
                    />
                    <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                      fill="#fff" fontSize="13" fontWeight="800">
                      {done ? '✓' : i + 1}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="14" fill="#fff" stroke="#ddd" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <button className="ic-spin-btn" onClick={spin} disabled={spinning || allFilled}>
          {allFilled ? '✅ Hammasi tayyor' : spinning ? 'Aylanmoqda...' : '🎡 Barabanni aylantirish'}
        </button>
        <p className="ic-hint">Bo'lakka bosib ham savol yozishingiz mumkin</p>
      </div>

      {/* ── Savol modal ── */}
      {modalIdx !== null && (
        <div className="ic-modal-overlay" onClick={() => setModalIdx(null)}>
          <div className="ic-modal" onClick={e => e.stopPropagation()}>
            <h2 className="ic-modal-title">{modalIdx + 1}-savol</h2>
            <input
              className="ic-q-input"
              placeholder="Savol matnini kiriting..."
              value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              autoFocus
            />
            <div className="ic-answers">
              {form.answers.map((a, i) => (
                <div key={i} className={`ic-ans-row ${form.correct === i ? 'correct' : ''}`}>
                  <button
                    className="ic-ans-mark"
                    onClick={() => setForm(f => ({ ...f, correct: i }))}
                    title="To'g'ri javob"
                  >
                    {form.correct === i ? '✓' : LABELS[i]}
                  </button>
                  <input
                    placeholder={`${LABELS[i]} variant`}
                    value={a}
                    onChange={e => setForm(f => {
                      const answers = [...f.answers];
                      answers[i] = e.target.value;
                      return { ...f, answers };
                    })}
                  />
                </div>
              ))}
            </div>
            <div className="ic-modal-btns">
              <button className="ic-modal-cancel" onClick={() => setModalIdx(null)}>Bekor</button>
              <button className="ic-modal-save" onClick={saveQuestion}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Host Live PIN modal ── */}
      {hostPin && (
        <div className="ic-modal-overlay" onClick={() => setHostPin(null)}>
          <div className="ic-pin-modal" onClick={e => e.stopPropagation()}>
            <div className="ic-pin-icon">🔴</div>
            <h2 className="ic-modal-title">Jonli sessiya boshlandi!</h2>
            <p className="ic-pin-desc">O'quvchilar bosh sahifada shu PIN bilan jonli yechishadi:</p>
            <div className="ic-pin-code">
              {hostPin.code.split('').map((d, i) => <span key={i} className="ic-pin-digit">{d}</span>)}
            </div>
            <div className="ic-modal-btns">
              <button className="ic-modal-cancel" onClick={() => navigator.clipboard.writeText(hostPin.code)}>Nusxalash</button>
              <button className="ic-modal-save" onClick={() => navigate(`/play/${hostPin.testId}`)}>Testga o'tish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCreate;
