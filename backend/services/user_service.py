from typing import List, Optional
from bson import ObjectId
from models.user import User
import db  

"""Nombre de la colección """
USER_COLLECTION = "users"

def create_user(user: User) -> User:
    """Inserta un usuario en MongoDB y retorna el modelo con ID asignado."""
    # Excluir id si es None, usar alias para mapeo _id 
    data = user.model_dump(by_alias=True, exclude_none=True)  
    if "id" in data: # No insertar el 'id' en el campo si este ha sido generado por el alias 
      del data["id"]

    # Revisa si el username o el email existen (opcional pero recomendado)
    if db.db[USER_COLLECTION].find_one({"username": user.username}):
      raise ValueError(f"Nombre de usuario '{user.username}' ya existe.")
    if db.db[USER_COLLECTION].find_one({"email": user.email}):
      raise ValueError(f"Email '{user.email}' ya existe.")

    result = db.db[USER_COLLECTION].insert_one(data)
    user.id = str(result.inserted_id)
    return user

def get_user_by_username(username: str) -> Optional[User]:
  """Encuentra el usuario por su nombre de usuario"""
  doc = db.db[USER_COLLECTION].find_one({"username": username})
  if doc:
    # Convertir _id en cadena y asignar al campo 'id'
    doc["id"] = str(doc["_id"])
    # Elimina doc[«_id»] Mantiene _id si es necesario, pero el User model usa alias
    return User(**doc)
  return None

def authenticate_user(username: str, password: str):
  """Autenticación del usuario por medio del username y contraseña"""
  user = get_user_by_username(username)
  if not user:
    return None
  
  # Comparación directa (texto plano)
  if password != user.password:
    return None
  
  return user