import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  Star, 
  MapPin, 
  CreditCard, 
  DollarSign, 
  ChevronRight, 
  ArrowRight, 
  Package, 
  X,
  Loader2,
  Filter
} from 'lucide-react';

interface MedicineItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  pack_size: string;
  price: number;
  mrp: number;
  discount_percent: number;
  requires_prescription: boolean;
  image_url: string;
  description: string;
  rating: number;
}

interface CartItem extends MedicineItem {
  qty: number;
}

export const PharmacyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Plot 42, Jubilee Hills, Hyderabad - 500033');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI (GPay / PhonePe)');
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'store' | 'history'>('store');

  const categories = [
    'All',
    'Fever & Cold',
    'Pain Relief',
    'Antibiotics',
    'Vitamins & Supplements',
    'First Aid',
    'Digestive Health',
    'Allergy & Sinus'
  ];

  useEffect(() => {
    fetchMedicines();
    if (user) {
      fetchMyOrders();
    }
  }, [user, selectedCategory]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory !== 'All' ? `?category=${encodeURIComponent(selectedCategory)}` : '';
      const res = await api.get(`/pharmacy/medicines${categoryParam}`);
      if (res.data.success) {
        setMedicines(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch pharmacy medicines', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await api.get('/pharmacy/orders');
      if (res.data.success) {
        setMyOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch pharmacy orders', err);
    }
  };

  const handleAddToCart = (med: MedicineItem) => {
    setCart((prev) => {
      const existing = prev[med.id];
      const nextQty = existing ? existing.qty + 1 : 1;
      return { ...prev, [med.id]: { ...med, qty: nextQty } };
    });
  };

  const handleRemoveFromCart = (medId: string) => {
    setCart((prev) => {
      const existing = prev[medId];
      if (!existing) return prev;
      if (existing.qty <= 1) {
        const copy = { ...prev };
        delete copy[medId];
        return copy;
      }
      return { ...prev, [medId]: { ...existing, qty: existing.qty - 1 } };
    });
  };

  const cartList = Object.values(cart);
  const cartItemCount = cartList.reduce((acc, curr) => acc + curr.qty, 0);
  const cartSubtotal = cartList.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const deliveryFee = cartSubtotal > 500 || cartSubtotal === 0 ? 0 : 30;
  const cartGrandTotal = cartSubtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItemCount === 0) return;

    setSubmittingOrder(true);
    try {
      const res = await api.post('/pharmacy/orders', {
        items: cartList.map((c) => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
        total_amount: cartGrandTotal,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
      });

      if (res.data.success) {
        setConfirmedOrder(res.data.data);
        setCart({});
        setIsCheckoutOpen(false);
        fetchMyOrders();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to place medicine order.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
      {/* Top Banner / Store Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-black uppercase tracking-wider">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Express 30-Minute Medicine Delivery 🛵</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Tapza Pharmacy & Medicine Store</h1>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            Order genuine OTC medicines, prescription drugs, health supplements, and emergency care kits delivered straight to your doorstep.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 z-10">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'store' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            Order Medicines
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'history' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-white hover:bg-white/10'
            }`}
          >
            My Orders ({myOrders.length})
          </button>
        </div>
      </div>

      {activeTab === 'store' ? (
        <>
          {/* Search & Category Pill Filters */}
          <div className="space-y-4">
            <div className="relative max-w-2xl">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines, brands, fever, vitamins, or painkillers..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Categories Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-md scale-102'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Medicines Catalog Grid */}
          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center text-emerald-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No medicines found</h3>
              <p className="text-xs text-slate-400">Try searching for another medicine name or selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedicines.map((med) => {
                const inCart = cart[med.id];
                return (
                  <div
                    key={med.id}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group p-4 space-y-3"
                  >
                    <div>
                      {/* Image & Discount Badge */}
                      <div className="h-36 bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center mb-3">
                        <img
                          src={med.image_url}
                          alt={med.name}
                          className="max-h-32 object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        {med.discount_percent > 0 && (
                          <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-md shadow-sm">
                            {med.discount_percent}% OFF
                          </span>
                        )}
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-amber-600 text-[10px] font-bold rounded-md flex items-center gap-0.5 shadow-sm">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {med.rating}
                        </span>
                      </div>

                      {/* Medicine Header */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {med.category}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">{med.name}</h4>
                        <p className="text-[11px] font-semibold text-slate-400">{med.brand} • {med.pack_size}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{med.description}</p>
                      </div>
                    </div>

                    {/* Price & Cart Controller */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black text-slate-900">₹{med.price}</span>
                          {med.mrp > med.price && (
                            <span className="text-xs text-slate-400 line-through font-semibold">₹{med.mrp}</span>
                          )}
                        </div>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-2 bg-emerald-600 text-white rounded-xl p-1 font-black text-xs shadow-md">
                          <button
                            onClick={() => handleRemoveFromCart(med.id)}
                            className="w-7 h-7 rounded-lg hover:bg-emerald-700 flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-1 text-xs font-black">{inCart.qty}</span>
                          <button
                            onClick={() => handleAddToCart(med)}
                            className="w-7 h-7 rounded-lg hover:bg-emerald-700 flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(med)}
                          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 border border-emerald-200"
                        >
                          <Plus className="w-3.5 h-3.5" /> ADD
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating Cart Bar (Food-delivery App Style) */}
          {cartItemCount > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92vw] bg-slate-950 text-white p-4 rounded-3xl shadow-2xl border-2 border-emerald-500/80 flex items-center justify-between gap-4 animate-slide-up backdrop-blur-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-base shadow-md">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white">
                    {cartItemCount} {cartItemCount === 1 ? 'Medicine' : 'Medicines'} Added
                  </div>
                  <div className="text-xs text-emerald-400 font-black">
                    Subtotal: ₹{cartSubtotal} {deliveryFee === 0 ? '(Free 30-min Delivery 🎉)' : `(+₹${deliveryFee} delivery)`}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-colors flex items-center gap-2"
              >
                <span>Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        /* Orders History View */
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900">My Medicine Delivery Orders</h2>
              <p className="text-xs text-slate-500 mt-1">Track live status and delivery history of your medicine orders.</p>
            </div>
          </div>

          {myOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-semibold">No pharmacy orders placed yet.</div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => (
                <div key={ord.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">Order #{ord.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          ord.status === 'out_for_delivery' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          ord.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-200 text-slate-800'
                        }`}>
                          {ord.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{ord.items_summary}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">₹{ord.total_amount}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{ord.created_at?.split('T')[0] || 'Today'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> Delivery: {ord.delivery_address}</span>
                    <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Payment: {ord.payment_method}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  🛵
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Express Medicine Checkout</h3>
                  <p className="text-xs text-slate-500">Estimated delivery in 30 minutes to your address.</p>
                </div>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Items List */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Ordered Items ({cartItemCount})</label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {cartList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900">{item.name}</span>
                      <span className="text-[11px] text-slate-500 block">₹{item.price} x {item.qty}</span>
                    </div>
                    <span className="font-black text-slate-900">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Address
              </label>
              <textarea
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold bg-white"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Select Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-extrabold bg-white"
              >
                <option value="UPI (GPay / PhonePe)">📱 UPI (GPay / PhonePe / Paytm)</option>
                <option value="Cash on Delivery">💵 Cash on Delivery</option>
                <option value="Credit / Debit Card">💳 Credit / Debit Card</option>
                <option value="Pay Later">⚡ Pay Later</option>
              </select>
            </div>

            {/* Price Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-bold">₹{cartSubtotal}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Express Delivery Fee (30 mins)</span>
                <span className="font-bold text-emerald-700">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-emerald-700">₹{cartGrandTotal}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingOrder}
                onClick={handlePlaceOrder}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2"
              >
                {submittingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                <span>Place Express Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Order Modal */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Order Placed Successfully! 🛵</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your medicine delivery order <span className="font-mono font-bold text-slate-900">#{confirmedOrder.id}</span> for <span className="font-bold text-emerald-700">₹{confirmedOrder.total_amount}</span> has been confirmed.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-200 text-left">
              <div>Est. Delivery: <span className="font-bold text-emerald-700">Within 30 Minutes</span></div>
              <div>Address: <span className="font-semibold text-slate-800">{confirmedOrder.delivery_address}</span></div>
              <div>Payment: <span className="font-semibold text-slate-800">{confirmedOrder.payment_method}</span></div>
            </div>

            <button
              onClick={() => setConfirmedOrder(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg transition-colors"
            >
              Done & Track Order Status
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
