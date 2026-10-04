import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Plus, 
  Trash2, 
  UploadCloud, 
  Link2, 
  FileText, 
  Type, 
  Paperclip, 
  CheckCircle2, 
  Stethoscope, 
  ImageIcon,
  Clock,
  Pill
} from 'lucide-react';

interface IssuePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPatientName?: string;
  defaultPatientId?: string;
  defaultDoctorName?: string;
  defaultClinicName?: string;
}

export const IssuePrescriptionModal: React.FC<IssuePrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultPatientName = '',
  defaultPatientId = '',
  defaultDoctorName = '',
  defaultClinicName = '',
}) => {
  const { user } = useAuth();
  const [entryMode, setEntryMode] = useState<'manual' | 'document'>('manual');
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [patientId, setPatientId] = useState(defaultPatientId || '');
  const [patientsList, setPatientsList] = useState<{ id: string; name: string; email?: string }[]>([]);

  // Manual Medicine List State (Starts clean and empty)
  const [medicines, setMedicines] = useState([
    {
      medicine_name: '',
      dosage: '',
      duration: '',
      morning: false,
      afternoon: false,
      night: false,
      instructions: '',
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      setPatientName(defaultPatientName || '');
      setPatientId(defaultPatientId || '');
      setDoctorName(defaultDoctorName || (user?.role === 'doctor' ? user?.name || '' : ''));
      setClinicName(defaultClinicName || '');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setDocumentUrl('');
      setMedicines([
        {
          medicine_name: '',
          dosage: '',
          duration: '',
          morning: false,
          afternoon: false,
          night: false,
          instructions: '',
        },
      ]);
      fetchPatients();
    }
  }, [isOpen, defaultPatientName, defaultPatientId, defaultDoctorName, defaultClinicName, user]);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      if (res.data.success) {
        setPatientsList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch patients list for prescription modal', err);
    }
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      {
        medicine_name: '',
        dosage: '',
        duration: '',
        morning: false,
        afternoon: false,
        night: false,
        instructions: '',
      },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: string, value: any) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const parseDriveOrCloudUrl = (url: string) => {
    if (!url) return '';
    const driveMatch = url.match(/\/file\/d\/([^\/]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
    }
    return url;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setDocumentUrl(res.data.url);
          showNotify('Prescription document file uploaded successfully!');
        }
      } catch (err) {
        console.error('File upload fallback to data URL', err);
        setDocumentUrl(fileData);
        showNotify('Prescription document attached!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formattedMeds = medicines.map((m) => {
        const timings = [];
        if (m.morning) timings.push('Morning');
        if (m.afternoon) timings.push('Afternoon');
        if (m.night) timings.push('Night');
        return {
          ...m,
          timings_display: timings.length > 0 ? timings.join(', ') : 'Daily',
        };
      });

      const payload = {
        patient_id: patientId || defaultPatientId || '',
        patient_name: patientName,
        doctor_name: doctorName,
        clinic_name: clinicName || defaultClinicName || 'Tapza Care Hospital',
        date,
        notes,
        document_url: parseDriveOrCloudUrl(documentUrl),
        medicines: entryMode === 'manual' ? formattedMeds : [],
      };

      const res = await api.post('/prescriptions', payload);
      if (res.data.success) {
        showNotify('Prescription issued and synced to database!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to issue prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-black">
              Rx
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Issue New Digital Prescription</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manually type prescribed medicines or upload prescription document file.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl font-bold text-xs">
          <button
            type="button"
            onClick={() => setEntryMode('manual')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              entryMode === 'manual'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Manually Type Prescription</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('document')}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              entryMode === 'document'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Upload / Paste File Document</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* General Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Patient Name</label>
              <input
                type="text"
                required
                list="registered-patients-list"
                value={patientName}
                onChange={(e) => {
                  const val = e.target.value;
                  setPatientName(val);
                  const found = patientsList.find((p) => p.name.toLowerCase() === val.toLowerCase());
                  if (found) setPatientId(found.id);
                }}
                placeholder="Enter Patient Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white"
              />
              <datalist id="registered-patients-list">
                {patientsList.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.email || p.id})
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Prescribing Doctor</label>
              <input
                type="text"
                required
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Enter Doctor Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Prescription Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white"
              />
            </div>
          </div>

          {/* MODE 1: MANUALLY TYPE MEDICINES */}
          {entryMode === 'manual' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                  <span>Prescribed Medicines List ({medicines.length})</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddMedicineRow}
                  className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-extrabold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Medicine
                </button>
              </div>

              <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                {medicines.map((med, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-slate-800 text-[11px]">Medicine #{idx + 1}</span>
                      {medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicineRow(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Remove Medicine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Medicine Name</label>
                        <input
                          type="text"
                          required
                          value={med.medicine_name}
                          onChange={(e) => handleMedicineChange(idx, 'medicine_name', e.target.value)}
                          placeholder="e.g. Paracetamol 500mg"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Dosage</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                          placeholder="e.g. 1 Tablet / 5ml"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold bg-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                          placeholder="e.g. 5 days"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-bold bg-white text-xs"
                        />
                      </div>
                    </div>

                    {/* Dosage Timings Checkboxes */}
                    <div className="flex flex-wrap items-center gap-4 bg-white p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">Timings:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={med.morning}
                          onChange={(e) => handleMedicineChange(idx, 'morning', e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Morning</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={med.afternoon}
                          onChange={(e) => handleMedicineChange(idx, 'afternoon', e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Afternoon</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={med.night}
                          onChange={(e) => handleMedicineChange(idx, 'night', e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Night</span>
                      </label>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                        placeholder="Special instructions (e.g. Take twice daily after food)"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 font-semibold bg-white text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: UPLOAD OR PASTE FILE DOCUMENT */}
          {entryMode === 'document' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Prescription Document / File</span>
                <span className="text-teal-600 text-[10px] font-semibold">PDF / Image / Google Drive / URL</span>
              </label>

              <div className="space-y-3">
                <label className="cursor-pointer px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-sm inline-flex items-center gap-2 transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Prescription File (PDF / Image)</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                <div className="relative">
                  <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(parseDriveOrCloudUrl(e.target.value))}
                    placeholder="Or paste Google Drive link / Document URL / Data URL"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  />
                </div>

                {documentUrl && (
                  <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold rounded-xl flex items-center gap-2 truncate">
                    <Paperclip className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="truncate">Attached: {documentUrl}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Doctor Advice / Notes */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Doctor Advice & Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter additional clinical advice, dietary guidelines, or notes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>{submitting ? 'Issuing Prescription...' : 'Issue Prescription'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
