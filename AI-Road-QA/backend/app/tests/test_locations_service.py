import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.dialects import postgresql

from app.locations.service import get_nearby_reports


@pytest.mark.asyncio
async def test_nearby_reports_applies_radius_in_meters():
    session = AsyncMock()
    session.execute.return_value = SimpleNamespace(
        all=lambda: []
    )

    await get_nearby_reports(
        session=session,
        latitude=37.7749,
        longitude=-122.4194,
        radius=1500,
        citizen_id=uuid.uuid4(),
    )

    statement = session.execute.await_args.args[0]
    compiled = statement.compile(dialect=postgresql.dialect())

    assert "ST_DWithin" in str(compiled)
    assert "ST_Distance" in str(compiled)
    assert any(value == 1500 for value in compiled.params.values())
    assert "geography" in str(compiled).lower()


@pytest.mark.asyncio
async def test_nearby_reports_allows_none_citizen_id_for_public_view():
    session = AsyncMock()
    session.execute.return_value = SimpleNamespace(
        all=lambda: []
    )

    await get_nearby_reports(
        session=session,
        latitude=18.5204,
        longitude=73.8567,
        radius=5000,
        citizen_id=None,
    )

    statement = session.execute.await_args.args[0]
    compiled = statement.compile(dialect=postgresql.dialect())

    assert "ST_DWithin" in str(compiled)
    assert "citizen_id" not in str(compiled)
