import React, { useEffect, useState } from 'react';
import eventService from '../api/eventService';
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

  useEffect(() => {
    // Obtener lista de eventos
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.list();
      setEvents(data);
    } catch (err) {
      console.error('Error obteniendo la lista de eventos:', err);
      setError('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (event) => {
    console.log("Event clicked:", event); // verifica que el evento tenga un id
    console.log("Event ID:", event.id, "MongoDB _id:", event._id);

    // Asegurarse de tener siempre un ID válido
    const eventWithId = {
      ...event,
      // Si no hay id pero hay _id, usamos _id como id
      id: event.id || event._id
    };

    setSelectedEvent(eventWithId);
    setEditForm({
      name: event.name,
      description: event.description,
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      location: event.location
    });
    setIsModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      if(!selectedEvent || !selectedEvent.id) {
        setError('No se puede actualizar: ID de evento no disponible');
        return;
      }

      console.log("Updating event with ID:", selectedEvent.id);
      const updatedEvent = await eventService.update(selectedEvent.id, {
        ...editForm,
        start_time: formatToISO(editForm.start_time),
        end_time: formatToISO(editForm.end_time)
      });
      setEvents(events.map(evt => evt.id === selectedEvent.id ? updatedEvent : evt));
      setIsEditing(false);
      setSelectedEvent(updatedEvent);
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
      setEvents(events.filter(evt => evt.id !== selectedEvent.id));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error eliminando el evento:', err);
      setError('Error al eliminar el evento');
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Cargando eventos...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Lista de Eventos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(evt => (
          <div 
            key={evt.id} 
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(evt)}
          >
            <h2 className="text-xl font-semibold mb-2">{evt.name}</h2>
            <p className="text-gray-600 mb-4">
              {evt.description || 'Sin descripción'}
            </p>
            <p className="text-gray-500 text-sm">
              {new Date(evt.start_time).toLocaleString()} - {new Date(evt.end_time).toLocaleString()}
            </p>
            {evt.location && (
              <p className="text-gray-500 text-sm mt-1">Ubicación: {evt.location}</p>
            )}
          </div>
        ))}
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
                  className="mt-1 block w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Descripción</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Inicio</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={editForm.start_time}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border rounded p-2"
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
                  className="mt-1 block w-full border rounded p-2"
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
                  className="mt-1 block w-full border rounded p-2"
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={handleUpdate}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
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
              <h2 className="text-2xl font-bold mb-4">{selectedEvent?.name}</h2>
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
              <div className="flex justify-between">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
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