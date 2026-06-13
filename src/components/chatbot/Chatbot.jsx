import { useState, useRef, useEffect, memo } from 'react';
import './Chatbot.css';

const SYSTEM_PROMPT = `Siz "Qalem go" ta'lim platformasining yordamchi botisiz.
Foydalanuvchilarga test yaratish, o'yin o'ynash va platform funksiyalaridan foydalanish bo'yicha yordam bering.
Qisqa, aniq va do'stona javob bering. Asosan o'zbek tilida javob bering.`;

async function askClaude(history) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: history,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.content[0]?.text ?? 'Kechirasiz, javob ololmadim.';
}

const GREETING = 'Salom! Men Qalem go yordamchisiman. Sizga qanday yordam bera olaman?';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: GREETING, display: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const history = nextMessages
        .filter(m => !m.display)
        .map(m => ({ role: m.role, content: m.text }));

      const reply = await askClaude(history);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      const msg = err.message?.includes('credit')
        ? 'Hisobda kredit yetarli emas. Iltimos console.anthropic.com saytida kredit soling.'
        : 'Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.';
      setMessages(prev => [...prev, { role: 'assistant', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbot-root">
      {/* Chat panel */}
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">Q</div>
              <div>
                <div className="chatbot-title">Qalem Yordamchi</div>
                <div className="chatbot-status">
                  <span className="chatbot-dot" />
                  Online
                </div>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                {msg.role === 'assistant' && <div className="msg-avatar">Q</div>}
                <div className="msg-bubble">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg assistant">
                <div className="msg-avatar">Q</div>
                <div className="msg-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-input-row">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Xabar yozing..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={loading}
            />
            <button
              className={`chatbot-send ${input.trim() && !loading ? 'active' : ''}`}
              onClick={sendMessage}
              disabled={!input.trim() || loading}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        className={`chatbot-toggle ${open ? 'opened' : ''}`}
        onClick={() => setOpen(v => !v)}
        title="Chat"
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default memo(Chatbot);
