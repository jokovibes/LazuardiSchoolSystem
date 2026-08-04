import React, { useState } from 'react';
import { 
  Sunrise, 
  Camera, 
  Search, 
  Plus, 
  Download, 
  Share2, 
  MapPin, 
  UserCheck, 
  Calendar, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Trash2,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Student, EarlyArrivalRecord, SchoolUnit, StudentClass, User } from '../../types';
import { FaceScannerModal } from '../FaceScannerModal';
import { exportToExcel, exportToPdf, shareRekapToUnit } from '../../utils/exporter';

interface EarlyArrivalViewProps {
  students: Student[];
  earlyArrivals: EarlyArrivalRecord[];
  units: SchoolUnit[];
  classes: StudentClass[];
  currentUser: User;
  onAddRecord: (record: Omit<EarlyArrivalRecord, 'id' | 'createdAt'>) => void;
  onDeleteRecord: (id: string) => void;
}

export const EarlyArrivalView: React.FC<EarlyArrivalViewProps> = ({
  students,
  earlyArrivals,
  units,
  classes,
  currentUser,
  onAddRecord,
  onDeleteRecord
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [arrivalTime, setArrivalTime] = useState<string>('06:00');
  const [assemblyLocation, setAssemblyLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Filters
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterPeriod, setFilterPeriod] = useState<'Hari' | 'Minggu' | 'Bulan'>('Hari');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSelectFromScanner = (student: Student, confidence: number) => {
    setSelectedStudent(student);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setArrivalTime(`${hours}:${mins}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Silakan pilih atau pindai wajah siswa terlebih dahulu.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    onAddRecord({
      studentId: selectedStudent.id,
      nis: selectedStudent.nis,
      studentName: selectedStudent.name,
      unitName: selectedStudent.unitName,
      className: selectedStudent.className,
      date: todayStr,
      arrivalTime: arrivalTime,
      assemblyLocation: assemblyLocation,
      officerName: currentUser.name,
      notes: notes || 'Hadir lebih awal sebelum jam operasional sekolah.',
      status: 'Datang Terlalu Pagi'
    });

    // Reset form
    setSelectedStudent(null);
    setNotes('');
    alert(`Data kedatangan dini siswa ${selectedStudent.name} berhasil disimpan!`);
  };

  // Filter records
  const filteredRecords = earlyArrivals.filter(r => {
    const matchUnit = filterUnit === 'ALL' || (r.unitName || '').includes(filterUnit);
    const matchClass = filterClass === 'ALL' || r.className === filterClass;
    const matchQuery = 
      (r.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.nis || '').includes(searchQuery) ||
      (r.assemblyLocation || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchUnit && matchClass && matchQuery;
  });

  const handleExportExcel = () => {
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Tiba', 'Lokasi Berkumpul', 'Petugas', 'Keterangan'];
    const rows = filteredRecords.map(r => [
      r.nis, r.studentName, r.className, r.unitName, r.date, r.arrivalTime, r.assemblyLocation, r.officerName, r.notes
    ]);
    exportToExcel('Siswa_Datang_Terlalu_Pagi', headers, rows, `Kedatangan_Dini_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPdf = () => {
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Jam Tiba', 'Lokasi Berkumpul', 'Petugas'];
    const rows = filteredRecords.map(r => [
      r.nis, r.studentName, r.className, r.arrivalTime, r.assemblyLocation, r.officerName
    ]);
    exportToPdf('Laporan Siswa Datang Terlalu Pagi', headers, rows, `Kedatangan_Dini_${new Date().toISOString().split('T')[0]}`);
  };

  const handleShareRekap = () => {
    const lines = filteredRecords.map(r => `- ${r.studentName} (${r.className}): Tiba ${r.arrivalTime} di ${r.assemblyLocation}`);
    shareRekapToUnit(filterUnit === 'ALL' ? 'Lazuardi Global' : filterUnit, 'Siswa Datang Terlalu Pagi', filteredRecords.length, lines);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sunrise className="w-6 h-6 text-amber-500" />
            Pencatatan Siswa Datang Terlalu Pagi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mencatat dan mengawasi siswa yang hadir di sekolah sebelum jam operasional normal (&lt; 06:15 WIB).
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-md shadow-blue-700/20 transition-all cursor-pointer shrink-0"
        >
          <Search className="w-5 h-5 text-sky-300" />
          Pilih / Cari Siswa (Nama & Kelas)
        </button>
      </div>

      {/* Form Input Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Formulir Pencatatan Kedatangan Dini
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Selected Student Card */}
          {selectedStudent ? (
            <div className="p-4 bg-blue-50/80 border-2 border-blue-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                />
                <div>
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md">
                    SISWA TERPILIH
                  </span>
                  <h4 className="font-bold text-slate-800 text-base mt-0.5">{selectedStudent.name}</h4>
                  <p className="text-xs text-slate-600">
                    NIS: <span className="font-mono font-semibold">{selectedStudent.nis}</span> &bull; {selectedStudent.className} &bull; {selectedStudent.unitName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="text-xs bg-white hover:bg-blue-100 text-blue-700 font-semibold px-3 py-1.5 rounded-lg border border-blue-300 transition-colors"
              >
                Ganti Siswa
              </button>
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 space-y-3">
              <div 
                onClick={() => setIsScannerOpen(true)}
                className="text-center cursor-pointer py-2 hover:bg-blue-50/50 rounded-xl transition-all"
              >
                <Search className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">Klik di sini untuk Cari Nama & Kelas Siswa</p>
                <p className="text-xs text-slate-500 mt-0.5">Atau pilih langsung dari daftar siswa di bawah</p>
              </div>

              {/* Direct Dropdown Selection */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Langsung Siswa</label>
                  <select
                    onChange={(e) => {
                      const found = students.find(s => s.id === e.target.value);
                      if (found) {
                        setSelectedStudent(found);
                        const now = new Date();
                        setArrivalTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
                      }
                    }}
                    defaultValue=""
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>-- Pilih Siswa dari List --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.className} - {s.unitName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Pilihan</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Belum ada siswa dipilih"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Kedatangan
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lokasi Berkumpul Siswa
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={assemblyLocation}
                  onChange={(e) => setAssemblyLocation(e.target.value)}
                  placeholder="Masukkan lokasi berkumpul (mis: Perpustakaan, Lobi, dll)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Petugas Pencatat
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={currentUser.name}
                  disabled
                  className="w-full pl-9 pr-3 py-2 bg-slate-200 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan / Alasan Datang Terlalu Pagi
            </label>
            <input
              type="text"
              placeholder="Contoh: Tugas piket OSIS, persiapan lomba, diantar orang tua kerja awal..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedStudent}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Catatan Kedatangan Dini
            </button>
          </div>

        </form>
      </div>

      {/* Rekap & Data Table Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Table Header Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Rekap Data Kedatangan Dini Siswa
            </h3>
            <p className="text-xs text-slate-500">Filter berdasarkan Unit, Kelas, dan Periode Rekap</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama / NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Unit */}
            <select
              value={filterUnit}
              onChange={(e) => setFilterUnit(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white cursor-pointer"
            >
              <option value="ALL">Semua Unit</option>
              {units.map(u => (
                <option key={u.id} value={u.code}>{u.name}</option>
              ))}
            </select>

            {/* Filter Class */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white cursor-pointer"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Actions */}
            <button
              onClick={handleExportExcel}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel
            </button>
            <button
              onClick={handleExportPdf}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              PDF
            </button>
            <button
              onClick={handleShareRekap}
              className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Unit
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">Siswa & NIS</th>
                <th className="p-3">Kelas / Unit</th>
                <th className="p-3">Jam Tiba</th>
                <th className="p-3">Lokasi Berkumpul</th>
                <th className="p-3">Petugas</th>
                <th className="p-3">Keterangan</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Belum ada data kedatangan terlalu pagi yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-800">
                      <p>{record.studentName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">NIS: {record.nis}</p>
                    </td>
                    <td className="p-3 text-slate-700">
                      <p className="font-semibold">{record.className}</p>
                      <p className="text-[10px] text-slate-500">{record.unitName}</p>
                    </td>
                    <td className="p-3 font-bold text-amber-600">
                      {record.arrivalTime} WIB
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      <span className="bg-slate-100 px-2 py-1 rounded-md">
                        {record.assemblyLocation}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{record.officerName}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{record.notes}</td>
                    <td className="p-3">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                        {record.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Face Scanner Modal */}
      <FaceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        students={students}
        onSelectStudent={handleSelectFromScanner}
        title="Scan Wajah Siswa - Datang Terlalu Pagi"
      />

    </div>
  );
};
