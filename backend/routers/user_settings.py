from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from services import user_settings_service
from bson.errors import InvalidId

router = APIRouter()

class NotificationPreferences(BaseModel):
    email: bool = True
    push: bool = True
    sms: bool = False

class UserSettingsUpdate(BaseModel):
    notification_preferences: Optional[NotificationPreferences] = None
    theme: Optional[str] = None
    preferred_categories: Optional[List[str]] = None
    language: Optional[str] = None
    timezone: Optional[str] = None

@router.get("/{user_id}", response_model=dict)
async def get_settings(user_id: str):
    """Obtiene la configuración de un usuario"""
    try:
        settings = user_settings_service.get_user_settings(user_id)
        if not settings:
            # Si el usuario no tiene configuraciones, inicializamos las predeterminadas
            user_settings_service.initialize_user_settings(user_id)
            settings = user_settings_service.get_user_settings(user_id)
        return settings
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")

@router.put("/{user_id}", response_model=dict)
async def update_settings(user_id: str, settings: UserSettingsUpdate):
    """Actualiza la configuración de un usuario"""
    try:
        settings_dict = settings.dict(exclude_unset=True)
        success = user_settings_service.update_user_settings(user_id, settings_dict)
        if not success:
            raise HTTPException(status_code=500, detail="Error al actualizar configuración")
        return {"message": "Configuración actualizada exitosamente"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")

@router.post("/{user_id}/initialize", response_model=dict)
async def initialize_settings(user_id: str):
    """Inicializa las configuraciones predeterminadas para un usuario"""
    try:
        settings_id = user_settings_service.initialize_user_settings(user_id)
        return {"id": settings_id, "message": "Configuración inicializada exitosamente"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")

@router.put("/{user_id}/categories", response_model=dict)
async def update_preferred_categories(user_id: str, category_ids: List[str]):
    """Actualiza las categorías preferidas de un usuario"""
    try:
        success = user_settings_service.update_preferred_categories(user_id, category_ids)
        if not success:
            raise HTTPException(status_code=500, detail="Error al actualizar categorías preferidas")
        return {"message": "Categorías preferidas actualizadas exitosamente"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")