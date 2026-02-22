import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ArrowRight, Clock, User, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AttendanceHistory = () => {
    const [history, setHistory] = useState([]);
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
    const getLocalDate = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const [date, setDate] = useState(getLocalDate());

    useEffect(() => {
        fetchHistory();
    }, [date]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`http://127.0.0.1:8000/attendance/logs?date=${date}`);
            setHistory(res.data);
        } catch (error) {
            console.error("Attendance history sync failed");
            setHistory([]);
        }
    };

    const stats = {
        total: history.length,
        present: history.filter(h => !h.is_late && !h.is_half_day).length,
        late: history.filter(h => h.is_late).length,
        halfDay: history.filter(h => h.is_half_day).length
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--n-900)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>Daily Attendance</h1>
                    <p style={{ color: 'var(--n-500)', marginTop: '0.25rem' }}>Overview of employee check-ins and activity logs</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => window.open(`http://127.0.0.1:8000/reports/daily-log?date=${date}`, '_blank')}
                    >
                        <Download size={18} /> Export Report
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <MetricCard
                    label="Total Present"
                    value={stats.total}
                    icon={User}
                    color="var(--primary)"
                    bg="var(--primary-light)"
                />
                <MetricCard
                    label="On Time"
                    value={stats.present}
                    icon={Clock}
                    color="var(--success)"
                    bg="#d1fae5"
                />
                <MetricCard
                    label="Late Arrivals"
                    value={stats.late}
                    icon={Clock}
                    color="var(--warning)"
                    bg="#fef3c7"
                />
                <MetricCard
                    label="Half Days"
                    value={stats.halfDay}
                    icon={Clock}
                    color="var(--info)"
                    bg="#dbeafe"
                />
            </div>

            {/* Main Content Card */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--n-200)', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                {/* Toolbar */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--n-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Calendar style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--n-400)' }} size={16} />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{
                                    padding: '0.625rem 1rem 0.625rem 2.5rem',
                                    border: '1px solid var(--n-200)',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    outline: 'none',
                                    color: 'var(--n-900)',
                                    background: 'var(--n-50)',
                                    fontFamily: 'inherit',
                                    cursor: 'pointer'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--n-500)', fontSize: '0.875rem' }}>
                        <Filter size={16} />
                        <span>Filter by Date</span>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: 'var(--n-50)', borderBottom: '1px solid var(--n-200)' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Employee</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Entry Time</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Exit Time</th>
                                <th style={{ textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--n-500)' }}>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--n-500)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                                <Clock size={40} strokeWidth={1.5} style={{ opacity: 0.3 }} />
                                                <span style={{ fontWeight: 500 }}>No attendance records found for this date</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {history.map((h, i) => (
                                    <motion.tr
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="hover-effect"
                                        whileHover={{ backgroundColor: 'var(--n-50)', scale: 1.002, transition: { duration: 0.1 } }}
                                        transition={{ delay: i * 0.05 }}
                                        style={{ borderBottom: '1px solid var(--n-100)', cursor: 'default' }}
                                    >
                                        <td style={{ padding: '1rem 1.5rem', cursor: 'pointer' }} onClick={() => viewStats(h.employee_id, h.name)}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '50%',
                                                    background: 'var(--primary-light)', color: 'var(--primary)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem'
                                                }}>
                                                    {h.name[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--n-900)' }}>{h.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--n-500)' }}>#{h.emp_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--n-700)', fontWeight: 500 }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                                                {h.entry_time ? new Date(h.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span style={{ color: 'var(--n-400)' }}>--:--</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--n-700)', fontWeight: 500 }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: h.exit_time ? 'var(--n-400)' : 'var(--warning)' }} />
                                                {h.exit_time ? new Date(h.exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                                    (h.entry_time ? <span style={{ color: 'var(--warning)', fontWeight: 600 }}>ACTIVE</span> : <span style={{ color: 'var(--n-400)' }}>--:--</span>)
                                                }
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span className={`badge ${h.status === 'Present' ? 'badge-success' :
                                                h.status === 'Late Entry' ? 'badge-warning' :
                                                    h.status === 'Half Day' ? 'badge-danger' : 'badge-danger'
                                                }`} style={{
                                                    background: h.status === 'Half Day' ? '#e0e7ff' : undefined,
                                                    color: h.status === 'Half Day' ? '#4338ca' : undefined
                                                }}>
                                                {h.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--n-700)', fontWeight: 600 }}>
                                                {h.worked_hours > 0 ? `${h.worked_hours} hrs` : (h.entry_time ? (h.exit_time ? '0 hrs' : 'Active') : '0 hrs')}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

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

export default AttendanceHistory;
