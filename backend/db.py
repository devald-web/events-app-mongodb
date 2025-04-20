from pymongo import MongoClient
from config import settings

client = None 
db = None     

def connect_to_mongo():
    global client, db
    client = MongoClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]


def close_mongo_connection():
    global client
    if client:
        client.close()