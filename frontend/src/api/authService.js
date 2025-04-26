// src/api/authService.js

// URL del backend FastAPI para auth
const API_URL = 'http://127.0.0.1:8000/auth'

/**
 * Registra un nuevo usuario.
 * @param {object} userData - Datos del usuario { username, email, password, role?}
 * @returns {promise<object>} - Los datos del usuario registrado (excluyendo contraseña)
*/
async function register(userData){
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error en registro:", error);
    // Re-lanza el error para que el componente lo maneje
    throw { detail: error.message || "Error de conexión" };
  }
};

/**
 * Inicio de sesión de un usuario.
 * @param {object} credentials - Credenciales del usuario { username, password }
 * @returns {Promise<object>} Los datos del usuario logueado (excluyendo contraseña)
 */
async function login(credentials) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include' // Importante para CORS y cookies
    });

    // const responseData = await response.json(); // Intenta parsear JSON siempre
  
    if (!response.ok) {
      // Lanza un error con el detalle del backend si está disponible
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}`);
    }
    // Tras login exitoso, almacenar info del usuario en el localStorage
    const userData = await response.json();
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error("login error:", error);
    // Re-lanza el error para que el componente lo maneje
    throw { detail: error.message || "Error de conexión" };
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

// Exporta las funciones individualmente
export default { register, login, logout };