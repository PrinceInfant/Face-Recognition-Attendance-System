from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class EmployeeBase(BaseModel):
    emp_id: str
    name: str
    department: str
    monthly_salary: float
    ot_rule: float
    working_days_rule: int
    daily_work_hours: float

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    date: date
    entry_time: Optional[datetime]
    exit_time: Optional[datetime]
    status: str
    late_minutes: int

class Attendance(AttendanceBase):
    id: int
    employee_id: int
    class Config:
        from_attributes = True

class SalaryBase(BaseModel):
    month: int
    year: int
    present_days: int
    absent_days: int
    ot_hours: float
    calculated_salary: float
    final_salary: float

class SalaryRecord(SalaryBase):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    class Config:
        from_attributes = True
