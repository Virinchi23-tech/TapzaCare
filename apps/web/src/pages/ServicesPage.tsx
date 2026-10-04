import React, { useState, useEffect } from 'react';
import { HealthcareService } from '@tapza/shared-types';
import { api } from '../lib/api';
import { Stethoscope, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceBookingModal } from '../components/ServiceBookingModal';

const FALLBACK_SERVICES: HealthcareService[] = [
  {
    id: 's-1',
    name: 'Emergency Care',
    category: 'Emergency',
    description: '24/7 Rapid response medical emergency and trauma care.',
    price: 2500,
    icon_name: 'ambulance',
    promotional_badge: '24/7 Available',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500',
  },
  {
    id: 's-2',
    name: 'Pediatric Department',
    category: 'Consultation',
    description: 'Specialized medical care and wellness checks for infants & children.',
    price: 1000,
    icon_name: 'baby',
    promotional_badge: 'Popular',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500',
  },
  {
    id: 's-3',
    name: 'Cardiology',
    category: 'Specialist',
    description: 'Advanced cardiac evaluation, ECG, and echocardiogram checks.',
    price: 1500,
    icon_name: 'heart-pulse',
    promotional_badge: 'Recommended',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500',
  },
  {
    id: 's-4',
    name: 'Full Body Health Checkup',
    category: 'Lab Tests',
    description: 'Comprises 64 essential health parameters including Liver & Kidney profile.',
    price: 1999,
    icon_name: 'test-tube',
    promotional_badge: '50% OFF',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=500',
  },
  {
    id: 's-5',
    name: 'General Health Checkup',
    category: 'Consultation',
    description: 'Routine physical checkup, vitals check, and prescription advisory.',
    price: 800,
    icon_name: 'stethoscope',
    promotional_badge: 'Top Pick',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500',
  },
];

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<HealthcareService[]>(FALLBACK_SERVICES);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<HealthcareService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.get('/services');
        if (res.data.success) {
          setServices(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch services', err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const handleOpenBooking = (service: HealthcareService) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Service Test Booking Modal */}
      <ServiceBookingModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Healthcare Services</h1>
        <p className="text-sm text-slate-500">Explore preventive packages, lab checkups, and specialized clinical care.</p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-teal-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={service.image_url || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500'}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {service.promotional_badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white text-xs font-black rounded-lg shadow-md">
                      {service.promotional_badge}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <span className="text-[10px] font-extrabold uppercase text-teal-600 tracking-wider bg-teal-50 px-2.5 py-1 rounded-md mb-2 inline-block">
                    {service.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">{service.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{service.description}</p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Price</span>
                  <span className="text-xl font-black text-slate-900">₹{service.price}</span>
                </div>

                <button
                  onClick={() => handleOpenBooking(service)}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  Book Service <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
