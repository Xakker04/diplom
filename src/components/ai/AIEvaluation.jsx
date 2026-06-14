import { useState, useEffect, useRef, useCallback } from 'react';
import './AIEvaluation.css';

/*
  props:
    payload — { title, subject, score, correctCount, total, items }
    onClose — modalni yopish
*/
const AIEvaluation = ({ payload, onClose }) => {
  const [evalData, setEvalData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Repetitor chat
  const [chat, setChat]       = useState([]); // {role, content}
  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  /* ── Baholashni yuklash ── */
  const fetchEval = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || res.statusText);
      setEvalData(await res.json());
    } catch (e) {
      const raw = e.message || '';
      const friendly = /credit|billing/i.test(raw)
        ? "AI hisobida kredit tugagan. console.anthropic.com → Plans & Billing da kredit qo'shing."
        : (raw || 'Tahlilni olishda xatolik');
      setError(friendly);
    } finally {
      setLoading(false);
    }
  }, [payload]);

  useEffect(() => { fetchEval(); }, [fetchEval]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat, sending]);

  /* ── Repetitorga savol yuborish ── */
  const sendQuestion = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const next = [...chat, { role: 'user', content: text }];
    setChat(next);
    setInput('');
    setSending(true);
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subject: payload.subject, title: payload.title, messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || res.statusText);
      setChat(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      const raw = e.message || '';
      const friendly = /credit|billing/i.test(raw)
        ? "AI hisobida kredit tugagan. console.anthropic.com da kredit qo'shing."
        : 'Xatolik: ' + (raw || 'qayta urinib koʻring');
      setChat(prev => [...prev, { role: 'assistant', content: friendly }]);
    } finally {
      setSending(false);
    }
  };

  const level = evalData?.level ?? 0;

  return (
    <div className="ai-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={e => e.stopPropagation()}>
        <div className="ai-head">
          <div className="ai-head-title">🤖 AI bilim tahlili</div>
          <button className="ai-close" onClick={onClose}>✕</button>
        </div>

        <div className="ai-body">
          {loading && (
            <div className="ai-loading">
              <div className="ai-spinner" />
              <p>Natijalaringiz tahlil qilinmoqda...</p>
            </div>
          )}

          {error && !loading && (
            <div className="ai-error">
              <p>{error}</p>
              <button className="ai-retry" onClick={fetchEval}>Qayta urinish</button>
            </div>
          )}

          {evalData && !loading && (
            <>
              {/* Daraja */}
              <div className="ai-level">
                <div className="ai-level-ring" style={{ '--pct': `${level * 10}%` }}>
                  <span>{level}/10</span>
                </div>
                <div className="ai-verdict">{evalData.verdict}</div>
              </div>

              {/* Kuchli / zaif */}
              <div className="ai-cols">
                <div className="ai-card good">
                  <div className="ai-card-title">✅ Kuchli tomonlar</div>
                  <ul>{(evalData.strengths || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
                <div className="ai-card weak">
                  <div className="ai-card-title">⚠️ Zaif mavzular</div>
                  <ul>{(evalData.weaknesses || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              </div>

              {/* Tavsiyalar */}
              <div className="ai-card rec">
                <div className="ai-card-title">📚 Tavsiyalar</div>
                <ul>{(evalData.recommendations || []).map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>

              {evalData.encouragement && (
                <div className="ai-encourage">💪 {evalData.encouragement}</div>
              )}

              {/* Repetitor chat */}
              <div className="ai-tutor">
                <div className="ai-tutor-title">
                  Savolingiz bormi? <span>({payload.subject} bo'yicha so'rang)</span>
                </div>
                <div className="ai-chat">
                  {chat.length === 0 && (
                    <p className="ai-chat-hint">Masalan: «kasrlarni qanday qo'shaman?»</p>
                  )}
                  {chat.map((m, i) => (
                    <div key={i} className={`ai-msg ${m.role}`}>{m.content}</div>
                  ))}
                  {sending && <div className="ai-msg assistant typing">···</div>}
                  <div ref={bottomRef} />
                </div>
                <div className="ai-chat-input">
                  <input
                    type="text"
                    placeholder={`${payload.subject} bo'yicha savol...`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendQuestion()}
                    disabled={sending}
                  />
                  <button onClick={sendQuestion} disabled={!input.trim() || sending}>➤</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIEvaluation;
