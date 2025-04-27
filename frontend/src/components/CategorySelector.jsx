import React, { useState, useEffect } from 'react';
import categoryService from '../api/categoryService';

// Componente para seleccionar categorías (múltiple o individual)
const CategorySelector = ({ 
  selectedCategories = [], 
  onChange, 
  multiple = false,
  className = ""
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await categoryService.list();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Error cargando categorías:', err);
        setError('No se pudieron cargar las categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (categoryId) => {
    if (multiple) {
      // Para selección múltiple (toggle)
      if (selectedCategories.includes(categoryId)) {
        onChange(selectedCategories.filter(id => id !== categoryId));
      } else {
        onChange([...selectedCategories, categoryId]);
      }
    } else {
      // Para selección única (radio button)
      onChange(categoryId);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Cargando categorías...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className={`${className}`}>
      {multiple ? (
        // Checkboxes para selección múltiple
        <div className="grid grid-cols-2 gap-2">
          {categories.map(category => (
            <div key={category._id} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category._id}`}
                checked={selectedCategories.includes(category._id)}
                onChange={() => handleCategoryChange(category._id)}
                className="mr-2"
              />
              <label 
                htmlFor={`category-${category._id}`}
                className="text-sm cursor-pointer flex items-center"
                style={{ color: category.color || '#4A5568' }}
              >
                {category.icon && <span className="mr-1">⦿</span>}
                {category.name}
              </label>
            </div>
          ))}
        </div>
      ) : (
        // Dropdown para selección única
        <select
          className="w-full border rounded p-2 text-gray-700"
          onChange={(e) => handleCategoryChange(e.target.value)}
          value={selectedCategories[0] || ""}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CategorySelector;