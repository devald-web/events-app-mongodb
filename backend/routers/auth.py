from fastapi import APIRouter, HTTPException, Depends, status, Body
from models.user import User # Importa User model
from services import user_service #Importa user service
from pydantic import BaseModel
from services.security import get_current_user 

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

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: dict = Body(...),
    current_user: User = Depends(get_current_user)
):
    try:
        # 1. Verificar que la contraseña actual es correcta (es necesario)
        current_password = profile_data.get("currentPassword")
        if not current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail = "Se requiere la contraseña actual"
            )
            
        if current_password != current_user.password: # Comparación en texto plano
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail = "La contraseña actual es incorrecta"
            )
        
        #2. Preparar los datos para la actualización
        update_data = {}
            
        if "username" in profile_data:
            update_data["username"] = profile_data["username"]
        if "email" in profile_data:
            update_data["email"] = profile_data["email"]
        
        # Si hay nueva contraseña, usarla directamente
        if "newPassword" in profile_data and profile_data["newPassword"]:
            update_data["password"] = profile_data["newPassword"] # En texto plano
            
        # 3. Actualizar el usuario
        if update_data:
            updated_user = user_service.update_profile(current_user.id, update_data)
            if not updated_user:
                raise HTTPException(
                    status_code=status.HHTP_500_INTERNAL_SERVER_ERROR,
                    detail = "Error al actualizar el perfil"
                )
            return updated_user
        else:
            # Si no hay cambios, devolver el usuario actual
            return current_user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))