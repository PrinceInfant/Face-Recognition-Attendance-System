from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import numpy as np
import io

import models, schemas, database, face_logic, salary_logic, report_logic
from database import engine, get_db
from fastapi.responses import Response

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Face Attendance & Salary System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/employees/", response_model=schemas.Employee)
async def create_employee(
    emp_id: str = Form(...),
    name: str = Form(...),
    department: str = Form(...),
    monthly_salary: float = Form(...),
    ot_rule: float = Form(...),
    working_days_rule: int = Form(...),
    daily_work_hours: float = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if exists
    db_employee = db.query(models.Employee).filter(models.Employee.emp_id == emp_id).first()
    if db_employee:
        raise HTTPException(status_code=400, detail="Employee ID already registered")
    
    # Process face encoding
    contents = await image.read()
    print(f"Received registration request for: {name} ({emp_id})")
    
    import asyncio
    loop = asyncio.get_event_loop()
    encoding = await loop.run_in_executor(None, face_logic.get_face_encoding, contents)
    
    if encoding is None:
        print("Face detection failed during registration")
        raise HTTPException(status_code=400, detail="No face detected in image. Ensure your face is clearly visible.")
    
    print("Face encoded successfully")
    # Store encoding as bytes
    encoding_bytes = encoding.tobytes()
    
    new_employee = models.Employee(
        emp_id=emp_id,
        name=name,
        department=department,
        monthly_salary=monthly_salary,
        ot_rule=ot_rule,
        working_days_rule=working_days_rule,
        daily_work_hours=daily_work_hours,
        face_encoding=encoding_bytes
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee

@app.get("/employees/", response_model=List[schemas.Employee])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    employees = db.query(models.Employee).order_by(models.Employee.emp_id.asc()).offset(skip).limit(limit).all()
    return employees

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Delete related attendance records first to avoid foreign key issues
    db.query(models.Attendance).filter(models.Attendance.employee_id == employee_id).delete()
    
    db.delete(db_employee)
    db.commit()
    return {"success": True, "message": "Employee deleted"}

@app.put("/employees/{employee_id}", response_model=schemas.Employee)
async def update_employee(
    employee_id: int,
    emp_id: str = Form(...),
    name: str = Form(...),
    department: str = Form(...),
    monthly_salary: float = Form(...),
    ot_rule: float = Form(...),
    working_days_rule: int = Form(...),
    daily_work_hours: float = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    db_employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db_employee.emp_id = emp_id
    db_employee.name = name
    db_employee.department = department
    db_employee.monthly_salary = monthly_salary
    db_employee.ot_rule = ot_rule
    db_employee.working_days_rule = working_days_rule
    db_employee.daily_work_hours = daily_work_hours
    
    if image:
        contents = await image.read()
        import asyncio
        loop = asyncio.get_event_loop()
        encoding = await loop.run_in_executor(None, face_logic.get_face_encoding, contents)
        if encoding is not None:
            db_employee.face_encoding = encoding.tobytes()
        else:
            print("Face detection failed during update, keeping old face data")
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.get("/employees/{emp_id}/stats/{month}/{year}")
def get_employee_monthly_stats(emp_id: int, month: int, year: int, db: Session = Depends(get_db)):
    stats = salary_logic.calculate_monthly_salary(db, emp_id, month, year)
    if not stats:
        raise HTTPException(status_code=404, detail="Employee not found")
    return stats

@app.post("/attendance/mark")
async def mark_attendance(
    image: UploadFile = File(...), 
    check_only: bool = False,
    db: Session = Depends(get_db)
):
    contents = await image.read()
    
    # Get all employees encodings
    employees = db.query(models.Employee).all()
    known_encodings = []
    for emp in employees:
        if emp.face_encoding:
            encoding_np = np.frombuffer(emp.face_encoding, dtype=np.float64)
            known_encodings.append((emp.id, encoding_np))
    
    import asyncio
    loop = asyncio.get_event_loop()
    emp_id, message = await loop.run_in_executor(None, face_logic.compare_faces, known_encodings, contents)
    
    if emp_id is None:
        return {"success": False, "message": message}
    
    # Success! Mark attendance
    today = datetime.date.today()
    now = datetime.datetime.now()
    
    emp_name = db.query(models.Employee).filter(models.Employee.id == emp_id).first().name
    
    attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == emp_id,
        models.Attendance.date == today
    ).first()
    
    if check_only:
        # Simulation Mode
        if not attendance:
            return {"success": True, "message": "Check-in successful", "employee_name": emp_name}
        elif attendance.exit_time is None:
            return {"success": True, "message": "Check-out successful", "employee_name": emp_name}
        else:
            return {"success": True, "message": "Already Marked", "employee_name": emp_name}

    if not attendance:
        # Check-in
        # Determine status
        initial_status = "Present"
        if now.time() > datetime.time(9, 30):
            initial_status = "Late Entry"
            
        attendance = models.Attendance(
            employee_id=emp_id,
            date=today,
            entry_time=now,
            status=initial_status
        )
        db.add(attendance)
        message = "Check-in successful"
    else:
        if attendance.exit_time is None:
            # Check-out
            attendance.exit_time = now
            
            # Check duration for Half Day
            duration = now - attendance.entry_time
            if duration.total_seconds() < 5 * 3600: # Less than 5 hours
                attendance.status = "Half Day"
                
            message = "Check-out successful"
        else:
            message = "Already done today attendance"
            
    db.commit()
    
    employee = db.query(models.Employee).filter(models.Employee.id == emp_id).first()
    return {
        "success": True, 
        "message": message, 
        "employee_name": employee.name,
        "time": now.strftime("%H:%M:%S")
    }

@app.get("/attendance/logs")
def get_attendance_logs(date: Optional[str] = None, db: Session = Depends(get_db)):
    if date:
        try:
            query_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
        except:
            query_date = datetime.date.today()
    else:
        query_date = datetime.date.today()

    results = db.query(models.Attendance, models.Employee).join(
        models.Employee, models.Attendance.employee_id == models.Employee.id
    ).filter(models.Attendance.date == query_date).all()
    
    output = []
    for att, emp in results:
        worked_hours = 0
        if att.entry_time and att.exit_time:
            duration = att.exit_time - att.entry_time
            worked_hours = round(duration.total_seconds() / 3600, 2)
            
        # Independent flags — an employee can be BOTH late AND half day
        is_late = False
        is_half_day = False
        status = att.status  # Default from DB (Present, Late Entry, Half Day)
        
        if att.entry_time:
            entry_time_val = att.entry_time.time()
            
            # Late Entry: arrived after 9:30 AM
            if entry_time_val > datetime.time(9, 30):
                is_late = True
            
            # Half Day Check 1: arrived after 12:00 PM
            if entry_time_val > datetime.time(12, 0):
                is_half_day = True
            
            # Half Day Check 2: worked less than 5 hours (only if checked out)
            if att.exit_time:
                shift_end = datetime.datetime.combine(att.date, datetime.time(17, 0))
                standard_end = min(att.exit_time, shift_end)
                standard_hours = (standard_end - att.entry_time).total_seconds() / 3600
                if standard_hours < 5.0:
                    is_half_day = True
        
        # Display status: show most significant condition
        if is_half_day:
            status = "Half Day"
        elif is_late:
            status = "Late Entry"
        else:
            status = "Present"

        output.append({
            "id": att.id,
            "employee_id": emp.id,
            "name": emp.name,
            "emp_id": emp.emp_id,
            "entry_time": att.entry_time,
            "exit_time": att.exit_time,
            "status": status,
            "is_late": is_late,
            "is_half_day": is_half_day,
            "worked_hours": worked_hours
        })
    return output

@app.get("/salary/{month}/{year}")
def get_salary_all(month: int, year: int, db: Session = Depends(get_db)):
    employees = db.query(models.Employee).all()
    results = []
    for emp in employees:
        info = salary_logic.calculate_monthly_salary(db, emp.id, month, year)
        if info:
            results.append(info)
    return results

@app.get("/reports/attendance")
def download_attendance_report(employee_id: int = None, date: str = None, db: Session = Depends(get_db)):
    excel_data = report_logic.generate_attendance_report(db, employee_id, date)
    return Response(
        content=excel_data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=attendance_report_{date if date else 'all'}.xlsx"}
    )

@app.get("/reports/daily-log")
def download_daily_log_report(date: str = None, db: Session = Depends(get_db)):
    excel_data = report_logic.generate_daily_log_report(db, date)
    return Response(
        content=excel_data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=daily_log_{date if date else 'today'}.xlsx"}
    )

@app.get("/reports/salary/{month}/{year}")
def download_salary_report(month: int, year: int, db: Session = Depends(get_db)):
    excel_data = report_logic.generate_salary_report(db, month, year)
    return Response(
        content=excel_data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=salary_report_{month}_{year}.xlsx"}
    )

@app.get("/reports/department_salary/{month}/{year}")
def download_dept_salary_report(month: int, year: int, db: Session = Depends(get_db)):
    excel_data = report_logic.generate_department_salary_report(db, month, year)
    return Response(
        content=excel_data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=dept_summary_{month}_{year}.xlsx"}
    )

@app.get("/reports/employees")
def download_employee_directory(db: Session = Depends(get_db)):
    excel_data = report_logic.generate_employee_directory_report(db)
    return Response(
        content=excel_data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=employee_master_directory.xlsx"}
    )

@app.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_employees = db.query(models.Employee).count()
    today = datetime.date.today()
    present_today = db.query(models.Attendance).filter(models.Attendance.date == today).count()
    
    # Calculate total salary cost for current month
    now = datetime.datetime.now()
    results = get_salary_all(now.month, now.year, db)
    total_cost = sum(r["final_salary"] for r in results)
    
    # Calculate daily attendance distribution for the last 7 days
    daily_stats = []
    for i in range(6, -1, -1):
        target_date = today - datetime.timedelta(days=i)
        count = db.query(models.Attendance).filter(models.Attendance.date == target_date).count()
        daily_stats.append({
            "name": target_date.strftime("%a"), 
            "present": count
        })

    # Calculate late entries today (ALL entries after 9:30 AM — including half day employees)
    late_today = db.query(models.Attendance).filter(
        models.Attendance.date == today,
        models.Attendance.entry_time > datetime.datetime.combine(today, datetime.time(9, 30))
    ).count()

    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": total_employees - present_today,
        "late_today": late_today,
        "monthly_salary_cost": total_cost,
        "daily_stats": daily_stats
    }
