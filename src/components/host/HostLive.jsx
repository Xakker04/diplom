import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, collection, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import Avatar from '../avatar/Avatar';
import './HostLive.css';

const HostLive = () => {
  const { testId } = useParams();
  const navigate   = useNavigate();

  const [test, setTest]       = useState(null);
  const [players, setPlayers] = useState([]);
  const [copied, setCopied]   = useState(false);

  /* test hujjati (pin, started) */
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tests', testId), snap => {
      setTest(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [testId]);

  /* o'yinchilar (jonli) */
  useEffect(() => {
    const qy = query(collection(db, 'tests', testId, 'players'), orderBy('score', 'desc'));
    const unsub = onSnapshot(qy, snap => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [testId]);

  const live = players.filter(p => Date.now() - (p.lastActive ?? p.joinedAt ?? 0) < 25000);

  const start = () => {
    updateDoc(doc(db, 'tests', testId), { started: true, startedAt: Date.now() }).catch(() => {});
  };

  const finish = async () => {
    await updateDoc(doc(db, 'tests', testId), { live: false, started: false }).catch(() => {});
    navigate('/dashboard');
  };

  if (!test) {
    return <div className="hl-page"><p className="hl-loading">Yuklanmoqda...</p></div>;
  }

  const started = !!test.started;

  return (
    <div className="hl-page">
      <div className="hl-top">
        <h1 className="hl-title">{test.title}</h1>
        <button className="hl-finish" onClick={finish}>Yakunlash</button>
      </div>

      {/* PIN */}
      <div className="hl-pin-box">
        <span className="hl-pin-label">Kirish PIN kodi</span>
        <div className="hl-pin-code">
          {String(test.pin ?? '').split('').map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <button
          className="hl-copy"
          onClick={() => { navigator.clipboard.writeText(String(test.pin ?? '')); setCopied(true); }}
        >
          {copied ? '✓ Nusxalandi' : 'Nusxalash'}
        </button>
      </div>

      {/* Holat + Start */}
      <div className="hl-status">
        <div className="hl-count">
          <b>{live.length}</b> ishtirokchi {started ? 'o\'ynamoqda' : 'qo\'shildi'}
        </div>
        {!started ? (
          <button className="hl-start" onClick={start} disabled={live.length === 0}>
            ▶ Boshlash
          </button>
        ) : (
          <span className="hl-live-badge">🔴 Jonli</span>
        )}
      </div>

      {/* Lobbi (boshlanmagan) yoki real-vaqt reyting */}
      {!started ? (
        <div className="hl-grid">
          {live.length === 0 && <p className="hl-empty">O'quvchilar PIN bilan kirishini kuting...</p>}
          {live.map(p => (
            <div key={p.id} className="hl-player">
              <Avatar id={p.avatar || 'moose'} size={56} />
              <span className="hl-player-name">{p.username}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="hl-board">
          {live.map((p, i) => (
            <div key={p.id} className={`hl-row ${i < 3 ? 'top' : ''}`}>
              <span className="hl-rank">{i + 1}</span>
              <Avatar id={p.avatar || 'moose'} size={34} />
              <span className="hl-name">{p.username}</span>
              <span className="hl-score">{p.score} ball</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostLive;
