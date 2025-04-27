from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Event(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    category_id: Optional[str] = None # ID de la categoría del evento
    created_by: Optional[str] = None # ID del usuario que creó el evento
    created_at: datetime = datetime.now()
    updated_at: Optional[datetime] = None
    
    class Config:
        validate_by_name = True