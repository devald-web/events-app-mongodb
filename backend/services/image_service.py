import datetime
from bson import ObjectId
import db  

def upload_event_image(event_id: str, image_url: str, is_header: bool = True):
  image_data = {
    "event_id": ObjectId(event_id),
    "url": image_url,
    "upload_date": datetime.utcnow(),
    "is_header": is_header
  }
  db.db["event_images"].insert_one(image_data)