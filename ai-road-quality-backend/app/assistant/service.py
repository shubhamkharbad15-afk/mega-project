from app.assistant.schemas import (
    RepairAdviceRequest,
    RepairAdviceResponse,
)


async def generate_repair_advice(
    data: RepairAdviceRequest,
) -> RepairAdviceResponse:

    defect = data.defect_type.lower()
    severity = data.severity.lower()

    if (
        defect == "pothole"
        and severity == "high"
    ):

        repair = (
            "Priority patching with proper "
            "surface preparation, edge treatment, "
            "tack coat and compacted asphalt."
        )

        materials = [
            "Hot-mix asphalt",
            "Tack coat",
            "Aggregate base",
        ]

        eco = [
            "Warm-mix asphalt",
            "Recycled asphalt pavement",
        ]

    elif defect == "crack":

        repair = (
            "Clean and seal the crack using "
            "an appropriate pavement crack-sealing treatment."
        )

        materials = [
            "Crack sealant",
            "Fine aggregate",
        ]

        eco = [
            "Low-temperature sealant options",
            "Recycled aggregate where suitable",
        ]

    else:

        repair = (
            "Inspect the defect on site and select "
            "the repair method based on defect type, "
            "depth and surrounding pavement condition."
        )

        materials = [
            "Aggregate",
            "Bituminous repair material",
        ]

        eco = [
            "Recycled aggregate",
            "Warm-mix alternatives",
        ]

    return RepairAdviceResponse(

        recommended_repair=repair,

        materials=materials,

        eco_friendly_alternatives=eco,

        estimated_resources={

            "labor": "2-4 workers",

            "equipment": (
                "Plate compactor / "
                "suitable road-repair equipment"
            ),

            "priority": severity,

            "road_type": data.road_type,
        },

        safety_notes=[

            "Verify traffic and work-zone safety "
            "before repair.",

            "Final material selection should follow "
            "applicable engineering specifications.",
        ],
    )