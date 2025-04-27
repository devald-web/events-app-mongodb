import React, { useState } from 'react'
import eventService from '../api/eventService'

// Convierte 'YYYY-MM-DDTHH:MM' a ISO 8601 para la API
export function formatToISO(dateLocal) {
  return new Date(dateLocal).toISOString()
}

export default function CreateEvent() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    start_time: '',
    end_time: '',
    location: ''
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const eventData = {
        name: form.name,
        description: form.description,
        start_time: formatToISO(form.start_time),
        end_time: formatToISO(form.end_time),
        location: form.location
      }
      // Añadimos _id null directamente en la llamada
      await eventService.create(eventData)
      setSuccess('Evento creado correctamente')
      setForm({ name: '', description: '', start_time: '', end_time: '', location: '' })
    } catch (err) {
      console.error('Error creating event:', err)
      setError(err.message)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">Crear Evento</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Inicio</label>
          <input
            type="datetime-local"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fin</label>
          <input
            type="datetime-local"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Ubicación</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Crear Evento
        </button>
      </form>
    </div>
  )
}