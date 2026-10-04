import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { 
  Heart, 
  Activity, 
  Footprints, 
  FileText, 
  Calendar, 
  Bell, 
  LogOut, 
  User as UserIcon,
  ShieldCheck,
  LogIn,
  Edit3,
  X,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'Unspecified',
    dob: '',
    blood_group: '',
    address: '',
    emergency_contact: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await api.get('/profile');
      if (res.data.success) {
        const data = res.data.data;
        setProfileData(data);
        const prof = data.profile || {};
        setFormData({
          name: data.name || user.name || '',
          phone: data.phone || user.phone || '',
          gender: prof.gender || 'Unspecified',
          dob: prof.dob || '',
          blood_group: prof.blood_group || '',
          address: prof.address || '',
          emergency_contact: prof.emergency_contact || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile data', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/profile', formData);
      if (res.data.success) {
        await refreshUser();
        await fetchProfile();
        setSuccessMessage('Profile details updated successfully!');
        setIsEditModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-teal-100">
          <UserIcon className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please sign in to view your patient profile, track health vitals, and manage medical prescriptions.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" /> Go to Sign In
        </button>
      </div>
    );
  }

  const profile = profileData?.profile || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-teal-500/20 shadow-md shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-black text-2xl flex items-center justify-center border-4 border-teal-500/20 shadow-md shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">{user.email} {user.phone ? `• ${user.phone}` : ''}</p>
            <p className="text-xs text-slate-400 mt-1">
              {profile.address ? (
                <span>{profile.address}</span>
              ) : (
                <span className="italic text-slate-400">Address: Not set</span>
              )}
              {' • '}Blood Group: <span className="font-bold text-slate-700">{profile.blood_group ? profile.blood_group : 'Not set'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-extrabold rounded-xl border border-teal-200 shadow-sm transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-teal-600" /> Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-extrabold rounded-xl border border-rose-200 shadow-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" /> Logout
          </button>
        </div>
      </div>

      {/* Health Dashboard Cards */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Health Dashboard</h2>
            <p className="text-xs text-slate-400">Track your vital stats & daily wellness goals</p>
          </div>

          <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-2xl border border-teal-100">
            <div className="w-10 h-10 rounded-full border-4 border-teal-500 border-t-transparent flex items-center justify-center font-black text-teal-700 text-xs">
              85
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Health Score</span>
              <span className="text-xs font-black text-emerald-600">Good Status</span>
            </div>
          </div>
        </div>

        {/* Vitals Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-100 flex items-center gap-3">
            <div className="p-3 bg-teal-500 text-white rounded-xl shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Pressure</span>
              <span className="text-sm font-extrabold text-slate-900">120/80 <span className="text-[10px] text-slate-500 font-normal">mmHg</span></span>
              <span className="text-[10px] font-bold text-emerald-600 block">Normal</span>
            </div>
          </div>

          <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 flex items-center gap-3">
            <div className="p-3 bg-rose-500 text-white rounded-xl shadow-sm">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Heart Rate</span>
              <span className="text-sm font-extrabold text-slate-900">72 <span className="text-[10px] text-slate-500 font-normal">bpm</span></span>
              <span className="text-[10px] font-bold text-emerald-600 block">Normal</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-sm">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Today's Steps</span>
              <span className="text-sm font-extrabold text-slate-900">4,230</span>
              <span className="text-[10px] font-bold text-emerald-600 block">Active Goal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Options List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden divide-y divide-slate-100">
        <Link to="/bookings" className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">My Appointments</span>
          </div>
          <span className="text-xs text-slate-400">→</span>
        </Link>

        <Link to="/prescriptions" className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Digital Prescriptions</span>
          </div>
          <span className="text-xs text-slate-400">→</span>
        </Link>

        <Link to="/reminders" className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Medicine Reminders</span>
          </div>
          <span className="text-xs text-slate-400">→</span>
        </Link>

        <Link to="/family" className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-800">Family Members</span>
          </div>
          <span className="text-xs text-slate-400">→</span>
        </Link>

        {user?.role === 'admin' && (
          <Link to="/admin" className="p-4 flex items-center justify-between bg-amber-50/60 hover:bg-amber-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-sm font-extrabold text-amber-900">Admin Control Portal</span>
            </div>
            <span className="text-xs font-bold text-amber-700">Open Admin →</span>
          </Link>
        )}
      </div>

      {/* Interactive Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
            <div className="px-6 py-4 bg-teal-600 text-white flex items-center justify-between">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit Profile Details
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold bg-white"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold bg-white"
                  >
                    <option value="Unspecified">Unspecified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Address / Location</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
                  placeholder="e.g. Jubilee Hills, Hyderabad"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-semibold"
                  placeholder="e.g. +91 9876543210 (Spouse/Parent)"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
