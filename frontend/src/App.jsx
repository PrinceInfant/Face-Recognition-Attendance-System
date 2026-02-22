import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Clock, CreditCard,
  LogOut, Menu, X, ChevronRight,
  ShieldCheck, Search, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import AttendanceMonitor from './pages/AttendanceMonitor';
import AttendanceHistory from './pages/AttendanceHistory';
import SalaryAnalytics from './pages/SalaryAnalytics';
import Login from './pages/Login';

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const location = useLocation();

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

        {/* Public Route */}
        {!isAuthenticated && (
          <Route path="/" element={
            <div style={{ padding: '2rem', background: 'var(--n-50)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ maxWidth: '1200px', width: '100%' }}>
                <PageTransition><AttendanceMonitor /></PageTransition>
              </div>
            </div>
          } />
        )}

        {/* Protected Dashboard Area */}
        {isAuthenticated ? (
          <Route path="/*" element={
            <Layout handleLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/employees" element={<PageTransition><EmployeeManagement /></PageTransition>} />
                <Route path="/history" element={<PageTransition><AttendanceHistory /></PageTransition>} />
                <Route path="/salary" element={<PageTransition><SalaryAnalytics /></PageTransition>} />
              </Routes>
            </Layout>
          } />
        ) : (
          <Route path="*" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        )}
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    style={{ width: '100%' }}
  >
    {children}
  </motion.div>
);

const Layout = ({ children, handleLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: Clock, label: 'Daily Attendance', path: '/history' },
    { icon: CreditCard, label: 'Payroll', path: '/salary' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--n-50)' }}>
      {/* Intelligent Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        style={{
          backgroundColor: 'white',
          borderRight: '1px solid var(--n-200)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'flex-start' : 'center', marginBottom: '1rem' }}>
          {sidebarOpen ? (
            <img src="/logo.png" alt="EVAI Technologies" style={{ height: '60px', objectFit: 'contain' }} />
          ) : (
            <img src="/logo.png" alt="EVAI" style={{ height: '40px', width: '40px', objectFit: 'contain' }} />
          )}
        </div>

        <nav style={{ flex: 1, padding: '0 0.75rem' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
              {sidebarOpen && location.pathname === item.path && <ChevronRight size={14} />}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--n-100)' }}>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
            <LogOut size={20} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Modern Header */}
        <header style={{
          height: '72px',
          backgroundColor: 'white',
          borderBottom: '1px solid var(--n-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--n-600)' }}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ borderLeft: '1px solid var(--n-200)', height: '20px' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard'}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Prince Infant</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--n-500)' }}>Admin</p>
              </div>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'var(--n-100)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                color: 'var(--primary)'
              }}>P</div>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default App;
