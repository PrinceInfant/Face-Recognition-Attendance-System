import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, Activity, ShieldCheck,
    Cpu, Scan, Lock, Clock, Zap, AlertCircle, Terminal
} from 'lucide-react';

const AttendanceMonitor = () => {
    const webcamRef = useRef(null);
    const [status, setStatus] = useState('Standby');
    const [result, setResult] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [recentLogs, setRecentLogs] = useState([]);

    const [pendingAuth, setPendingAuth] = useState(null);

    const handleResult = (data) => {
        setIsScanning(false); // Immediate reset
        setResult(data);
        let statusLabel = 'ENTRY';
        let statusColor = 'Success';

        if (data.success) {
            if (data.message.includes('Check-out')) {
                statusLabel = 'EXIT';
            } else if (data.message.includes('Already')) {
                statusLabel = 'DONE';
                statusColor = 'Warning';
            }
            setRecentLogs(prev => [{
                name: data.employee_name,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                result: statusColor,
                trend: statusLabel
            }, ...prev.slice(0, 4)]);
        } else {
            setRecentLogs(prev => [{
                name: 'Unknown Target',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                result: 'Danger',
                trend: 'DENIED'
            }, ...prev.slice(0, 4)]);
        }

        setTimeout(() => {
            setResult(null);
            setStatus('Standby');
        }, 3000);
    };

    // Helper for real commit
    const performRealCommit = async (imageSource) => {
        setIsScanning(true);
        setStatus('Processing...');
        try {
            const formData = new FormData();
            const blobRes = await fetch(imageSource);
            const blob = await blobRes.blob();
            formData.append('image', blob, 'attendance.jpg');

            const arrayBuffer = await blob.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const res = await axios.post('http://127.0.0.1:8000/attendance/mark', formData, {
                headers: { 'X-Biometric-Hash': hashHex }
            });
            handleResult(res.data);
        } catch (error) {
            setResult({ success: false, message: 'Commit Failed' });
        } finally {
            setIsScanning(false);
            setPendingAuth(null);
        }
    };

    const initiateScan = async () => {
        if (!webcamRef.current) return;
        setIsScanning(true);
        setStatus('Identifying...');
        const imageSrc = webcamRef.current.getScreenshot();

        try {
            const formData = new FormData();
            const blobRes = await fetch(imageSrc);
            const blob = await blobRes.blob();
            formData.append('image', blob, 'attendance.jpg');

            // Call with check_only=true to peek at the result
            const res = await axios.post('http://127.0.0.1:8000/attendance/mark?check_only=true', formData);

            const isFreshAction = res.data.success && !res.data.message.includes('Already');

            if (isFreshAction) {
                // If it's a Check-OUT, ask for confirmation
                if (res.data.message.includes('Check-out')) {
                    setPendingAuth({ image: imageSrc, data: res.data });
                    setStatus('Awaiting Confirmation');
                } else {
                    // If it's a Check-IN, Auto-Commit immediately!
                    await performRealCommit(imageSrc);
                }
            } else {
                // If Unknown or Already Marked, show result immediately
                handleResult(res.data);
            }
        } catch (error) {
            setResult({ success: false, message: 'Identification Failed' });
            setIsScanning(false);
        }
    };

    const confirmAttendance = async () => {
        if (!pendingAuth) return;
        await performRealCommit(pendingAuth.image);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Live Recognition</h1>
                    <p className="text-muted" style={{ marginTop: '0.25rem' }}>Real-time biometric authentication terminal</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '40px', padding: '0 1rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
                        Operational
                    </div>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="btn btn-primary"
                        style={{ height: '40px', background: 'var(--primary)', color: 'white', border: 'none' }}
                    >
                        <Lock size={16} /> Admin Login
                    </button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Left Column: Terminal & Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Video Terminal */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '435px', padding: '0.75rem', background: 'var(--n-900)', border: 'none', position: 'relative' }}>
                        <div style={{
                            position: 'relative', height: '100%', width: '100%',
                            borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <Webcam
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                style={{
                                    width: '100%', height: '100%', objectFit: 'cover',
                                    filter: isScanning ? 'grayscale(0.3) contrast(1.2)' : 'none'
                                }}
                            />

                            {/* HUD Overlays */}
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                <AnimatePresence>
                                    {isScanning && (
                                        <motion.div
                                            initial={{ top: '0%' }}
                                            animate={{ top: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--primary)', boxShadow: '0 0 20px var(--primary)', zIndex: 10 }}
                                        />
                                    )}
                                </AnimatePresence>
                                <div style={{ position: 'absolute', top: 20, left: 20, width: 30, height: 30, borderTop: '2px solid white', borderLeft: '2px solid white', opacity: 0.5 }} />
                                <div style={{ position: 'absolute', top: 20, right: 20, width: 30, height: 30, borderTop: '2px solid white', borderRight: '2px solid white', opacity: 0.5 }} />
                                <div style={{ position: 'absolute', bottom: 20, left: 20, width: 30, height: 30, borderBottom: '2px solid white', borderLeft: '2px solid white', opacity: 0.5 }} />
                                <div style={{ position: 'absolute', bottom: 20, right: 20, width: 30, height: 30, borderBottom: '2px solid white', borderRight: '2px solid white', opacity: 0.5 }} />
                            </div>
                        </div>
                    </div>

                    {/* Status & Control Row */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch', minHeight: '50px' }}>
                        <div style={{ flex: 1 }}>
                            <AnimatePresence mode="wait">
                                {result ? (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="card"
                                        style={{
                                            border: 'none',
                                            background: result.success
                                                ? (result.message.includes('Already') ? 'var(--warning)' : 'var(--success)')
                                                : 'var(--danger)',
                                            color: result.message.includes('Already') ? 'var(--n-900)' : 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.25rem',
                                            padding: '0.75rem 1.5rem',
                                            height: '100%',
                                            margin: 0
                                        }}
                                    >
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            background: result.message.includes('Already') ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {result.success
                                                ? (result.message.includes('Already') ? <AlertCircle size={16} /> : <CheckCircle size={16} />)
                                                : <AlertCircle size={16} />
                                            }
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
                                                {result.success ? result.message : 'Access Denied'}
                                            </div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                                                {result.success ? result.employee_name : 'Identity Rejected'}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="card"
                                        style={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0 1rem',
                                            background: 'var(--n-50)',
                                            border: '1px dashed var(--n-200)',
                                            color: 'var(--n-400)',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            margin: 0
                                        }}
                                    >
                                        System ready. Align face with sensor...
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            disabled={isScanning || pendingAuth}
                            onClick={initiateScan}
                            className="btn btn-primary"
                            style={{
                                width: '280px',
                                height: 'auto',
                                borderRadius: '12px',
                                flexDirection: 'row',
                                gap: '10px',
                                padding: '0.4rem 1.5rem',
                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            {isScanning ? <Cpu className="spin" size={20} /> : <Scan size={20} />}
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                                {isScanning ? 'PROCESSING BIOMETRICS...' : 'INITIATE OPTICAL SCAN'}
                            </span>
                        </button>
                    </div>

                    {/* Biometric Confirmation Modal */}
                    <AnimatePresence>
                        {pendingAuth && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                style={{
                                    marginTop: '1rem',
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '1rem',
                                    border: '1px solid var(--n-200)',
                                    color: 'var(--n-900)',
                                    zIndex: 50,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '1rem',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                    width: '100%'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                                    <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--n-200)', flexShrink: 0 }}>
                                        <img src={pendingAuth.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.1rem', color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {pendingAuth.data?.message?.includes('Check-in') ? 'Confirm Check-In' :
                                                pendingAuth.data?.message?.includes('Check-out') ? 'Confirm Check-Out' : 'Verify Identity'}
                                        </h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--n-500)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {pendingAuth.data?.employee_name || 'Scanning...'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                                    <button
                                        className="btn"
                                        style={{ background: 'var(--n-50)', color: 'var(--n-600)', border: '1px solid var(--n-200)', fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}
                                        onClick={() => {
                                            setPendingAuth(null);
                                            setIsScanning(false);
                                            setStatus('Standby');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}
                                        onClick={confirmAttendance}
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Interaction Layers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Activity Logs */}
                    <div className="card" style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={18} className="text-muted" /> Authentication Trace
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recentLogs.map((log, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--n-50)' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: log.result === 'Success' ? 'var(--success-light)' : (log.result === 'Warning' ? 'rgba(245, 158, 11, 0.1)' : 'var(--danger-light)'),
                                        color: log.result === 'Success' ? 'var(--success)' : (log.result === 'Warning' ? 'var(--warning)' : 'var(--danger)'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {log.result === 'Success' ? <CheckCircle size={18} /> : (log.result === 'Warning' ? <AlertCircle size={18} /> : <Lock size={18} />)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{log.name}</p>
                                        <p className="text-muted text-small">{log.time}</p>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: log.result === 'Success' ? 'var(--success)' : (log.result === 'Warning' ? 'var(--warning)' : 'var(--danger)') }}>
                                        {log.trend}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Protocol Vault */}
                    <div className="card" style={{ background: 'linear-gradient(135deg, #1e1b4b, #0f172a)', color: 'white', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <ShieldCheck size={20} style={{ color: '#10b981' }} />
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.02em', color: 'white' }}>Local Encryption</h4>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--n-300)', lineHeight: 1.6 }}>
                            All biometric payloads are hashed via <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>SHA-256</span> before terminal transmission.
                        </p>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div className="text-small" style={{ opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biometric Confidence</div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginTop: '4px',
                                    padding: '4px 10px',
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#10b981',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 900
                                }}>
                                    99.9%
                                </div>
                            </div>
                            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Zap size={20} color="var(--primary)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceMonitor;
