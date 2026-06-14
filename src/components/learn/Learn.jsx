import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { CATEGORIES, getCategory } from '../../data/categories';
import './Learn.css';

const Learn = () => {
  const navigate = useNavigate();
  const [tests, setTests]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState('all');   // 'all' | category id

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'tests'));
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        setTests(list);
      } catch (e) {
        console.error('Testlarni yuklashda xatolik:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = active === 'all' ? tests : tests.filter(t => t.category === active);

  /* Faqat testi bor fanlarni chiplarda ko'rsatamiz */
  const usedCats = CATEGORIES.filter(c => tests.some(t => t.category === c.id));

  return (
    <div className="learn-page">
      <div className="learn-head">
        <h1 className="learn-title">Fanlar bo'yicha testlar</h1>
        <p className="learn-sub">Tayyor testlardan birini tanlab, bilimingizni sinab ko'ring</p>
      </div>

      {/* Fan filtrlari */}
      <div className="learn-filters">
        <button
          className={`learn-chip ${active === 'all' ? 'active' : ''}`}
          onClick={() => setActive('all')}
        >
          📚 Hammasi
        </button>
        {usedCats.map(c => (
          <button
            key={c.id}
            className={`learn-chip ${active === c.id ? 'active' : ''}`}
            onClick={() => setActive(c.id)}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Testlar */}
      {loading ? (
        <div className="learn-empty">Yuklanmoqda...</div>
      ) : filtered.length === 0 ? (
        <div className="learn-empty">Bu bo'limda hali test yo'q</div>
      ) : (
        <div className="learn-grid">
          {filtered.map(t => {
            const cat = getCategory(t.category);
            return (
              <button key={t.id} className="learn-card" onClick={() => navigate(`/play/${t.id}`)}>
                <div className="learn-card-emoji">{cat?.emoji ?? '📝'}</div>
                <div className="learn-card-title">{t.title}</div>
                <div className="learn-card-meta">
                  {cat && <span className="learn-card-badge">{cat.label}</span>}
                  <span>{t.cards?.length ?? 0} savol</span>
                </div>
                {t.ownerName && <div className="learn-card-author">👤 {t.ownerName}</div>}
                <span className="learn-card-play">Ishlash →</span>
              </button>
            );
          })}
        </div>
      )}

      <button className="learn-back" onClick={() => navigate('/')}>← Bosh sahifa</button>
    </div>
  );
};

export default memo(Learn);
