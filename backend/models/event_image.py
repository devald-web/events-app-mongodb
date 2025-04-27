from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class EventImage(BaseModel):
  id: Optional[str] = Field(alias="_id")
  event_id: str
  url: str
  upload_date: datetime = datetime.utcnow()
  is_header: bool = True # Indica si es la imagen principal del evento
  alt_text: Optional[str] = None # Texto alternativo para accesibilidad
  
  class Config:
    validate_by_name = True