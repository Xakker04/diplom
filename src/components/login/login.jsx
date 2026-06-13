import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './login.css';

const Login = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = login(form.email, form.password);
      if (result.success) navigate('/dashboard');
      else setError(result.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* ── Chap brand panel ── */}
      <div className="auth-left">
        <div className="auth-brand-logo">
          <div className="auth-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <span className="auth-brand-name">Qalem go</span>
        </div>

        <h1 className="auth-brand-headline">
          Bilimni<br />
          <span>o'yin orqali</span><br />
          kashf eting
        </h1>
        <p className="auth-brand-sub">
          Interaktiv testlar va o'yinlar orqali o'quvchilar bilimini
          qiziqarli tarzda tekshiring.
        </p>

        <div className="auth-testimonial">
          <p className="auth-testimonial-text">
            "Qalem go orqali o'quvchilarim testlarni xuddi o'yindek qiziqish bilan yechadilar."
          </p>
          <div className="auth-testimonial-author">
            <div className="auth-testimonial-avatar">S</div>
            <div>
              <div className="auth-testimonial-name">Sardor Karimov</div>
              <div className="auth-testimonial-role">Matematika o'qituvchisi</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── O'ng forma panel ── */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">Xush kelibsiz</h2>
            <p className="auth-subtitle">Hisobingizga kiring va davom eting</p>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email manzil</label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Parol</label>
              <input
                type="password"
                name="password"
                placeholder="Parolingizni kiriting"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Kirilmoqda...' : 'Kirish →'}
            </button>
          </form>

          <div className="auth-divider">yoki</div>

          <p className="auth-switch">
            Hisob yo'qmi? <Link to="/register">Ro'yxatdan o'ting</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(Login);
