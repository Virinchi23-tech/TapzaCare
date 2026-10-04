import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  Pill, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard, 
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Filter,
  ShoppingBag,
  UploadCloud,
  ImageIcon,
  ShieldAlert
} from 'lucide-react';

export const PharmacistPortal: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  
  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Inventory / Medicines State
  const [medicines, setMedicines] = useState<any[]>([]);
  const [medicinesLoading, setMedicinesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any | null>(null);
  const [medicineForm, setMedicineForm] = useState({
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

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else {
      fetchMedicines();
    }
  }, [user, activeTab]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/pharmacy/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch pharmacist orders', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchMedicines = async () => {
    setMedicinesLoading(true);
    try {
      const res = await api.get('/pharmacy/medicines');
      if (res.data.success) {
        setMedicines(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch medicine inventory', err);
    } finally {
      setMedicinesLoading(false);
    }
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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    try {
      await api.patch(`/pharmacy/orders/${id}/status`, { status: newStatus });
      showNotify(`Order #${id} status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}!`);
    } catch (err) {
      console.error('PATCH failed, retrying with PUT...', err);
      try {
        await api.put(`/pharmacy/orders/${id}/status`, { status: newStatus });
        showNotify(`Order #${id} status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}!`);
      } catch (e2) {
        console.error('All status update calls failed:', e2);
        fetchOrders();
      }
    }
  };

  const openMedicineModal = (med?: any) => {
    if (med) {
      setEditingMedicine(med);
      setMedicineForm({
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
      setEditingMedicine(null);
      setMedicineForm({
        name: '',
        brand: 'Cipla',
        category: 'Fever & Cold',
        pack_size: 'Strip of 10 Tablets',
        price: 45,
        mrp: 60,
        discount_percent: 25,
        requires_prescription: false,
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500',
        description: '',
        stock_status: 'in_stock',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        await api.put(`/pharmacy/medicines/${editingMedicine.id}`, medicineForm);
        showNotify(`Medicine "${medicineForm.name}" updated successfully!`);
      } else {
        await api.post('/pharmacy/medicines', medicineForm);
        showNotify(`New medicine "${medicineForm.name}" added to catalog!`);
      }
      setIsModalOpen(false);
      setEditingMedicine(null);
      fetchMedicines();
    } catch (err: any) {
      console.error('Failed to save medicine', err);
      alert(err.response?.data?.error || 'Failed to save medicine');
    }
  };

  const handleDeleteMedicine = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    try {
      await api.delete(`/pharmacy/medicines/${id}`);
      showNotify(`Medicine "${name}" removed from inventory!`);
      fetchMedicines();
    } catch (err) {
      console.error('Failed to delete medicine', err);
      alert('Could not delete medicine');
    }
  };

  const filteredMedicines = medicines.filter((med) => {
    const matchesCategory = selectedCategory === 'All' || med.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (med.brand && med.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-bold">
            <Pill className="w-3.5 h-3.5" />
            <span>Pharmacist Operations Portal</span>
          </div>
          <h1 className="text-3xl font-black">Welcome, {user?.name || 'Pharmacist'}</h1>
          <p className="text-xs text-emerald-100 max-w-xl">
            Manage live medicine delivery orders, pack prescriptions, and update medicine inventory with full CRUD operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => activeTab === 'orders' ? fetchOrders() : fetchMedicines()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>
      </div>

      {/* Portal Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4 text-emerald-400" />
          <span>Customer Delivery Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Pill className="w-4 h-4 text-teal-400" />
          <span>Medicine Catalog & Inventory ({medicines.length})</span>
        </button>
      </div>

      {/* TAB 1: CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Customer Express Pharmacy Orders</h2>
              <p className="text-xs text-slate-500 mt-1">Manage order processing, express dispatch, and delivery completion.</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-800 text-xs font-black rounded-xl border border-emerald-200">
              Total Active: {orders.length}
            </div>
          </div>

          {ordersLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">No pharmacy orders available.</div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-base">Order #{ord.id}</span>
                        <span className="text-xs font-bold text-slate-500">Patient: {ord.patient_name}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          ord.status === 'out_for_delivery' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          ord.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-200 text-slate-800'
                        }`}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-700">{ord.items_summary}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-semibold pt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {ord.delivery_address}</span>
                        <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-emerald-600" /> {ord.payment_method}</span>
                        <span className="font-black text-slate-900">Total: ₹{ord.total_amount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-400">Update Status:</span>
                      <select
                        value={getNormalizedStatus(ord.status)}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className="text-xs font-black px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-950 shadow-sm cursor-pointer hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      >
                        <option value="placed">Placed 🛒</option>
                        <option value="processing">Processing & Packing 💊</option>
                        <option value="out_for_delivery">Out for Delivery 🛵</option>
                        <option value="delivered">Delivered ✓</option>
                        <option value="cancelled">Cancelled ❌</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEDICINE CATALOG & INVENTORY (CRUD) */}
      {activeTab === 'inventory' && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">Medicine Catalog & Stock Management</h2>
              <p className="text-xs text-slate-500 mt-1">Add new medicines, edit prices, update stock availability, or remove items.</p>
            </div>
            <button
              onClick={() => openMedicineModal()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Medicine
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by medicine name, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['All', 'Fever & Cold', 'Antibiotics', 'Digestive Health', 'Vitamins & Supplements', 'Pain Relief', 'Allergy & Sinus', 'First Aid'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Medicine List Grid */}
          {medicinesLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">Loading catalog...</div>
          ) : filteredMedicines.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">No medicines found matching criteria.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedicines.map((med) => (
                <div key={med.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 flex flex-col justify-between gap-3 hover:bg-white transition-all shadow-sm">
                  <div className="flex items-start gap-3">
                    <img
                      src={med.image_url}
                      alt={med.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md truncate">
                          {med.category}
                        </span>
                        {med.requires_prescription ? (
                          <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0">
                            Rx Needed
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-900 truncate mt-1">{med.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{med.brand} • {med.pack_size}</p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-black text-slate-900">₹{med.price}</span>
                        {med.mrp > med.price && (
                          <span className="text-xs text-slate-400 line-through">₹{med.mrp}</span>
                        )}
                        {med.discount_percent > 0 && (
                          <span className="text-[10px] font-black text-emerald-600">({med.discount_percent}% OFF)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      med.stock_status === 'in_stock' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {med.stock_status === 'in_stock' ? 'In Stock ✓' : 'Out of Stock ✕'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openMedicineModal(med)}
                        className="p-1.5 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg border border-slate-200 shadow-sm"
                        title="Edit Medicine"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(med.id, med.name)}
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
          )}
        </div>
      )}

      {/* MEDICINE MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingMedicine ? 'Edit Medicine Details' : 'Add New Medicine to Catalog'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={medicineForm.name}
                  onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                  placeholder="e.g. Paracetamol 650mg"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Manufacturer / Brand</label>
                  <input
                    type="text"
                    required
                    value={medicineForm.brand}
                    onChange={(e) => setMedicineForm({ ...medicineForm, brand: e.target.value })}
                    placeholder="e.g. Cipla, Micro Labs"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    value={medicineForm.category}
                    onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })}
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
                    value={medicineForm.price}
                    onChange={(e) => setMedicineForm({ ...medicineForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={medicineForm.mrp}
                    onChange={(e) => setMedicineForm({ ...medicineForm, mrp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Discount %</label>
                  <input
                    type="number"
                    value={medicineForm.discount_percent}
                    onChange={(e) => setMedicineForm({ ...medicineForm, discount_percent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Pack Size / Unit</label>
                  <input
                    type="text"
                    value={medicineForm.pack_size}
                    onChange={(e) => setMedicineForm({ ...medicineForm, pack_size: e.target.value })}
                    placeholder="e.g. Strip of 10 Tablets"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Stock Status</label>
                  <select
                    value={medicineForm.stock_status}
                    onChange={(e) => setMedicineForm({ ...medicineForm, stock_status: e.target.value })}
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
                  id="requires_prescription"
                  checked={medicineForm.requires_prescription}
                  onChange={(e) => setMedicineForm({ ...medicineForm, requires_prescription: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="requires_prescription" className="text-xs font-extrabold text-amber-900 cursor-pointer">
                  Requires Doctor's Prescription (Rx Needed)
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Image URL</label>
                <input
                  type="text"
                  value={medicineForm.image_url}
                  onChange={(e) => setMedicineForm({ ...medicineForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description / Dosage Instructions</label>
                <textarea
                  rows={2}
                  value={medicineForm.description}
                  onChange={(e) => setMedicineForm({ ...medicineForm, description: e.target.value })}
                  placeholder="Enter details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md"
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

export default PharmacistPortal;
