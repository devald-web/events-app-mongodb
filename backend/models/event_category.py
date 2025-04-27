from pydantic import BaseModel, Field
from typing import Optional

class EventCategory(BaseModel):
  id: Optional[str] = Field(alias="_id")
  name: str
  description: Optional[str] = None
  icon: Optional[str] = None # Para almacenar un icono o símbolo representativo
  color: Optional[str] = None # Para diferenciar visualmente las categorías
  
  class Config:
    validate_by_name = True 