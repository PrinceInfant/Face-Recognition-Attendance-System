import { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Search, Edit2, Trash2, Camera, X, CheckCircle, Shield, Briefcase, Hash, CreditCard, Calendar, Filter, Download, Cpu, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import axios from 'axios';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [selectedStats, setSelectedStats] = useState(null);
    const [viewingEmp, setViewingEmp] = useState(null);
    const [statsMonth, setStatsMonth] = useState(new Date().getMonth() + 1);
    const [statsYear, setStatsYear] = useState(new Date().getFullYear());
    const webcamRef = useRef(null);

    const [formData, setFormData] = useState({
        emp_id: '',
        name: '',
        department: '',
        monthly_salary: '',
        ot_rule: '',
        working_days_rule: '26',
        daily_work_hours: '8'
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/employees/');
            setEmployees(res.data);
        } catch (error) {
            console.error("Employee data sync failed");
            setEmployees([]);
        }
    };

    const handleCapture = async () => {
        if (!webcamRef.current) {
            console.error("Webcam ref not found");
            return;
        }

        const imageSrc = webcamRef.current.getScreenshot();
        console.log("Captured image length:", imageSrc ? imageSrc.length : 0);

        if (!imageSrc) {
            alert("Camera not ready. Please try again in 3... 2... 1...");
            return;
        }

        setCapturedImage(imageSrc);
        setIsCapturing(false);

        // Trigger visual "Training" phase
        setIsTraining(true);
        setTimeout(() => setIsTraining(false), 2500);
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Only require photo for NEW employees
        // For edits, it's optional (keeps existing photo if not changed)
        if (!editingId && !capturedImage) {
            alert("Please capture a photo first for new registrations!");
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        try {
            if (capturedImage && capturedImage.startsWith('data:')) {
                const res = await fetch(capturedImage);
                const blob = await res.blob();
                data.append('image', blob, 'employee.jpg');
            }

            if (editingId) {
                await axios.put(`http://127.0.0.1:8000/employees/${editingId}`, data);
            } else {
                await axios.post('http://127.0.0.1:8000/employees/', data);
            }
            setShowModal(false);
            resetForm();
            fetchEmployees();

            // Ensure UI updates before showing alert
            requestAnimationFrame(() => {
                setTimeout(() => {
                    alert("Employee registered successfully!");
                }, 50);
            });
        } catch (error) {
            console.error("Registration Error:", error);
            const detail = error.response?.data?.detail;
            const errorMsg = typeof detail === 'string' ? detail :
                (typeof detail === 'object' ? JSON.stringify(detail) : "Error saving employee profile");
            alert(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            emp_id: '', name: '', department: '',
            monthly_salary: '', ot_rule: '',
            working_days_rule: '26', daily_work_hours: '8'
        });
        setEditingId(null);
        setCapturedImage(null);
    };

    const handleEdit = (emp) => {
        setFormData({ ...emp });
        setEditingId(emp.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this employee profile?")) return;
        try {
            await axios.delete(`http://127.0.0.1:8000/employees/${id}`);
            fetchEmployees();
        } catch (error) {
            alert("Delete failed");
        }
    };

    const viewStats = async (emp, m, y) => {
        try {
            const month = m || statsMonth;
            const year = y || statsYear;
            const res = await axios.get(`http://127.0.0.1:8000/employees/${emp.id}/stats/${month}/${year}`);
            setSelectedStats(res.data);
            setViewingEmp(emp);
            setShowStatsModal(true);
        } catch (error) {
            alert("Failed to fetch employee stats");
        }
    };

    useEffect(() => {
        if (showStatsModal && viewingEmp) {
            viewStats(viewingEmp, statsMonth, statsYear);
        }
    }, [statsMonth, statsYear]);

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.emp_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.department && e.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Employee Directory</h1>
                    <p className="text-muted">Manage workforce profiles and compensation rules</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { resetForm(); setShowModal(true); }}
                >
                    <UserPlus size={18} /> New Employee
                </button>
            </div>

            {/* Directory Controls */}
            <div className="card" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={18} className="text-muted" />
                <input
                    className="input"
                    placeholder="Search by name, ID or department..."
                    style={{ border: 'none', background: 'none', boxShadow: 'none' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div style={{ borderLeft: '1px solid var(--n-200)', height: '24px' }} />
                <button className="btn btn-secondary" style={{ padding: '0.5rem' }}><Filter size={18} /></button>
                <button
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem' }}
                    onClick={() => window.open('http://127.0.0.1:8000/reports/employees', '_blank')}
                >
                    <Download size={18} />
                </button>
            </div>

            {/* High-End Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--n-50)', borderBottom: '1px solid var(--n-200)' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Employee</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Sector</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Salary</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>OT Rate</th>
                            <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--n-500)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={32} opacity={0.3} />
                                        <span style={{ fontWeight: 500 }}>No employees found</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {filteredEmployees.map((emp, i) => (
                            <tr key={emp.id} style={{ borderBottom: '1px solid var(--n-100)' }} className="hover-effect">
                                <td onClick={() => viewStats(emp)} style={{ padding: '1rem 1.5rem', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: 'var(--primary-light)', color: 'var(--primary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                                        }}>
                                            {emp.name[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{emp.name}</p>
                                            <p className="text-small text-muted">{emp.emp_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span className="badge" style={{ background: 'var(--n-100)', color: 'var(--n-700)' }}>{emp.department}</span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                                    ₹{emp.monthly_salary.toLocaleString()}
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span className="badge badge-success">{emp.ot_rule}x</span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button onClick={() => viewStats(emp)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--primary)' }}><Eye size={14} /></button>
                                        <button onClick={() => handleEdit(emp)} className="btn btn-secondary" style={{ padding: '0.4rem' }}><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(emp.id)} className="btn btn-secondary" style={{ padding: '0.4rem', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Professional Modal */}
            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="card"
                            style={{ width: '100%', maxWidth: '800px', position: 'relative', zIndex: 101, padding: '2rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem' }}>{editingId ? 'Edit Profile' : 'New Registration'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--n-400)' }}><X /></button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                {/* Left: Biometric Identification */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{
                                        aspectRatio: '1', borderRadius: '16px', background: 'var(--n-900)',
                                        overflow: 'hidden', position: 'relative', border: '1px solid var(--n-800)'
                                    }}>
                                        {capturedImage ? (
                                            <>
                                                <img src={capturedImage} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isTraining ? 0.7 : 1 }} />
                                                <AnimatePresence>
                                                    {isTraining && (
                                                        <motion.div
                                                            initial={{ top: '0%' }}
                                                            animate={{ top: ['0%', '100%', '0%'] }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                            style={{
                                                                position: 'absolute', left: 0, right: 0, height: '3px',
                                                                background: 'var(--primary)', boxShadow: '0 0 15px var(--primary)',
                                                                zIndex: 10
                                                            }}
                                                        />
                                                    )}
                                                </AnimatePresence>
                                                {isTraining && (
                                                    <div style={{
                                                        position: 'absolute', inset: 0, display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(0,0,0,0.3)', color: 'white'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                                                            <Cpu className="spin" size={16} />
                                                            EXTRACTING BIOMETRICS...
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ) : isCapturing ? (
                                            <Webcam
                                                ref={webcamRef}
                                                screenshotFormat="image/jpeg"
                                                audio={false}
                                                mirrored={true}
                                                onUserMedia={() => console.log("Camera Stream Connected")}
                                                onUserMediaError={(err) => console.error("Camera Error:", err)}
                                                videoConstraints={{ facingMode: "user" }}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'white' }}>
                                                <Camera size={32} opacity={0.5} />
                                                <p className="text-small" style={{ opacity: 0.5 }}>Optical ID Required</p>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        {isCapturing ? (
                                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCapture}>Capture</button>
                                        ) : (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ flex: 1 }}
                                                onClick={() => {
                                                    setCapturedImage(null);
                                                    setIsCapturing(true);
                                                }}
                                            >
                                                Initialize Camera
                                            </button>
                                        )}
                                        {capturedImage && (
                                            <button className="btn btn-secondary" onClick={() => setCapturedImage(null)}>Reset</button>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Metadata Fields */}
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--n-500)', marginBottom: '0.5rem' }}>FULL NAME</label>
                                        <input className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--p-text-3)', marginBottom: '0.5rem' }}>EMPLOYEE ID</label>
                                        <input className="input" value={formData.emp_id} onChange={e => setFormData({ ...formData, emp_id: e.target.value })} required placeholder="EMP001" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--n-500)', marginBottom: '0.5rem' }}>SECTOR</label>
                                            <input
                                                className="input"
                                                value={formData.department}
                                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                                                required
                                                placeholder="e.g. Finance"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--n-500)', marginBottom: '0.5rem' }}>SALARY</label>
                                            <input className="input" type="number" value={formData.monthly_salary} onChange={e => setFormData({ ...formData, monthly_salary: e.target.value })} required placeholder="₹" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--p-text-3)', marginBottom: '0.5rem' }}>OT RATE</label>
                                            <input className="input" type="number" step="0.1" value={formData.ot_rule} onChange={e => setFormData({ ...formData, ot_rule: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--n-500)', marginBottom: '0.5rem' }}>WORK DAYS</label>
                                            <input
                                                className="input"
                                                type="text"
                                                value="Dynamic (Actual Days)"
                                                readOnly
                                                title="Calculated based on actual days in month excluding Sundays"
                                                style={{ background: 'var(--n-100)', color: 'var(--n-500)', cursor: 'not-allowed', opacity: 0.8, fontSize: '0.75rem', fontWeight: 600 }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ height: '48px', marginTop: '1rem' }}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Cpu className="spin" size={16} />
                                                <span>Encoding Biometrics...</span>
                                            </div>
                                        ) : "Confirm Identity Record"}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showStatsModal && selectedStats && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowStatsModal(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card"
                            style={{ maxWidth: '400px', width: '100%', padding: '1.5rem', margin: '1rem', position: 'relative', zIndex: 1001 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Attendance Summary</h2>
                                <button onClick={() => { setShowStatsModal(false); setViewingEmp(null); }} className="btn btn-secondary" style={{ padding: '0.4rem' }}><X size={18} /></button>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <select
                                    value={statsMonth}
                                    onChange={(e) => setStatsMonth(parseInt(e.target.value))}
                                    className="input"
                                    style={{ flex: 1, padding: '8px' }}
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                    ))}
                                </select>
                                <select
                                    value={statsYear}
                                    onChange={(e) => setStatsYear(parseInt(e.target.value))}
                                    className="input"
                                    style={{ width: '90px', padding: '8px' }}
                                >
                                    {[2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)',
                                        color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 1rem'
                                    }}>
                                        {selectedStats.employee_name[0]}
                                    </div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{selectedStats.employee_name}</h3>
                                    <p className="text-muted text-small">Monthly Performance Tracking</p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="card" style={{ padding: '0.75rem', textAlign: 'center', background: 'var(--success-light)' }}>
                                        <div style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.25rem' }}>{selectedStats.present_days}</div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>Present</div>
                                    </div>
                                    <div className="card" style={{ padding: '0.75rem', textAlign: 'center', background: 'var(--danger-light)' }}>
                                        <div style={{ color: 'var(--danger)', fontWeight: 800, fontSize: '1.25rem' }}>{selectedStats.absent_days}</div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase' }}>Absent</div>
                                    </div>
                                    <div className="card" style={{ padding: '0.75rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.1)' }}>
                                        <div style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '1.25rem' }}>{selectedStats.late_entries}</div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase' }}>Late Entry</div>
                                    </div>
                                    <div className="card" style={{ padding: '0.75rem', textAlign: 'center', background: 'rgba(99, 102, 241, 0.1)' }}>
                                        <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem' }}>{selectedStats.half_days}</div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>Half Day</div>
                                    </div>
                                </div>

                                <div className="card" style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className="text-muted text-small">Total Expected Days</span>
                                        <span style={{ fontWeight: 700 }}>{selectedStats.total_working_days}</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--n-100)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(selectedStats.present_days / selectedStats.total_working_days) * 100}%`,
                                            background: 'var(--primary)'
                                        }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmployeeManagement;
