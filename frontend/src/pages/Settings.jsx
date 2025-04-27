import React, { useState, useEffect } from 'react';
import authService from '../api/authService';

function Settings() {
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
      // Validar que las contraseñas coincidan
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      // Preparar datos para enviar
      const updateData = {
        username: formData.username,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword || undefined
      };

      // Aquí deberías implementar la llamada a tu API para actualizar el perfil
      const updatedUser = await authService.updateProfile(updateData);
      
      // Simulación de éxito
      setSuccess("Perfil actualizado correctamente");
      setTimeout(() => {
        // Actualizar localStorage y recargar
        const user = JSON.parse(localStorage.getItem('user'));
        localStorage.setItem('user', JSON.stringify({
          ...user,
          username: formData.username,
          email: formData.email
        }));
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Configuración</h2>
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
  );
}

export default Settings;