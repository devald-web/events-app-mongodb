import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import CreateEvent from './pages/CreateEvent'
import Settings from './pages/Settings'
import Login from './components/Login'
import Register from './components/Register'
import authService from './api/authService'
import { UserDropdown } from './components/UserDropdown'

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    localStorage.removeItem('user');
    return null;
  }
};

function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(!!currentUser);
  const [showLogin, setShowLogin] = useState(true);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = (userData) => {
    setShowLogin(true);
    alert(`Usuario ${userData.username} registrado correctamente. Por favor iniciar sesión`);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowLogin(true);
    window.location.href = window.location.origin;
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setIsAuthenticated(!!user);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <BrowserRouter>
      <nav className="bg-white p-4 shadow mb-6 flex justify-between items-center">
        <div>
          {isAuthenticated ? (
            <>
              <Link to="/" className="mr-4 text-blue-600 hover:underline">Eventos</Link>
              {currentUser?.role === 'admin' && (
                <Link to="/create" className="mr-4 text-blue-600 hover:underline">Crear Evento</Link>
              )}
            </>
          ) : (
            <span className="text-xl font-semibold text-gray-700">EVENTS</span>
          )}
        </div>
        <div className="flex items-center">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <UserDropdown user={currentUser} />
            </div>
          ) : (
            <>
              {showLogin ? (
                <button onClick={() => setShowLogin(false)} className="text-green-600 hover:underline focus:outline-none">Registrarse</button>
              ) : (
                <button onClick={() => setShowLogin(true)} className="text-blue-600 hover:underline focus:outline-none">Ingresar</button>
              )}
            </>
          )}
        </div>
      </nav>

      <div className="px-4 bg-white text-gray-900 min-h-screen">
        <Routes>
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Home />} />
              <Route
                path="/create"
                element={currentUser?.role === 'admin' ? <CreateEvent /> : <Navigate to="/" replace />}
              />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route
                path="/*"
                element={
                  showLogin ? (
                    <Login onLoginSuccess={handleLoginSuccess} />
                  ) : (
                    <Register onRegisterSuccess={handleRegisterSuccess} />
                  )
                }
              />
            </>
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
