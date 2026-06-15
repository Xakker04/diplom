import { memo, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { getCategory } from '../../data/categories';
import './Dashboard.css';

/* ── SVG icon set ── */
const IconFile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const IconGamepad = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"/>
    <line x1="8" y1="10" x2="8" y2="14"/>
    <line x1="15" y1="13" x2="15.01" y2="13" strokeWidth="3"/>
    <line x1="18" y1="11" x2="18.01" y2="11" strokeWidth="3"/>
    <rect x="2" y="6" width="20" height="12" rx="4"/>
  </svg>
);

const IconTrophy = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
  </svg>
);

const IconStar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconFilePlus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);

const IconPresentation = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
);

const IconBarChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>
);

const IconInbox = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const ACTIONS = [
  { Icon: IconFilePlus,     title: 'Test yaratish',       desc: "Savollar va javoblar bilan test tuzing va o'quvchilaringizni sinab ko'ring", route: '/create/test', cls: 'v1' },
  { Icon: IconPresentation, title: 'Taqdimot yaratish',   desc: "Vizual slaydlar bilan ta'sirchan taqdimot tayyorlang",                      route: '/create/ppt',  cls: 'v2' },
  { Icon: IconBarChart,     title: "Natijalarni ko'rish", desc: "O'quvchilarning test natijalari va statistikasi",                            route: null,           cls: 'v3' },
];

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const initial  = currentUser?.name?.charAt(0).toUpperCase() ?? '?';

  const [tests, setTests]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [hostPin, setHostPin] = useState(null);   // { code }
  const [hosting, setHosting] = useState(null);    // hosting bo'layotgan testId
  const [copied, setCopied]   = useState(false);

  const fetchTests = useCallback(async () => {
    if (!currentUser?.email) { setLoading(false); return; }
    try {
      const q = query(collection(db, 'tests'), where('ownerEmail', '==', currentUser.email));
      const snap = await getDocs(q);
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setTests(list);
    } catch (e) {
      console.error('Testlarni yuklashda xatolik:', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const deleteTest = async (id) => {
    if (!window.confirm("Bu testni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteDoc(doc(db, 'tests', id));
      setTests(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert('O\'chirishda xatolik: ' + e.message);
    }
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

  /* Jonli sessiya boshlash: yangi PIN + eski o'yinchilarni tozalash */
  const hostLive = async (t) => {
    setHosting(t.id);
    try {
      const code = await generatePin();
      // oldingi o'yinchilarni tozalaymiz (toza sessiya)
      const playersSnap = await getDocs(collection(db, 'tests', t.id, 'players'));
      await Promise.all(playersSnap.docs.map(d => deleteDoc(doc(db, 'tests', t.id, 'players', d.id))));
      await updateDoc(doc(db, 'tests', t.id), { pin: code, live: true, hostedAt: Date.now() });
      setTests(prev => prev.map(x => x.id === t.id ? { ...x, pin: code, live: true } : x));
      setHostPin({ code, testId: t.id });
      setCopied(false);
    } catch (e) {
      alert('Xatolik: ' + e.message);
    } finally {
      setHosting(null);
    }
  };

  const STATS = [
    { Icon: IconFile,    label: "Testlar",     value: tests.length, cls: 'purple' },
    { Icon: IconGamepad, label: "O'yinlar",    value: 0,            cls: 'green'  },
    { Icon: IconTrophy,  label: "G'alabalar",  value: 0,            cls: 'amber'  },
    { Icon: IconStar,    label: "Umumiy ball", value: 0,            cls: 'blue'   },
  ];

  return (
    <div className="dashboard-page">

      {/* ── Hero ── */}
      <div className="db-hero">
        <div className="db-hero-left">
          <p className="db-hero-greeting">Shaxsiy kabinet</p>
          <h1 className="db-hero-name">Salom, {currentUser?.name}</h1>
          <p className="db-hero-sub">{currentUser?.email}</p>
        </div>
        <div className="db-hero-avatar">{initial}</div>
      </div>

      {/* ── Stats ── */}
      <div className="db-stats">
        {STATS.map(({ Icon, label, value, cls }) => (
          <div className="db-stat" key={label}>
            <div className={`db-stat-icon ${cls}`}><Icon /></div>
            <div className="db-stat-info">
              <div className="db-stat-value">{value}</div>
              <div className="db-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="db-content">

        <div>
          <div className="db-section-header">
            <div className="db-section-title">Tezkor amallar</div>
          </div>
          <div className="db-actions">
            {ACTIONS.map(({ Icon, title, desc, route, cls }) => (
              <button
                key={title}
                className="db-action-card"
                onClick={() => route && navigate(route)}
                style={!route ? { cursor: 'default' } : {}}
              >
                <div className={`db-action-icon ${cls}`}><Icon /></div>
                <div className="db-action-title">{title}</div>
                <div className="db-action-desc">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="db-section-header">
            <div className="db-section-title">Mening testlarim</div>
            <button className="db-section-link" onClick={() => navigate('/create/test')}>
              + Yangi test
            </button>
          </div>
          {loading ? (
            <div className="db-empty"><div className="db-empty-title">Yuklanmoqda...</div></div>
          ) : tests.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon"><IconInbox /></div>
              <div className="db-empty-title">Hali test yaratilmagan</div>
              <div className="db-empty-desc">Birinchi testingizni yarating va o'quvchilaringizni sinab ko'ring</div>
              <button className="db-empty-btn" onClick={() => navigate('/create/test')}>
                Test yaratish
              </button>
            </div>
          ) : (
            <div className="db-test-list">
              {tests.map(t => {
                const cat = getCategory(t.category);
                return (
                  <div className="db-test-card" key={t.id}>
                    <div className="db-test-main">
                      <div className="db-test-title">{t.title}</div>
                      <div className="db-test-meta">
                        {cat && <span className="db-test-badge">{cat.emoji} {cat.label}</span>}
                        <span>{t.cards?.length ?? 0} savol</span>
                        {t.live && t.pin && <span className="db-test-pin">🔴 Jonli · PIN: {t.pin}</span>}
                      </div>
                    </div>
                    <div className="db-test-actions">
                      <button
                        className="db-test-host"
                        onClick={() => hostLive(t)}
                        disabled={hosting === t.id}
                      >
                        {hosting === t.id ? '...' : '🔴 Host Live'}
                      </button>
                      <button className="db-test-del" onClick={() => deleteTest(t.id)} title="O'chirish">
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Host Live PIN modal ── */}
      {hostPin && (
        <div className="db-pin-overlay" onClick={() => setHostPin(null)}>
          <div className="db-pin-modal" onClick={e => e.stopPropagation()}>
            <div className="db-pin-icon">🔴</div>
            <h2 className="db-pin-title">Jonli sessiya boshlandi!</h2>
            <p className="db-pin-desc">O'quvchilar bosh sahifada shu PIN bilan kirib, jonli yechishadi:</p>
            <div className="db-pin-code">
              {hostPin.code.split('').map((d, i) => (
                <span key={i} className="db-pin-digit">{d}</span>
              ))}
            </div>
            <div className="db-pin-btns">
              <button
                className="db-pin-copy"
                onClick={() => { navigator.clipboard.writeText(hostPin.code); setCopied(true); }}
              >
                {copied ? '✓ Nusxalandi' : 'Nusxalash'}
              </button>
              <button className="db-pin-go" onClick={() => navigate(`/play/${hostPin.testId}`)}>
                Testga o'tish
              </button>
            </div>
            <button className="db-pin-close" onClick={() => setHostPin(null)}>Yopish</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Dashboard);
