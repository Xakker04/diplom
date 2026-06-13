import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const exists = users.find((u) => u.email === email);
    if (exists) return { success: false, message: 'Bu email allaqachon ro\'yxatdan o\'tgan' };

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify({ name, email }));
    setCurrentUser({ name, email });
    return { success: true };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return { success: false, message: 'Email yoki parol noto\'g\'ri' };

    localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
    setCurrentUser({ name: user.name, email: user.email });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
