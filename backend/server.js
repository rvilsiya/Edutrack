from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from datetime import datetime
from typing import List

from database import (
    jobs_collection,
    courses_collection,
    applications_collection,
    enrollments_collection,
    certificates_collection,
)
from models import (
    JobCreate, JobOut,
    CourseCreate, CourseOut,
    ApplicationCreate, ApplicationOut,
    QuizSubmit, QuizResult,
    CertificateOut,
)

app = FastAPI(title="PathLadder API")

# Allow the Vercel frontend (and local dev) to call this API.
# Replace "*" with your actual Vercel URL once deployed, for security.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def fix_id(doc: dict) -> dict:
    """Convert Mongo's _id (ObjectId) into a plain string 'id' field."""
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


@app.get("/")
async def root():
    return {"status": "PathLadder API running"}


# ================= JOBS =================

@app.get("/jobs", response_model=List[JobOut])
async def list_jobs():
    jobs = await jobs_collection.find().to_list(200)
    return [fix_id(j) for j in jobs]


@app.post("/jobs", response_model=JobOut)
async def create_job(job: JobCreate):
    result = await jobs_collection.insert_one(job.model_dump())
    new_job = await jobs_collection.find_one({"_id": result.inserted_id})
    return fix_id(new_job)


@app.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    result = await jobs_collection.delete_one({"_id": ObjectId(job_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"deleted": True}


# ================= COURSES =================

@app.get("/courses", response_model=List[CourseOut])
async def list_courses():
    courses = await courses_collection.find().to_list(200)
    return [fix_id(c) for c in courses]


@app.get("/courses/{course_id}", response_model=CourseOut)
async def get_course(course_id: str):
    course = await courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return fix_id(course)


@app.post("/courses", response_model=CourseOut)
async def create_course(course: CourseCreate):
    result = await courses_collection.insert_one(course.model_dump())
    new_course = await courses_collection.find_one({"_id": result.inserted_id})
    return fix_id(new_course)


# ================= APPLICATIONS =================

@app.post("/applications", response_model=ApplicationOut)
async def apply_to_job(app_in: ApplicationCreate):
    job = await jobs_collection.find_one({"_id": ObjectId(app_in.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing = await applications_collection.find_one({
        "job_id": app_in.job_id,
        "applicant_email": app_in.applicant_email,
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    doc = app_in.model_dump()
    doc["applied_at"] = datetime.utcnow().strftime("%d %b %Y")
    doc["status"] = "Applied"
    result = await applications_collection.insert_one(doc)
    new_app = await applications_collection.find_one({"_id": result.inserted_id})
    return fix_id(new_app)


@app.get("/applications", response_model=List[ApplicationOut])
async def list_applications(job_id: str = None):
    query = {"job_id": job_id} if job_id else {}
    apps = await applications_collection.find(query).to_list(500)
    return [fix_id(a) for a in apps]


# ================= QUIZ + CERTIFICATE =================

@app.post("/quiz/submit", response_model=QuizResult)
async def submit_quiz(submission: QuizSubmit):
    course = await courses_collection.find_one({"_id": ObjectId(submission.course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    quiz = course["quiz"]
    total = len(quiz)
    correct = 0
    for i, question in enumerate(quiz):
        if i < len(submission.answers) and submission.answers[i] == question["answer"]:
            correct += 1

    score = round((correct / total) * 100) if total else 0
    passed = score >= 70

    # Save/update enrollment record
    await enrollments_collection.update_one(
        {"course_id": submission.course_id, "user_email": submission.user_email},
        {"$set": {
            "course_id": submission.course_id,
            "user_email": submission.user_email,
            "user_name": submission.user_name,
            "score": score,
            "passed": passed,
        }},
        upsert=True,
    )

    certificate_id = None
    if passed:
        existing_cert = await certificates_collection.find_one({
            "course_id": submission.course_id,
            "email": submission.user_email,
        })
        if existing_cert:
            certificate_id = str(existing_cert["_id"])
        else:
            cert_doc = {
                "course_id": submission.course_id,
                "course_title": course["title"],
                "name": submission.user_name,
                "email": submission.user_email,
                "score": score,
                "date": datetime.utcnow().strftime("%d %B %Y"),
            }
            result = await certificates_collection.insert_one(cert_doc)
            certificate_id = str(result.inserted_id)

    return QuizResult(score=score, passed=passed, certificate_id=certificate_id)


@app.get("/certificates", response_model=List[CertificateOut])
async def list_certificates(email: str = None):
    query = {"email": email} if email else {}
    certs = await certificates_collection.find(query).to_list(500)
    return [fix_id(c) for c in certs]
