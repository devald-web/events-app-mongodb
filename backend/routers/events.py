from fastapi import APIRouter, HTTPException, Depends, status
from models.event import Event
from models.user import User
from services.security import get_current_user
from services.event_service import create_event, get_event, list_events, update_event as service_update_event, delete_event as service_delete_event
from pydantic import BaseModel
from typing import List, Optional

# Definir modelo de actualización si no existe
class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    category_id: Optional[str] = None

router = APIRouter()

@router.post("/", response_model=Event)
def create_event_endpoint(event: Event):
    return create_event(event)

@router.get("/{event_id}", response_model=Event)
def get_event_endpoint(event_id: str):
    event = get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    current_user: User = Depends(get_current_user)
):
    # Verficiar que el usuario es administrador
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden editar eventos"
        )
    
    # Convertir a diccionario y eliminar valores None
    update_data = {k: v for k, v in event_data.dict().items() if v is not None}
    
    updated_event = service_update_event(event_id, update_data)
    if not updated_event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return updated_event
    
@router.delete("/{event_id}", response_model=dict)
def delete_event_endpoint(
    event_id: str,
    current_user: User = Depends(get_current_user)
):
    # Verificar que el usuario es administrador
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden eliminar eventos"
        )
        
    success = service_delete_event(event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return {"message": "Evento eliminado correctamente"}

@router.get("/", response_model=list[Event])
def list_events_endpoint():
    return list_events()