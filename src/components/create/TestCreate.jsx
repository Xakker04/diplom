import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/categories';
import './TestCreate.css';

const LABELS  = ['A', 'B', 'C', 'D'];
const COLORS  = ['#e84d4d', '#1368ce', '#d89e00', '#26890c'];

const PRESET_BGS = [
  { id: 'g1', style: { background: 'linear-gradient(135deg,#1a1a2e,#16213e)' } },
  { id: 'g2', style: { background: 'linear-gradient(135deg,#0f3460,#533483)' } },
  { id: 'g3', style: { background: 'linear-gradient(135deg,#134e5e,#71b280)' } },
  { id: 'g4', style: { background: 'linear-gradient(135deg,#c94b4b,#4b134f)' } },
  { id: 'g5', style: { background: 'linear-gradient(135deg,#f7971e,#ffd200)' } },
  { id: 'g6', style: { background: 'linear-gradient(135deg,#4776e6,#8e54e9)' } },
  { id: 'g7', style: { background: 'linear-gradient(135deg,#11998e,#38ef7d)' } },
  { id: 'g8', style: { background: 'linear-gradient(135deg,#373b44,#4286f4)' } },
  { id: 'g9', style: { background: 'linear-gradient(135deg,#fc5c7d,#6a3093)' } },
];

const makeCard = () => ({
  id: Date.now() + Math.random(),
  question: '',
  answers: ['', '', '', ''],
  correct: 0,
});

const initialCards = [makeCard()];

/* ── Mini card (chap sidebar) ── */
const MiniCard = ({ card, cardIdx, isSelected, onSelect, onDelete, onDuplicate, canDelete }) => (
  <div className="mc-row">
    <div className="mc-actions">
      <button className="mc-action-btn" onClick={() => onDuplicate(card.id)} title="Nusxa">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>
      {canDelete && (
        <button className="mc-action-btn mc-delete" onClick={() => onDelete(card.id)} title="O'chirish">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      )}
    </div>

    <div className={`mc-card ${isSelected ? 'mc-selected' : ''}`} onClick={() => onSelect(card.id)}>
      <div className="mc-card-label">Question</div>
      <div className="mc-card-middle">
        <div className="mc-num">{cardIdx + 1}</div>
        <div className="mc-img-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      </div>
      <div className="mc-lines">
        <div className="mc-line" />
        <div className="mc-line mc-line-short" />
      </div>
    </div>
  </div>
);

/* ── Markaziy savol kartasi ── */
const QuestionCard = ({ card, sectionIdx, onChange, bgStyle, bgImage }) => {
  const cardStyle = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : bgStyle;

  return (
    <div className="q-slide" style={cardStyle}>
      <div className="q-slide-overlay" />

      <div className="q-slide-inner">
        {/* Sarlavha */}
        <div className="q-title-wrap">
          <input
            className="q-title-input"
            type="text"
            placeholder="Savol matnini kiriting..."
            value={card.question}
            onChange={e => onChange(sectionIdx, card.id, 'question', e.target.value)}
          />
        </div>

        {/* Javoblar 2×2 to'rtburchak grid */}
        <div className="q-answers-grid">
          {card.answers.map((ans, ai) => (
            <div
              key={ai}
              className={`q-answer-rect ${card.correct === ai ? 'is-correct' : ''}`}
              style={{ '--ans-color': COLORS[ai] }}
            >
              <button
                className="q-answer-label"
                onClick={() => onChange(sectionIdx, card.id, 'correct', ai)}
                title="To'g'ri javob sifatida belgilash"
              >
                {card.correct === ai
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : LABELS[ai]
                }
              </button>
              <input
                className="q-answer-input"
                type="text"
                placeholder={`${LABELS[ai]} variant...`}
                value={ans}
                onChange={e => {
                  const updated = [...card.answers];
                  updated[ai] = e.target.value;
                  onChange(sectionIdx, card.id, 'answers', updated);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TIME_PRESETS = [10, 20, 30, 60, 90, 120];

/* ── O'ng sidebar: orqa fon + vaqt + personaj ── */
const BgSidebar = ({ selectedBg, onSelect, bgImage, onImageUpload, onImageRemove, time, onTimeChange, category, onCategoryChange }) => (
  <aside className="bg-sidebar">
    {/* ── Fan ── */}
    <div className="bg-sidebar-title">Fan</div>
    <select
      className="bg-cat-select"
      value={category}
      onChange={e => onCategoryChange(e.target.value)}
    >
      {CATEGORIES.map(c => (
        <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
      ))}
    </select>

    <div className="bg-divider" />

    <div className="bg-sidebar-title">Orqa fon</div>

    <div className="bg-presets">
      {PRESET_BGS.map(bg => (
        <button
          key={bg.id}
          className={`bg-preset-item ${selectedBg === bg.id ? 'selected' : ''}`}
          style={bg.style}
          onClick={() => onSelect(bg.id)}
          title="Fon tanlash"
        />
      ))}
    </div>

    <div className="bg-divider" />

    <div className="bg-upload-section">
      <div className="bg-upload-label">Rasm yuklash</div>
      {bgImage ? (
        <div className="bg-image-preview-wrap">
          <img className="bg-image-preview" src={bgImage} alt="fon" />
          <button className="bg-image-remove" onClick={onImageRemove}>✕</button>
        </div>
      ) : (
        <label className="bg-upload-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Rasm tanlang
          <input type="file" accept="image/*" hidden onChange={onImageUpload} />
        </label>
      )}
    </div>

    <div className="bg-divider" />

    {/* ── Test vaqti ── */}
    <div className="bg-time-section">
      <div className="bg-upload-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 5 }}>
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Test vaqti (sek)
      </div>

      <div className="bg-time-presets">
        {TIME_PRESETS.map(sec => (
          <button
            key={sec}
            className={`bg-time-chip ${time === sec ? 'selected' : ''}`}
            onClick={() => onTimeChange(sec)}
          >
            {sec}s
          </button>
        ))}
      </div>

      <input
        className="bg-time-input"
        type="number"
        min="5"
        max="3600"
        placeholder="O'zingiz kiriting..."
        value={time}
        onChange={e => onTimeChange(Math.max(0, Number(e.target.value)))}
      />
    </div>
  </aside>
);

/* ── Asosiy komponent ── */
const TestCreate = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cards, setCards]               = useState(initialCards);
  const [selectedId, setSelectedId]     = useState(initialCards[0].id);
  const [testTitle, setTestTitle]       = useState('');
  const [selectedBg, setSelectedBg]     = useState('g1');
  const [bgImage, setBgImage]           = useState(null);
  const [time, setTime]                 = useState(30);
  const [category, setCategory]         = useState('matematika');
  const [saving, setSaving]             = useState(false);
  const [hosting, setHosting]           = useState(false);
  const [hostPin, setHostPin]           = useState(null);   // { code, testId }

  const selectedCard = cards.find(c => c.id === selectedId) ?? cards[0];

  const addCard = () => {
    const card = makeCard();
    setCards(prev => [...prev, card]);
    setSelectedId(card.id);
  };

  const deleteCard = (id) => {
    if (cards.length === 1) return;
    const remaining = cards.filter(c => c.id !== id);
    setCards(remaining);
    if (id === selectedId) setSelectedId(remaining[0].id);
  };

  const duplicateCard = (id) => {
    const orig = cards.find(c => c.id === id);
    if (!orig) return;
    const copy = { ...orig, id: Date.now() + Math.random() };
    setCards(prev => {
      const idx = prev.findIndex(c => c.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setSelectedId(copy.id);
  };

  const changeCard = (_, cardId, field, value) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, [field]: value } : c));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setBgImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  /* Testni saqlab, hujjat ID sini qaytaradi */
  const saveTest = async () => {
    const ref = await addDoc(collection(db, 'tests'), {
      title: testTitle.trim(),
      cards: cards.map(({ id: _id, ...rest }) => rest),
      bg: selectedBg,
      bgImage: bgImage ?? null,
      time,
      category,
      pin: null,
      live: false,
      ownerEmail: currentUser?.email ?? null,
      ownerName: currentUser?.name ?? null,
      createdAt: Date.now(),
    });
    return ref.id;
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

  /* Saqlash: faqat saqlanadi (Learn'da ko'rinadi) */
  const handleSave = async () => {
    if (!testTitle.trim()) { alert("Test sarlavhasini kiriting!"); return; }
    setSaving(true);
    try {
      await saveTest();
      navigate('/dashboard');
    } catch (err) {
      alert('Xatolik: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* Host Live: saqlaydi + PIN beradi (jonli o'ynash) */
  const handleHostLive = async () => {
    if (!testTitle.trim()) { alert("Test sarlavhasini kiriting!"); return; }
    setHosting(true);
    try {
      const id = await saveTest();
      const code = await generatePin();
      await updateDoc(doc(db, 'tests', id), { pin: code, live: true, hostedAt: Date.now() });
      setHostPin({ code, testId: id });
    } catch (err) {
      alert('Xatolik: ' + err.message);
    } finally {
      setHosting(false);
    }
  };

  const bgStyle = bgImage ? {} : (PRESET_BGS.find(b => b.id === selectedBg)?.style ?? {});

  return (
    <div className="tc-wrapper">

      {/* ── Yuqori panel ── */}
      <div className="tc-topbar">
        <button className="tc-back-btn" onClick={() => navigate(-1)}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Orqaga
        </button>

        <input
          className="tc-title-input"
          type="text"
          placeholder="Test sarlavhasi..."
          value={testTitle}
          onChange={e => setTestTitle(e.target.value)}
        />

        <button className="tc-host-btn" onClick={handleHostLive} disabled={hosting || saving}>
          {hosting ? '...' : '🔴 Host Live'}
        </button>

        <button className="tc-save-btn" onClick={handleSave} disabled={saving || hosting}>
          {saving ? <span className="tc-save-spinner" /> : 'Saqlash'}
        </button>
      </div>

      {/* ── Asosiy qator ── */}
      <div className="tc-main-row">

        {/* Chap sidebar */}
        <aside className="tc-sidebar">
          <div className="tc-sidebar-head">
            <span className="tc-sidebar-num">1</span>
            <span className="tc-sidebar-title">Quiz</span>
          </div>

          <div className="tc-mini-list">
            {cards.map((card, ci) => (
              <MiniCard
                key={card.id}
                card={card}
                cardIdx={ci}
                isSelected={card.id === selectedCard.id}
                onSelect={setSelectedId}
                onDelete={deleteCard}
                onDuplicate={duplicateCard}
                canDelete={cards.length > 1}
              />
            ))}
          </div>

          <div className="tc-sidebar-btns">
            <button className="tc-add-btn" onClick={addCard}>+ Add</button>
            <button className="tc-generate-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Generate
            </button>
          </div>
        </aside>

        {/* Markaziy kontent */}
        <main className="tc-content">
          <QuestionCard
            card={selectedCard}
            sectionIdx={0}
            onChange={changeCard}
            bgStyle={bgStyle}
            bgImage={bgImage}
          />
        </main>

        {/* O'ng sidebar: fon + vaqt */}
        <BgSidebar
          selectedBg={selectedBg}
          onSelect={(id) => { setSelectedBg(id); setBgImage(null); }}
          bgImage={bgImage}
          onImageUpload={handleImageUpload}
          onImageRemove={() => setBgImage(null)}
          time={time}
          onTimeChange={setTime}
          category={category}
          onCategoryChange={setCategory}
        />
      </div>

      {/* ── Host Live PIN modal ── */}
      {hostPin && (
        <div className="pin-modal-overlay" onClick={() => setHostPin(null)}>
          <div className="pin-modal" onClick={e => e.stopPropagation()}>
            <div className="pin-modal-icon">🔴</div>
            <h2 className="pin-modal-title">Jonli sessiya boshlandi!</h2>
            <p className="pin-modal-desc">O'quvchilar bosh sahifada shu PIN bilan jonli yechishadi:</p>
            <div className="pin-modal-code">
              {hostPin.code.split('').map((d, i) => (
                <span key={i} className="pin-digit">{d}</span>
              ))}
            </div>
            <p className="pin-modal-hint">PIN kodni nusxalang va o'quvchilarga yuboring</p>
            <div className="pin-modal-btns">
              <button
                className="pin-copy-btn"
                onClick={() => navigator.clipboard.writeText(hostPin.code)}
              >
                Nusxalash
              </button>
              <button className="pin-close-btn" onClick={() => navigate(`/play/${hostPin.testId}`)}>
                Testga o'tish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(TestCreate);
