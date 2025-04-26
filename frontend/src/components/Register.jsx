import React, { useState } from 'react';
import authService from '../api/authService';

function Register({ onRegisterSuccess }) { // Aceptar una devolución de llamada (callback)
  const [username, setUsername ] = useState('');
  const [email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ error, setError ] = useState('');
  const [ success, setSuccess ] = useState('');
  const [ loading, setLoading ] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Rol por defecto es 'usuario' en el backend, pero se puede ajustar desde aquí si es necesario.
      const userData = await authService.register({ username, email, password });
      setSuccess(`¡Usuario ${userData.username} registrado exitosamente! Ahora puede iniciar sesión.`);
      console.log('Registro correcto:', userData);

      // Limpiar el formulario
      setUsername('');
      setEmail('');
      setPassword('');

      if (onRegisterSuccess) {
        onRegisterSuccess(userData); // Notificar al padre
      }

      // Redirige automáticamente después de 2 segundos
      setTimeout(() => {}, 2000);
    } catch (err) {
      setError(err.detail || 'Fallo al registrar. Usuario o email ya existen.');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Registro</h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
        <div className="mb-4">
          <label htmlFor="reg-username" className="block text-gray-700 text-sm font-bold mb-2">
            Nombre de Usuario
          </label>
          <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500"
          id="reg-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reg-email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500"
            id="reg-email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reg-password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500"
            id="reg-password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;