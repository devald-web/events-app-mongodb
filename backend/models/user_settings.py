from pydantic import BaseModel, Field
from typing import Optional, List

class UserSettings(BaseModel):
  id: Optional[str] = Field(alias="_id")
  user_id: str
  notification_preferences: dict = {
    "email": True,
    "push": True,
    "sms": False
  }
  theme: str = "light" # light/dark/system
  preferred_categories: List[str] = [] # Lista de IDs de categorías preferidas
  language: str = "es" # Idioma preferido
  timezone: str = "America/Lima"
  
  class Config:
    validate_by_name = True