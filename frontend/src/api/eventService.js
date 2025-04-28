// src/api/eventService.js

// URL completa de la API
const API_URL = 'http://127.0.0.1:8000/events'

/**
 * Obtiene la lista de eventos.
 * @returns {Promise<Array>} Lista de eventos
 */
async function list() {
  const response = await fetch(API_URL)
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Error al obtener los eventos')
  }

  // Asegurarse de que todos los eventos tengan un ID
  const events = await response.json();
  return events.map(event => ({
    ...event,
    // Si la API devuelve _id en lugar de id, asegurémonos de tener ambos
    id: event.id || event._id
  }));
}

/**
 * Crea un nuevo evento.
 * @param {Object} event Datos del evento
 * @returns {Promise<Object>} Evento creado
 */
async function create(event) {
  const payload = { _id: null, ...event };
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${localStorage.getItem('username')}:${localStorage.getItem('password')}`)
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || JSON.stringify(errorData));
    } catch {
      throw new Error(text || 'Error al crear evento');
    }
  }
  return JSON.parse(text);
}

/**
 * Actualiza un evento existente
 * @param {string} eventId ID del evento
 * @param {Object} eventData Datos a actualizar 
 * @returns {Promise<Object>} Evento actualizado
 */
async function update(eventId, eventData) {
  if (!eventId) {
    throw new Error("Se requiere un ID de evento");
  }

  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${localStorage.getItem('username')}:${localStorage.getItem('password')}`)
      },
      body: JSON.stringify(eventData)
    });

    if (response.status === 403) {
      throw new Error("No tienes permisos para editar eventos. Se requiere rol de administrador.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error actualizando evento');
    }

    const data = await response.json();
    return { ...data, id: data._id || data.id };
    
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

/**
 * Elimina un evento.
 * @param {string} eventId ID del evento a eliminar
 * @returns {promise<Object>} Respuesta de confirmación
 */

async function remove(eventId) {
  if (!eventId) {
    throw new Error("Se requiere un ID de evento");
  }

  try {
    const response = await fetch(`${API_URL}/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(`${localStorage.getItem('username')}:${localStorage.getItem('password')}`)
      }
    });

    if (response.status === 403) {
      throw new Error("No tienes permisos para eliminar eventos. Se requiere rol de administrador.")
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

export default { list, create, update, remove }