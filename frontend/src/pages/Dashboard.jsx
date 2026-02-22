import { useState, useEffect } from 'react';
import {
    Users, UserCheck, UserMinus, DollarSign,
    ArrowUpRight, ArrowDownRight, Activity,
    TrendingUp, Calendar, Zap, ShieldCheck, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_employees: 0,
        present_today: 0,
        absent_today: 0,
        late_today: 0,
        monthly_salary_cost: 0,
        daily_stats: []
    });
    const [chartType, setChartType] = useState('area'); // 'area' or 'bar'

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:8000/dashboard/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Dashboard stats sync failed");
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>System Overview</h1>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>Real-time monitoring and workforce analytics</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {[
                    { label: 'Total Workforce', value: stats.total_employees, icon: Users, color: 'var(--primary)', trend: 'Active', isPos: true },
                    { label: 'Operational Now', value: stats.present_today, icon: UserCheck, color: 'var(--success)', trend: `${stats.total_employees > 0 ? Math.round((stats.present_today / stats.total_employees) * 100) : 0}%`, isPos: true },
                    { label: 'Employee Absent', value: stats.absent_today, icon: Activity, color: 'var(--danger)', trend: `${stats.total_employees > 0 ? Math.round((stats.absent_today / stats.total_employees) * 100) : 0}%`, isPos: false },
                    { label: 'Late Entry Today', value: stats.late_today, icon: Clock, color: '#f59e0b', trend: `${stats.total_employees > 0 ? Math.round((stats.late_today / stats.total_employees) * 100) : 0}%`, isPos: true },
                ].map((stat, i) => (
                    <div key={i} className="card card-hover" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{
                                padding: '0.75rem', borderRadius: '12px',
                                background: `${stat.color}10`, color: stat.color
                            }}>
                                <stat.icon size={24} />
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                fontSize: '0.75rem', fontWeight: 700,
                                color: stat.isPos ? 'var(--success)' : 'var(--danger)'
                            }}>
                                {stat.isPos ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-muted text-small" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{stat.value}</h2>
                    </div>
                ))}
            </div>

            {/* Main Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '420px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.125rem' }}>Attendance Trend</h3>
                            <p className="text-muted text-small">Daily workforce presence (Last 7 Days)</p>
                        </div>
                        <div style={{ background: 'var(--n-100)', padding: '0.25rem', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                            <button
                                onClick={() => setChartType('area')}
                                className="btn"
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.75rem',
                                    background: chartType === 'area' ? 'white' : 'transparent',
                                    boxShadow: chartType === 'area' ? 'var(--shadow-sm)' : 'none',
                                    color: chartType === 'area' ? 'var(--primary)' : 'var(--n-600)'
                                }}
                            >
                                Area
                            </button>
                            <button
                                onClick={() => setChartType('bar')}
                                className="btn"
                                style={{
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.75rem',
                                    background: chartType === 'bar' ? 'white' : 'transparent',
                                    boxShadow: chartType === 'bar' ? 'var(--shadow-sm)' : 'none',
                                    color: chartType === 'bar' ? 'var(--primary)' : 'var(--n-600)'
                                }}
                            >
                                Bar
                            </button>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'area' ? (
                                <AreaChart data={stats.daily_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--n-200)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--n-500)', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--n-500)', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    />
                                    <Area
                                        type="monotone" dataKey="present" stroke="var(--primary)"
                                        strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)"
                                    />
                                </AreaChart>
                            ) : (
                                <BarChart data={stats.daily_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--n-200)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--n-500)', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--n-500)', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--n-100)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    />
                                    <Bar dataKey="present" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Security Card */}
                    <div className="card" style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, var(--n-800), var(--n-900))',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <ShieldCheck size={20} color="var(--success)" />
                            <h4 style={{ fontSize: '1rem', color: 'white' }}>Security Health</h4>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--n-300)', lineHeight: 1.5 }}>
                            All biometric sensors are operational. No critical anomalies detected in the last 24 hours.
                        </p>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <div className="text-small" style={{ opacity: 0.6, marginBottom: '0.25rem' }}>Uptime</div>
                                <div className="font-bold">99.98%</div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="text-small" style={{ opacity: 0.6, marginBottom: '0.25rem' }}>Latency</div>
                                <div className="font-bold">24ms</div>
                            </div>
                        </div>
                    </div>

                    {/* Shift Config Card */}
                    <div className="card" style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--primary)', transform: 'rotate(45deg)' }} />
                            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--n-800)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Shift Configuration</h4>
                        </div>

                        <div style={{
                            background: 'var(--n-50)',
                            borderRadius: '16px',
                            padding: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: '1px solid var(--n-200)',
                            position: 'relative'
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--n-500)', textTransform: 'uppercase', marginBottom: '4px' }}>START</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--n-900)' }}>09:00 <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>AM</span></p>
                            </div>

                            <div style={{ padding: '0 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <Clock size={14} color="var(--n-300)" />
                            </div>

                            <div style={{ flex: 1, textAlign: 'right' }}>
                                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--n-500)', textTransform: 'uppercase', marginBottom: '4px' }}>END</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--n-900)' }}>05:00 <span style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>PM</span></p>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShieldCheck size={16} color="var(--success)" />
                                <span style={{ fontSize: '0.8rem', color: 'var(--n-600)', fontWeight: 600 }}>Policy Active</span>
                            </div>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
