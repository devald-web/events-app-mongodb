import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Home from './pages/Home' // listEvents y grid de cards
import CreateEvent from './pages/CreateEvent' // Página para crear eventos
import Login from './components/login' // Importar componente Login
import Register from './components/register' // Importar componente Register
import authService from './api/authService'
import { UserDropdown } from './components/UserDropdown'

// Función de ayuda para obtener el usuario del localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    localStorage.removeItem('user'); // Limpia las entradas inválidas
    return null;
  }
};

function App() {
  // --- Estado de Autenticación ---
  // Inicializar el estado basado en el localStorage
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(!!currentUser);
  // Estado para alternar entre los formularios de inicio de sesión y registro cuando no está autenticado
  const [showLogin, setShowLogin] = useState(true);

  // --- Estado para el modo oscuro ---
  // const [darkMode, setDarkMode] = useState(false);

  // useEffect(() => {
  //   if (darkMode) {
  //     document.documentElement.classList.add('dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //   }
  // }, [darkMode]);

  // --- Gestores de Autenticación ---
  const handleLoginSuccess = (userData) => {
    // authService.login ya guarda en localStorage
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = (userData) => {
    // Cambiar a la vista login después de registrarse exitosamente
    setShowLogin(true);
    alert(`Usuario ${userData.username} registrado correctamente. Por favor iniciar sesión`)
  };

  const handleLogout = () => {
    authService.logout(); // Limpiar localStorage
    setCurrentUser(null);
    setIsAuthenticated(false);
    setShowLogin(true); // Por defecto a la vista de inicio de sesión después de cerrar la sesión
    window.location.href = window.location.origin;
    // Nota: authService.logout actualmente intenta redirigir, lo que podría entrar en conflicto
    // con React Router. Considera eliminar la redirección de authService.logout
    // si quieres que React Router maneje la navegación completamente.
  };

  // --- Efecto de sincronizar el estado si localStorage cambia inesperadamente (opcional) ---
  useEffect(() => {
    const handleStorageChange = () => {
      const user = getCurrentUser();
      setCurrentUser(user);
      setIsAuthenticated(!!user);
    };

    window.addEventListener('storage', handleStorageChange);
    // Comprobación inicial en caso de que localStorage haya sido borrado manualmente o por otra pestaña
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [])

  // --- Lógica de renderizado
  return (
    <BrowserRouter>
      {/* Navegación - Representación diferente según el estado de autenticación */}
      <nav className="bg-white p-4 shadow mb-6 flex justify-between items-center">
        <div>
          {isAuthenticated ? (
            <>
              <Link to="/" className='mr-4 text-blue-600 hover:underline'>Eventos</Link>
              {/* Mostrar condicionalmente el evento Create en función del rol */}
              {/* Ajuste el nombre del rol 'admin' si es diferente en su backend/user model */}
              {currentUser?.role === 'admin' && (
                <Link to="/create" className="mr-4 text-blue-600 hover:underline">Crear Evento</Link>
              )}
            </>
          ) : (
            <span className="text-xl font-semibold text-gray-700">EVENTS</span>
          )}
        </div>
        <div>
          {/* <button
            onClick={() => setDarkMode(!darkMode)}
className="p-2 mr-4 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            {darkMode ? '☀️' : '🌙'}
          </button> */}
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-4">
                <UserDropdown user={currentUser} />
              </div>
            </>
          ) : (
            <>
              {/* Botones para alternar los formularios de inicio de sesión/registro */}
              {showLogin ? (
                <button onClick={() => setShowLogin(false)} className="text-green-600 hover:underline focus:outline-none">Registrarse</button>
              ) : (
                <button onClick={() => setShowLogin(true)} className="text-blue-600 hover:underline focus:outline-none">Ingresar</button>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-4">
        <Routes>
          {/* Rutas de autenticación */}
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Home />} />
              {/* Proteger la ruta CreateEvent - redirigir si no es el admin o no está logeado */}
              <Route
                path="/create"
                element={currentUser?.role === 'admin' ? <CreateEvent /> : <Navigate to="/" replace />}
              />
              {/* Redirigir cualquier otra ruta a Inicio al iniciar sesión */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            /* Rutas no autenticadas - Renderizar Login/Registro directamente */
            <>
              <Route
                path="/*" // Coincidir con cualquier ruta cuando no se ha iniciado sesión
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