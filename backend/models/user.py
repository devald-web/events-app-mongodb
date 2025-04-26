from pydantic import BaseModel, Field
from typing import Optional


class User(BaseModel):
    id: str | None = None
    username: str
    email: str
    password: str
    role: str

    class Config:
      json_schema_extra = {
        "example": {
          "username": "johndoe",
          "email": "johndoe@example.com",
          "role": "usuario"
        }
      }
      