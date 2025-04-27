from fastapi import FastAPI
from db import connect_to_mongo, close_mongo_connection
from routers.auth import router as auth_router
from routers.events import router as events_router
from routers.categories import router as categories_router  # Nuevo router
from routers.images import router as images_router  # Nuevo router
from routers.user_settings import router as user_settings_router  # Nuevo router
from fastapi.middleware.cors import CORSMiddleware
from services.event_category_service import initialize_default_categories

app = FastAPI(
    title="My Event App",
    version="0.1.0",
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Añade el middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # quién puede llamar
    allow_credentials=True,         # si se permiten cookies/credenciales
    allow_methods=["*"],            # qué métodos HTTP se permiten
    allow_headers=["*"],            # qué cabeceras se permiten
    expose_headers=["*"]
)

def startup_db_client():
    connect_to_mongo()
    # Inicializar categorías predeterminadas al arrancar la aplicación
    initialize_default_categories()
    
app.add_event_handler("startup", startup_db_client)

def shutdown_db_client():
    close_mongo_connection()
    
app.add_event_handler("shutdown", shutdown_db_client)


app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(events_router, prefix="/events", tags=["events"])

app.include_router(categories_router, prefix="/categories", tags=["categories"])
app.include_router(images_router, prefix="/images", tags=["images"])
app.include_router(user_settings_router, prefix="/user-settings", tags=["user-settings"])