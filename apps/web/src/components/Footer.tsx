import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-black">
                +
              </div>
              <span className="text-xl font-bold text-white tracking-tight">TAPZA CARE</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Compassionate care for you and your family. Book top doctors, get instant digital prescriptions, and track health vitals in one place.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/doctors" className="hover:text-teal-400 transition-colors">Find Doctors</Link></li>
              <li><Link to="/services" className="hover:text-teal-400 transition-colors">Healthcare Services</Link></li>
              <li><Link to="/bookings" className="hover:text-teal-400 transition-colors">My Appointments</Link></li>
              <li><Link to="/prescriptions" className="hover:text-teal-400 transition-colors">Digital Prescriptions</Link></li>
              <li><Link to="/reminders" className="hover:text-teal-400 transition-colors">Medicine Reminders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Clinics & Hubs</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>CarePlus Hub: Road No 36, Jubilee Hills, Hyderabad</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Tapza Center: Banjara Hills Near Metro, Hyderabad</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">24/7 Emergency Support</h4>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-3">
              <div className="text-xs text-slate-400 font-semibold mb-1">Emergency Helpline</div>
              <div className="text-lg font-black text-teal-400 flex items-center gap-2">
                <Phone className="w-5 h-5 animate-bounce" />
                +91 1800 123 9999
              </div>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-teal-400" />
              support@tapzacare.com
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 Tapza Care Technologies Ltd. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Clinical Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
