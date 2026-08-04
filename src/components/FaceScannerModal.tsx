import React, { useState } from 'react';
import { Search, X, Users, CheckCircle2, UserPlus, GraduationCap, Building } from 'lucide-react';
import { Student } from '../types';

interface FaceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSelectStudent: (student: Student, confidenceScore?: number) => void;
  title?: string;
}

export const FaceScannerModal: React.FC<FaceScannerModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelectStudent,
  title = 'Pilih / Cari Siswa (Manual)'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Quick Manual Form Mode
  const [isQuickManualMode, setIsQuickManualMode] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualClass, setManualClass] = useState('');
  const [manualUnit, setManualUnit] = useState('SD Lazuardi');

  if (!isOpen) return null;

  // Unique Units & Classes
  const availableUnits = Array.from(new Set(students.map(s => s.unitName || 'SD Lazuardi'))).filter(Boolean);
  const availableClasses = Array.from(new Set(students.map(s => s.className || '1-A'))).filter(Boolean);

  // Filtered list
  const filteredStudents = students.filter(s => {
    const matchUnit = selectedUnit === 'ALL' || (s.unitName || '').includes(selectedUnit);
    const matchClass = selectedClass === 'ALL' || s.className === selectedClass;
    const matchQuery = 
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nis || '').includes(searchQuery) ||
      (s.className || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.unitName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchUnit && matchClass && matchQuery;
  });

  const handleSelect = (student: Student) => {
    onSelectStudent(student, 100);
    onClose();
  };

  const handleCreateQuickManualStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName || !manualClass) {
      alert('Silakan isi Nama dan Kelas siswa.');
      return;
    }

    const tempStudent: Student = {
      id: `temp-${Date.now()}`,
      nis: `NIS-${Math.floor(1000 + Math.random() * 9000)}`,
      name: manualName,
      gender: 'L',
      unitId: 'unit-1',
      unitName: manualUnit,
      classId: 'cls-1',
      className: manualClass,
      parentName: 'Orang Tua Siswa',
      parentPhone: '08123456789',
      address: 'Depok, Jawa Barat',
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      hasFaceData: true
    };

    onSelectStudent(tempStudent, 100);
    setManualName('');
    setManualClass('');
    setIsQuickManualMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 rounded-xl border border-blue-400/30 text-sky-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{title}</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                Cari dan pilih siswa berdasarkan Nama & Kelas untuk pencatatan presensi
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-blue-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toggle Mode Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 pt-3">
          <div className="flex gap-2">
            <button
              onClick={() => setIsQuickManualMode(false)}
              className={`flex items-center gap-2 px-4 py-2 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
                !isQuickManualMode
                  ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Pilih dari Daftar Siswa
            </button>
            <button
              onClick={() => setIsQuickManualMode(true)}
              className={`flex items-center gap-2 px-4 py-2 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
                isQuickManualMode
                  ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Ketik Manual (Nama & Kelas Baru)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!isQuickManualMode ? (
            /* Search & Select List */
            <div className="space-y-4">
              
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik Nama Siswa, NIS, atau Kelas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">Semua Unit</option>
                  {availableUnits.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>

                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">Semua Kelas</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <span className="text-[11px] text-slate-400 ml-auto font-mono">
                  Ditemukan: {filteredStudents.length}
                </span>
              </div>

              {/* Student List Scrollable */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 space-y-2">
                    <p className="text-xs">Siswa tidak ditemukan dengan kata kunci tersebut.</p>
                    <button
                      onClick={() => setIsQuickManualMode(true)}
                      className="text-xs text-blue-600 font-bold underline hover:text-blue-800"
                    >
                      + Ketik Nama & Kelas secara Manual
                    </button>
                  </div>
                ) : (
                  filteredStudents.map(student => (
                    <div
                      key={student.id}
                      onClick={() => handleSelect(student)}
                      className="p-3 hover:bg-blue-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-xs group-hover:text-blue-700">{student.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-slate-500">NIS: {student.nis}</span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.2 rounded">
                              {student.className}
                            </span>
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded">
                              {student.unitName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button className="px-3 py-1.5 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors">
                        Pilih
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Quick Manual Entry Mode */
            <form onSubmit={handleCreateQuickManualStudent} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                Lengkapi isian manual Nama & Kelas siswa jika belum terdaftar di sistem.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap siswa..."
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1-A, 7-B..."
                    value={manualClass}
                    onChange={(e) => setManualClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Sekolah</label>
                  <select
                    value={manualUnit}
                    onChange={(e) => setManualUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="SD Lazuardi">SD Lazuardi</option>
                    <option value="SMP Lazuardi">SMP Lazuardi</option>
                    <option value="SMA Lazuardi">SMA Lazuardi</option>
                    <option value="Pre-School & Kindergarten">Pre-School & Kindergarten</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickManualMode(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs"
                >
                  Kembali ke Daftar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20"
                >
                  Gunakan Siswa Ini
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Pilih siswa untuk memasukkan ke dalam formulir presensi.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
