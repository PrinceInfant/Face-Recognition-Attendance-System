from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    emp_id = Column(String(50), unique=True, index=True)
    name = Column(String(100))
    department = Column(String(100))
    monthly_salary = Column(Float)
    ot_rule = Column(Float) # Hourly rate or multiplier
    working_days_rule = Column(Integer) # Default 30 or 26
    daily_work_hours = Column(Float, default=8.0) # Normal shift duration
    face_encoding = Column(LargeBinary) # Storing face encoding as bytes

    attendances = relationship("Attendance", back_populates="employee")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, default=datetime.date.today)
    entry_time = Column(DateTime, nullable=True)
    exit_time = Column(DateTime, nullable=True)
    status = Column(String(50)) # Present, Absent, Half Day
    late_minutes = Column(Integer, default=0)

    employee = relationship("Employee", back_populates="attendances")

class SalaryRecord(Base):
    __tablename__ = "salary_records"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    month = Column(Integer)
    year = Column(Integer)
    present_days = Column(Integer)
    absent_days = Column(Integer)
    ot_hours = Column(Float, default=0)
    calculated_salary = Column(Float)
    final_salary = Column(Float)

    employee = relationship("Employee")
