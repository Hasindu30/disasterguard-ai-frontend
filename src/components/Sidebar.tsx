import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  LayoutDashboard,
  MapPin,
  FileSearch,
  PhoneCall,
  BellRing,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Home
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
      show: true,
    },
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      show: !!user,
    },
    {
      label: 'Disaster Map',
      path: '/map',
      icon: MapPin,
      show: !!user,
    },
    {
      label: 'Analyze Risk',
      path: '/search',
      icon: FileSearch,
      show: !!user,
    },
    {
      label: 'Emergency Resources',
      path: '/resources',
      icon: PhoneCall,
      show: !!user,
    },
    {
      label: 'Alert Log',
      path: '/alerts',
      icon: BellRing,
      show: !!user,
    },
    {
      label: 'Admin Panel',
      path: '/admin',
      icon: Settings,
      show: user?.role === 'ADMIN',
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 hover:bg-slate-800 transition-colors"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[45] w-64 glass-panel border-r border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-red-500/25 border border-red-500/50 rounded-lg animate-pulse">
            <ShieldAlert className="text-red-500" size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              DisasterGuard AI
            </h1>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              MVP Command Center
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-red-500/10 border-l-4 border-red-500 text-red-400 font-medium shadow-md shadow-red-500/5'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border-l-4 border-transparent'
                  }`}
                >
                  <Icon
                    size={18}
                    className={`transition-colors duration-200 ${
                      active ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

          {/* Guest Quick Links */}
          {!user && (
            <div className="pt-4 mt-4 border-t border-slate-800/50 space-y-1.5">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive('/login')
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <LogIn size={18} className="text-slate-500" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive('/register')
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <UserPlus size={18} className="text-slate-500" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Session Footer */}
        {user && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center font-bold text-white shadow-md shadow-red-500/10">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-100 truncate">{user.name}</h4>
                <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${user.role === 'ADMIN' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-red-500/15 border border-slate-700 hover:border-red-500/30 text-slate-300 hover:text-red-400 font-medium rounded-xl transition-all duration-200"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
export default Sidebar;
