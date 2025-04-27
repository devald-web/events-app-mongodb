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
  // Incluimos _id como null para ajustar el modelo Pydantic en backend
  const payload = { _id: null, ...event }
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify(payload)
  });

  const text = await response.text()
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text)
      throw new Error(errorData.detail || JSON.stringify(errorData))
    } catch {
      throw new Error(text || 'Error al crear evento')
    }
  }
  return JSON.parse(text)
}

async function update(eventId, eventData) {
  if (!eventId) {
    throw new Error("El ID del evento es necesario para actualizar");
  }

  console.log(`Actualizando evento con ID: ${eventId}`);

  const payload = { 
    _id: eventId,  // Aseguramos que _id esté presente
    ...eventData 
  };

  const response = await fetch(`${API_URL}/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  if (!response.ok) {
    try {
    const errorData = JSON.parse(text);
    throw new Error(errorData.detail || JSON.stringify(errorData));
  } catch {
    throw new Error(text || 'Error al actualizar el evento');
  }
}
  return JSON.parse(text);
}

/**
 * Elimina un evento.
 * @param {string} eventId ID del evento a eliminar
 * @returns {promise<Object>} Respuesta de confirmación
 */
async function remove(eventId) {
  if (!eventId) {
    throw new Error("ID de evento inválido: no se puede eliminar");
  }

  console.log(`Eliminando evento con ID: ${eventId}`);

  const response = await fetch(`${API_URL}/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || JSON.stringify(errorData));
  } catch {
    throw new Error(text || 'Error al eliminar el evento');
  }
}
    return await response.json();
}

export default { list, create, update, remove }