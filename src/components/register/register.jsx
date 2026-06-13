import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../login/login.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const result = register(form.name, form.email, form.password);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  return (
    <div className="auth-page">

      {/* ── Brand panel ── */}
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
          O'qitishni<br />
          <span>yangi darajaga</span><br />
          olib chiqing
        </h1>
        <p className="auth-brand-sub">
          Interaktiv testlar va o'yinlar bilan darslaringizni
          qiziqarli va samarali qiling.
        </p>

        <div className="auth-testimonial">
          <p className="auth-testimonial-text">
            "Qalem go bilan o'quvchilarim darsga qiziqishi ikki barobar oshdi. Tavsiya qilaman!"
          </p>
          <div className="auth-testimonial-author">
            <div className="auth-testimonial-avatar">N</div>
            <div>
              <div className="auth-testimonial-name">Nilufar Yusupova</div>
              <div className="auth-testimonial-role">Ingliz tili o'qituvchisi</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">Hisob yaratish</h2>
            <p className="auth-subtitle">Bepul ro'yxatdan o'ting va boshlang</p>
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
              <label>Ism</label>
              <input
                type="text"
                name="name"
                placeholder="Ismingizni kiriting"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

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
              />
            </div>

            <div className="form-group">
              <label>Parol</label>
              <input
                type="password"
                name="password"
                placeholder="Kamida 6 ta belgi"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Saqlanmoqda...' : "Ro'yxatdan o'tish →"}
            </button>
          </form>

          <div className="auth-divider">yoki</div>

          <p className="auth-switch">
            Hisobingiz bormi? <Link to="/login">Kirish</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(Register);
