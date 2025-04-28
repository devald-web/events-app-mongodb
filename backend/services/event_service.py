from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException
from models.event import Event
import db  


def create_event(event: Event) -> Event:
    """Inserta un evento en MongoDB y retorna el modelo con ID asignado."""
    data = event.dict(by_alias=True, exclude={"id"})  
    result = db.db["events"].insert_one(data)       
    event.id = str(result.inserted_id)                 
    return event


def get_event(event_id: str) -> Optional[Event]:
    """Busca un evento por ObjectId y retorna el modelo o None."""
    doc = db.db["events"].find_one({"_id": ObjectId(event_id)})
    if doc:
        doc["id"] = str(doc["_id"])                  
        del doc["_id"]                               
        return Event(**doc)                             
    return None


def list_events() -> List[Event]:
    """Devuelve lista de todos los eventos como modelos Pydantic."""
    events: List[Event] = []
    for doc in db.db["events"].find():
        doc["id"] = str(doc["_id"])                   
        del doc["_id"]                                 
        events.append(Event(**doc))                    
    return events

def update_event(event_id: str, event_data):
    # Verificar si event_data es un dict o un modelo Pydantic
    if hasattr(event_data, 'dict'):
        update_data = {k: v for k, v in event_data.dict(exclude={"id"}).items() if v is not None}
    else:
        # Ya es un diccionario
        update_data = {k: v for k, v in event_data.items() if v is not None}
    
    result = db.db["events"].update_one(
        {"_id": ObjectId(event_id)},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return get_event(event_id)

def delete_event(event_id: str) -> bool:
    result = db.db["events"].delete_one({"_id": ObjectId(event_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return True