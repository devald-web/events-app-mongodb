import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../api/authService';

export const UserDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.username);

  const handleNameUpdate = async () => {
    try {
      if (!newName.trim()) {
        alert("El nombre de usuario no puede estar vacío");
        return;
      }

      // Obtener la contraseña del localStorage
      const password = localStorage.getItem('password');
      if (!password) {
        alert("No se pudo obtener la información de autenticación. Por favor inicie sesión nuevamente.");
        handleLogout();
        return;
      }

      await authService.updateProfile({
        username: newName,
        currentPassword: password // Necesitamos la contraseña actual para autorizar el cambio
      });

      // Actualizar localStorage directamente
      localStorage.setItem('username', newName);

      // Actualizar el objeto user en localStorage
      const userObject = JSON.parse(localStorage.getItem('user'));
      if (userObject) {
        localStorage.setItem('user', JSON.stringify({
          ...userObject,
          username: newName
        }));
      }

      setIsEditingName(false);

      // Actualizar la UI sin necesidad de recargar la página
      user.username = newName;

      // O alternativamente, recargar si es necesario
      // window.location.reload();
    } catch (error) {
      console.error("Error updating name:", error);
      alert("Error al actualizar nombre: " + (error.message || "Error desconocido"));
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center items-center space-x-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="font-medium">{user.username}</span>
          <svg className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {isEditingName ? (
              <div className="px-4 py-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border rounded p-1 mb-2"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleNameUpdate}
                    className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="text-sm bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cambiar nombre
                </button>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Configuración
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};