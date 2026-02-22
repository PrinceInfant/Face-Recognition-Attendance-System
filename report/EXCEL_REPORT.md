# Excel Reports: Features & Structure

## Overview
As part of the system, I developed a reporting engine that automatically generates professional Excel files. These reports help the HR and Finance teams at EVAI Technologies verify attendance and process payroll without manual calculations.

The system generates **four main reports**:

---

## 1. Attendance Register (Monthly View)
This report provides a bird's-eye view of the entire month.
- **What it shows**: A grid where each row is an employee and each column is a day of the month.
- **Status Codes**: 
  - **P**: Present (Green)
  - **A**: Absent (Red)
  - **H**: Holiday/Sunday (Orange)
- **Use Case**: Used to check overall presence patterns and identify frequent absentees at a glance.

## 2. Daily Log (Detailed View)
A highly detailed report specifically for a single day.
- **What it shows**: Precise timestamps for Check-In and Check-Out.
- **Calculations**: It calculates the exact **Work Hours** and **Overtime** for every employee for that day.
- **Flags**: Automatically highlights "Late Entry" and "Half Day" based on business rules.

## 3. Salary Report (Payroll)
A comprehensive two-sheet report for the finance department.
- **Sheet 1 (Payroll)**: Lists every employee with their pro-rata salary, overtime bonus, and final gross payout.
- **Sheet 2 (Summary)**: Provides a total disbursement figure and a cost breakdown by department (e.g., Developer vs. Designer costs).

## 4. Employee Master Directory
A simple export of the current workforce.
- **What it shows**: Active employees, their departments, base salaries, and registration dates.
- **Use Case**: Used as a backup or reference for the employee database.

---

## Technical Highlights
- **Styler**: All reports use conditional formatting (colors) to make important data stand out.
- **Accuracy**: Calculations are performed by the backend engine (Pandas) to ensure 100% precision.
- **Download**: Reports are accessed via the "Download" buttons in the Admin Dashboard and Payroll pages.

---
**Developed by:** Prince Infant
