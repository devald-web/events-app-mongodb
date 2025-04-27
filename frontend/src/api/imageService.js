// src/api/imageService.js

// URL completa de la API
const API_URL = 'http://127.0.0.1:8000/images'

/**
 * Obtiene los headers de autorización para las peticiones
 * @returns {Object} Headers con autorización Basic
 */
function getAuthHeaders(includeContentType = true) {
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  
  if (!username || !password) {
    throw new Error('Credenciales no disponibles');
  }
  
  const headers = {
    'Authorization': 'Basic ' + btoa(`${username}:${password}`)
  };
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
}

/**
 * Sube una nueva imagen para un evento.
 * @param {string} eventId ID del evento asociado
 * @param {string} imageUrl URL de la imagen
 * @param {boolean} isHeader Si es la imagen principal/header
 * @returns {Promise<Object>} Imagen creada
 */
async function upload(eventId, imageUrl, isHeader = false) {
  const payload = { 
    event_id: eventId,
    url: imageUrl,
    is_header: isHeader
  }
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  const text = await response.text()
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text)
      throw new Error(errorData.detail || JSON.stringify(errorData))
    } catch {
      throw new Error(text || 'Error al subir imagen')
    }
  }
  return JSON.parse(text)
}

/**
 * Obtiene todas las imágenes asociadas a un evento.
 * @param {string} eventId ID del evento
 * @returns {Promise<Array>} Lista de imágenes
 */
async function getByEvent(eventId) {
  const response = await fetch(`${API_URL}/event/${eventId}`)
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Error al obtener las imágenes del evento')
  }

  const images = await response.json();
  return images.map(image => ({
    ...image,
    id: image.id || image._id
  }));
}

/**
 * Obtiene la imagen de cabecera de un evento.
 * @param {string} eventId ID del evento
 * @returns {Promise<Object>} Imagen de cabecera
 */
async function getHeader(eventId) {
  const response = await fetch(`${API_URL}/header/${eventId}`)
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Error al obtener la imagen de cabecera')
  }
  return await response.json();
}

/**
 * Actualiza una imagen existente.
 * @param {string} imageId ID de la imagen a actualizar
 * @param {Object} imageData Nuevos datos de la imagen
 * @returns {Promise<Object>} Imagen actualizada
 */
async function update(imageId, imageData) {
  if (!imageId) {
    throw new Error("El ID de la imagen es necesario para actualizar");
  }

  const response = await fetch(`${API_URL}/${imageId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(imageData)
  });

  const text = await response.text();
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || JSON.stringify(errorData));
    } catch {
      throw new Error(text || 'Error al actualizar la imagen');
    }
  }
  return JSON.parse(text);
}

/**
 * Elimina una imagen.
 * @param {string} imageId ID de la imagen a eliminar
 * @returns {Promise<Object>} Respuesta de confirmación
 */
async function remove(imageId) {
  if (!imageId) {
    throw new Error("ID de imagen inválido: no se puede eliminar");
  }

  const response = await fetch(`${API_URL}/${imageId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(false)
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || JSON.stringify(errorData));
    } catch {
      throw new Error(text || 'Error al eliminar la imagen');
    }
  }
  return await response.json();
}

export default { upload, getByEvent, getHeader, update, remove }