from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.event_category import EventCategory
from services import event_category_service
from bson.errors import InvalidId
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[EventCategory])
async def get_all_categories():
    """Obtiene todas las categorías de eventos disponibles"""
    return event_category_service.get_all_categories()

@router.get("/{category_id}", response_model=EventCategory)
async def get_category(category_id: str):
    """Obtiene una categoría específica por su ID"""
    try:
        category = event_category_service.get_category_by_id(category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        return category
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de categoría inválido")

@router.post("/", response_model=dict)
async def create_category(category: EventCategory):
    """Crea una nueva categoría de evento"""
    category_dict = category.dict(exclude={"id"})
    category_id = event_category_service.create_category(category_dict)
    return {"id": category_id, "message": "Categoría creada exitosamente"}

@router.put("/{category_id}", response_model=dict)
async def update_category(category_id: str, category: EventCategory):
    """Actualiza una categoría existente"""
    try:
        category_dict = category.dict(exclude={"id"}, exclude_unset=True)
        success = event_category_service.update_category(category_id, category_dict)
        if not success:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        return {"message": "Categoría actualizada exitosamente"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de categoría inválido")

@router.delete("/{category_id}", response_model=dict)
async def delete_category(category_id: str):
    """Elimina una categoría"""
    try:
        success = event_category_service.delete_category(category_id)
        if not success:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        return {"message": "Categoría eliminada exitosamente"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de categoría inválido")