import React, { useState } from 'react';

// Componente para ingresar URL de imagen con previsualización
const ImageUrlInput = ({ value = "", onChange, className = "" }) => {
  const [previewUrl, setPreviewUrl] = useState(value);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const url = e.target.value;
    setPreviewUrl(url);
    onChange(url);
  };

  const validateImage = () => {
    if (!previewUrl) {
      setError(null);
      return;
    }

    const img = new Image();
    img.onload = () => setError(null);
    img.onerror = () => setError("La URL no es una imagen válida");
    img.src = previewUrl;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center">
        <input
          type="text"
          value={previewUrl}
          onChange={handleInputChange}
          onBlur={validateImage}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="flex-1 border rounded p-2 text-sm"
        />
      </div>
      
      {error && <p className="text-red-500 text-xs">{error}</p>}
      
      {previewUrl && !error && (
        <div className="mt-2">
          <img 
            src={previewUrl} 
            alt="Vista previa" 
            className="max-h-32 rounded shadow-sm" 
            onError={() => setError("Error al cargar la imagen")} 
          />
        </div>
      )}
    </div>
  );
};

export default ImageUrlInput;