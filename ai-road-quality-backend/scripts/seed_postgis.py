import asyncio
import uuid
from geoalchemy2.elements import WKTElement
from sqlalchemy import select, delete

from app.core.database import AsyncSessionLocal
from app.reports.models import RoadReport
from app.users.models import User
from app.detections.models import Detection
from app.notifications.models import Notification

DEFAULT_USER_ID = uuid.UUID("352b8c46-4a15-424c-99e5-418b8421a857")

PUNE_REPORTS = [
    {
        "id": uuid.UUID("11111111-1111-4111-8111-111111111111"),
        "title": "Deep Cavity on Express Lane",
        "description": "14cm deep cavity in right wheel path. Poses high risk of rim damage and loss of steering control for two-wheelers.",
        "status": "confirmed",
        "severity": "high",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "evidence": ["/images/pothole-deep-cavity.jpg"],
    },
    {
        "id": uuid.UUID("22222222-2222-4222-8222-222222222222"),
        "title": "Structural Alligator Cracking Network",
        "description": "Extensive alligator fatigue cracking network over 8 meters of roadway. Base layer water infiltration observed.",
        "status": "in_progress",
        "severity": "medium",
        "latitude": 18.5314,
        "longitude": 73.8446,
        "evidence": ["/images/alligator-cracking.jpg"],
    },
    {
        "id": uuid.UUID("33333333-3333-4333-8333-333333333333"),
        "title": "Transverse Flyover Joint Fracture",
        "description": "Thermal expansion fracture across both lanes of flyover ascent. Edge spalling observed.",
        "status": "resolved",
        "severity": "low",
        "latitude": 18.5089,
        "longitude": 73.8078,
        "evidence": ["/images/transverse-joint-fracture.jpg"],
    },
    {
        "id": uuid.UUID("44444444-4444-4444-8444-444444444444"),
        "title": "Waterlogged Pothole Cluster",
        "description": "Post-monsoon depression series with standing rainwater. Vehicles swerving into oncoming traffic lane.",
        "status": "confirmed",
        "severity": "high",
        "latitude": 18.5913,
        "longitude": 73.7389,
        "evidence": ["/images/waterlogged-pothole.jpg"],
    },
    {
        "id": uuid.UUID("55555555-5555-4555-8555-555555555555"),
        "title": "Severe Trench Subsidence & Manhole Dip",
        "description": "18cm deep road cut depression across two lanes. High risk of toppling for two-wheelers and severe axle impact.",
        "status": "confirmed",
        "severity": "high",
        "latitude": 18.5065,
        "longitude": 73.8322,
        "evidence": ["/images/trench-subsidence.jpg"],
    },
    {
        "id": uuid.UUID("66666666-6666-4666-8666-666666666666"),
        "title": "Crater Cavity at Metro Pier Transition",
        "description": "Sharp-edged pothole cavity measuring 1.2m across in central bus lane. Standing rainwater obscures depth during evening peak commute.",
        "status": "confirmed",
        "severity": "high",
        "latitude": 18.5604,
        "longitude": 73.9168,
        "evidence": ["/images/crater-pier-transition.jpg"],
    },
    {
        "id": uuid.UUID("77777777-7777-4777-8777-777777777777"),
        "title": "Longitudinal Thermal Joint Rutting",
        "description": "Wheel rutting depth 35mm causing vehicle steering drag during lane changes. Surface aggregate raveling.",
        "status": "in_progress",
        "severity": "medium",
        "latitude": 18.5638,
        "longitude": 73.8077,
        "evidence": ["/images/rutting-longitudinal.jpg"],
    },
    {
        "id": uuid.UUID("88888888-8888-4888-8888-888888888888"),
        "title": "Edge Spalling & Shoulder Breakdown",
        "description": "Pavement edge unraveling into unpaved shoulder over 15 meters. Lateral support loss along canal embankment.",
        "status": "confirmed",
        "severity": "medium",
        "latitude": 18.4912,
        "longitude": 73.8291,
        "evidence": ["/images/edge-spalling.jpg"],
    },
    {
        "id": uuid.UUID("99999999-9999-4999-8999-999999999999"),
        "title": "Block Cracking Pattern on Approach Gradient",
        "description": "Interconnected square fatigue crack blocks spanning 20 sq meters. Moisture seepage noted at seam intersections.",
        "status": "in_progress",
        "severity": "medium",
        "latitude": 18.5398,
        "longitude": 73.8297,
        "evidence": ["/images/block-cracking.jpg"],
    },
    {
        "id": uuid.UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"),
        "title": "Patch Deterioration & Corrugation Shoving",
        "description": "Previous cold-mix repair has pushed into 40mm asphalt ripples at signalized intersection stop line.",
        "status": "confirmed",
        "severity": "medium",
        "latitude": 18.5144,
        "longitude": 73.9272,
        "evidence": ["/images/patch-corrugation.jpg"],
    },
]


async def seed_corridor_reports():
    async with AsyncSessionLocal() as session:
        # Verify user exists
        user = await session.get(User, DEFAULT_USER_ID)
        if not user:
            result = await session.execute(select(User).limit(1))
            user = result.scalar_one_or_none()
            if not user:
                print("No user found in database. Please run migrations/user seeds first.")
                return

        user_id = user.id
        print(f"Attributing reports to user: {user.name} ({user_id})")

        # Clean existing mock report if present
        await session.execute(
            delete(RoadReport).where(RoadReport.title == "Pothole on FC Road")
        )

        for data in PUNE_REPORTS:
            existing = await session.get(RoadReport, data["id"])
            location_point = WKTElement(
                f"POINT({data['longitude']} {data['latitude']})",
                srid=4326,
            )

            if existing:
                existing.title = data["title"]
                existing.description = data["description"]
                existing.status = data["status"]
                existing.severity = data["severity"]
                existing.latitude = data["latitude"]
                existing.longitude = data["longitude"]
                existing.location = location_point
                existing.evidence = data["evidence"]
                existing.citizen_id = user_id
                print(f"Updated report: {data['title']}")
            else:
                report = RoadReport(
                    id=data["id"],
                    title=data["title"],
                    description=data["description"],
                    status=data["status"],
                    severity=data["severity"],
                    latitude=data["latitude"],
                    longitude=data["longitude"],
                    location=location_point,
                    evidence=data["evidence"],
                    citizen_id=user_id,
                )
                session.add(report)
                print(f"Inserted report: {data['title']}")

        await session.commit()
        print("Successfully seeded Pune municipal corridor reports.")


if __name__ == "__main__":
    asyncio.run(seed_corridor_reports())
