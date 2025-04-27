from bson import ObjectId
from typing import List, Optional
import db
from models.event_category import EventCategory

def create_category(category_data: dict) -> str:
  """Crea una nueva categoría de evento y devuelve su ID"""
  result = db.db["event_categories"].insert_one(category_data)
  return str(result.inserted_id)

def get_all_categories() -> List[EventCategory]:
  """Obtiene todas las categorías disponibles"""
  categories = list(db.db["event_categories"].find())
  for category in categories:
    category["_id"] = str(category["_id"])
  return categories

def get_category_by_id(category_id: str) -> Optional[EventCategory]:
  """Obtiene una categoría por su ID"""
  category = db.db["event_categories"].find_one({"_id": ObjectId(category_id)})
  if category:
    category["_id"] = str(category["_id"])
  return category

def update_category(category_id: str) -> bool:
  """Elimina una categoría"""
  result = db.db["event_categories"].delete_one({"_id": ObjectId(category_id)})
  return result.deleted_count > 0

# Función para inicializar categorías predeterminadas
def initialize_default_categories():
  """Inicializa categorías predeterminadas si no existen"""
  if db.db["event_categories"].count_documents({}) == 0:
    default_categories = [
      {
        "name": "Conciertos",
        "description": "Eventos musicales en vivo",
        "icon": "music",
        "color": "#FF5733"
      },
     {
        "name": "Conferencias",
        "description": "Charlas y presentaciones educativas",
        "icon": "microphone",
        "color": "#3498DB"
      },
      {
        "name": "Deportes",
        "description": "Eventos deportivos y competiciones",
        "icon": "football",
        "color": "#2ECC71"
      },
      {
        "name": "Arte y cultura",
        "description": "Exposiciones, teatro y eventos culturales",
        "icon": "palette",
        "color": "#9B59B6"
       },
       {
        "name": "Gastronomía",
        "description": "Ferias de comida y experiencias culinarias",
        "icon": "utensils",
        "color": "#F1C40F"
      },
      {
        "name": "Tecnología",
        "description": "Hackathons, meetups y eventos de tecnología",
        "icon": "laptop",
        "color": "#1ABC9C"
      }
    ]
    
    db.db["event_categories"].insert_many(default_categories)