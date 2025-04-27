import React, { useState } from 'react'
import eventService from '../api/eventService'
import imageService from '../api/imageService'
import CategorySelector from '../components/CategorySelector'
import ImageUrlInput from '../components/ImageUrlInput'

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
    location: '',
    category_id: '', // Nueva propiedad
    image_url: '' // Nueva propiedad
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (categoryId) => {
    setForm(prev => ({ ...prev, category_id: categoryId }))
  }

  const handleImageChange = (url) => {
    setForm(prev => ({ ...prev, image_url: url }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    
    try {
      // Crear evento
      const eventData = {
        name: form.name,
        description: form.description,
        start_time: formatToISO(form.start_time),
        end_time: formatToISO(form.end_time),
        location: form.location,
        category_id: form.category_id || null
      }
      
      const createdEvent = await eventService.create(eventData)
      
      // Si hay imagen, asociarla al evento
      if (form.image_url) {
        try {
          await imageService.upload(
            createdEvent.id || createdEvent._id,
            form.image_url,
            true // Es la imagen principal
          )
        } catch (imgError) {
          console.error('Error al subir imagen:', imgError)
          // Continuar aunque falle la imagen
        }
      }
      
      setSuccess('Evento creado correctamente')
      setForm({ 
        name: '', 
        description: '', 
        start_time: '', 
        end_time: '', 
        location: '',
        category_id: '',
        image_url: ''
      })
    } catch (err) {
      console.error('Error creating event:', err)
      setError(err.message || 'Error al crear evento')
    } finally {
      setIsSubmitting(false)
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
          <label className="block text-sm font-medium">Categoría</label>
          <CategorySelector
            selectedCategories={form.category_id ? [form.category_id] : []}
            onChange={handleCategoryChange}
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
        
        <div>
          <label className="block text-sm font-medium">Imagen del evento (URL)</label>
          <ImageUrlInput
            value={form.image_url}
            onChange={handleImageChange}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Creando...' : 'Crear Evento'}
        </button>
      </form>
    </div>
  )
}