import { useState, useEffect } from 'react';
import { CreditCard, Download, TrendingUp, Filter, IndianRupee, PieChart, Wallet, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const SalaryAnalytics = () => {
    const [salaries, setSalaries] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedSlip, setSelectedSlip] = useState(null);

    const [showStatsModal, setShowStatsModal] = useState(false);
    const [selectedStats, setSelectedStats] = useState(null);
    const [viewingEmp, setViewingEmp] = useState(null);
    const [statsMonth, setStatsMonth] = useState(new Date().getMonth() + 1);
    const [statsYear, setStatsYear] = useState(new Date().getFullYear());

    const viewStats = async (empId, empName) => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/employees/${empId}/stats/${statsMonth}/${statsYear}`);
            setSelectedStats({ ...res.data, employee_name: empName });
            setViewingEmp({ id: empId, name: empName });
            setShowStatsModal(true);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch employee stats");
        }
    };

    useEffect(() => {
        if (showStatsModal && viewingEmp) {
            viewStats(viewingEmp.id, viewingEmp.name);
        }
    }, [statsMonth, statsYear]);

    useEffect(() => {
        fetchSalaries();
    }, [month, year]);

    const fetchSalaries = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/salary/${month}/${year}`);
            setSalaries(res.data);
        } catch (error) {
            console.error("Salary data sync failed");
            setSalaries([]);
        }
    };

    const downloadSalaryReport = () => {
        window.open(`http://127.0.0.1:8000/reports/salary/${month}/${year}`, '_blank');
    };

    const downloadAttendanceReport = () => {
        const now = new Date();
        let targetDate;

        // If selected month/year matches current, use Today to avoid future rows
        if ((now.getMonth() + 1) === Number(month) && now.getFullYear() === Number(year)) {
            targetDate = now;
        } else {
            // Use last day of selected month
            // new Date(year, month, 0) gives last day of previous month... wait
            // if month is 1-based (Feb=2), JS Date(2026, 2, 0) is Day 0 of March = Feb 28. Correct.
            targetDate = new Date(year, month, 0);
        }

        // Format YYYY-MM-DD manually to avoid timezone shift
        const y = targetDate.getFullYear();
        const m = (targetDate.getMonth() + 1).toString().padStart(2, '0');
        const d = targetDate.getDate().toString().padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        window.open(`http://127.0.0.1:8000/reports/attendance?date=${dateStr}`, '_blank');
    };

    const totalPayout = salaries.reduce((acc, curr) => acc + curr.final_salary, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--n-900)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>Financial Intelligence</h1>
                    <p style={{ color: 'var(--n-500)', marginTop: '0.25rem' }}>Automated payroll processing and salary disbursements</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={downloadAttendanceReport}>
                        <Download size={18} /> Attendance Data
                    </button>
                    <button className="btn btn-primary" onClick={downloadSalaryReport}>
                        <Download size={18} /> Payroll Report
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <MetricCard
                    label="Total Monthly Payout"
                    value={`₹${totalPayout.toLocaleString()}`}
                    icon={Wallet}
                    color="var(--primary)"
                    bg="var(--primary-light)"
                />
                <MetricCard
                    label="Processed Records"
                    value={`${salaries.length} Employees`}
                    icon={PieChart}
                    color="var(--success)"
                    bg="#d1fae5" // green-100
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                    style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--n-200)', boxShadow: 'var(--shadow-sm)' }}
                >
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--n-500)', marginBottom: '0.25rem', display: 'block' }}>Month</label>
                            <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--n-200)', borderRadius: '0.5rem', fontWeight: 600, outline: 'none' }}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ width: '100px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--n-500)', marginBottom: '0.25rem', display: 'block' }}>Year</label>
                            <select value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', padding: '0.625rem', border: '1px solid var(--n-200)', borderRadius: '0.5rem', fontWeight: 600, outline: 'none' }}>
                                {[2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Department-wise Costing Section */}
            <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--n-200)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '4px', height: '16px', background: 'var(--primary)', borderRadius: '2px' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--n-800)' }}>Departmental Cost Breakdown</h3>
                    </div>
                    <button
                        onClick={() => window.location.href = `http://127.0.0.1:8000/reports/department_salary/${month}/${year}`}
                        className="btn btn-ghost"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center' }}
                    >
                        <Download size={14} style={{ marginRight: '6px' }} /> Download Summary
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {salaries.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ opacity: 0.3, marginBottom: '0.5rem' }}><Filter size={24} /></div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>No departmental data available</div>
                        </div>
                    ) : (
                        Object.entries(
                            salaries.reduce((acc, curr) => {
                                acc[curr.department] = (acc[curr.department] || 0) + curr.final_salary;
                                return acc;
                            }, {})
                        ).map(([dept, total], idx) => (
                            <motion.div
                                key={dept}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                transition={{ delay: idx * 0.05 }}
                                style={{ padding: '1rem', background: 'var(--n-50)', borderRadius: '12px', border: '1px solid var(--n-200)' }}
                            >
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>{dept}</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--n-900)' }}>₹{total.toLocaleString()}</p>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--n-200)', boxShadow: 'var(--shadow-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--n-50)', borderBottom: '1px solid var(--n-200)' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Team Member</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Working Days</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Base Salary</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Overtime</th>
                            <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Net Pay</th>
                            <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {salaries.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '4rem', color: 'var(--n-500)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                            <CreditCard size={40} strokeWidth={1.5} style={{ opacity: 0.3 }} />
                                            <span style={{ fontWeight: 500 }}>No payroll records found for this period</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {salaries.map((s, i) => (
                                <motion.tr
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="hover-effect"
                                    whileHover={{ backgroundColor: 'var(--n-50)', scale: 1.002, transition: { duration: 0.1 } }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ borderBottom: '1px solid var(--n-100)', cursor: 'default' }}
                                >
                                    <td onClick={() => viewStats(s.employee_id, s.employee_name)} style={{ padding: '1rem 1.5rem', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '50%',
                                                background: 'var(--primary-light)', color: 'var(--primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem'
                                            }}>
                                                {s.employee_name[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--n-900)' }}>{s.employee_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--n-500)' }}>#{s.emp_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--n-700)' }}>
                                            <span style={{ color: 'var(--success)' }}>{s.present_days}</span>
                                            <span style={{ color: 'var(--n-400)' }}>/</span>
                                            <span>{s.total_working_days}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--n-500)', fontWeight: 500 }}>DAYS</div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--n-600)' }}>
                                        ₹{s.calculated_salary.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--success)' }}>
                                        +₹{s.ot_amount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem' }}>
                                            <IndianRupee size={14} strokeWidth={3} /> {s.final_salary.toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '1rem 1.5rem' }}>
                                        <button
                                            onClick={() => setSelectedSlip(s)}
                                            className="btn btn-secondary"
                                            style={{
                                                padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600,
                                                color: 'var(--primary)', borderColor: 'var(--primary-light)',
                                                background: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em'
                                            }}
                                        >
                                            Slip
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Detailed Salary Slip Modal */}
            <AnimatePresence>
                {selectedSlip && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                        backdropFilter: 'blur(4px)', padding: '1rem'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'white', width: '100%', maxWidth: '500px', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--primary)' }}
                        >
                            <div style={{ background: 'var(--primary)', padding: '2rem', color: 'white', position: 'relative' }}>
                                <button
                                    onClick={() => setSelectedSlip(null)}
                                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}
                                >
                                    <TrendingUp size={18} style={{ transform: 'rotate(45deg)' }} />
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
                                        {selectedSlip.employee_name[0]}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Official Pay Slip</h3>
                                        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem' }}>{new Date(0, selectedSlip.month - 1).toLocaleString('default', { month: 'long' })} {selectedSlip.year}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Net Payable Amount</p>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>₹{selectedSlip.final_salary.toLocaleString()}</h2>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                <div style={{ borderBottom: '1px dashed var(--n-200)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--n-500)', textTransform: 'uppercase', marginBottom: '1rem' }}>Employee Details</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--n-400)', textTransform: 'uppercase' }}>Full Name</p>
                                            <p style={{ fontWeight: 700 }}>{selectedSlip.employee_name}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--n-400)', textTransform: 'uppercase' }}>Employee ID</p>
                                            <p style={{ fontWeight: 700 }}>{selectedSlip.emp_id}</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--n-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Earnings Breakdown</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                                        <span style={{ color: 'var(--n-600)' }}>Base Duty Pay ({selectedSlip.present_days} Days)</span>
                                        <span style={{ fontWeight: 700 }}>₹{selectedSlip.calculated_salary.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
                                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>Overtime Component</span>
                                        <span style={{ fontWeight: 700, color: 'var(--success)' }}>+ ₹{selectedSlip.ot_amount.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--n-100)', marginTop: '0.25rem' }}>
                                        <span style={{ fontWeight: 800 }}>Total Distributed</span>
                                        <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.125rem' }}>₹{selectedSlip.final_salary.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '2rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'var(--n-50)', borderRadius: '12px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.6rem', color: 'var(--n-500)', fontWeight: 700 }}>ABSENT</p>
                                        <p style={{ fontWeight: 800, color: 'var(--danger)' }}>{selectedSlip.absent_days}</p>
                                    </div>
                                    <div style={{ padding: '0.75rem', background: 'var(--n-50)', borderRadius: '12px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.6rem', color: 'var(--n-500)', fontWeight: 700 }}>LATE</p>
                                        <p style={{ fontWeight: 800, color: 'var(--warning)' }}>{selectedSlip.late_entries}</p>
                                    </div>
                                    <div style={{ padding: '0.75rem', background: 'var(--n-50)', borderRadius: '12px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.6rem', color: 'var(--n-500)', fontWeight: 700 }}>HALF DAY</p>
                                        <p style={{ fontWeight: 800, color: 'var(--primary)' }}>{selectedSlip.half_days}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => window.print()}
                                    className="btn btn-primary"
                                    style={{ width: '100%', height: '48px', gap: '0.75rem' }}
                                >
                                    <Download size={18} /> Print Digital Slip
                                </button>
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

const MetricCard = ({ label, value, icon: Icon, color, bg }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--n-200)', boxShadow: 'var(--shadow-sm)' }}
    >
        <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: bg, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon size={24} />
        </div>
        <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--n-500)', fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--n-900)', lineHeight: 1.2 }}>{value}</div>
        </div>
    </motion.div>
);

export default SalaryAnalytics;
