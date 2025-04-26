from fastapi import APIRouter, HTTPException, Depends, status, Body
from models.user import User # Importa User model
from services import user_service #Importa user service
from pydantic import BaseModel

router = APIRouter()

# --- Request Models ---
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "usuario"  # Rol por defecto
        
class UserLogin(BaseModel):
    username: str
    password: str
        
class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str

# --- Endpoints --- 

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    try:
        user = User(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            role=user_data.role
        )
        
        created_user = user_service.create_user(user)
        return {
            "id": str(created_user.id),
            "username": created_user.username,
            "email": created_user.email,
            "role": created_user.role
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error en registro: {str(e)}")  # Log para debug
        raise HTTPException(status_code=500, detail="Error en el servidor")
    
class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
        
@router.post("/login", response_model=UserResponse)
def login_user(login_data: UserLogin):
    """Inicia la sesión de un usuario"""
    user = user_service.authenticate_user(username=login_data.username, password=login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Convertir a dict y asegurar que solo contiene los campos de UserResponse
    user_dict = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role
    }
    
    return UserResponse(**user.model_dump())
