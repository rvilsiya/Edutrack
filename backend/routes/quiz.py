from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import QuizCreate, QuizInDB, QuizSubmission
from database import quizzes_collection, users_collection
from routes.deps import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.get("/{course_id}", response_model=List[QuizInDB])
async def get_quizzes_for_course(course_id: str):
    quizzes = list(quizzes_collection.find({"course_id": course_id}))
    for quiz in quizzes:
        quiz["_id"] = str(quiz["_id"])
    return quizzes

@router.post("/", response_model=QuizInDB)
async def add_quiz(quiz: QuizCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to add quizzes")

    quiz_dict = quiz.model_dump()
    result = quizzes_collection.insert_one(quiz_dict)
    quiz_dict["_id"] = str(result.inserted_id)
    return quiz_dict

@router.post("/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, submission: QuizSubmission, current_user: dict = Depends(get_current_user)):
    quiz = quizzes_collection.find_one({"_id": ObjectId(quiz_id)})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    score = 0
    total = len(quiz["questions"])

    for i, answer_idx in enumerate(submission.answers):
        if i < total and quiz["questions"][i]["correct_option_index"] == answer_idx:
            score += 1

    # Save score to user profile (simplistic approach for now)
    users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {f"quiz_scores.{quiz_id}": {"score": score, "total": total}}}
    )

    return {"score": score, "total": total}
