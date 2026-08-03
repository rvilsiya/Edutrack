from fastapi import APIRouter, HTTPException
from typing import List
from models import JobCreate, JobInDB
from database import jobs_collection
from bson import ObjectId

router = APIRouter(prefix="/jobs", tags=["jobs"])


# ✅ GET ALL JOBS
@router.get("/", response_model=List[JobInDB])
async def list_jobs():
    jobs = list(jobs_collection.find())
    for job in jobs:
        job["_id"] = str(job["_id"])
    return jobs


# ✅ ADD JOB (NO AUTH TEMP)
@router.post("/", response_model=JobInDB)
async def add_job(job: JobCreate):
    job_dict = job.model_dump()
    result = jobs_collection.insert_one(job_dict)
    job_dict["_id"] = str(result.inserted_id)
    return job_dict


# ✅ APPLY JOB (NO AUTH TEMP)
@router.post("/{job_id}/apply")
async def apply_job(job_id: str):
    job = jobs_collection.find_one({"_id": ObjectId(job_id)})
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {"message": "Applied successfully"}