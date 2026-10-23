from pydantic import BaseModel, Field


class RepairAdviceRequest(BaseModel):

    defect_type: str = Field(
        min_length=2
    )

    severity: str = Field(
        min_length=2
    )

    road_type: str = "asphalt"

    location_context: str | None = None


class RepairAdviceResponse(BaseModel):

    recommended_repair: str

    materials: list[str]

    eco_friendly_alternatives: list[str]

    estimated_resources: dict[str, str]

    safety_notes: list[str]