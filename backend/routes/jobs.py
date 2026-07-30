from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import JobCreate, JobInDB
from database import jobs_collection, users_collection
from routes.deps import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/", response_model=List[JobInDB])
async def list_jobs():
    jobs = list(jobs_collection.find())
    for job in jobs:
        job["_id"] = str(job["_id"])
    return jobs

@router.post("/", response_model=JobInDB)
async def add_job(job: JobCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to add jobs")

    job_dict = job.model_dump()
    result = jobs_collection.insert_one(job_dict)
    job_dict["_id"] = str(result.inserted_id)
    return job_dict

@router.post("/{job_id}/apply")
async def apply_job(job_id: str, current_user: dict = Depends(get_current_user)):
    job = jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job_id in current_user.get("applied_jobs", []):
        raise HTTPException(status_code=400, detail="Already applied to this job")

    users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$push": {"applied_jobs": job_id}}
    )
    return {"message": "Applied successfully"}
