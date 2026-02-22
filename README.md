# 🧠 Smart Face Attendance & Salary Management System

> **A Next-Gen Biometric Workforce Solution for EVAI Technologies**

The **Smart Face Attendance & Salary Management System** is a professional-grade, software-only alternative to expensive biometric hardware. Leveraging state-of-the-art deep learning for facial recognition, it provides a seamless and secure experience for both employees marking attendance and administrators managing payroll.

![Dashboard Overview](report/UI%20screenshots/dashboard_overview.png)

---

## 🚀 Vision & Goal
Developed for **EVAI Technologies**, this system replaces traditional fingerprint or card-based terminals with a secure, webcam-based facial recognition kiosk. It focuses on:
- **Cost Reduction**: Eliminates the need for dedicated biometric hardware.
- **Security**: Strict facial matching (0.4 tolerance) prevents proxy attendance.
- **Automation**: End-to-end processing from face scan to pro-rata salary calculation and Excel reporting.

---

## ✨ Key Features

### 👤 Advanced Face Recognition
- **Deep Learning Biometrics**: Uses 128-dimensional facial embeddings for high-precision matching.
- **Strict Security**: Configured with a **0.4 matching tolerance** (stricter than library defaults) to eliminate false positives.
- **Double-Check Verification**: Secondary distance check ensures only high-confidence matches are recorded.

### 📸 Live Attendance Terminal (Public Interface)
- **Self-Service Kiosk**: Animated realtime scanning terminal at the landing page. No login required for employees.
- **Smart Detection**: Automatically distinguishes between **Check-In** and **Check-Out** based on existing records.
- **Verification Flow**: Two-step check-out with visual confirmation (photo preview) to prevent accidental exits.
- **Real-time Feedback**: Instant success/warning/denied banners with an authentication trace log.

### 👥 Admin Control Center
- **Dashboard Analytics**: Real-time stats on workforce presence, absentees, and late entries today.
- **Employee Directory**: Manage profiles (Name, ID, Department, Salary, Multipliers) and registration with live photo capture.
- **Attendance History**: Searchable logs for any date with color-coded status badges (Present, Late Entry, Half Day).
- **Payroll Intelligence**: Automated computation of pro-rata working salary and overtime earnings (hours worked after 5:00 PM).

### 📄 Professional Reporting (Excel)
Generates four production-ready Excel reports with professional styling:
1. **Attendance Register**: Monthly pivot table with status codes (P/A/H).
2. **Daily Log**: Precise check-in/out times, exact work hours, and overtime breakdown.
3. **Salary Report**: Complete payroll sheets with financial summaries and department costs.
4. **Employee Directory**: Master workforce export.

---

## 🏗️ Technical Architecture

### Tech Stack
| Tier | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Framer Motion, Recharts, Lucide Icons |
| **Backend** | Python 3.9+, FastAPI, SQLAlchemy ORM |
| **Database** | MySQL (Managed via **HeidiSQL**) |
| **AI/Biometrics** | `face_recognition` (dlib), OpenCV, NumPy |
| **Processing** | Pandas, OpenPyXL |

### System Logic (Business Rules)
- **Shift Timing**: 09:00 AM – 05:00 PM.
- **Late Entry**: Arriving after 09:30 AM.
- **Half Day**: Worked less than 5 standard hours (capped at shift end) or arrived after 12:00 PM.
- **Overtime**: Calculated for any time worked beyond 05:00 PM, multiplied by individual employee OT rates.
- **Working Days**: Auto-computed excluding Sundays.

---

## 📂 Project Structure

```bash
face_attenance/
├── backend/                # FastAPI Application
│   ├── face_logic.py       # Biometric matching & encoding
│   ├── salary_logic.py     # Pro-rata & OT calculation engine
│   ├── report_logic.py     # Excel generation (OpenPyXL/Pandas)
│   ├── main.py             # API Router & Application Logic
│   └── models.py           # Database Schema (MySQL)
├── frontend/               # React (Vite) Application
│   ├── src/pages/          # UI Modules (Dashboard, Payroll, etc.)
│   └── src/index.css       # Global Design System
├── report/                 # Project Documentation
│   ├── excel/              # Sample Generated Reports
│   └── UI screenshots/     # Annotated Interface Captures
├── README.md               # You are here
└── package.json            # Root runner (Concurrent execution)
```

---

## 🛠️ Installation & Setup

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **MySQL Server** (Ensure a database named `attendance_db` is created in HeidiSQL/MySQL)
- **C++ Compiler** (Required for `dlib` library compilation)

### Quick Start (Concurrent Mode)
1. **Install Root Runner**:
   ```bash
   npm install
   ```
2. **Setup Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. **Setup Frontend**:
   ```bash
   cd ../frontend
   npm install
   ```
4. **Launch Application**:
   - Run both Frontend & Backend with one command from the project root:
   ```bash
   npm run dev
   ```

### Accessing the System
- **Web Interface**: `http://localhost:5173`
- **API Documentation**: `http://localhost:8000/docs`
- **Default Admin Login**: See code for credentials (setup during first run).

---

## 📸 Interface Preview

<details>
<summary><b>🔍 Biometric Terminal</b></summary>
<table>
  <tr>
    <td><img src="report/UI%20screenshots/live_recognition_idle.png" width="400" /></td>
    <td><img src="report/UI%20screenshots/live_recognition_checkin_success.png" width="400" /></td>
  </tr>
  <tr>
    <td><img src="report/UI%20screenshots/live_recognition_checkout_confirm.png" width="400" /></td>
    <td><img src="report/UI%20screenshots/live_recognition_checkout_success.png" width="400" /></td>
  </tr>
</table>
</details>

<details>
<summary><b>📊 Admin Dashboard & Reports</b></summary>
<table>
  <tr>
    <td><img src="report/UI%20screenshots/dashboard_overview.png" width="400" /></td>
    <td><img src="report/UI%20screenshots/payroll_overview.png" width="400" /></td>
  </tr>
  <tr>
    <td><img src="report/UI%20screenshots/daily_attendance.png" width="400" /></td>
    <td><img src="report/UI%20screenshots/payslip_yukeshraja.png" width="400" /></td>
  </tr>
</table>
</details>

---

## 🛡️ Documentation Suite
For deeper technical insights, refer to the following documents in the `report/` folder:
- [**Project Report**](report/PROJECT_REPORT.md): Deep dive into algorithms and architecture.
- [**UI Documentation**](report/UI_DOCUMENTATION.md): Guide to interface features and user experience.
- [**Excel Report Guide**](report/EXCEL_REPORT.md): Structure and logic of generated payroll/attendance files.

---

> **Created for EVAI Technologies** | *Empowering workforce management with Intelligent Biometrics.*
