import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeConfig } from '../context/ThemeContext';
import { api } from '../lib/api';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  Calendar, 
  Settings, 
  Sparkles, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff,
  CheckCircle2, 
  FlaskConical, 
  Pill, 
  FileText,
  Loader2,
  Edit,
  Trash2,
  X,
  Power,
  Search,
  Filter,
  Upload,
  Folder,
  Link2,
  UploadCloud,
  ImageIcon,
  Mail,
  Lock,
  Key,
  ShoppingBag,
  Truck
} from 'lucide-react';

const DEFAULT_AVATAR_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";

export const AdminPortal: React.FC = () => {
  const { user } = useAuth();
  const { config, refetchConfig } = useThemeConfig();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'doctors' | 'employees' | 'services' | 'bookings' | 'config' | 'labs' | 'pharmacy' | 'audit'>('dashboard');

  const [stats, setStats] = useState<any>(null);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [labsList, setLabsList] = useState<any[]>([]);
  const [pharmacyOrdersList, setPharmacyOrdersList] = useState<any[]>([]);
  const [pharmacyMedicinesList, setPharmacyMedicinesList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [labStatusFilter, setLabStatusFilter] = useState<string>('all');
  const [pharmacyStatusFilter, setPharmacyStatusFilter] = useState<string>('all');
  const [employeeRoleFilter, setEmployeeRoleFilter] = useState<string>('all');

  // Config editor state
  const [editedSections, setEditedSections] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // --- Modals State ---
  const [modalType, setModalType] = useState<'doctor' | 'employee' | 'service' | 'booking' | 'lab' | 'pharmacy_med' | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Pharmacy Medicine Form State
  const [medForm, setMedForm] = useState({
    name: '',
    brand: 'Cipla',
    category: 'Fever & Cold',
    pack_size: 'Strip of 10 Tablets',
    price: 50,
    mrp: 65,
    discount_percent: 20,
    requires_prescription: false,
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
    description: '',
    stock_status: 'in_stock',
  });

  // Doctor Form State
  const [docForm, setDocForm] = useState({
    name: '',
    specialty: 'General Physician',
    qualifications: '',
    experience_years: 5,
    consultation_fee: 500,
    clinic_name: 'CarePlus Hospital',
    photo_url: '',
    bio: '',
    email: '',
    password: '',
  });
  const [showDocPassword, setShowDocPassword] = useState(false);

  // Employee Form State
  const [empForm, setEmpForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'nurse',
  });
  const [showEmpPassword, setShowEmpPassword] = useState(false);

  // Service Form State
  const [serviceForm, setServiceForm] = useState({
    name: '',
    category: 'Consultation',
    description: '',
    price: 999,
    icon_name: 'stethoscope',
    promotional_badge: 'Popular',
    image_url: '',
  });

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    patient_name: '',
    doctor_name: '',
    booking_date: '',
    time_slot: '09:00 AM',
    fee: 800,
    status: 'confirmed',
    reason: '',
  });

  // Lab Form State
  const [labForm, setLabForm] = useState({
    patient_name: '',
    test_name: '',
    sample_type: 'Blood',
    price: 1499,
    status: 'pending',
    test_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  useEffect(() => {
    if (config?.sections) {
      setEditedSections([...config.sections]);
    }
  }, [config]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const parseDriveOrCloudUrl = (url: string) => {
    if (!url) return '';
    const driveMatch = url.match(/\/file\/d\/([^\/]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    return url;
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'doctor' | 'service') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const fileData = reader.result as string;
      try {
        const res = await api.post('/admin/upload', {
          fileName: file.name,
          fileData: fileData,
        });

        if (res.data.success && res.data.url) {
          if (target === 'doctor') {
            setDocForm((prev) => ({ ...prev, photo_url: res.data.url }));
          } else {
            setServiceForm((prev) => ({ ...prev, image_url: res.data.url }));
          }
          showNotify('Image uploaded successfully from system/drive!');
        }
      } catch (err) {
        console.error('File upload fallback to data URL', err);
        if (target === 'doctor') {
          setDocForm((prev) => ({ ...prev, photo_url: fileData }));
        } else {
          setServiceForm((prev) => ({ ...prev, image_url: fileData }));
        }
        showNotify('Image attached successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) setStats(res.data.data);
      } else if (activeTab === 'doctors') {
        const res = await api.get('/doctors?all=true');
        if (res.data.success) setDoctorsList(res.data.data);
      } else if (activeTab === 'employees') {
        const res = await api.get('/admin/employees');
        if (res.data.success) setEmployeesList(res.data.data);
      } else if (activeTab === 'services') {
        const res = await api.get('/services?all=true');
        if (res.data.success) setServicesList(res.data.data);
      } else if (activeTab === 'bookings') {
        const res = await api.get('/admin/bookings');
        if (res.data.success) setBookingsList(res.data.data);
      } else if (activeTab === 'labs') {
        const res = await api.get('/admin/labs');
        if (res.data.success) setLabsList(res.data.data);
      } else if (activeTab === 'pharmacy') {
        const [ordersRes, medsRes] = await Promise.all([
          api.get('/pharmacy/orders'),
          api.get('/pharmacy/medicines'),
        ]);
        if (ordersRes.data.success) setPharmacyOrdersList(ordersRes.data.data);
        if (medsRes.data.success) setPharmacyMedicinesList(medsRes.data.data);
      } else if (activeTab === 'audit') {
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) setAuditLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePharmacyMed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/pharmacy/medicines/${editingItem.id}`, medForm);
        showNotify(`Medicine "${medForm.name}" updated!`);
      } else {
        await api.post('/pharmacy/medicines', medForm);
        showNotify(`Medicine "${medForm.name}" added to catalog!`);
      }
      setModalType(null);
      setEditingItem(null);
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to save medicine');
    }
  };

  const handleDeletePharmacyMed = async (id: string, name: string) => {
    if (!window.confirm(`Delete medicine "${name}" from catalog?`)) return;
    try {
      await api.delete(`/pharmacy/medicines/${id}`);
      showNotify(`Medicine "${name}" deleted!`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const openPharmacyMedModal = (med?: any) => {
    if (med) {
      setEditingItem(med);
      setMedForm({
        name: med.name || '',
        brand: med.brand || 'Cipla',
        category: med.category || 'Fever & Cold',
        pack_size: med.pack_size || 'Strip of 10 Tablets',
        price: med.price || 50,
        mrp: med.mrp || 65,
        discount_percent: med.discount_percent || 20,
        requires_prescription: Boolean(med.requires_prescription),
        image_url: med.image_url || '',
        description: med.description || '',
        stock_status: med.stock_status || 'in_stock',
      });
    } else {
      setEditingItem(null);
      setMedForm({
        name: '',
        brand: 'Cipla',
        category: 'Fever & Cold',
        pack_size: 'Strip of 10 Tablets',
        price: 50,
        mrp: 65,
        discount_percent: 20,
        requires_prescription: false,
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
        description: '',
        stock_status: 'in_stock',
      });
    }
    setModalType('pharmacy_med');
  };

  const getNormalizedStatus = (status: string) => {
    if (!status) return 'placed';
    const s = status.toLowerCase();
    if (s.includes('pack') || s.includes('process')) return 'processing';
    if (s.includes('out') || (s.includes('deliver') && !s.includes('delivered'))) return 'out_for_delivery';
    if (s === 'delivered' || s.includes('complete')) return 'delivered';
    if (s.includes('cancel')) return 'cancelled';
    return 'placed';
  };

  const handleUpdatePharmacyStatus = async (orderId: string, newStatus: string) => {
    setPharmacyOrdersList((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    try {
      await api.patch(`/pharmacy/orders/${orderId}/status`, { status: newStatus });
      showNotify(`Pharmacy Order ${orderId} updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}!`);
    } catch (err) {
      console.error('Failed to update order status via patch, retrying via put', err);
      try {
        await api.put(`/pharmacy/orders/${orderId}/status`, { status: newStatus });
        showNotify(`Pharmacy Order ${orderId} updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}!`);
      } catch (e2) {
        fetchAdminData();
      }
    }
  };

  // --- Employee CRUD Operations ---
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/admin/employees/${editingItem.id}`, empForm);
        showNotify(`Employee "${empForm.name}" updated successfully!`);
      } else {
        await api.post('/admin/employees', empForm);
        showNotify(`Employee "${empForm.name}" created successfully!`);
      }
      setModalType(null);
      setEditingItem(null);
      fetchAdminData();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to save employee profile.');
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete employee "${name}"?`)) return;
    try {
      await api.delete(`/admin/employees/${id}`);
      showNotify(`Employee "${name}" deleted!`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEmployeeModal = (emp?: any) => {
    if (emp) {
      setEditingItem(emp);
      setEmpForm({
        name: emp.name || '',
        email: emp.email || '',
        password: '',
        phone: emp.phone || '',
        role: emp.role || 'nurse',
      });
    } else {
      setEditingItem(null);
      setEmpForm({
        name: '',
        email: '',
        password: 'password123',
        phone: '+91 98765 00000',
        role: 'nurse',
      });
    }
    setShowEmpPassword(false);
    setModalType('employee');
  };

  // --- Doctor CRUD Operations ---
  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/admin/doctors/${editingItem.id}`, docForm);
        showNotify(`Doctor "${docForm.name}" updated successfully!`);
      } else {
        await api.post('/admin/doctors', docForm);
        showNotify(`Doctor "${docForm.name}" added successfully!`);
      }
      setModalType(null);
      setEditingItem(null);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to save doctor details.');
    }
  };

  const handleToggleDoctorStatus = async (id: string, name: string) => {
    try {
      await api.patch(`/admin/doctors/${id}/toggle`);
      showNotify(`Status for "${name}" toggled!`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDoctor = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete Doctor "${name}"?`)) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      showNotify(`Doctor "${name}" deleted!`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const openDoctorModal = (doc?: any) => {
    if (doc) {
      setEditingItem(doc);
      setDocForm({
        name: doc.name || '',
        specialty: doc.specialty || 'General Physician',
        qualifications: doc.qualifications || '',
        experience_years: doc.experience_years || 5,
        consultation_fee: doc.consultation_fee || 500,
        clinic_name: doc.clinic_name || 'CarePlus Hospital',
        photo_url: doc.photo_url || '',
        bio: doc.bio || '',
        email: doc.email || `${doc.id}@tapzacare.com`,
        password: '',
      });
    } else {
      setEditingItem(null);
      setDocForm({
        name: '',
        specialty: 'General Physician',
        qualifications: '',
        experience_years: 5,
        consultation_fee: 500,
        clinic_name: 'CarePlus Hospital',
        photo_url: '',
        bio: '',
        email: '',
        password: 'password123',
      });
    }
    setShowDocPassword(false);
    setModalType('doctor');
  };

  // --- Services CRUD Operations ---
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/admin/services/${editingItem.id}`, serviceForm);
        showNotify(`Service "${serviceForm.name}" updated!`);
      } else {
        await api.post('/admin/services', serviceForm);
        showNotify(`Service "${serviceForm.name}" created!`);
      }
      setModalType(null);
      setEditingItem(null);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to save service.');
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete Service "${name}"?`)) return;
    try {
      await api.delete(`/admin/services/${id}`);
      showNotify(`Service "${name}" deleted!`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const openServiceModal = (srv?: any) => {
    if (srv) {
      setEditingItem(srv);
      setServiceForm({
        name: srv.name || '',
        category: srv.category || 'Consultation',
        description: srv.description || '',
        price: srv.price || 999,
        icon_name: srv.icon_name || 'stethoscope',
        promotional_badge: srv.promotional_badge || '',
        image_url: srv.image_url || '',
      });
    } else {
      setEditingItem(null);
      setServiceForm({
        name: '',
        category: 'Consultation',
        description: '',
        price: 500,
        icon_name: 'stethoscope',
        promotional_badge: '',
        image_url: '',
      });
    }
    setModalType('service');
  };

  // --- Bookings CRUD Operations ---
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/admin/bookings/${editingItem.id}`, bookingForm);
        showNotify('Appointment updated!');
      }
      setModalType(null);
      setEditingItem(null);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    try {
      await api.put(`/admin/bookings/${id}`, { status });
      showNotify(`Appointment status updated to ${status}!`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      fetchAdminData();
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!window.confirm('Delete this appointment record?')) return;
    try {
      await api.delete(`/admin/bookings/${id}`);
      showNotify('Appointment deleted!');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const openBookingModal = (b: any) => {
    setEditingItem(b);
    setBookingForm({
      patient_name: b.patient_name || '',
      doctor_name: b.doctor_name || '',
      booking_date: b.booking_date || '',
      time_slot: b.time_slot || '09:00 AM',
      fee: b.fee || 800,
      status: b.status || 'confirmed',
      reason: b.reason || '',
    });
    setModalType('booking');
  };

  // --- Lab CRUD Operations ---
  const handleSaveLab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/admin/labs/${editingItem.id}`, labForm);
        showNotify(`Lab order "${labForm.test_name}" updated!`);
      } else {
        await api.post('/admin/labs', labForm);
        showNotify(`Lab order "${labForm.test_name}" created!`);
      }
      setModalType(null);
      setEditingItem(null);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLabStatus = async (id: string, status: string) => {
    setLabsList((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
    try {
      await api.patch(`/admin/labs/${id}`, { status });
      showNotify(`Lab status updated to ${status}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      fetchAdminData();
    }
  };

  const handleDeleteLab = async (id: string) => {
    if (!window.confirm('Delete this lab order?')) return;
    try {
      await api.delete(`/admin/labs/${id}`);
      showNotify('Lab order deleted!');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const openLabModal = (lab?: any) => {
    if (lab) {
      setEditingItem(lab);
      setLabForm({
        patient_name: lab.patient_name || '',
        test_name: lab.test_name || '',
        sample_type: lab.sample_type || 'Blood',
        price: lab.price || 1499,
        status: lab.status || 'pending',
        test_date: lab.test_date || new Date().toISOString().split('T')[0],
      });
    } else {
      setEditingItem(null);
      setLabForm({
        patient_name: '',
        test_name: '',
        sample_type: 'Blood',
        price: 999,
        status: 'pending',
        test_date: new Date().toISOString().split('T')[0],
      });
    }
    setModalType('lab');
  };

  // Config editor handlers
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const updated = [...editedSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setEditedSections(updated);
  };

  const handleToggleVisibility = (index: number) => {
    const updated = [...editedSections];
    updated[index].visible = !updated[index].visible;
    setEditedSections(updated);
  };

  const handleSaveConfig = async () => {
    try {
      const res = await api.post('/admin/config', {
        id: config?.id || `cfg-${Date.now()}`,
        version: config?.version || 'v1.0.0',
        sections: editedSections,
      });

      if (res.data.success) {
        setSaveStatus('Home Screen Layout Configuration saved and synced to Turso DB successfully!');
        await refetchConfig();
      }
    } catch (err) {
      console.error('Failed to save config', err);
      setSaveStatus('Failed to publish configuration changes.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}



      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 custom-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard Overview', icon: ShieldCheck },
          { id: 'config', label: 'Home Screen Config Engine', icon: Settings },
          { id: 'doctors', label: 'Doctor Management', icon: Stethoscope },
          { id: 'employees', label: 'Hospital Staff & Employees', icon: Users },
          { id: 'services', label: 'Services Catalog', icon: Sparkles },
          { id: 'bookings', label: 'Appointments List', icon: Calendar },
          { id: 'labs', label: 'Lab Diagnostic Orders', icon: FlaskConical },
          { id: 'pharmacy', label: 'Medicine Express Orders 🛵', icon: ShoppingBag },
          { id: 'audit', label: 'System Audit Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Registered Patients</span>
              <div className="text-3xl font-black text-slate-900 mt-2">{stats?.total_patients || 12}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Doctors</span>
              <div className="text-3xl font-black text-teal-600 mt-2">{stats?.total_doctors || 16}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Today's Appointments</span>
              <div className="text-3xl font-black text-indigo-600 mt-2">{stats?.today_appointments || 2}</div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase">Confirmed Bookings</span>
              <div className="text-3xl font-black text-emerald-600 mt-2">{stats?.confirmed_bookings || 8}</div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIG ENGINE TAB */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Dynamic Home Screen Configuration Editor</h2>
              <p className="text-xs text-slate-500 mt-1">Reorder, toggle visibility, and update home screen layout sections at runtime.</p>
            </div>
            <button
              onClick={handleSaveConfig}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Save & Publish Layout
            </button>
          </div>

          {saveStatus && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl">
              {saveStatus}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Sections ({editedSections.length})</h3>
            {editedSections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{sec.title || sec.type}</h4>
                    <p className="text-xs text-slate-500 font-mono">Type: {sec.type} • Background: {sec.background_type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleVisibility(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      sec.visible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {sec.visible ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveSection(idx, 'up')}
                    className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === editedSections.length - 1}
                    onClick={() => handleMoveSection(idx, 'down')}
                    className="p-2 bg-white rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCTOR MANAGEMENT TAB */}
      {activeTab === 'doctors' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Doctor Directory & Scheduling Management</h2>
              <p className="text-xs text-slate-500 mt-1">Add new doctors, edit existing profiles, upload photos from system/drive, or toggle availability.</p>
            </div>
            <button
              onClick={() => openDoctorModal()}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctorsList.map((doc) => (
              <div key={doc.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.photo_url}
                      alt={doc.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_AVATAR_PLACEHOLDER;
                      }}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-teal-600 font-semibold">{doc.specialty} • ₹{doc.consultation_fee}</p>
                      <p className="text-[11px] text-slate-400">{doc.qualifications} • {doc.experience_years} yrs exp</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleDoctorStatus(doc.id, doc.name)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                        doc.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {doc.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => openDoctorModal(doc)}
                      className="p-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl border border-slate-200 shadow-sm"
                      title="Edit Doctor Profile & Login Credentials"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                      className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl border border-slate-200 shadow-sm"
                      title="Delete Doctor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Doctor Login Credentials Info Bar */}
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] font-semibold gap-2">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Email:</span>
                    <span className="font-mono text-slate-900">{doc.email || `${doc.id}@tapzacare.com`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Pass:</span>
                    <span className="font-mono text-slate-700">password123</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOSPITAL STAFF & EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Hospital Staff & Employee Directory</h2>
              <p className="text-xs text-slate-500 mt-1">Manage hospital personnel (nurses, pharmacists, lab technicians, receptionists, clinical staff) and credentials.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Filter Role:</span>
                <select
                  value={employeeRoleFilter}
                  onChange={(e) => setEmployeeRoleFilter(e.target.value)}
                  className="text-xs font-extrabold px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer"
                >
                  <option value="all">All Roles ({employeesList.length})</option>
                  <option value="nurse">Nurses</option>
                  <option value="pharmacist">Pharmacists</option>
                  <option value="lab">Lab Technicians</option>
                  <option value="receptionist">Receptionists</option>
                  <option value="staff">Clinical Staff</option>
                </select>
              </div>
              <button
                onClick={() => openEmployeeModal()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add New Employee
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employeesList
              .filter((emp) => employeeRoleFilter === 'all' || emp.role === employeeRoleFilter)
              .map((emp) => (
                <div key={emp.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-700 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                        {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{emp.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            emp.role === 'nurse' ? 'bg-purple-100 text-purple-800' :
                            emp.role === 'pharmacist' ? 'bg-emerald-100 text-emerald-800' :
                            emp.role === 'lab' ? 'bg-indigo-100 text-indigo-800' :
                            emp.role === 'receptionist' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {emp.role}
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">{emp.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEmployeeModal(emp)}
                        className="p-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl border border-slate-200 shadow-sm"
                        title="Edit Employee & Credentials"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl border border-slate-200 shadow-sm"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Employee Credentials Column Bar */}
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between text-[11px] font-semibold gap-2">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Login Email:</span>
                      <span className="font-mono text-slate-900">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Pass:</span>
                      <span className="font-mono text-slate-700">password123</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SERVICES CATALOG TAB */}
      {activeTab === 'services' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Healthcare Services Catalog</h2>
              <p className="text-xs text-slate-500 mt-1">Manage clinical service offerings, prices, badges, and categories.</p>
            </div>
            <button
              onClick={() => openServiceModal()}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicesList.map((srv) => (
              <div key={srv.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">{srv.name}</h4>
                    {srv.promotional_badge && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                        {srv.promotional_badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-teal-600 font-semibold">{srv.category} • ₹{srv.price}</p>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-1">{srv.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openServiceModal(srv)}
                    className="p-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl border border-slate-200 shadow-sm"
                    title="Edit Service"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(srv.id, srv.name)}
                    className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl border border-slate-200 shadow-sm"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPOINTMENTS LIST TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Patient Appointments Audit & Management</h2>
              <p className="text-xs text-slate-500 mt-1">Review patient bookings, update appointment status, or cancel appointments.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Filter Status:</span>
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="text-xs font-extrabold px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer"
              >
                <option value="all">All Appointments ({bookingsList.length})</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {bookingsList
              .filter((b) => bookingStatusFilter === 'all' || b.status === bookingStatusFilter)
              .map((b) => (
                <div key={b.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{b.patient_name} with {b.doctor_name}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{b.specialty} • {b.booking_date} at {b.time_slot} • ₹{b.fee}</p>
                    {b.reason && <p className="text-xs text-slate-400 mt-0.5">Reason: {b.reason}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={b.status}
                      onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                      className="text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-teal-400 transition-colors"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => openBookingModal(b)}
                      className="p-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl border border-slate-200 shadow-sm"
                      title="Edit Appointment"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(b.id)}
                      className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl border border-slate-200 shadow-sm"
                      title="Delete Appointment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* LAB & PHARMACY ORDERS TAB */}
      {activeTab === 'labs' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Lab Diagnostic & Pharmacy Orders Management</h2>
              <p className="text-xs text-slate-500 mt-1">Manage lab test packages, diagnostic orders, and update fulfillment status.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Filter Status:</span>
                <select
                  value={labStatusFilter}
                  onChange={(e) => setLabStatusFilter(e.target.value)}
                  className="text-xs font-extrabold px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer"
                >
                  <option value="all">All Lab Orders ({labsList.length})</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={() => openLabModal()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Lab Order
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {labsList
              .filter((lab) => labStatusFilter === 'all' || lab.status === labStatusFilter)
              .map((lab) => (
                <div key={lab.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{lab.test_name} ({lab.patient_name})</h4>
                    <p className="text-xs text-slate-500">{lab.sample_type} • Date: {lab.test_date} • ₹{lab.price}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={lab.status}
                      onChange={(e) => handleUpdateLabStatus(lab.id, e.target.value)}
                      className="text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-teal-400 transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={() => openLabModal(lab)}
                      className="p-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl border border-slate-200 shadow-sm"
                      title="Edit Lab Order"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteLab(lab.id)}
                      className="p-2 bg-white hover:bg-rose-50 text-rose-600 rounded-xl border border-slate-200 shadow-sm"
                      title="Delete Lab Order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MEDICINE EXPRESS ORDERS & CATALOG TAB */}
      {activeTab === 'pharmacy' && (
        <div className="space-y-8">
          {/* Medicine Catalog CRUD Management Section */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  <span>Pharmacy Medicine Inventory & Catalog CRUD</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Manage hospital pharmacy stock, add new medicines, edit prices, and delete items.</p>
              </div>
              <button
                onClick={() => openPharmacyMedModal()}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" /> Add New Medicine
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pharmacyMedicinesList.map((med) => (
                <div key={med.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={med.image_url}
                      alt={med.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md truncate">
                          {med.category}
                        </span>
                        {med.requires_prescription ? (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0">
                            Rx Needed
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 truncate mt-1">{med.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{med.brand} • {med.pack_size}</p>
                      <p className="text-xs font-black text-slate-900 mt-1">₹{med.price} <span className="text-slate-400 font-normal line-through text-[11px]">₹{med.mrp}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      med.stock_status === 'in_stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {med.stock_status === 'in_stock' ? 'In Stock ✓' : 'Out of Stock ✕'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openPharmacyMedModal(med)}
                        className="p-1.5 bg-white hover:bg-teal-50 text-teal-700 rounded-lg border border-slate-200 shadow-sm"
                        title="Edit Medicine"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePharmacyMed(med.id, med.name)}
                        className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200 shadow-sm"
                        title="Delete Medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Orders Fulfillment Section */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <span>Customer Pharmacy Express Delivery Orders</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">Live customer medicine orders, payment methods, delivery addresses, and fulfillment tracking.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Filter Status:</span>
                <select
                  value={pharmacyStatusFilter}
                  onChange={(e) => setPharmacyStatusFilter(e.target.value)}
                  className="text-xs font-extrabold px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer"
                >
                  <option value="all">All Orders ({pharmacyOrdersList.length})</option>
                  <option value="placed">Placed</option>
                  <option value="processing">Processing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

          <div className="space-y-4">
            {pharmacyOrdersList.filter((o) => pharmacyStatusFilter === 'all' || o.status === pharmacyStatusFilter).length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">No pharmacy delivery orders found matching this filter.</p>
              </div>
            ) : (
              pharmacyOrdersList
                .filter((o) => pharmacyStatusFilter === 'all' || o.status === pharmacyStatusFilter)
                .map((order) => {
                  let items = [];
                  try {
                    items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
                  } catch (e) {
                    items = [];
                  }

                  return (
                    <div key={order.id} className="p-5 rounded-3xl border border-slate-200 bg-slate-50/80 hover:bg-white transition-all shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                            🛵
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-extrabold text-slate-900">{order.id}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                {order.payment_method || 'COD'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5">
                              Customer: <strong className="text-slate-800">{order.patient_name || 'Patient'}</strong> ({order.patient_phone || 'N/A'})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="block text-xs font-bold text-slate-400">Total Bill</span>
                            <span className="text-base font-black text-emerald-700">₹{order.total_amount}</span>
                          </div>

                          <select
                            value={getNormalizedStatus(order.status)}
                            onChange={(e) => handleUpdatePharmacyStatus(order.id, e.target.value)}
                            className="text-xs font-black px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm cursor-pointer hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                          >
                            <option value="placed">Placed 🛒</option>
                            <option value="processing">Processing & Packing 💊</option>
                            <option value="out_for_delivery">Out for Delivery 🛵</option>
                            <option value="delivered">Delivered ✅</option>
                            <option value="cancelled">Cancelled ❌</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Items Ordered ({items.length})</span>
                          <div className="space-y-1">
                            {items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-slate-700 font-semibold bg-white p-2 rounded-xl border border-slate-100">
                                <span>{item.name} × {item.quantity}</span>
                                <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Delivery Address & Time</span>
                          <div className="bg-white p-3 rounded-2xl border border-slate-100 space-y-1 text-slate-700">
                            <p className="font-semibold text-slate-900 line-clamp-2">📍 {order.delivery_address || 'Home Address'}</p>
                            <p className="text-[11px] text-slate-400">Ordered at: {order.created_at || 'Just now'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
      )}

      {/* SYSTEM AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-4">
          <h2 className="text-xl font-black text-slate-900 mb-4">System Activity Audit Logs</h2>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold">No recent system audit logs recorded.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{log.action_name}</span>
                  <span className="text-slate-500 ml-2">{log.details}</span>
                </div>
                <span className="text-slate-400">{log.created_at}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- MODALS --- */}
      {/* 1. Doctor Modal with System / Drive File Upload */}
      {modalType === 'doctor' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingItem ? 'Edit Doctor Profile' : 'Add New Doctor Profile'}
              </h3>
              <button onClick={() => setModalType(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-4 text-xs">
              {/* Doctor Login Credentials Widget */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-teal-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-teal-700" />
                    <span>Doctor Portal Login Credentials</span>
                  </label>
                  <span className="text-[10px] text-teal-700 font-semibold">Account access details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Doctor Login Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={docForm.email}
                        onChange={(e) => setDocForm({ ...docForm, email: e.target.value })}
                        placeholder="e.g. dr.sunita@tapzacare.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-bold bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      {editingItem ? 'New Password (Optional)' : 'Account Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showDocPassword ? 'text' : 'password'}
                        required={!editingItem}
                        value={docForm.password}
                        onChange={(e) => setDocForm({ ...docForm, password: e.target.value })}
                        placeholder={editingItem ? 'Leave blank to keep current' : 'password123'}
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 font-bold bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDocPassword(!showDocPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        title={showDocPassword ? 'Hide password' : 'Show password'}
                      >
                        {showDocPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  placeholder="Enter Doctor Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Specialty</label>
                  <select
                    value={docForm.specialty}
                    onChange={(e) => setDocForm({ ...docForm, specialty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Orthopedist">Orthopedist</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Qualifications</label>
                  <input
                    type="text"
                    required
                    value={docForm.qualifications}
                    onChange={(e) => setDocForm({ ...docForm, qualifications: e.target.value })}
                    placeholder="Enter Qualifications (e.g. MBBS, MD)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    required
                    value={docForm.experience_years}
                    onChange={(e) => setDocForm({ ...docForm, experience_years: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    required
                    value={docForm.consultation_fee}
                    onChange={(e) => setDocForm({ ...docForm, consultation_fee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Rich Doctor Image Upload & Preview Widget */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Doctor Portrait Photo</span>
                  <span className="text-teal-600 text-[10px] font-semibold">System File / Google Drive / URL</span>
                </label>

                <div className="flex items-center gap-4">
                  {/* Live Preview Box */}
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-300 shadow-sm overflow-hidden shrink-0 flex items-center justify-center">
                    {docForm.photo_url ? (
                      <img
                        src={parseDriveOrCloudUrl(docForm.photo_url)}
                        alt="Preview"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_AVATAR_PLACEHOLDER;
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-sm inline-flex items-center gap-2 transition-colors">
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Photo from System / Drive</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, 'doctor')}
                      />
                    </label>

                    <div className="relative">
                      <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={docForm.photo_url}
                        onChange={(e) => setDocForm({ ...docForm, photo_url: parseDriveOrCloudUrl(e.target.value) })}
                        placeholder="Or paste Google Drive view link / Direct Image URL"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Bio / Overview</label>
                <textarea
                  rows={3}
                  value={docForm.bio}
                  onChange={(e) => setDocForm({ ...docForm, bio: e.target.value })}
                  placeholder="Enter doctor bio and clinical background..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Doctor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Employee Modal */}
      {modalType === 'employee' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingItem ? 'Edit Hospital Employee Profile' : 'Add New Hospital Employee'}
              </h3>
              <button onClick={() => setModalType(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              {/* Employee Credentials Box */}
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-teal-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-teal-700" />
                    <span>Employee Login Credentials</span>
                  </label>
                  <span className="text-[10px] text-teal-700 font-semibold">System access details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Employee Email</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={empForm.email}
                        onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                        placeholder="e.g. nurse.anjali@tapzacare.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-bold bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      {editingItem ? 'New Password (Optional)' : 'Account Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showEmpPassword ? 'text' : 'password'}
                        required={!editingItem}
                        value={empForm.password}
                        onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })}
                        placeholder={editingItem ? 'Leave blank to keep current' : 'password123'}
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 font-bold bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmpPassword(!showEmpPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        title={showEmpPassword ? 'Hide password' : 'Show password'}
                      >
                        {showEmpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Employee Full Name</label>
                <input
                  type="text"
                  required
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  placeholder="Enter Employee Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Employee Role</label>
                  <select
                    value={empForm.role}
                    onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="nurse">Nurse</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="lab">Lab Technician</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="staff">Clinical Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Employee Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Service Modal with System / Drive File Upload */}
      {modalType === 'service' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingItem ? 'Edit Service Details' : 'Add New Service'}
              </h3>
              <button onClick={() => setModalType(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  placeholder="Enter Service Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    placeholder="Enter Service Category"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Promotional Badge</label>
                <input
                  type="text"
                  value={serviceForm.promotional_badge}
                  onChange={(e) => setServiceForm({ ...serviceForm, promotional_badge: e.target.value })}
                  placeholder="Enter Promotional Badge (Optional)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              {/* Service Image Upload Widget */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Service Image / Banner
                </label>

                <div className="flex items-center gap-4">
                  {serviceForm.image_url && (
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-300 shadow-sm overflow-hidden shrink-0">
                      <img src={parseDriveOrCloudUrl(serviceForm.image_url)} alt="Service Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-sm inline-flex items-center gap-2 transition-colors">
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload Image from System / Drive</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, 'service')}
                      />
                    </label>

                    <div className="relative">
                      <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={serviceForm.image_url}
                        onChange={(e) => setServiceForm({ ...serviceForm, image_url: parseDriveOrCloudUrl(e.target.value) })}
                        placeholder="Or paste Google Drive view link / Direct Image URL"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Enter service details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Booking Modal */}
      {modalType === 'booking' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Edit Patient Appointment</h3>
              <button onClick={() => setModalType(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
                <select
                  value={bookingForm.status}
                  onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Booking Date</label>
                  <input
                    type="date"
                    value={bookingForm.booking_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, booking_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={bookingForm.time_slot}
                    onChange={(e) => setBookingForm({ ...bookingForm, time_slot: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                  placeholder="Enter reason for appointment or medical notes..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Booking Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Lab Modal */}
      {modalType === 'lab' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingItem ? 'Edit Lab Order' : 'Create New Lab Test Order'}
              </h3>
              <button onClick={() => setModalType(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLab} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={labForm.patient_name}
                  onChange={(e) => setLabForm({ ...labForm, patient_name: e.target.value })}
                  placeholder="Enter Patient Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Test Name</label>
                <input
                  type="text"
                  required
                  value={labForm.test_name}
                  onChange={(e) => setLabForm({ ...labForm, test_name: e.target.value })}
                  placeholder="Enter Lab Test Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Sample Type</label>
                  <input
                    type="text"
                    required
                    value={labForm.sample_type}
                    onChange={(e) => setLabForm({ ...labForm, sample_type: e.target.value })}
                    placeholder="Enter Sample Type (e.g. Blood, Urine)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={labForm.price}
                    onChange={(e) => setLabForm({ ...labForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Lab Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Pharmacy Medicine Modal (Add / Edit) */}
      {modalType === 'pharmacy_med' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingItem ? 'Edit Medicine Details' : 'Add New Medicine to Catalog'}
              </h3>
              <button onClick={() => setModalType(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePharmacyMed} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                  placeholder="e.g. Paracetamol 650mg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={medForm.brand}
                    onChange={(e) => setMedForm({ ...medForm, brand: e.target.value })}
                    placeholder="e.g. Cipla, Micro Labs"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={medForm.category}
                    onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="Fever & Cold">Fever & Cold</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Digestive Health">Digestive Health</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Allergy & Sinus">Allergy & Sinus</option>
                    <option value="First Aid">First Aid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={medForm.price}
                    onChange={(e) => setMedForm({ ...medForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={medForm.mrp}
                    onChange={(e) => setMedForm({ ...medForm, mrp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Discount %</label>
                  <input
                    type="number"
                    value={medForm.discount_percent}
                    onChange={(e) => setMedForm({ ...medForm, discount_percent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Pack Size</label>
                  <input
                    type="text"
                    value={medForm.pack_size}
                    onChange={(e) => setMedForm({ ...medForm, pack_size: e.target.value })}
                    placeholder="e.g. Strip of 10 Tablets"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Stock Status</label>
                  <select
                    value={medForm.stock_status}
                    onChange={(e) => setMedForm({ ...medForm, stock_status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                  >
                    <option value="in_stock">In Stock ✓</option>
                    <option value="out_of_stock">Out of Stock ✕</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  id="admin_requires_prescription"
                  checked={medForm.requires_prescription}
                  onChange={(e) => setMedForm({ ...medForm, requires_prescription: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <label htmlFor="admin_requires_prescription" className="text-xs font-extrabold text-amber-900 cursor-pointer">
                  Requires Prescription (Rx Needed)
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  value={medForm.image_url}
                  onChange={(e) => setMedForm({ ...medForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={medForm.description}
                  onChange={(e) => setMedForm({ ...medForm, description: e.target.value })}
                  placeholder="Enter medicine details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
