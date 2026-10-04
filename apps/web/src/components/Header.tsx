import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeConfig } from '../context/ThemeContext';
import { 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  UserPlus,
  Stethoscope
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { config } = useThemeConfig();
  const navigate = useNavigate();
  const location = useLocation();

  const primaryColor = config?.primary_color || '#0d9488';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md transform group-hover:scale-105 transition-all duration-200"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0284c7 100%)` }}
          >
            <div className="relative flex items-center justify-center">
              <span className="text-xl font-black">+</span>
            </div>
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
              TAPZA<span style={{ color: primaryColor }}>CARE</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
              Premium Medical
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname === '/' ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/doctors"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname.startsWith('/doctors') ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Doctors
          </Link>
          <Link
            to="/services"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname.startsWith('/services') ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Services
          </Link>
          <Link
            to="/bookings"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname === '/bookings' ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Bookings
          </Link>
          <Link
            to="/prescriptions"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname === '/prescriptions' ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Prescriptions
          </Link>
          <Link
            to="/reminders"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname === '/reminders' ? 'text-teal-700 bg-teal-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Reminders
          </Link>
          <Link
            to="/pharmacy"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              location.pathname.startsWith('/pharmacy') ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Pharmacy 🛵
          </Link>
          {user?.role === 'pharmacist' && (
            <Link
              to="/pharmacist"
              className="px-3 py-2 rounded-lg text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5"
            >
              Pharmacist Portal
            </Link>
          )}
          {user?.role === 'doctor' && (
            <Link
              to="/doctor"
              className="px-3 py-2 rounded-lg text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 flex items-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Doctor Portal
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="px-3 py-2 rounded-lg text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Right Auth Controls */}
        <div className="flex items-center gap-3">

          {/* Book Appointment CTA */}
          <button
            onClick={() => navigate('/doctors')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all duration-200"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0284c7 100%)` }}
          >
            Book Appointment
          </button>

          {/* User Profile Badge or Sign In / Register Buttons */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <Link to="/profile" className="flex items-center gap-2 group">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-teal-500 shadow-sm group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center border-2 border-teal-500 shadow-sm group-hover:scale-105 transition-transform">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <span className="text-xs font-extrabold text-slate-800 block leading-tight">{user.name}</span>
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">{user.role}</span>
                </div>
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" /> Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
