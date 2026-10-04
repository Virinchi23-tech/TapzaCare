import React, { useState, useEffect } from 'react';
import { Prescription } from '@tapza/shared-types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, Clock, Download, Stethoscope, AlertCircle, Loader2, LogIn, Plus, Paperclip, Eye, ExternalLink } from 'lucide-react';
import { IssuePrescriptionModal } from '../components/IssuePrescriptionModal';

export const PrescriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [loggedDoses, setLoggedDoses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/prescriptions');
      if (res.data.success && res.data.data.length > 0) {
        setPrescriptions(res.data.data);
        setSelectedRx(res.data.data[0]);
      } else {
        setPrescriptions([]);
        setSelectedRx(null);
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDose = async (medId: string, medName: string) => {
    const nextState = !loggedDoses[medId];
    setLoggedDoses((prev) => ({ ...prev, [medId]: nextState }));

    try {
      await api.post('/dose-logs', {
        prescription_id: selectedRx?.id,
        medicine_name: medName,
        status: nextState ? 'taken' : 'pending',
      });
    } catch (err) {
      console.error('Failed to log dose status', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-100 shadow-2xl text-center space-y-4">
        <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-teal-100">
          <FileText className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please sign in to view your digital prescriptions and log medicine intake.
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Modal Dialog */}
      <IssuePrescriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchPrescriptions()}
        defaultPatientName={user?.role === 'patient' ? user?.name : ''}
        defaultPatientId={user?.role === 'patient' ? user?.id : ''}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Digital Prescriptions</h1>
          <p className="text-sm text-slate-500">View doctor recommendations and log daily medication intake.</p>
        </div>
        {(user?.role === 'doctor' || user?.role === 'admin') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Issue / Upload Prescription
          </button>
        )}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-teal-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">No active prescriptions</h3>
            <p className="text-xs text-slate-400 mt-1">Prescriptions issued by your doctor in the Doctor Portal will appear here.</p>
          </div>
          {(user?.role === 'doctor' || user?.role === 'admin') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Issue / Upload Prescription
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Prescription List Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescription History</h3>
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                onClick={() => setSelectedRx(rx)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedRx?.id === rx.id
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md scale-102'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-teal-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-extrabold">{rx.doctor_name}</h4>
                  <span className={`text-[10px] font-bold ${selectedRx?.id === rx.id ? 'text-teal-100' : 'text-slate-400'}`}>
                    {rx.date}
                  </span>
                </div>
                <div className={`text-xs font-semibold ${selectedRx?.id === rx.id ? 'text-teal-100' : 'text-slate-700'}`}>
                  Patient: <span className="font-extrabold">{(rx as any).patient_name || 'Patient'}</span>
                </div>
                <p className={`text-[11px] mt-0.5 ${selectedRx?.id === rx.id ? 'text-teal-100' : 'text-slate-400'}`}>
                  {rx.clinic_name} • {rx.medicines?.length || 0} Meds
                  {(rx as any).document_url && ' • 📁 File Attached'}
                </p>
              </div>
            ))}
          </div>

          {/* Selected Prescription Details */}
          {selectedRx && (
            <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 space-y-6">
              {/* Doctor Header */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black">
                    Rx
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{selectedRx.doctor_name}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Patient: <span className="text-teal-700 font-black bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{(selectedRx as any).patient_name || 'Patient'}</span> • {selectedRx.clinic_name} • Issued on {selectedRx.date}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if ((selectedRx as any).document_url) {
                      window.open((selectedRx as any).document_url, '_blank');
                    } else {
                      alert(`Downloading PDF prescription for ${selectedRx.id}...`);
                    }
                  }}
                  className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download / View Document
                </button>
              </div>

              {/* Attached Prescription Document File (if available) */}
              {(selectedRx as any).document_url && (
                <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-teal-950 text-xs">
                      <Paperclip className="w-4 h-4 text-teal-700" />
                      <span>Attached Prescription Document File</span>
                    </div>
                    <a
                      href={(selectedRx as any).document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Original File <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {(selectedRx as any).document_url.match(/\.(jpg|jpeg|png|webp)/i) || (selectedRx as any).document_url.startsWith('data:image') ? (
                    <div className="mt-2 rounded-xl overflow-hidden border border-teal-200 max-h-72 bg-white flex items-center justify-center p-2">
                      <img src={(selectedRx as any).document_url} alt="Prescription Document" className="max-h-64 object-contain rounded-lg" />
                    </div>
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-teal-200 text-xs text-slate-600 font-mono truncate">
                      {(selectedRx as any).document_url}
                    </div>
                  )}
                </div>
              )}

              {/* Medicines Schedule */}
              {selectedRx.medicines && selectedRx.medicines.length > 0 && (
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">Prescribed Medication</h4>
                  <div className="space-y-3">
                    {selectedRx.medicines?.map((med) => {
                      const isTaken = loggedDoses[med.id];
                      return (
                        <div
                          key={med.id}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                            isTaken ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200/60'
                          }`}
                        >
                          <div>
                            <h5 className="text-sm font-extrabold text-slate-900 mb-1">{med.medicine_name}</h5>
                            <p className="text-xs font-semibold text-teal-700 mb-1">{med.dosage} • {med.duration}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="px-2 py-0.5 bg-white rounded border border-slate-200 font-bold">
                                Timings: {med.timings_display}
                              </span>
                              <span>{med.instructions}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleDose(med.id, med.medicine_name)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              isTaken
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white text-slate-700 border border-slate-300 hover:border-teal-500'
                            }`}
                          >
                            <CheckCircle2 className={`w-4 h-4 ${isTaken ? 'text-white' : 'text-slate-400'}`} />
                            {isTaken ? 'Dose Taken' : 'Mark Taken'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Doctor Notes */}
              {selectedRx.notes && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 text-amber-900">
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-1">Doctor Advice & Notes</h5>
                  <p className="text-xs leading-relaxed">{selectedRx.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
