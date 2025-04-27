import React, { useState, useEffect } from 'react';
import authService from '../api/authService';
import UserPreferences from '../components/UserPreferences';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar datos actuales del usuario
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username,
        email: user.email
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.username.trim()) {
        throw new Error("El nombre de usuario es requerido");
      }

      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error("El email no es válido");
      }

      // IMPORTANTE: SIEMPRE requiere la contraseña actual
      if (!formData.currentPassword) {
        throw new Error("La contraseña actual es necesaria para hacer cambios");
      }

      // Validar que las contraseñas coinciden si hay una nueva
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }
      }

      // Obtener el usuario actual para detectar cambios
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const usernameChanged = formData.username !== currentUser.username;
      const passwordChanged = !!formData.newPassword;

      // Llamar a la API para actualizar
      await authService.updateProfile({
        username: formData.username,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword || undefined
      });

      // Limpiar campos de contraseña siempre
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

      // Mostrar mensaje de éxito y posiblemente cerrar sesión
      if (usernameChanged || passwordChanged) {
        setSuccess("Perfil actualizado correctamente. Los cambios en las credenciales requieren nuevo inicio de sesión");

        // Dar tiempo para leer el mensaje y luego cerrar sesión
        setTimeout(() => {
          authService.logout();
          window.location.href = '/';
        }, 3000);
      } else {
        setSuccess("Perfil actualizado correctamente.");
      }
    } catch (err) {
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Configuración</h1>

      <div className="mb-6 flex border-b">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          Perfil
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'preferences' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferencias
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Información de Perfil</h2>

          {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
          {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Nombre de usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="p-3 bg-blue-50 text-blue-800 rounded-md mb-4 text-sm">
              <p className="font-semibold">Información importante:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Debes proporcionar tu contraseña actual para realizar cualquier cambio.</li>
                <li>Si cambias tu nombre de usuario o contraseña, cerraremos tu sesión automáticamente.</li>
              </ul>
            </div>
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-3">Cambiar contraseña</h3>

              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Necesaria para hacer cambios"
                />
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-bold mb-2">Nueva contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Dejar en blanco para no cambiar"
                />
              </div>

              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-bold mb-2">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Igual que la nueva contraseña"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      ) : (
        <UserPreferences />
      )}
    </div>
  );
}

export default Settings;