import { memo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './main.css';

const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>
);

const IconTrophy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
);

const IconGamepad = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"/>
    <line x1="8" y1="10" x2="8" y2="14"/>
    <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth="3"/>
    <line x1="18" y1="11" x2="18.01" y2="11" strokeWidth="3"/>
    <rect x="2" y="6" width="20" height="12" rx="4"/>
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const FEATURES = [
  { Icon: IconTarget,   text: 'Real vaqtda natijalar'  },
  { Icon: IconBarChart, text: 'Batafsil statistika'     },
  { Icon: IconTrophy,   text: 'Reyting tizimi'          },
];

const Main = () => {
  const [pin, setPin]           = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();
  const inputRef                = useRef();

  const handleEnter = async () => {
    if (pin.length !== 6 || loading) return;
    if (!username.trim()) { setError('Ismingizni kiriting.'); return; }
    setLoading(true);
    setError('');
    try {
      const q    = query(collection(db, 'tests'), where('pin', '==', pin));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('Bunday PIN kod topilmadi. Qayta tekshiring.');
      } else {
        navigate(`/play/${snap.docs[0].id}`, { state: { username: username.trim() } });
      }
    } catch (err) {
      console.error('Firebase error:', err);
      if (err?.code === 'permission-denied') {
        setError("Firebase ruxsati yo'q. Firestore Rules ni tekshiring.");
      } else {
        setError('Xatolik: ' + (err?.message ?? err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setError('');
    setPin(e.target.value.replace(/\D/g, '').slice(0, 6));
  };

  return (
    <div className="main-page">

      {/* ── Left hero panel ── */}
      <div className="main-left">
        <div className="main-hero-badge">
          <span className="main-hero-badge-dot" />
          Onlayn ta'lim platformasi
        </div>

        <h1 className="main-hero-title">
          Bilim olish<br />
          <span>o'yin orqali</span>
        </h1>

        <p className="main-hero-desc">
          Qalem go — interaktiv testlar va o'yinlar orqali o'quvchilar bilimini
          tekshirish uchun zamonaviy platforma.
        </p>

        <div className="main-features">
          {FEATURES.map(({ Icon, text }) => (
            <div className="main-feature-item" key={text}>
              <div className="main-feature-icon"><Icon /></div>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right PIN panel ── */}
      <div className="main-right">
        <div className="pin-card">
          <div className="pin-card-header">
            <div className="pin-card-icon"><IconGamepad /></div>
            <h2 className="pin-card-title">Testga kirish</h2>
            <p className="pin-card-sub">6 xonali PIN kodni kiriting</p>
          </div>

          <input
            className="pin-name-input"
            type="text"
            placeholder="Ismingiz (reytingda ko'rinadi)"
            value={username}
            onChange={e => { setError(''); setUsername(e.target.value.slice(0, 20)); }}
            disabled={loading}
            maxLength={20}
          />

          <div className="pin-boxes-wrap" onClick={() => inputRef.current?.focus()}>
            <div className="pin-boxes">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={[
                    'pin-box',
                    pin[i] ? 'filled' : '',
                    i === pin.length ? 'active' : '',
                  ].join(' ')}
                >
                  {pin[i] ?? ''}
                </div>
              ))}
            </div>
            <input
              ref={inputRef}
              className="pin-input-hidden"
              type="text"
              inputMode="numeric"
              value={pin}
              onChange={handleChange}
              onKeyDown={e => e.key === 'Enter' && handleEnter()}
              maxLength={6}
              autoFocus
              disabled={loading}
              aria-label="PIN kod"
            />
          </div>

          {error && (
            <p className="pin-error"><IconAlert /> {error}</p>
          )}

          <div className="pin-actions">
            <button
              className={`pin-enter-btn ${pin.length === 6 && !loading ? 'active' : ''}`}
              onClick={handleEnter}
              disabled={pin.length !== 6 || loading}
            >
              {loading
                ? <><span className="pin-spinner" /> Tekshirilmoqda...</>
                : 'Kirish →'
              }
            </button>
            <button className="pin-learn-btn" onClick={() => navigate('/learn')}>
              📚 Learn
            </button>
          </div>

          <div className="pin-divider">yoki</div>
          <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, margin: '12px 0 0', fontWeight: 500 }}>
            Test yaratish uchun ro'yxatdan o'ting
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(Main);
