import React, { useState } from 'react';
import { 
  LogOut, 
  Camera, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Eye, 
  X, 
  FileSpreadsheet, 
  FileText, 
  Share2, 
  Search,
  UserCheck,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { Student, ExitPermissionRecord, SchoolUnit, StudentClass, User } from '../../types';
import { FaceScannerModal } from '../FaceScannerModal';
import { exportToExcel, exportToPdf, shareRekapToUnit } from '../../utils/exporter';

interface ExitPermissionViewProps {
  students: Student[];
  exitPermissions: ExitPermissionRecord[];
  units: SchoolUnit[];
  classes: StudentClass[];
  currentUser: User;
  onAddRecord: (record: Omit<ExitPermissionRecord, 'id' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, newStatus: 'Sudah Kembali', actualReturnTime: string) => void;
  onDeleteRecord: (id: string) => void;
}

export const ExitPermissionView: React.FC<ExitPermissionViewProps> = ({
  students,
  exitPermissions,
  units,
  classes,
  currentUser,
  onAddRecord,
  onUpdateStatus,
  onDeleteRecord
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [exitTime, setExitTime] = useState<string>('10:30');
  const [expectedReturnTime, setExpectedReturnTime] = useState<string>('12:00');
  const [purpose, setPurpose] = useState<string>('');
  const [pickupBy, setPickupBy] = useState<string>('');
  const [permitLetterUrl, setPermitLetterUrl] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filters
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Belum Kembali' | 'Sudah Kembali'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSelectFromScanner = (student: Student) => {
    setSelectedStudent(student);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setExitTime(`${hours}:${mins}`);
    // Default 1.5 hours return expectation
    const returnHours = String((now.getHours() + 1) % 24).padStart(2, '0');
    setExpectedReturnTime(`${returnHours}:${mins}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPermitLetterUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Silakan pilih atau panggil data siswa terlebih dahulu.');
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
      exitTime,
      expectedReturnTime,
      purpose,
      pickupBy,
      permitLetterUrl: permitLetterUrl || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
      officerName: currentUser.name,
      status: 'Belum Kembali'
    });

    setSelectedStudent(null);
    setPermitLetterUrl('');
    alert(`Surat izin keluar siswa ${selectedStudent.name} berhasil diterbitkan & dicatat!`);
  };

  const handleMarkReturned = (id: string) => {
    const now = new Date();
    const returnTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    onUpdateStatus(id, 'Sudah Kembali', returnTime);
  };

  const filteredRecords = exitPermissions.filter(r => {
    const matchUnit = filterUnit === 'ALL' || (r.unitName || '').includes(filterUnit);
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchQuery = 
      (r.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.nis || '').includes(searchQuery) ||
      (r.purpose || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchUnit && matchStatus && matchQuery;
  });

  const overdueCount = exitPermissions.filter(r => r.status === 'Belum Kembali').length;

  const handleExportExcel = () => {
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Jam Keluar', 'Jam Estimasi Kembali', 'Jam Aktual Kembali', 'Keperluan', 'Penjemput', 'Status'];
    const rows = filteredRecords.map(r => [
      r.nis, r.studentName, r.className, r.unitName, r.exitTime, r.expectedReturnTime, r.actualReturnTime || '-', r.purpose, r.pickupBy, r.status
    ]);
    exportToExcel('Siswa_Izin_Keluar', headers, rows, `Izin_Keluar_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPdf = () => {
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Jam Keluar', 'Target Kembali', 'Keperluan', 'Status'];
    const rows = filteredRecords.map(r => [
      r.nis, r.studentName, r.className, r.exitTime, r.expectedReturnTime, r.purpose, r.status
    ]);
    exportToPdf('Laporan Izin Keluar Sekolah', headers, rows, `Izin_Keluar_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LogOut className="w-6 h-6 text-blue-600" />
            Pencatatan Siswa Izin Keluar Sekolah
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan surat izin keluar jam pelajaran, verifikasi penjemput, upload foto surat izin, dan pengawasan status kembali.
          </p>
        </div>

        {overdueCount > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-xs font-semibold animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p>{overdueCount} Siswa Belum Kembali!</p>
              <p className="text-[10px] text-rose-600 font-normal">Sistem memberikan reminder berkala ke pos jaga security.</p>
            </div>
          </div>
        )}
      </div>

      {/* Form Input Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Penerbitan & Pencatatan Surat Izin Keluar
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          
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
                    IZIN KELUAR AKTIF
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
            <div 
              onClick={() => setIsScannerOpen(true)}
              className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400 cursor-pointer transition-all"
            >
              <Camera className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Pindai Wajah / Cari Siswa yang Mengajukan Izin Keluar</p>
              <p className="text-xs text-slate-500 mt-1">Gunakan kamera atau ketikkan NIS untuk pemanggilan instan</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Keluar</label>
              <input
                type="time"
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Jam Kembali</label>
              <input
                type="time"
                value={expectedReturnTime}
                onChange={(e) => setExpectedReturnTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Penjemput / Pendamping</label>
              <input
                type="text"
                value={pickupBy}
                onChange={(e) => setPickupBy(e.target.value)}
                placeholder="Orang Tua / Wali / Supir"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Surat Izin (Foto/Doc)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Keperluan / Alasan Izin Keluar</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Contoh: Berobat di rumah sakit, acara keluarga, mengikuti olimpiade..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              Terbitkan & Simpan Izin Keluar
            </button>
          </div>

        </form>
      </div>

      {/* Riwayat & Monitoring Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Riwayat & Status Izin Keluar Siswa</h3>
            <p className="text-xs text-slate-500">Monitor status kepulangan kembali siswa ke lingkungan sekolah</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
            >
              <option value="ALL">Semua Status</option>
              <option value="Belum Kembali">Belum Kembali Only</option>
              <option value="Sudah Kembali">Sudah Kembali Only</option>
            </select>

            <button
              onClick={handleExportExcel}
              className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel
            </button>
            <button
              onClick={handleExportPdf}
              className="p-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1"
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
                <th className="p-3">Jam Keluar</th>
                <th className="p-3">Target Kembali</th>
                <th className="p-3">Keperluan & Penjemput</th>
                <th className="p-3">Surat Izin</th>
                <th className="p-3">Status Kembali</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">Belum ada riwayat izin keluar.</td>
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
                    <td className="p-3 font-bold text-slate-800">{record.exitTime} WIB</td>
                    <td className="p-3 font-bold text-blue-600">{record.expectedReturnTime} WIB</td>
                    <td className="p-3 text-slate-700 max-w-xs">
                      <p className="truncate font-medium">{record.purpose}</p>
                      <p className="text-[10px] text-slate-500">Penjemput: {record.pickupBy}</p>
                    </td>
                    <td className="p-3">
                      {record.permitLetterUrl ? (
                        <button
                          onClick={() => setPreviewImage(record.permitLetterUrl!)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold flex items-center gap-1 border border-slate-300"
                        >
                          <Eye className="w-3 h-3 text-blue-600" />
                          Preview Surat
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Tidak ada foto</span>
                      )}
                    </td>
                    <td className="p-3">
                      {record.status === 'Belum Kembali' ? (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1 w-max animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          Belum Kembali
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          Sudah Kembali ({record.actualReturnTime || '11:45'})
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {record.status === 'Belum Kembali' && (
                          <button
                            onClick={() => handleMarkReturned(record.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Konfirmasi Kembali
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteRecord(record.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-xl w-full relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-bold text-slate-800 text-sm">Preview Dokumen Surat Izin Keluar</h4>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-1 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 bg-slate-900 rounded-xl p-2 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewImage}
                alt="Surat Izin"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Face Scanner Modal */}
      <FaceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        students={students}
        onSelectStudent={handleSelectFromScanner}
        title="Scan Wajah Siswa - Izin Keluar Sekolah"
      />

    </div>
  );
};
