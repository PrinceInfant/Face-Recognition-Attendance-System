import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, User, ArrowRight, Activity } from 'lucide-react';

const Login = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        // In a real app, you'd verify with the backend
        if (username === 'admin' && password === 'admin123') {
            setIsAuthenticated(true);
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/');
        } else {
            setError('enter the correct username and password');
            setTimeout(() => setError(''), 4000);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--n-50) 0%, var(--n-100) 100%)',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 2000
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '440px',
                    padding: '2.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', background: 'var(--primary)',
                        borderRadius: '16px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>Vision<span style={{ color: 'var(--primary)' }}>Hub</span> Control</h1>
                    <p style={{ color: 'var(--n-500)', fontSize: '0.9375rem' }}>Access restricted to administrative personnel</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                color: 'var(--danger)',
                                background: 'var(--danger-light)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                textAlign: 'center',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            {error}
                        </motion.div>
                    )}
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--n-400)' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Username"
                            style={{ paddingLeft: '2.5rem' }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--n-400)' }} />
                        <input
                            type="password"
                            className="input"
                            placeholder="Password"
                            style={{ paddingLeft: '2.5rem' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ height: '52px', marginTop: '1rem', width: '100%' }}>
                        Authenticate Access <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </button>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--n-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biometric Server Online</span>
                    </div>
                </form>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--n-100)', textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-secondary"
                        style={{ width: '100%', gap: '10px', fontSize: '0.8rem' }}
                    >
                        <Activity size={16} /> Return to Live Terminal
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
