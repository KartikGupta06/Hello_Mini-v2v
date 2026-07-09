from app.repositories.user import user_repository
from app.repositories.contact import contact_repository
from app.repositories.journey import journey_repository
from app.repositories.report import report_repository
from app.repositories.police_station import police_station_repository
from app.repositories.hospital import hospital_repository
from app.repositories.street_light import street_light_repository
from app.repositories.cctv_camera import cctv_camera_repository
from app.repositories.crime_record import crime_record_repository

__all__ = [
    "user_repository",
    "contact_repository",
    "journey_repository",
    "report_repository",
    "police_station_repository",
    "hospital_repository",
    "street_light_repository",
    "cctv_camera_repository",
    "crime_record_repository"
]

