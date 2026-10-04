import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ReminderNotifier } from './components/ReminderNotifier';

import { HomePage } from './pages/HomePage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { BookingsPage } from './pages/BookingsPage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { RemindersPage } from './pages/RemindersPage';
import { FamilyPage } from './pages/FamilyPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPortal } from './pages/AdminPortal';
import { DoctorPortal } from './pages/DoctorPortal';
import { PharmacyPage } from './pages/PharmacyPage';
import { PharmacistPortal } from './pages/PharmacistPortal';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
            <Header />
            <ReminderNotifier />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/doctors" element={<DoctorsPage />} />
                <Route path="/doctors/:id" element={<DoctorDetailPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                <Route path="/prescriptions" element={<PrescriptionsPage />} />
                <Route path="/reminders" element={<RemindersPage />} />
                <Route path="/family" element={<FamilyPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/pharmacy" element={<PharmacyPage />} />
                <Route path="/pharmacist" element={<PharmacistPortal />} />
                <Route path="/admin" element={<AdminPortal />} />
                <Route path="/doctor" element={<DoctorPortal />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
