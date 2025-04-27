from typing import Optional
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

def update_profile(user_id: str, profile_data: dict) -> User:
  user_data = db.db[USER_COLLECTION].find_one({"_id": ObjectId(user_id)})
  if not user_data:
    raise ValueError("Usuario no encontrado")
  
  user = User(**user_data)
  
  update_data = {}
  if 'username' in profile_data:
    # Verificar si el nuevo username ya existe
    existing = get_user_by_username(profile_data['username'])
    if existing and str(existing.id) != user_id:
      raise ValueError("Nombre de usuario ya existe")
    update_data['username'] = profile_data['username']
    
  if 'email' in profile_data:
    # Verificar si el nuevo email ya existe
    existing = db.db[USER_COLLECTION].find_one({"email": profile_data['email']})
    if existing and existing['_id'] != ObjectId(user_id):
      raise ValueError("Email ya existe")
    update_data['email'] = profile_data['email']
    
  if 'password' in profile_data and profile_data['password']:
    update_data['password'] = profile_data['password']
    
  if update_data:
    db.db[USER_COLLECTION].update_one(
      {"_id": ObjectId(user_id)},
      {"$set": update_data}
    )
    
  # Obtener y devolver el usuario actualizado
  updated_user_data = db.db[USER_COLLECTION].find_one({"_id": ObjectId(user_id)})
  updated_user_data["id"] = str(updated_user_data["_id"])
  return User(**updated_user_data)