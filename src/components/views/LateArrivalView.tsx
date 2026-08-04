import React, { useState } from 'react';
import { 
  Clock, 
  Camera, 
  Search, 
  Plus, 
  Download, 
  Share2, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  TrendingUp, 
  FileSpreadsheet, 
  FileText,
  Image as ImageIcon,
  UserX
} from 'lucide-react';
import { Student, LateArrivalRecord, SchoolUnit, StudentClass, User } from '../../types';
import { FaceScannerModal } from '../FaceScannerModal';
import { exportToExcel, exportToPdf, shareRekapToUnit } from '../../utils/exporter';

interface LateArrivalViewProps {
  students: Student[];
  lateArrivals: LateArrivalRecord[];
  units: SchoolUnit[];
  classes: StudentClass[];
  currentUser: User;
  onAddRecord: (record: Omit<LateArrivalRecord, 'id' | 'createdAt'>) => void;
  onDeleteRecord: (id: string) => void;
}

export const LateArrivalView: React.FC<LateArrivalViewProps> = ({
  students,
  lateArrivals,
  units,
  classes,
  currentUser,
  onAddRecord,
  onDeleteRecord
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [arrivalTime, setArrivalTime] = useState<string>('07:25');
  const [lateReason, setLateReason] = useState<string>('');
  const [photoProofUrl, setPhotoProofUrl] = useState<string>('');

  // Filters
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const commonReasons = [
    'Ban kendaraan bocor / kendala mesin',
    'Kemacetan lalu lintas parah',
    'Bangun kesiangan',
    'Hujan deras & banjir jalanan',
    'Mengantar anggota keluarga berobat',
    'Lainnya (Tuliskan khusus)'
  ];

  const handleSelectFromScanner = (student: Student) => {
    setSelectedStudent(student);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setArrivalTime(`${hours}:${mins}`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      lateReason: lateReason,
      officerName: currentUser.name,
      photoProofUrl: photoProofUrl || undefined,
      attendanceStatus: 'Terlambat'
    });

    setSelectedStudent(null);
    setLateReason('Ban bocor di perempatan Fatmawati');
    setPhotoProofUrl('');
    alert(`Pencatatan keterlambatan siswa ${selectedStudent.name} berhasil disimpan! Notifikasi otomatis terikirim.`);
  };

  const filteredRecords = lateArrivals.filter(r => {
    const matchUnit = filterUnit === 'ALL' || (r.unitName || '').includes(filterUnit);
    const matchClass = filterClass === 'ALL' || r.className === filterClass;
    const matchQuery = 
      (r.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.nis || '').includes(searchQuery) ||
      (r.lateReason || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchUnit && matchClass && matchQuery;
  });

  // Calculate Top Late Students
  const lateFrequencyMap: Record<string, { name: string; count: number; className: string; unitName: string }> = {};
  lateArrivals.forEach(r => {
    if (!lateFrequencyMap[r.nis]) {
      lateFrequencyMap[r.nis] = { name: r.studentName, count: 0, className: r.className, unitName: r.unitName };
    }
    lateFrequencyMap[r.nis].count += 1;
  });

  const topLateStudents = Object.entries(lateFrequencyMap)
    .map(([nis, data]) => ({ nis, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const handleExportExcel = () => {
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Tiba', 'Alasan Terlambat', 'Petugas', 'Status'];
    const rows = filteredRecords.map(r => [
      r.nis, r.studentName, r.className, r.unitName, r.date, r.arrivalTime, r.lateReason, r.officerName, r.attendanceStatus
    ]);
    exportToExcel('Siswa_Terlambat_Datang', headers, rows, `Keterlambatan_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPdf = () => {
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Jam Tiba', 'Alasan Terlambat', 'Petugas'];
    const rows = filteredRecords.map(r => [
      r.nis, r.studentName, r.className, r.arrivalTime, r.lateReason, r.officerName
    ]);
    exportToPdf('Laporan Keterlambatan Siswa', headers, rows, `Keterlambatan_${new Date().toISOString().split('T')[0]}`);
  };

  const handleShareRekap = () => {
    const lines = filteredRecords.map(r => `- ${r.studentName} (${r.className}): Tiba ${r.arrivalTime} - ${r.lateReason}`);
    shareRekapToUnit(filterUnit === 'ALL' ? 'Lazuardi' : filterUnit, 'Siswa Terlambat Datang', filteredRecords.length, lines);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-rose-600" />
            Pencatatan Siswa Terlambat Datang
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan keterlambatan siswa via Pemilihan / Input Manual beserta foto bukti dan alasan.
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer shrink-0"
        >
          <Search className="w-5 h-5 text-rose-200" />
          Pilih / Cari Siswa (Nama & Kelas)
        </button>
      </div>

      {/* Form Input Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-rose-600" />
          Formulir Pencatatan Keterlambatan
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {selectedStudent ? (
            <div className="p-4 bg-rose-50/80 border-2 border-rose-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-rose-500 shadow-xs"
                />
                <div>
                  <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-md">
                    TERLAMBAT DETECTED
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
                className="text-xs bg-white hover:bg-rose-100 text-rose-700 font-semibold px-3 py-1.5 rounded-lg border border-rose-300 transition-colors"
              >
                Ganti Siswa
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setIsScannerOpen(true)}
              className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50 hover:bg-rose-50/50 hover:border-rose-400 cursor-pointer transition-all"
            >
              <Camera className="w-8 h-8 text-rose-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Klik di sini untuk Pindai Wajah atau Cari Siswa Terlambat</p>
              <p className="text-xs text-slate-500 mt-1">Sistem otomatis menampilkan identitas lengkap siswa</p>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Kedatangan (WIB)
              </label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-rose-600 focus:bg-white focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Alasan Terlambat
              </label>
              <select
                onChange={(e) => setLateReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:bg-white cursor-pointer"
              >
                {commonReasons.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Foto Bukti (Opsional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detail Alasan Terlambat
            </label>
            <input
              type="text"
              value={lateReason}
              onChange={(e) => setLateReason(e.target.value)}
              placeholder="Tuliskan keterangan lebih rinci..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedStudent}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Data Keterlambatan
            </button>
          </div>

        </form>
      </div>

      {/* Top Late Students Highlight Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-600" />
            Top Siswa Sering Terlambat
          </h3>
          <div className="space-y-2">
            {topLateStudents.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada frekuensi keterlambatan berulang.</p>
            ) : (
              topLateStudents.map((st, idx) => (
                <div key={st.nis} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{st.name}</p>
                      <p className="text-[10px] text-slate-500">{st.className}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-md border border-rose-200">
                    {st.count}x Terlambat
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Rekap Data Keterlambatan</h3>
              <p className="text-xs text-slate-500">Daftar siswa terlambat yang terdata hari ini</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="ALL">Semua Unit</option>
                {units.map(u => (
                  <option key={u.id} value={u.code}>{u.name}</option>
                ))}
              </select>

              <button
                onClick={handleExportExcel}
                className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Excel
              </button>
              <button
                onClick={handleExportPdf}
                className="p-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Siswa & NIS</th>
                  <th className="p-3">Kelas / Unit</th>
                  <th className="p-3">Jam Tiba</th>
                  <th className="p-3">Alasan Terlambat</th>
                  <th className="p-3">Petugas</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">Tidak ada catatan keterlambatan.</td>
                  </tr>
                ) : (
                  filteredRecords.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">
                        <p>{record.studentName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">NIS: {record.nis}</p>
                      </td>
                      <td className="p-3 text-slate-700">
                        <p className="font-semibold">{record.className}</p>
                        <p className="text-[10px] text-slate-500">{record.unitName}</p>
                      </td>
                      <td className="p-3 font-bold text-rose-600">{record.arrivalTime} WIB</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{record.lateReason}</td>
                      <td className="p-3 text-slate-600">{record.officerName}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onDeleteRecord(record.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
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

      </div>

      {/* Face Scanner Modal */}
      <FaceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        students={students}
        onSelectStudent={handleSelectFromScanner}
        title="Scan Wajah Siswa Terlambat"
      />

    </div>
  );
};
