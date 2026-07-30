from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from models import CertificateInDB
from database import certificates_collection, users_collection, courses_collection
from routes.deps import get_current_user
from bson import ObjectId
import os
from datetime import datetime
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

router = APIRouter(prefix="/certificate", tags=["certificate"])

# Ensure certificates directory exists
CERT_DIR = "certificates_data"
if not os.path.exists(CERT_DIR):
    os.makedirs(CERT_DIR)

def generate_pdf(user_name: str, course_name: str, date: str, file_path: str):
    c = canvas.Canvas(file_path, pagesize=landscape(letter))
    width, height = landscape(letter)

    # Border
    c.setLineWidth(5)
    c.rect(0.5*inch, 0.5*inch, width - 1*inch, height - 1*inch)

    # Text
    c.setFont("Helvetica-Bold", 40)
    c.drawCentredString(width/2.0, height - 2*inch, "Certificate of Completion")

    c.setFont("Helvetica", 20)
    c.drawCentredString(width/2.0, height - 3.5*inch, "This is to certify that")

    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width/2.0, height - 4.5*inch, user_name)

    c.setFont("Helvetica", 20)
    c.drawCentredString(width/2.0, height - 5.5*inch, "has successfully completed the course")

    c.setFont("Helvetica-Bold", 25)
    c.drawCentredString(width/2.0, height - 6.5*inch, course_name)

    c.setFont("Helvetica", 16)
    c.drawCentredString(width/2.0, 1.5*inch, f"Date Issued: {date}")

    c.save()

@router.post("/generate/{course_id}")
async def generate_certificate(course_id: str, current_user: dict = Depends(get_current_user)):
    # Verify course exists
    course = courses_collection.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if already enrolled
    if course_id not in current_user.get("enrolled_courses", []):
        raise HTTPException(status_code=400, detail="User must be enrolled in the course to get a certificate")

    # Check if certificate already generated
    existing_cert = certificates_collection.find_one({
        "user_id": str(current_user["_id"]),
        "course_id": course_id
    })

    if existing_cert:
        file_path = f"{CERT_DIR}/{existing_cert['_id']}.pdf"
        if os.path.exists(file_path):
            return {"message": "Certificate already generated", "certificate_id": str(existing_cert["_id"])}

    # Generate new certificate
    date_issued = datetime.utcnow()
    cert_doc = {
        "user_id": str(current_user["_id"]),
        "course_id": course_id,
        "user_name": current_user["name"],
        "course_name": course["title"],
        "date_issued": date_issued
    }

    result = certificates_collection.insert_one(cert_doc)
    cert_id = str(result.inserted_id)

    file_path = f"{CERT_DIR}/{cert_id}.pdf"
    generate_pdf(current_user["name"], course["title"], date_issued.strftime("%B %d, %Y"), file_path)

    return {"message": "Certificate generated successfully", "certificate_id": cert_id}

@router.get("/download/{certificate_id}")
async def download_certificate(certificate_id: str):
    # Basic path traversal protection
    if "/" in certificate_id or "\\" in certificate_id or ".." in certificate_id:
        raise HTTPException(status_code=400, detail="Invalid certificate ID")

    # Only allow safe characters
    import re
    if not re.match(r"^[a-zA-Z0-9_-]+$", certificate_id):
        raise HTTPException(status_code=400, detail="Invalid certificate ID format")

    file_path = f"{CERT_DIR}/{certificate_id}.pdf"
    # Ensure it stays within CERT_DIR using abspath check
    abs_cert_dir = os.path.abspath(CERT_DIR)
    abs_file_path = os.path.abspath(file_path)

    if not abs_file_path.startswith(abs_cert_dir):
        raise HTTPException(status_code=400, detail="Invalid file path")

    if not os.path.exists(abs_file_path):
        raise HTTPException(status_code=404, detail="Certificate not found")

    return FileResponse(abs_file_path, filename=f"certificate_{certificate_id}.pdf", media_type="application/pdf")
