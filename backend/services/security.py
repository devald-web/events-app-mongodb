from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from services.user_service import get_user_by_username

basic_auth = HTTPBasic()

def get_current_user(credentials: HTTPBasicCredentials = Depends(basic_auth)):
  # Verifica usuario y contraseña en texto plano
  user = get_user_by_username(credentials.username)
  if not user:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Usuario incorrecto",
    )
  if user.password != credentials.password: # Comparación en texto plano
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Contraseña incorrecta",
    )
  return user