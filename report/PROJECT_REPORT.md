# Project Report: Smart Face Attendance & Salary Management System

## 1. Introduction
This project was developed for **EVAI Technologies** to provide an automated, software-based solution for tracking employee attendance and managing payroll. By using facial recognition, the system eliminates the need for physical biometric scanners and manual attendance registers, making the process faster and more secure.

## 2. Project Objectives
- **Automate Attendance**: Use a webcam to identify employees and log their entry/exit times.
- **Accurate Salary Calculation**: Calculate monthly pay based on actual hours worked (pro-rata).
- **Security**: Prevent "buddy punching" by using strict biometric matching.
- **Reporting**: Generate professional Excel reports for HR and management.

## 3. Technology Stack
The system is built using modern technologies to ensure reliability and speed:
- **Frontend**: React (Vite) with Framer Motion for a smooth user interface.
- **Backend**: FastAPI (Python) for high-performance API processing.
- **Database**: MySQL (managed via HeidiSQL) for secure data storage.
- **Biometrics**: `face_recognition` (dlib) and OpenCV for high-accuracy facial matching.
- **Reporting**: Pandas and OpenPyXL for generating Excel files.

## 4. System Architecture
The project is divided into three main layers:
1.  **Client Layer (UI)**: A web-based interface where employees scan their faces and admins manage the system.
2.  **Logic Layer (Backend)**: Handles the heavy lifting—comparing faces, calculating work hours, and processing salary formulas.
3.  **Data Layer (Storage)**: Stores employee profiles, facial encodings, and attendance history in a MySQL database.

## 5. Implementation Details

### 5.1 Facial Recognition Logic
I implemented a strict biometric verification process. When a face is scanned, the system converts it into a digital signature (128-dimensional encoding). It then compares this against the database with a **0.4 tolerance threshold**. This ensures that the system is highly accurate and strictly rejects anyone not registered.

### 5.2 Attendance & Work Rules
- **Shift**: 09:00 AM to 05:00 PM.
- **Late Entry**: Anything after 09:30 AM is flagged as late.
- **Half Day**: Triggered if an employee works less than 5 hours or arrives after 12:00 PM.
- **Check-Out**: Requires a quick visual confirmation to prevent accidental logs.

### 5.3 Salary & Overtime Engine
The salary is calculated pro-rata based on actual hours worked. 
- **Standard Salary** = (Monthly Salary / Working Days) * Hours Worked.
- **Overtime (OT)** = Time worked after 05:00 PM * Individual OT Rate.
The system automatically excludes Sundays when calculating total working days in a month.

## 6. System Screenshots
I have designed the interface to be clean and professional. Below are the key modules:

### 6.1 Employee Scan Kiosk
The landing page where employees mark their attendance.
![Live Scan](UI%20screenshots/live_recognition_idle.png)

### 6.2 Admin Dashboard
A high-level view of attendance trends and monthly payroll costs.
![Dashboard](UI%20screenshots/dashboard_overview.png)

### 6.3 Salary & Payroll Management
Admins can view detailed breakdowns and generate pay slips.
![Payroll](UI%20screenshots/payroll_overview.png)

## 7. Conclusion
This system successfully provides an end-to-end solution for modern workforce management. It is cost-effective, secure, and ready to scale. By moving attendance to a digital biometric platform, EVAI Technologies can ensure transparency and save significant administrative time.

---
**Developed by:** Prince Infant  
**Project Version:** 1.0.0
