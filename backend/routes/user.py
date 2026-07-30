from fastapi import APIRouter, HTTPException, Depends
from models import UserInDB
from database import users_collection, courses_collection, jobs_collection, certificates_collection
from routes.deps import get_current_user
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]

    # Fetch details for enrolled courses
    enrolled_courses = []
    if "enrolled_courses" in current_user and current_user["enrolled_courses"]:
        object_ids = [ObjectId(cid) for cid in current_user["enrolled_courses"] if ObjectId.is_valid(cid)]
        courses = list(courses_collection.find({"_id": {"$in": object_ids}}))
        for course in courses:
            course["_id"] = str(course["_id"])
            enrolled_courses.append(course)

    # Fetch details for applied jobs
    applied_jobs = []
    if "applied_jobs" in current_user and current_user["applied_jobs"]:
        job_ids = [ObjectId(jid) for jid in current_user["applied_jobs"] if ObjectId.is_valid(jid)]
        jobs = list(jobs_collection.find({"_id": {"$in": job_ids}}))
        for job in jobs:
            job["_id"] = str(job["_id"])
            applied_jobs.append(job)

    # Fetch earned certificates
    certificates = list(certificates_collection.find({"user_id": str(user_id)}))
    for cert in certificates:
        cert["_id"] = str(cert["_id"])

    return {
        "user": {
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user.get("role", "user")
        },
        "enrolled_courses": enrolled_courses,
        "applied_jobs": applied_jobs,
        "quiz_scores": current_user.get("quiz_scores", {}),
        "certificates": certificates
    }
