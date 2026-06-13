import { memo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './navbar.css';

const useDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  return { open, setOpen, ref };
};

const LogoMark = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
    <rect width="30" height="30" rx="8" fill="#4f46e5" />
    <path d="M8 10h9M8 15h12M8 20h7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="22" cy="20" r="2" fill="#fff" />
  </svg>
);

const IconTest = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="12" y1="18" x2="12" y2="12"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);

const IconSlides = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <path d="M8 21h8M12 17v4"/>
  </svg>
);

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [loadingRoute, setLoadingRoute] = useState(null);

  const isMain       = pathname === '/';
  const isAuthPage   = pathname === '/login' || pathname === '/register';
  const isCreatePage = pathname.startsWith('/create/');
  const showUserNav  = !!currentUser && !isMain && !isAuthPage;

  const create = useDropdown();
  const user   = useDropdown();

  const handleLogout = () => {
    user.setOpen(false);
    logout();
    navigate('/');
  };

  const handleCreateNav = (route) => {
    create.setOpen(false);
    setLoadingRoute(route);
    setTimeout(() => {
      setLoadingRoute(null);
      navigate(route);
    }, 600);
  };

  return (
    <nav className="navbar-container">

      <Link to="/" className="navbar-logo">
        <LogoMark />
        <span className="logo-text">Qalem go</span>
      </Link>

      {showUserNav && (
        <div className="navbar-right">

          {!isCreatePage && (
            <div className="create-wrap" ref={create.ref}>
              <button
                className={`create-btn ${create.open ? 'active' : ''}`}
                onClick={() => create.setOpen(v => !v)}
              >
                <span className="create-plus">+</span>
                Yaratish
                <span className={`create-chevron ${create.open ? 'open' : ''}`}>▾</span>
              </button>

              {create.open && (
                <div className="create-dropdown">
                  <button
                    className="create-item"
                    disabled={!!loadingRoute}
                    onClick={() => handleCreateNav('/create/test')}
                  >
                    <div className="create-item-icon">
                      {loadingRoute === '/create/test'
                        ? <span className="create-spinner" />
                        : <IconTest />}
                    </div>
                    <div className="create-item-text">
                      <span className="create-item-title">Test yaratish</span>
                      <span className="create-item-desc">Savollar va javoblar bilan test tuzing</span>
                    </div>
                  </button>

                  <button
                    className="create-item"
                    disabled={!!loadingRoute}
                    onClick={() => handleCreateNav('/create/ppt')}
                  >
                    <div className="create-item-icon">
                      {loadingRoute === '/create/ppt'
                        ? <span className="create-spinner" />
                        : <IconSlides />}
                    </div>
                    <div className="create-item-text">
                      <span className="create-item-title">Taqdimot yaratish</span>
                      <span className="create-item-desc">Vizual slaydlar bilan taqdimot</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="user-btn-wrap" ref={user.ref}>
            <button className="user-btn" onClick={() => user.setOpen(v => !v)}>
              <div className="user-avatar">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className={`user-chevron ${user.open ? 'open' : ''}`}>▾</span>
            </button>

            {user.open && (
              <div className="user-modal">
                <div className="modal-avatar-row">
                  <div className="modal-avatar">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="modal-info">
                    <div className="modal-name">{currentUser.name}</div>
                    <div className="modal-email">{currentUser.email}</div>
                  </div>
                </div>
                <div className="modal-divider" />
                <button className="modal-logout-btn" onClick={handleLogout}>
                  <IconLogout /> Chiqish
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!showUserNav && !currentUser && (
        <button className="login-btn" onClick={() => navigate('/login')}>
          Kirish
        </button>
      )}

    </nav>
  );
};

export default memo(Navbar);
