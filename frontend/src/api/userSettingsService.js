// URL completa de la API
const API_URL = 'http://127.0.0.1:8000/user-settings'

/**
 * Obtiene el ID del usuario actual desde localStorage
 * @returns {string} ID del usuario
 */
function getCurrentUserId() {
  try {
    // Obtener el objeto usuario del localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('Usuario no autenticado');
    }
    
    const user = JSON.parse(userStr);
    if (!user || !user.id) {
      throw new Error('Información de usuario incompleta');
    }
    
    return user.id;
  } catch (error) {
    console.error('Error al obtener el ID del usuario:', error);
    throw new Error('No se pudo obtener el ID del usuario. Por favor inicia sesión nuevamente.');
  }
}

/**
 * Obtiene los headers de autorización para las peticiones
 * @returns {Object} Headers con autorización Basic
 */
function getAuthHeaders() {
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  
  if (!username || !password) {
    throw new Error('Credenciales no disponibles');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
  };
}

/**
 * Obtiene la configuración del usuario actual.
 * @returns {Promise<Object>} Configuración del usuario
 */
async function get() {
  const userId = getCurrentUserId();
  
  const response = await fetch(`${API_URL}/${userId}`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Error al obtener configuración de usuario')
  }
  return await response.json();
}

/**
 * Actualiza la configuración del usuario.
 * @param {Object} settings Nuevas configuraciones
 * @returns {Promise<Object>} Configuración actualizada
 */
async function update(settings) {
  const userId = getCurrentUserId();
  
  const response = await fetch(`${API_URL}/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings)
  });

  const text = await response.text();
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || JSON.stringify(errorData));
    } catch {
      throw new Error(text || 'Error al actualizar configuración de usuario');
    }
  }
  return JSON.parse(text);
}

/**
 * Inicializa la configuración del usuario.
 * @returns {Promise<Object>} Configuración inicializada
 */
async function initialize() {
  const userId = getCurrentUserId();
  
  const response = await fetch(`${API_URL}/${userId}/initialize`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  const text = await response.text();
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || JSON.stringify(errorData));
    } catch {
      throw new Error(text || 'Error al inicializar configuración de usuario');
    }
  }
  return JSON.parse(text);
}

/**
 * Actualiza las categorías preferidas del usuario.
 * @param {Array} categories IDs de categorías preferidas
 * @returns {Promise<Object>} Configuración actualizada
 */
async function updateCategories(categories) {
  const userId = getCurrentUserId();
  
  const response = await fetch(`${API_URL}/${userId}/categories`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(categories)
  });

  const text = await response.text();
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || JSON.stringify(errorData));
    } catch {
      throw new Error(text || 'Error al actualizar categorías preferidas');
    }
  }
  return JSON.parse(text);
}

export default { get, update, initialize, updateCategories }