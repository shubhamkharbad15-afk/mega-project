import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str | None
    role: str
    is_active: bool
    created_at: datetime | None