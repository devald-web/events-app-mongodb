import React, { useState, useEffect } from 'react';
import userSettingsService from '../api/userSettingsService';
import CategorySelector from './CategorySelector';

const UserPreferences = () => {
  const [settings, setSettings] = useState({
    notification_preferences: {
      email: true,
      push: true,
      sms: false
    },
    theme: 'light',
    preferred_categories: [],
    language: 'es',
    timezone: 'UTC'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Opciones de lenguaje y zona horaria
  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'pt', label: 'Português' }
  ];
  
  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/Mexico_City', label: 'Ciudad de México' },
    { value: 'America/Lima', label: 'Lima' },
    { value: 'America/Bogota', label: 'Bogotá' },
    { value: 'Europe/Madrid', label: 'Madrid' }
  ];

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        setLoading(true);
        const data = await userSettingsService.get();
        if (data) {
          setSettings({
            notification_preferences: data.notification_preferences || settings.notification_preferences,
            theme: data.theme || settings.theme,
            preferred_categories: data.preferred_categories || [],
            language: data.language || settings.language,
            timezone: data.timezone || settings.timezone
          });
          setInitialized(true); // Marca como inicializado
        }
      } catch (err) {
        console.error('Error cargando configuración:', err);
          
        if (err.message?.includes('No se pudo obtener el ID del usuario')) {
          setError('No se pudo cargar la configuración de usuario');
         return; 
        }

        // Intentar inicializar
        try {
          console.log('Intentando inicializar configuración...');
          await userSettingsService.initialize();
          const data = await userSettingsService.get();
          if (data) {
            setSettings({
              notification_preferences: data.notification_preferences || settings.notification_preferences,
              theme: data.theme || settings.theme,
              preferred_categories: data.preferred_categories || [],
              language: data.language || settings.language,
              timezone: data.timezone || settings.timezone
            });
            setInitialized(true);
          }
        } catch (initErr) {
          console.error('Error inicializando configuración:', initErr);
          setError('No se pudo inicializar la configuración. Por favor, intenta más tarde.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserSettings();
  }, []);

  const handleNotificationChange = (type) => {
    setSettings(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: !prev.notification_preferences[type]
      }
    }));
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
    // Aplicar tema inmediatamente (opcional)
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  const handleCategoriesChange = (categories) => {
    setSettings(prev => ({ ...prev, preferred_categories: categories }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);
    
    try {
      await userSettingsService.update(settings);
      
      // Actualizar categorías preferidas por separado
      if (settings.preferred_categories.length > 0) {
        await userSettingsService.updateCategories(settings.preferred_categories);
      }
      
      setSuccess('Configuración guardada correctamente');
    } catch (err) {
      console.error('Error guardando configuración:', err);
      setError('No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !initialized) {
    return <div className="text-center p-4">Cargando preferencias...</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Preferencias de Usuario</h2>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4">{success}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notificaciones */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Notificaciones</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="email-notif"
                checked={settings.notification_preferences.email}
                onChange={() => handleNotificationChange('email')}
                className="mr-2"
              />
              <label htmlFor="email-notif">Email</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="push-notif"
                checked={settings.notification_preferences.push}
                onChange={() => handleNotificationChange('push')}
                className="mr-2"
              />
              <label htmlFor="push-notif">Notificaciones push</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sms-notif"
                checked={settings.notification_preferences.sms}
                onChange={() => handleNotificationChange('sms')}
                className="mr-2"
              />
              <label htmlFor="sms-notif">SMS</label>
            </div>
          </div>
        </div>
        
        {/* Tema */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Tema</h3>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="light-theme"
                value="light"
                checked={settings.theme === 'light'}
                onChange={() => handleThemeChange('light')}
                className="mr-2"
              />
              <label htmlFor="light-theme">Claro</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="dark-theme"
                value="dark"
                checked={settings.theme === 'dark'}
                onChange={() => handleThemeChange('dark')}
                className="mr-2"
              />
              <label htmlFor="dark-theme">Oscuro</label>
            </div>
          </div>
        </div>
        
        {/* Categorías preferidas */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Categorías preferidas</h3>
          <p className="text-sm text-gray-500 mb-2">Selecciona las categorías que más te interesan</p>
          <CategorySelector 
            selectedCategories={settings.preferred_categories} 
            onChange={handleCategoriesChange}
            multiple={true}
          />
        </div>
        
        {/* Idioma y zona horaria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Idioma</h3>
            <select
              name="language"
              value={settings.language}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Zona horaria</h3>
            <select
              name="timezone"
              value={settings.timezone}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className={`w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Guardando...' : 'Guardar preferencias'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserPreferences;