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
  return response.json()
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
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

export default { list, create }