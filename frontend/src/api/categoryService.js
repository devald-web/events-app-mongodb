// URL completa de la API
const API_URL = 'http://127.0.0.1:8000/categories'

/**
 * Obtiene la lista de categorías de eventos.
 * @returns {Promise<Array>} Lista de categorías
 */
async function list() {
  const response = await fetch(API_URL)
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Error al obtener las categorías')
  }

  const categories = await response.json();
  return categories.map(category => ({
    ...category,
    id: category.id || category._id
  }));
}

/**
 * Crea una nueva categoría.
 * @param {Object} category Datos de la categoría
 * @returns {Promise<Object>} Categoría creada
 */
async function create(category) {
  const payload = { _id: null, ...category }
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text()
  if (!response.ok) {
    try {
      const errorData = JSON.parse(text)
      throw new Error(errorData.detail || JSON.stringify(errorData))
    } catch {
      throw new Error(text || 'Error al crear categoría')
    }
  }
  return JSON.parse(text)
}

/**
 * Actualiza una categoría existente.
 * @param {string} categoryId ID de la categoría a actualizar
 * @param {Object} categoryData Nuevos datos de la categoría
 * @returns {Promise<Object>} Categoría actualizada
 */
async function update(categoryId, categoryData) {
  if (!categoryId) {
    throw new Error("El ID de la categoría es necesario para actualizar");
  }

  const payload = { 
    _id: categoryId,
    ...categoryData 
  };

  const response = await fetch(`${API_URL}/${categoryId}`, {
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
      throw new Error(text || 'Error al actualizar la categoría');
    }
  }
  return JSON.parse(text);
}

/**
 * Elimina una categoría.
 * @param {string} categoryId ID de la categoría a eliminar
 * @returns {Promise<Object>} Respuesta de confirmación
 */
async function remove(categoryId) {
  if (!categoryId) {
    throw new Error("ID de categoría inválido: no se puede eliminar");
  }

  const response = await fetch(`${API_URL}/${categoryId}`, {
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
      throw new Error(text || 'Error al eliminar la categoría');
    }
  }
  return await response.json();
}

export default { list, create, update, remove }