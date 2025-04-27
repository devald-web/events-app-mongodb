from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from services import image_service
from bson.errors import InvalidId

router = APIRouter()

class ImageUpload(BaseModel):
    event_id: str
    url: str
    is_header: bool = True
    alt_text: Optional[str] = None

class ImageUpdate(BaseModel):
    url: Optional[str] = None
    is_header: Optional[bool] = None
    alt_text: Optional[str] = None

@router.post("/", response_model=dict)
async def upload_image(image: ImageUpload):
    """Sube una nueva imagen para un evento"""
    try:
        image_id = image_service.upload_event_image(
            image.event_id, 
            image.url, 
            image.is_header, 
            image.alt_text
        )
        return {"id": image_id, "message": "Imagen subida exitosamente"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de evento inválido")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir imagen: {str(e)}")

@router.get("/event/{event_id}", response_model=List[dict])
async def get_event_images(event_id: str):
    """Obtiene todas las imágenes asociadas a un evento"""
    try:
        return image_service.get_event_images(event_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de evento inválido")

@router.get("/event/{event_id}/header", response_model=Optional[dict])
async def get_event_header_image(event_id: str):
    """Obtiene la imagen principal de un evento"""
    try:
        image = image_service.get_header_image(event_id)
        if not image:
            return None
        return image
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de evento inválido")

@router.put("/{image_id}", response_model=dict)
async def update_image(image_id: str, image_data: ImageUpdate):
    """Actualiza la información de una imagen"""
    try:
        update_data = image_data.dict(exclude_unset=True)
        success = image_service.update_image(image_id, update_data)
        if not success:
            raise HTTPException(status_code=404, detail="Imagen no encontrada")
        return {"message": "Imagen actualizada exitosamente"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de imagen inválido")

@router.delete("/{image_id}", response_model=dict)
async def delete_image(image_id: str):
    """Elimina una imagen"""
    try:
        success = image_service.delete_image(image_id)
        if not success:
            raise HTTPException(status_code=404, detail="Imagen no encontrada")
        return {"message": "Imagen eliminada exitosamente"}
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de imagen inválido")