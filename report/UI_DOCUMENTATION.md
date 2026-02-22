# UI Documentation: User Journey & Features

## Introduction
The user interface (UI) for this project was designed with two main users in mind: **Employees** (who need a fast, simple way to scan in/out) and **Admins** (who need powerful tools to manage the team).

---

## 1. Employee Interface (The Attendance Kiosk)
This is the main landing page of the application (`/`). It is designed to be self-service and high-speed.

### Real-time Scanning
Employees simply stand in front of the camera and click **"Initiate Optical Scan"**. The system handles the rest.
- **Visual Feedback**: A blue scan line moves across the camera feed to show processing.
- **Smart Result**: The system automatically detects if it should Mark a Check-In, a Check-Out, or warn if the day is already complete.

![Live Scan](UI%20screenshots/live_recognition_idle.png)

---

## 2. Admin Login
Secure areas like the Dashboard and Payroll are protected. Admins use a clean login screen to access the control center.
- **Server Monitoring**: The login page shows a "Biometric Server Online" status so the admin knows the system is healthy before logging in.

---

## 3. The Management Dashboard
Once logged in, the admin lands on the **System Overview**.
- **Live Stats**: View how many people are present, late, or absent right now.
- **Visual Trends**: An interactive chart shows attendance patterns over the last 7 days.

![Dashboard](UI%20screenshots/dashboard_overview.png)

---

## 4. Workforce Management
The **Employee Directory** allows for full management of the team.
- **Registration**: Admins can register new employees by filling out a form and capturing their face directly via the webcam.
- **Salary Config**: Custom OT rates and base salaries are set here for each employee.

![Directory](UI%20screenshots/employee_directory.png)

---

## 5. Payroll & Pay Slips
The **Financial Intelligence** section automates all salary work.
- **Automated Payouts**: The system shows a list of net pay for all employees based on current attendance.
- **Digital Pay Slips**: Admins can open a professional pay slip for any employee, which breaks down base pay vs. overtime.

![Pay Slip](UI%20screenshots/payslip_yukeshraja.png)

---

## Design System
- **Colors**: I used a professional blue (`#2563eb`) for primary actions and standard status colors (Green for Success, Red for Error, Orange for Warning).
- **Animations**: Created using Framer Motion to make page transitions feel modern and smooth.
- **Typography**: Clean, sans-serif fonts for high readability of financial data.

---
**Developed by:** Prince Infant
