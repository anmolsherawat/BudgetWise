import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMoon, FiSun, FiLogOut, FiMenu, FiX, FiGrid, FiBookOpen, FiTrendingUp, FiTerminal, FiTarget, FiTool, FiBell, FiDollarSign, FiPieChart, FiClock, FiSettings, FiActivity } from 'react-icons/fi';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: FiGrid, label: 'Dashboard' },
    { path: '/transactions', icon: FiDollarSign, label: 'Transactions' },
    { path: '/budgets', icon: FiPieChart, label: 'Budgets' },
    { path: '/goals', icon: FiTarget, label: 'Goals' },
    { path: '/advisor', icon: FiTerminal, label: 'AI Advisor' },
    { path: '/tools', icon: FiTool, label: 'Tools' },
    { path: '/learn', icon: FiBookOpen, label: 'Learn' },
    { path: '/market', icon: FiTrendingUp, label: 'Market' },
    { path: '/alerts', icon: FiBell, label: 'Alerts' },
    { path: '/history', icon: FiClock, label: 'History' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">NovaMint</span>
            </Link>
            {isMobileOpen && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-lg hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Icon className="text-xl" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium"
              >
                {darkMode ? <FiSun /> : <FiMoon />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600"
              >
                <FiLogOut />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>

      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed bottom-6 right-6 z-30 md:hidden bg-primary-500 text-white p-4 rounded-full shadow-lg"
      >
        <FiMenu size={24} />
      </button>
    </div>
  );
};

export default Layout;
