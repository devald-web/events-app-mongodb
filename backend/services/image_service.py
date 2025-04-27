from datetime import datetime
from bson import ObjectId
from typing import List, Optional
import db  

def upload_event_image(event_id: str, image_url: str, is_header: bool = True, alt_text: str = None):
  """Sube una nueva imagen para un evento"""
  image_data = {
    "event_id": ObjectId(event_id),
    "url": image_url,
    "upload_date": datetime.utcnow(),
    "is_header": is_header,
    "alt_text": alt_text
  }
  result = db.db["event_images"].insert_one(image_data)
  return str(result.inserted_id)

def get_event_images(event_id: str) -> List[dict]:
  """Obtiene todas las imágenes asociadas a un evento"""
  images = list(db.db["event_images"].find({"event_id": ObjectId(event_id)}))
  for image in images:
    image["_id"] = str(image["_id"])
    image["event_id"] = str(image["event_id"])
  return images

def get_header_image(event_id: str) -> Optional[dict]:
  """Obtiene la imagen principal de un evento"""
  image = db.db["event_images"].find_one({
    "event_id": ObjectId(event_id),
    "is_header": True
  })
  if image:
    image["_id"] = str(image["_id"])
    image["event_id"] = str(image["event_id"])
  return image

def delete_image(image_id: str) -> bool:
  """Elimina una imagen"""
  result = db.db["event_images"].delete_one({"_id": ObjectId(image_id)})
  return result.deleted_count > 0
  
def update_image(image_id: str, image_data: dict) -> bool:
  """Act ualiza la información de una imagen"""
  result = db.db["event_images"].update_one(
    {"_id": ObjectId(image_id)},
    {"$set": image_data}
  )
  return result.modified_count > 0