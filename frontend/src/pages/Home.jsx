import React, { useEffect, useState } from 'react';
import eventService from '../api/eventService';
import imageService from '../api/imageService';
import categoryService from '../api/categoryService';
import Modal from 'react-modal';
import { formatToISO } from './CreateEvent';

Modal.setAppElement('#root');

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventImages, setEventImages] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Comprobar si el usuario es administrador
    const user = JSON.parse(localStorage.getItem('user'));
    setIsAdmin(user?.role === 'admin');
  }, []);

  // Cargar eventos, categorías e imágenes al inicio
  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  // Filtrar eventos cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategory) {
      fetchEvents(selectedCategory);
    } else {
      fetchEvents();
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (err) {
      console.error('Error obteniendo categorías:', err);
    }
  };

  const fetchEvents = async (categoryId = null) => {
    setLoading(true);
    try {
      // Aquí podrías implementar la lógica para filtrar por categoría en el backend
      // Por ahora, filtraremos en el frontend
      const data = await eventService.list();

      let filteredEvents = data;
      if (categoryId) {
        filteredEvents = data.filter(event => event.category_id === categoryId);
      }

      setEvents(filteredEvents);

      // Cargar imágenes para cada evento
      fetchEventImages(filteredEvents);
    } catch (err) {
      console.error('Error obteniendo la lista de eventos:', err);
      setError('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const fetchEventImages = async (eventsList) => {
    const imagesMap = { ...eventImages };

    for (const event of eventsList) {
      if (!imagesMap[event.id || event._id]) {
        try {
          // Intentar obtener cualquier imagen asociada al evento en lugar de buscar específicamente la cabecera
          const images = await imageService.getByEvent(event.id || event._id)
            .catch(() => []);

          if (images && images.length > 0) {
            // Si hay imágenes, usar la primera
            imagesMap[event.id || event._id] = images[0].url;
          }
        } catch (err) {
          console.error(`Error cargando imágenes para evento ${event.id}:`, err);
        }
      }
    }

    setEventImages(imagesMap);
  };

  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat._id === categoryId) || null;
  };

  const handleCardClick = (event) => {
    const eventWithId = {
      ...event,
      id: event.id || event._id
    };

    setSelectedEvent(eventWithId);

    // Obtener la URL de la imagen para este evento
    const imageUrl = eventImages[event.id || event._id] || '';

    setEditForm({
      name: event.name,
      description: event.description,
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      location: event.location,
      category_id: event.category_id || '',
      image_url: imageUrl // Añadir la URL de la imagen al formulario
    });
    setIsModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    setEditForm(prev => ({ ...prev, category_id: categoryId }));
  };

  const handleUpdate = async () => {
    try {
      if (!selectedEvent || !selectedEvent.id) {
        setError('No se puede actualizar: ID de evento no disponible');
        return;
      }

      console.log("Updating event with ID:", selectedEvent.id);

      // Actualizar el evento con todos los campos del formulario
      const updatedEvent = await eventService.update(selectedEvent.id, {
        ...editForm,
        start_time: formatToISO(editForm.start_time),
        end_time: formatToISO(editForm.end_time)
      });

      // Si hay cambios en la imagen, actualizarla
      if (editForm.image_url && editForm.image_url !== eventImages[selectedEvent.id]) {
        try {
          // Primero intentar obtener la imagen actual (si existe)
          const currentImages = await imageService.getByEvent(selectedEvent.id)
            .catch(() => []);

          if (currentImages.length > 0) {
            // Si ya tiene imágenes, actualizar la primera
            await imageService.update(currentImages[0].id || currentImages[0]._id, {
              url: editForm.image_url,
              is_header: true
            });
          } else {
            // Si no tiene imágenes, crear una nueva
            await imageService.upload(selectedEvent.id, editForm.image_url, true);
          }

          // Actualizar el mapa de imágenes
          setEventImages(prev => ({
            ...prev,
            [selectedEvent.id]: editForm.image_url
          }));
        } catch (imgErr) {
          console.error('Error actualizando imagen:', imgErr);
          // Continuar aunque falle la actualización de la imagen
        }
      }

      // Actualizar la lista de eventos
      setEvents(events.map(evt =>
        (evt.id === selectedEvent.id || evt._id === selectedEvent.id)
          ? { ...updatedEvent, id: selectedEvent.id }
          : evt
      ));
      setIsEditing(false);
      setSelectedEvent({ ...updatedEvent, id: selectedEvent.id });
    } catch (err) {
      console.error('Error actualizando el evento:', err);
      setError('Error al actualizar el evento');
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedEvent || !selectedEvent.id) {
        setError('No se puede eliminar: ID de evento no disponible');
        return;
      }

      console.log("Deleting event with ID:", selectedEvent.id);
      await eventService.remove(selectedEvent.id);
      setEvents(events.filter(evt => evt.id !== selectedEvent.id && evt._id !== selectedEvent.id));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error eliminando el evento:', err);
      setError('Error al eliminar el evento');
    }
  };

  if (loading && events.length === 0) {
    return <div className="text-center mt-10">Cargando eventos...</div>;
  }

  if (error && events.length === 0) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Lista de Eventos</h1>

      {/* Filtro de categorías */}
      <div className="mb-6 max-w-md mx-auto">
        <label className="block text-sm font-medium mb-1">Filtrar por categoría</label>
        <div className="flex">
          <select
            className="w-full border rounded p-2 flex-grow"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <button
              className="ml-2 bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              onClick={() => setSelectedCategory('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(evt => {
          const category = getCategoryById(evt.category_id);
          return (
            <div
              key={evt.id || evt._id}
              className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCardClick(evt)}
            >
              {/* Imagen del evento */}
              <div className="h-48 bg-gray-200 relative">
                {eventImages[evt.id || evt._id] ? (
                  <img
                    src={eventImages[evt.id || evt._id]}
                    alt={evt.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No hay imagen
                  </div>
                )}

                {/* Categoría como insignia */}
                {category && (
                  <span
                    className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: category.color || '#4A5568',
                      color: '#FFFFFF'
                    }}
                  >
                    {category.name}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{evt.name}</h2>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {evt.description || 'Sin descripción'}
                </p>
                <p className="text-gray-500 text-sm">
                  {new Date(evt.start_time).toLocaleString()} - {new Date(evt.end_time).toLocaleString()}
                </p>
                {evt.location && (
                  <p className="text-gray-500 text-sm mt-1">Ubicación: {evt.location}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setIsEditing(false);
          setShowDeleteConfirm(false);
        }}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Editar Evento</h2>
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Categoría</label>
                <select
                  name="category_id"
                  value={editForm.category_id || ''}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="mt-1 block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sin categoría</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Descripción</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Inicio</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={editForm.start_time}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Fin</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={editForm.end_time}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Ubicación</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Nuevo campo para la URL de imagen */}
              <div>
                <label className="block text-sm font-medium">URL de imagen</label>
                <input
                  type="text"
                  name="image_url"
                  value={editForm.image_url || ''}
                  onChange={handleEditChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="mt-1 block w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {editForm.image_url && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={editForm.image_url}
                      alt="Vista previa"
                      className="max-h-32 rounded shadow-sm"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Vista de detalle con imagen */}
              {eventImages[selectedEvent?.id] && (
                <div className="mb-4 rounded overflow-hidden">
                  <img
                    src={eventImages[selectedEvent.id]}
                    alt={selectedEvent.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <h2 className="text-2xl font-bold mb-2">{selectedEvent?.name}</h2>

              {/* Mostrar categoría */}
              {selectedEvent?.category_id && (
                <div className="mb-3">
                  <span
                    className="inline-block px-2 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: getCategoryById(selectedEvent.category_id)?.color || '#4A5568',
                      color: '#FFFFFF'
                    }}
                  >
                    {getCategoryById(selectedEvent.category_id)?.name || 'Categoría'}
                  </span>
                </div>
              )}

              <p className="text-gray-600 mb-4">
                {selectedEvent?.description || 'Sin descripción'}
              </p>
              <p className="text-gray-500 text-sm mb-2">
                <span className="font-semibold">Inicio:</span> {new Date(selectedEvent?.start_time).toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm mb-2">
                <span className="font-semibold">Fin:</span> {new Date(selectedEvent?.end_time).toLocaleString()}
              </p>
              {selectedEvent?.location && (
                <p className="text-gray-500 text-sm mb-4">
                  <span className="font-semibold">Ubicación:</span> {selectedEvent.location}
                </p>
              )}
              <div className="flex justify-between mt-6">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                      Eliminar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-red-50 rounded">
              <p className="text-red-800 mb-4">¿Estás seguro de eliminar este evento?</p>
              <div className="flex justify-between">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}