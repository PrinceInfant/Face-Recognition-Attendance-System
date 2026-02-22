from sqlalchemy.orm import Session
import models
import datetime
import calendar

def calculate_monthly_salary(db: Session, employee_id: int, month: int, year: int):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        return None
    
    # Get attendance for the month
    start_date = datetime.date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = datetime.date(year, month, last_day)
    
    attendances = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id,
        models.Attendance.date >= start_date,
        models.Attendance.date <= end_date
    ).all()
    
    # 1. Map attendances
    att_map = {att.date: att for att in attendances}
    
    # 2. Calculate Working Days & Salaries
    total_days_in_month = calendar.monthrange(year, month)[1]
    
    # Pre-calculate for Hourly Rate
    sundays = 0
    for day in range(1, total_days_in_month + 1):
        if datetime.date(year, month, day).weekday() == 6:
            sundays += 1
            
    calculated_working_days = total_days_in_month - sundays
    hourly_rate = (employee.monthly_salary / max(1, calculated_working_days)) / employee.daily_work_hours
    
    present_score = 0
    absent_count = 0
    late_entries = 0
    half_days = 0
    
    total_earned = 0
    total_ot_amount = 0
    
    limit_date = datetime.date.today()
    
    for day in range(1, total_days_in_month + 1):
        try:
            current_date = datetime.date(year, month, day)
        except ValueError:
            continue
            
        is_sunday = (current_date.weekday() == 6)
            
        att = att_map.get(current_date)
        
        if att and att.entry_time:
            # Late Entry Check
            entry_time_val = att.entry_time.time()
            if entry_time_val > datetime.time(9, 30):
                late_entries += 1
            
            day_score = 1.0 # Default Full Day
            day_salary = 0
            
            if att.exit_time:
                # Standard Logic
                shift_end_time = datetime.datetime.combine(current_date, datetime.time(17, 0))
                standard_end = min(att.exit_time, shift_end_time)
                standard_duration = standard_end - att.entry_time
                standard_hours = max(0, standard_duration.total_seconds() / 3600)
                
                # Half Day Check
                if standard_hours < 5.0:
                    half_days += 1
                    # day_score remains 1.0 as per user request
                
                # Salary Calculation
                standard_hours_capped = min(standard_hours, employee.daily_work_hours)
                day_salary = standard_hours_capped * hourly_rate
                
                # OT Calculation
                if att.exit_time > shift_end_time:
                    ot_duration = att.exit_time - shift_end_time
                    ot_hours = ot_duration.total_seconds() / 3600
                    # Apply multiplier (e.g. 1.5x of hourly rate)
                    total_ot_amount += (ot_hours * hourly_rate * employee.ot_rule)
            else:
                # Active Entry (No Exit yet)
                # Treat as 1.0 Present for now (or 0.5 if strict, but user prefers generous view)
                pass
            
            present_score += day_score
            total_earned += day_salary
            
        elif not is_sunday:
            # Absent Logic (Only Count if Date <= Today)
            if current_date <= limit_date:
                absent_count += 1
            
    # If calculating absent (past tense), use absent_count.
    # But usually absent_days return variable is used for "Days Absent".
    absent_days = absent_count
    
    # Update present_days to utilize the score (e.g. 23.5)
    present_days = present_score 
    
    return {
        "employee_id": employee_id,
        "emp_id": employee.emp_id,
        "employee_name": employee.name,
        "department": employee.department,
        "present_days": present_days,
        "absent_days": max(0, absent_days),
        "late_entries": late_entries,
        "half_days": half_days,
        "total_working_days": calculated_working_days,
        "calculated_salary": round(total_earned, 2),
        "ot_amount": round(total_ot_amount, 2),
        "final_salary": round(total_earned + total_ot_amount, 2),
        "month": month,
        "year": year
    }
