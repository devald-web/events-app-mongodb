from bson import ObjectId
import db  

def update_user_settings(user_id: str, settings: dict):
    db.db["user_settings"].update_one(
        {"user_id": ObjectId(user_id)},
        {"$set": settings},
        upsert=True
    )