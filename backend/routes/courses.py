from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import CourseCreate, CourseInDB
from database import courses_collection, users_collection
from routes.deps import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/courses", tags=["courses"])

@router.get("/", response_model=List[CourseInDB])
async def list_courses():
    courses = list(courses_collection.find())
    for course in courses:
        course["_id"] = str(course["_id"])
    return courses

@router.post("/", response_model=CourseInDB)
async def add_course(course: CourseCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to add courses")

    course_dict = course.model_dump()
    result = courses_collection.insert_one(course_dict)
    course_dict["_id"] = str(result.inserted_id)
    return course_dict

@router.post("/{course_id}/enroll")
async def enroll_course(course_id: str, current_user: dict = Depends(get_current_user)):
    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course_id in current_user.get("enrolled_courses", []):
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$push": {"enrolled_courses": course_id}}
    )
    return {"message": "Enrolled successfully"}
