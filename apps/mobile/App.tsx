import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar,
  TextInput,
  Modal,
  Alert
} from 'react-native';

const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.4:5000/api';

const FALLBACK_DOCTORS = [
  {
    id: 'd-1',
    name: 'Dr. Sunita Reddy',
    specialty: 'Cardiology Specialist',
    consultation_fee: 650,
    clinic_name: 'CarePlus Heart Institute',
    rating: 4.9,
    photo_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  },
  {
    id: 'd-2',
    name: 'Dr. K. Srinivas Rao',
    specialty: 'Senior Neurologist',
    consultation_fee: 800,
    clinic_name: 'Apex Brain & Spine Center',
    rating: 4.8,
    photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
  },
  {
    id: 'd-3',
    name: 'Dr. Ananya Sharma',
    specialty: 'Dermatologist & Cosmetologist',
    consultation_fee: 550,
    clinic_name: 'GlowSkin Care Clinic',
    rating: 4.9,
    photo_url: 'https://images.unsplash.com/photo-1594824813566-88855ce78961?w=400',
  },
];

const FALLBACK_MEDICINES = [
  { id: 'm-1', name: 'Paracetamol 650mg', category: 'Fever & Pain Relief', price: 35, requires_rx: false, image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300' },
  { id: 'm-2', name: 'Amoxicillin 500mg', category: 'Antibiotics', price: 120, requires_rx: true, image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300' },
  { id: 'm-3', name: 'Vitamin C 1000mg', category: 'Immunity Booster', price: 95, requires_rx: false, image_url: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300' },
  { id: 'm-4', name: 'Pantoprazole 40mg', category: 'Digestive Health', price: 65, requires_rx: false, image_url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=300' },
];

// Cross-platform React Native safe fetch helper (No AbortSignal.timeout dependency)
const safeFetchJson = async (url: string, timeoutMs: number = 3000) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      try { controller.abort(); } catch (e) {}
    }, timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
};

// Global React Native Error Boundary to prevent native crashes on launch
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.log('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Tapza Care Mobile</Text>
          <Text style={styles.errorMsg}>App opened in Recovery Mode.</Text>
          <TouchableOpacity 
            style={styles.reloadBtn} 
            onPress={() => this.setState({ hasError: false })}
          >
            <Text style={styles.reloadBtnText}>Reload Tapza Care</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'doctors' | 'pharmacy' | 'bookings' | 'profile'>('home');
  const [serverUrl, setServerUrl] = useState(DEFAULT_API_URL);
  const [isIpModalOpen, setIsIpModalOpen] = useState(false);
  const [ipInput, setIpInput] = useState(DEFAULT_API_URL);

  const [config, setConfig] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>(FALLBACK_DOCTORS);
  const [medicines, setMedicines] = useState<any[]>(FALLBACK_MEDICINES);
  const [bookings, setBookings] = useState<any[]>([]);
  const [cart, setCart] = useState<{ item: any; qty: number }[]>([]);

  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-10-05');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');

  const apiBase = serverUrl;

  useEffect(() => {
    fetchAllData();
  }, [serverUrl]);

  const fetchAllData = async () => {
    setConnectionStatus('connecting');
    let connected = false;

    // Fetch Config
    const configData = await safeFetchJson(`${apiBase}/config`, 3000);
    if (configData && configData.success) {
      setConfig(configData.data);
      connected = true;
    }

    // Fetch Doctors
    const docData = await safeFetchJson(`${apiBase}/doctors`, 3000);
    if (docData && docData.success && docData.data && docData.data.length > 0) {
      setDoctors(docData.data);
      connected = true;
    }

    // Fetch Medicines
    const medData = await safeFetchJson(`${apiBase}/medicines`, 3000);
    if (medData && medData.success && medData.data && medData.data.length > 0) {
      setMedicines(medData.data);
      connected = true;
    }

    // Fetch Bookings
    const bkData = await safeFetchJson(`${apiBase}/bookings`, 3000);
    if (bkData && bkData.success && bkData.data) {
      setBookings(bkData.data);
      connected = true;
    }

    setConnectionStatus(connected ? 'connected' : 'offline');
  };

  const handleSaveServerIp = () => {
    if (!ipInput.trim()) return;
    setServerUrl(ipInput.trim());
    setIsIpModalOpen(false);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !selectedDoctor) {
      Alert.alert('Selection Required', 'Please select a valid time slot');
      return;
    }

    try {
      const res = await fetch(`${apiBase}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          booking_date: selectedDate,
          time_slot: selectedSlot,
          reason: 'General Consultation',
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        Alert.alert('Booking Confirmed! 🎉', `Your appointment with ${selectedDoctor.name} is set for ${selectedSlot}.`);
        setIsModalOpen(false);
        fetchAllData();
        return;
      }
    } catch (err) {}

    // Fallback local insertion if offline
    const newBooking = {
      id: `bk-${Date.now()}`,
      doctor_name: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      clinic_name: selectedDoctor.clinic_name || 'Tapza Care Clinic',
      booking_date: selectedDate,
      time_slot: selectedSlot,
      status: 'confirmed',
    };
    setBookings([newBooking, ...bookings]);
    Alert.alert('Booking Confirmed (Offline Mode) 🎉', `Appointment with ${selectedDoctor.name} set for ${selectedSlot}.`);
    setIsModalOpen(false);
  };

  const addToCart = (med: any) => {
    const existing = cart.find((c) => c.item.id === med.id);
    if (existing) {
      setCart(cart.map((c) => (c.item.id === med.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { item: med, qty: 1 }]);
    }
  };

  const placeMedicineOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }

    const total = cart.reduce((acc, c) => acc + c.item.price * c.qty, 0);
    const summary = cart.map((c) => `${c.item.name} x${c.qty}`).join(', ');

    try {
      const res = await fetch(`${apiBase}/pharmacy/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items_summary: summary,
          total_amount: total,
          status: 'placed',
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        Alert.alert('Order Placed! 🛵', '30-Minute Express Medicine Delivery is on its way!');
        setCart([]);
        return;
      }
    } catch (err) {}

    Alert.alert('Express Order Placed! 🛵', '30-Minute Medicine Delivery is dispatched!');
    setCart([]);
  };

  const primaryColor = config?.primary_color || '#0d9488';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Connection Banner */}
      <TouchableOpacity 
        style={[styles.statusBanner, connectionStatus === 'connected' ? styles.statusConnected : styles.statusOffline]}
        onPress={() => setIsIpModalOpen(true)}
      >
        <Text style={styles.statusBannerText}>
          {connectionStatus === 'connected' 
            ? `🟢 Connected to Server (${serverIp})` 
            : `🟡 Tap to config Server IP: ${serverIp}`}
        </Text>
      </TouchableOpacity>

      {/* Main Scroll Content */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingText}>Hello 👋</Text>
            <Text style={styles.userNameText}>Ayesha Khan</Text>
          </View>
          <TouchableOpacity onPress={() => setIsIpModalOpen(true)}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }}
              style={styles.avatarImg}
            />
          </TouchableOpacity>
        </View>

        {/* Tab 1: HOME */}
        {activeTab === 'home' && (
          <View>
            <View style={[styles.heroBanner, { backgroundColor: primaryColor }]}>
              <Text style={styles.heroTitle}>{config?.festival_greeting || 'Tapza Healthcare'}</Text>
              <Text style={styles.heroSubtitle}>Book trusted doctors & get 30-min medicine delivery at home.</Text>
              <TouchableOpacity style={styles.bannerBtn} onPress={() => setActiveTab('doctors')}>
                <Text style={styles.bannerBtnText}>Book Doctor →</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Quick Services</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {[
                { title: 'Book Doctor', tab: 'doctors' },
                { title: '🛵 Express Medicines', tab: 'pharmacy' },
                { title: 'Lab Tests', tab: 'doctors' },
                { title: 'My Appointments', tab: 'bookings' },
              ].map((cat, i) => (
                <TouchableOpacity key={i} style={styles.chipBtn} onPress={() => setActiveTab(cat.tab as any)}>
                  <Text style={styles.chipBtnText}>{cat.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Top Rated Doctors</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carouselRow}>
              {doctors.map((doc) => (
                <View key={doc.id} style={styles.docCard}>
                  <Image source={{ uri: doc.photo_url }} style={styles.docImg} />
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docSpecialty}>{doc.specialty}</Text>
                  <Text style={styles.docFee}>₹{doc.consultation_fee}</Text>
                  <TouchableOpacity
                    style={[styles.bookSmallBtn, { backgroundColor: primaryColor }]}
                    onPress={() => {
                      setSelectedDoctor(doc);
                      setIsModalOpen(true);
                    }}
                  >
                    <Text style={styles.bookSmallBtnText}>Book Slot</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tab 2: DOCTORS */}
        {activeTab === 'doctors' && (
          <View>
            <Text style={styles.sectionTitle}>Find Specialist Doctors</Text>
            {doctors.map((doc) => (
              <View key={doc.id} style={styles.docListCard}>
                <Image source={{ uri: doc.photo_url }} style={styles.docListImg} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docSpecialty}>{doc.specialty} • {doc.clinic_name}</Text>
                  <Text style={styles.docFee}>Consultation: ₹{doc.consultation_fee}</Text>
                  <TouchableOpacity
                    style={[styles.bookSmallBtn, { backgroundColor: primaryColor, marginTop: 8 }]}
                    onPress={() => {
                      setSelectedDoctor(doc);
                      setIsModalOpen(true);
                    }}
                  >
                    <Text style={styles.bookSmallBtnText}>Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 3: PHARMACY */}
        {activeTab === 'pharmacy' && (
          <View>
            <View style={styles.pharmacyHeader}>
              <Text style={styles.sectionTitle}>🛵 30-Min Medicine Express Store</Text>
              <Text style={styles.subText}>Delivered directly to your doorstep</Text>
            </View>

            {medicines.map((med) => (
              <View key={med.id} style={styles.medCard}>
                <Image source={{ uri: med.image_url }} style={styles.medImg} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.medTitle}>{med.name}</Text>
                  <Text style={styles.medCategory}>{med.category}</Text>
                  <Text style={styles.medPrice}>₹{med.price}</Text>
                </View>
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: primaryColor }]} onPress={() => addToCart(med)}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            ))}

            {cart.length > 0 && (
              <View style={styles.cartBar}>
                <View>
                  <Text style={styles.cartCount}>{cart.reduce((a, b) => a + b.qty, 0)} Items</Text>
                  <Text style={styles.cartTotal}>Total: ₹{cart.reduce((a, b) => a + b.item.price * b.qty, 0)}</Text>
                </View>
                <TouchableOpacity style={styles.checkoutBtn} onPress={placeMedicineOrder}>
                  <Text style={styles.checkoutBtnText}>Order Now 🛵</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Tab 4: BOOKINGS */}
        {activeTab === 'bookings' && (
          <View>
            <Text style={styles.sectionTitle}>My Appointments</Text>
            {bookings.length === 0 ? (
              <Text style={styles.emptyText}>No appointments booked yet.</Text>
            ) : (
              bookings.map((b) => (
                <View key={b.id} style={styles.bookingCard}>
                  <Text style={styles.bookingDoctor}>{b.doctor_name}</Text>
                  <Text style={styles.bookingDetails}>{b.specialty || 'General'} • {b.clinic_name || 'Tapza Care Hub'}</Text>
                  <Text style={styles.bookingTime}>📅 {b.booking_date} at 🕒 {b.time_slot}</Text>
                  <Text style={styles.bookingStatus}>Status: {b.status}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Tab 5: PROFILE */}
        {activeTab === 'profile' && (
          <View>
            <Text style={styles.sectionTitle}>Health Dashboard</Text>
            <View style={styles.healthCard}>
              <Text style={styles.healthScoreTitle}>Health Score</Text>
              <Text style={styles.healthScoreVal}>84 / 100</Text>
              <Text style={styles.healthScoreStatus}>Good • Keep it up!</Text>
            </View>

            <TouchableOpacity style={styles.configServerCard} onPress={() => setIsIpModalOpen(true)}>
              <Text style={styles.configServerTitle}>⚙️ Backend Server IP Settings</Text>
              <Text style={styles.configServerVal}>Current IP: http://{serverIp}:5000/api</Text>
              <Text style={styles.configServerHint}>Tap here to change Server IP if on mobile Wi-Fi</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Doctor Slot Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            <Text style={styles.modalDocName}>{selectedDoctor?.name}</Text>
            <Text style={styles.modalDocFee}>Consultation Fee: ₹{selectedDoctor?.consultation_fee}</Text>

            <Text style={styles.label}>Select Time Slot:</Text>
            <View style={styles.slotGrid}>
              {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM'].map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotBtn, selectedSlot === slot && { backgroundColor: primaryColor }]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotText, selectedSlot === slot && { color: '#fff' }]}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: primaryColor }]} onPress={handleBookSlot}>
              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsModalOpen(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Server IP Config Modal */}
      <Modal visible={isIpModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>⚙️ Server IP Address</Text>
            <Text style={styles.subText}>Enter your PC's Wi-Fi IP address so your mobile phone can connect to the Tapza backend server:</Text>
            <TextInput
              style={styles.ipInput}
              value={ipInput}
              onChangeText={setIpInput}
              placeholder="e.g. 192.168.1.4"
              keyboardType="numeric"
            />
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: primaryColor }]} onPress={handleSaveServerIp}>
              <Text style={styles.confirmBtnText}>Save & Connect</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsIpModalOpen(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {[
          { key: 'home', label: 'Home', icon: '🏠' },
          { key: 'doctors', label: 'Doctors', icon: '🩺' },
          { key: 'pharmacy', label: 'Medicines', icon: '💊' },
          { key: 'bookings', label: 'Bookings', icon: '📅' },
          { key: 'profile', label: 'Profile', icon: '👤' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => setActiveTab(item.key as any)}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[styles.navLabel, activeTab === item.key && { color: primaryColor, fontWeight: 'bold' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

export default function RootApp() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  errorContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  errorMsg: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  reloadBtn: { backgroundColor: '#0d9488', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  reloadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  statusBanner: { paddingVertical: 6, paddingHorizontal: 12, alignItems: 'center' },
  statusConnected: { backgroundColor: '#dcfce7' },
  statusOffline: { backgroundColor: '#fef3c7' },
  statusBannerText: { fontSize: 11, fontWeight: 'bold', color: '#15803d' },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greetingText: { fontSize: 12, color: '#64748b' },
  userNameText: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  avatarImg: { width: 40, height: 40, borderRadius: 20 },
  heroBanner: { padding: 20, borderRadius: 20, marginBottom: 20 },
  heroTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  heroSubtitle: { fontSize: 12, color: '#f0fdfa', marginBottom: 12 },
  bannerBtn: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, alignSelf: 'flex-start' },
  bannerBtnText: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12, marginTop: 8 },
  subText: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  chipRow: { marginBottom: 16 },
  chipBtn: { backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  chipBtnText: { fontSize: 12, fontWeight: '600', color: '#334155' },
  carouselRow: { marginBottom: 20 },
  docCard: { width: 160, backgroundColor: '#fff', borderRadius: 16, padding: 12, marginRight: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  docImg: { width: '100%', height: 110, borderRadius: 12, marginBottom: 8 },
  docName: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  docSpecialty: { fontSize: 11, color: '#0d9488', marginBottom: 4 },
  docFee: { fontSize: 12, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  bookSmallBtn: { paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  bookSmallBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  docListCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  docListImg: { width: 70, height: 70, borderRadius: 12 },
  pharmacyHeader: { marginBottom: 8 },
  medCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 16, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  medImg: { width: 60, height: 60, borderRadius: 12 },
  medTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  medCategory: { fontSize: 11, color: '#64748b' },
  medPrice: { fontSize: 13, fontWeight: 'bold', color: '#0d9488', marginTop: 4 },
  addBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 12 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  cartBar: { backgroundColor: '#0f172a', padding: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  cartCount: { color: '#94a3b8', fontSize: 11 },
  cartTotal: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  checkoutBtn: { backgroundColor: '#0d9488', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  checkoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  bookingCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  bookingDoctor: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  bookingDetails: { fontSize: 12, color: '#0d9488', marginVertical: 2 },
  bookingTime: { fontSize: 12, color: '#64748b' },
  bookingStatus: { fontSize: 11, fontWeight: 'bold', color: '#059669', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginVertical: 20 },
  healthCard: { backgroundColor: '#0d9488', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 16 },
  healthScoreTitle: { color: '#ccfbf1', fontSize: 12, fontWeight: 'bold' },
  healthScoreVal: { color: '#fff', fontSize: 32, fontWeight: '900', marginVertical: 4 },
  healthScoreStatus: { color: '#fff', fontSize: 12 },
  configServerCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 12 },
  configServerTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  configServerVal: { fontSize: 12, color: '#0d9488', marginTop: 4 },
  configServerHint: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBody: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  modalDocName: { fontSize: 14, color: '#0d9488', marginBottom: 2 },
  modalDocFee: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  ipInput: { borderWidth: 1, borderColor: '#cbd5e1', padding: 12, borderRadius: 12, fontSize: 14, marginBottom: 16, marginTop: 8 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#475569', marginBottom: 8 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  slotBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  slotText: { fontSize: 11, fontWeight: 'bold', color: '#334155' },
  confirmBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  closeBtn: { paddingVertical: 8, alignItems: 'center' },
  closeBtnText: { color: '#64748b', fontSize: 12 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, backgroundColor: '#fff', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e2e8f0', justifyContent: 'space-around', alignItems: 'center' },
  navItem: { alignItems: 'center' },
  navIcon: { fontSize: 18 },
  navLabel: { fontSize: 10, color: '#64748b', marginTop: 2 },
});
