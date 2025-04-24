from pydantic import BaseModel, Field
from typing import Optional


class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    username: str
    email: str
    hashed_password: str
    rol: str

    class Config:
      validate_assignment = True
      populate_by_name = True
      