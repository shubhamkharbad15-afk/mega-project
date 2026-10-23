import uuid
from datetime import datetime

from pydantic import BaseModel


class NotificationResponse(BaseModel):

    id: uuid.UUID
    title: str
    message: str
    is_read: bool
    created_at: datetime | None