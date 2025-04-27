from bson import ObjectId
from typing import Optional
import db  

def get_user_settings(user_id: str) -> Optional[dict]:
  """Obtiene la configuración de un usuario"""
  settings = db.db["user_settings"].find_one({"user_id": ObjectId(user_id)})
  if settings:
    settings["_id"] = str(settings["_id"])
    settings["user_id"] = str(settings["user_id"])
  return settings

def update_user_settings(user_id: str, settings: dict) -> bool:
  """Actualiza o crea la configuración de un usuario"""
  # Convertir user_id a ObjectId
  settings_with_obj_id = {"user_id": ObjectId(user_id)}
  
  for key, value in settings.items():
    if key != "user_id":
      settings_with_obj_id[key] = value
  
    result = db.db["user_settings"].update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": settings_with_obj_id},
        upsert=True
    )
    return result.acknowledged
  
def initialize_user_settings(user_id: str) -> str:
  """Inicializa las configuraciones por defecto para un nuevo usuario"""
  default_settings = {
    "user_id": ObjectId(user_id),
    "notification_preferences": {
      "email": True,
      "push": True,
      "sms": False
    },
    "theme": "light",
    "preferred_categories": [],
    "language": "es",
    "timezone": "America/Lima"
  }
  
  # Verificar si ya existe configuración para este usuario
  existing = db.db["user_settings"].find_one({"user_id": ObjectId(user_id)})
  if existing:
    return str(existing["_id"])
  
  # Crear nueva configuración
  result = db.db["user_settings"].find_one({"user_id": ObjectId(user_id)})
  if existing:
    return str(existing["_id"])
  
  # Crear nueva configuración
  result = db.db["user_settings"].insert_one(default_settings)
  return str(result.inserted_id)

def update_preferred_categories(user_id: str, category_ids: list) -> bool:
  """Actualiza las categorías preferidas de un usuario"""
  # Convertir strings a ObjectId si es necesario
  object_ids = [ObjectId(cat_id) if isinstance(cat_id, str) else cat_id for cat_id in category_ids]
  
  result = db.db["user_settings"].update_one(
    {"user_id": ObjectId(user_id)},
    {"$set": {"preferred_categories": object_ids}},
    upsert=True
  )
  return result.acknowledged