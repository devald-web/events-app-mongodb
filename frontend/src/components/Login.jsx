import React, { useState } from "react";
import authService from '../api/authService';

function Login({ onLoginSuccess }) { // Acepta un callback para el inicio de sesión exitoso
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await authService.login({ username, password, });
      console.log('Inicio de sesión exitoso:', userData);
      if (onLoginSuccess) {
        onLoginSuccess(userData); // Notificar al componente principal (padre)
      }
    } catch (err) {
      setError(err.detail || 'Falló el inicio de sesión. Verifique credenciales.');
      console.log('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username</label>
          <input 
          type="text" 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500" 
          id="username"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input 
          type="password" 
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500" 
          id="password"
          placeholder="****************"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          />
        </div>
        <div className="flex items-center justify-between">
          <button className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow outline w-full ${loading ? 'opacity-50 cursor-not-allowed': ''}`}
          type="submit"
          disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;