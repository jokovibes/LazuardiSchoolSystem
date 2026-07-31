import React, { useState } from 'react';
import { 
  Car, 
  Camera, 
  Plus, 
  Footprints, 
  Bike, 
  Bus, 
  UserCheck, 
  FileSpreadsheet, 
  FileText, 
  Share2, 
  Search, 
  CheckCircle2, 
  Trash2,
  TrendingUp
} from 'lucide-react';
import { Student, TransportRecord, TransportMode, SchoolUnit, StudentClass, User } from '../../types';
import { FaceScannerModal } from '../FaceScannerModal';
import { exportToExcel, exportToPdf, shareRekapToUnit } from '../../utils/exporter';

interface TransportationViewProps {
  students: Student[];
  transportRecords: TransportRecord[];
  units: SchoolUnit[];
  classes: StudentClass[];
  currentUser: User;
  onAddRecord: (record: Omit<TransportRecord, 'id' | 'createdAt'>) => void;
  onDeleteRecord: (id: string) => void;
}

export const TransportationView: React.FC<TransportationViewProps> = ({
  students,
  transportRecords,
  units,
  classes,
  currentUser,
  onAddRecord,
  onDeleteRecord
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [dismissalTime, setDismissalTime] = useState<string>('15:15');
  const [transportMode, setTransportMode] = useState<TransportMode>('Kendaraan Online');
  const [driverName, setDriverName] = useState<string>('');
  const [vehiclePlate, setVehiclePlate] = useState<string>('');

  // Filters
  const [filterUnit, setFilterUnit] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const transportModes: { mode: TransportMode; label: string; icon: React.ElementType }[] = [
    { mode: 'Kendaraan Online', label: 'Kendaraan Online (Gojek/Grab)', icon: Car },
    { mode: 'Dijemput Orang Tua', label: 'Dijemput Orang Tua / Wali', icon: UserCheck },
    { mode: 'Bus Sekolah', label: 'Bus Sekolah Lazuardi', icon: Bus },
    { mode: 'Jalan Kaki', label: 'Jalan Kaki', icon: Footprints },
    { mode: 'Sepeda', label: 'Naik Sepeda', icon: Bike },
    { mode: 'Kendaraan Pribadi', label: 'Kendaraan Pribadi', icon: Car }
  ];

  const handleSelectFromScanner = (student: Student) => {
    setSelectedStudent(student);
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setDismissalTime(`${hours}:${mins}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Silakan pindai atau pilih siswa terlebih dahulu.');
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
      dismissalTime,
      transportMode,
      driverName: (transportMode === 'Kendaraan Online' || transportMode === 'Dijemput Orang Tua') ? driverName : undefined,
      vehiclePlate: (transportMode === 'Kendaraan Online' || transportMode === 'Dijemput Orang Tua') ? vehiclePlate : undefined,
      officerName: currentUser.name
    });

    setSelectedStudent(null);
    alert(`Moda transportasi kepulangan siswa ${selectedStudent.name} berhasil dicatat!`);
  };

  const filteredRecords = transportRecords.filter(r => {
    const matchUnit = filterUnit === 'ALL' || (r.unitName || '').includes(filterUnit);
    const matchMode = filterMode === 'ALL' || r.transportMode === filterMode;
    const matchQuery = 
      (r.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.nis || '').includes(searchQuery) ||
      (r.driverName && r.driverName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchUnit && matchMode && matchQuery;
  });

  // Analytics breakdown
  const onlineCount = transportRecords.filter(r => r.transportMode === 'Kendaraan Online').length;
  const parentCount = transportRecords.filter(r => r.transportMode === 'Dijemput Orang Tua').length;
  const busCount = transportRecords.filter(r => r.transportMode === 'Bus Sekolah').length;
  const walkCount = transportRecords.filter(r => r.transportMode === 'Jalan Kaki').length;

  const handleExportExcel = () => {
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Jam Pulang', 'Moda Transportasi', 'Nama Driver', 'Plat Nomor', 'Petugas'];
    const rows = filteredRecords.map(r => [
      r.nis, r.studentName, r.className, r.unitName, r.dismissalTime, r.transportMode, r.driverName || '-', r.vehiclePlate || '-', r.officerName
    ]);
    exportToExcel('Kepulangan_Transportasi', headers, rows, `Pulang_Transportasi_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPdf = () => {
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Jam Pulang', 'Moda Transportasi', 'Driver/Plat'];
    const rows = filteredRecords.map(r => [
      r.nis, r.studentName, r.className, r.dismissalTime, r.transportMode, r.vehiclePlate ? `${r.driverName || ''} (${r.vehiclePlate})` : '-'
    ]);
    exportToPdf('Laporan Kepulangan & Transportasi Siswa', headers, rows, `Pulang_Transportasi_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Car className="w-6 h-6 text-sky-600" />
            Pencatatan Kepulangan & Moda Transportasi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan Face Recognition saat penjemputan siswa, driver kendaraan online (Gojek/Grab), penjemputan oragan tua, bus, dan jalan kaki.
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer shrink-0"
        >
          <Camera className="w-5 h-5 text-sky-200" />
          Scan Wajah Kepulangan Siswa
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-sky-100 text-sky-700 rounded-xl"><Car className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Kendaraan Online</p>
            <p className="text-lg font-black text-slate-800">{onlineCount} Siswa</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl"><UserCheck className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Dijemput Orang Tua</p>
            <p className="text-lg font-black text-slate-800">{parentCount} Siswa</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl"><Bus className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Bus Sekolah</p>
            <p className="text-lg font-black text-slate-800">{busCount} Siswa</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl"><Footprints className="w-5 h-5" /></div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Jalan Kaki / Sepeda</p>
            <p className="text-lg font-black text-slate-800">{walkCount} Siswa</p>
          </div>
        </div>
      </div>

      {/* Form Input Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-sky-600" />
          Formulir Pencatatan Moda Transportasi Kepulangan
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {selectedStudent ? (
            <div className="p-4 bg-sky-50/80 border-2 border-sky-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudent.photoUrl}
                  alt={selectedStudent.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-sky-500 shadow-xs"
                />
                <div>
                  <span className="text-[10px] bg-sky-600 text-white font-bold px-2 py-0.5 rounded-md">
                    SCAN KEPULANGAN READY
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
                className="text-xs bg-white hover:bg-sky-100 text-sky-700 font-semibold px-3 py-1.5 rounded-lg border border-sky-300 transition-colors"
              >
                Ganti Siswa
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setIsScannerOpen(true)}
              className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50 hover:bg-sky-50/50 hover:border-sky-400 cursor-pointer transition-all"
            >
              <Camera className="w-8 h-8 text-sky-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Pindai Wajah Siswa Saat Kepulangan / Penjemputan Driver</p>
              <p className="text-xs text-slate-500 mt-1">Sistem otomatis mencocokkan data profil siswa</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Kepulangan</label>
              <input
                type="time"
                value={dismissalTime}
                onChange={(e) => setDismissalTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Moda Transportasi</label>
              <select
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value as TransportMode)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-sky-700 cursor-pointer"
              >
                {transportModes.map(tm => (
                  <option key={tm.mode} value={tm.mode}>{tm.label}</option>
                ))}
              </select>
            </div>

            {(transportMode === 'Kendaraan Online' || transportMode === 'Dijemput Orang Tua') && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Driver / Penjemput</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Nama Driver Gojek / Grab / Penjemput"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plat Nomor Kendaraan</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    placeholder="Contoh: B 1234 XYZ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-semibold uppercase"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedStudent}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Pencatatan Kepulangan
            </button>
          </div>

        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Rekap Moda Transportasi & Kepulangan</h3>
            <p className="text-xs text-slate-500">Daftar siswa yang telah terpindai pulang sore ini</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
            >
              <option value="ALL">Semua Moda Transportasi</option>
              {transportModes.map(m => (
                <option key={m.mode} value={m.mode}>{m.mode}</option>
              ))}
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
                <th className="p-3">Jam Pulang</th>
                <th className="p-3">Moda Transportasi</th>
                <th className="p-3">Driver / Plat</th>
                <th className="p-3">Petugas Guard</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">Belum ada catatan kepulangan.</td>
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
                    <td className="p-3 font-bold text-sky-700">{record.dismissalTime} WIB</td>
                    <td className="p-3 font-semibold text-slate-800">
                      <span className="bg-sky-50 text-sky-800 px-2.5 py-1 rounded-md border border-sky-200">
                        {record.transportMode}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-mono">
                      {record.vehiclePlate ? `${record.driverName || '-'} (${record.vehiclePlate})` : '-'}
                    </td>
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

      {/* Face Scanner Modal */}
      <FaceScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        students={students}
        onSelectStudent={handleSelectFromScanner}
        title="Scan Wajah Siswa - Kepulangan & Transportasi"
      />

    </div>
  );
};
