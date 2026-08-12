import React, { useState, useRef } from 'react';
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
  TrendingUp,
  Upload,
  X,
  Eye,
  Image as ImageIcon
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
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState<string>('');

  // Camera & Photo States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Lightbox Preview Modal State
  const [previewModalImage, setPreviewModalImage] = useState<{ url: string; title: string } | null>(null);

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

  // Camera control handlers
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Gagal mengakses kamera. Silakan gunakan opsi Upload Gambar.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setVehiclePhotoUrl(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setVehiclePhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Silakan pilih siswa terlebih dahulu.');
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
      vehiclePhotoUrl: vehiclePhotoUrl || undefined,
      officerName: currentUser.name
    });

    // Reset Form
    setSelectedStudent(null);
    setDriverName('');
    setVehiclePlate('');
    setVehiclePhotoUrl('');
    stopCamera();

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
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Jam Pulang', 'Moda Transportasi', 'Nama Driver', 'Plat Nomor', 'Foto Kendaraan', 'Petugas'];
    const rows = filteredRecords.map(r => [
      r.nis, r.studentName, r.className, r.unitName, r.dismissalTime, r.transportMode, r.driverName || '-', r.vehiclePlate || '-', r.vehiclePhotoUrl ? 'Ada Foto' : '-', r.officerName
    ]);
    exportToExcel('Kepulangan_Transportasi', headers, rows, `Pulang_Transportasi_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportPdf = () => {
    const headers = ['NIS', 'Nama Siswa', 'Kelas', 'Jam Pulang', 'Moda Transportasi', 'Driver/Plat', 'Foto Kendaraan'];
    const rows = filteredRecords.map(r => [
      r.nis, r.studentName, r.className, r.dismissalTime, r.transportMode, r.vehiclePlate ? `${r.driverName || ''} (${r.vehiclePlate})` : '-', r.vehiclePhotoUrl ? 'Ada Foto' : '-'
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
            Pencatatan penjemputan siswa, driver kendaraan online (Gojek/Grab), penjemputan orang tua, bus, foto kendaraan, dan jalan kaki.
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer shrink-0"
        >
          <Search className="w-5 h-5 text-sky-200" />
          Pilih / Cari Siswa (Nama & Kelas)
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
                    PILIH SISWA PULANG READY
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
                className="text-xs bg-white hover:bg-sky-100 text-sky-700 font-semibold px-3 py-1.5 rounded-lg border border-sky-300 transition-colors cursor-pointer"
              >
                Ganti Siswa
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setIsScannerOpen(true)}
              className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50 hover:bg-sky-50/50 hover:border-sky-400 cursor-pointer transition-all"
            >
              <Search className="w-8 h-8 text-sky-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Pilih / Cari Siswa (Nama & Kelas) Saat Kepulangan / Penjemputan</p>
              <p className="text-xs text-slate-500 mt-1">Klik di sini untuk memilih siswa dari daftar atau ketik nama & kelas</p>
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

            {(transportMode === 'Kendaraan Online' || transportMode === 'Dijemput Orang Tua' || transportMode === 'Kendaraan Pribadi') && (
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

          {/* Foto Kendaraan / Penjemput Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-sky-600" />
              Foto Kendaraan / Driver / Penjemput (Kamera / Upload File)
            </label>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {vehiclePhotoUrl ? (
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                  <img
                    src={vehiclePhotoUrl}
                    alt="Preview Kendaraan"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPreviewModalImage({ url: vehiclePhotoUrl, title: 'Foto Kendaraan / Driver' })}
                    className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Foto Terlampir
                  </span>
                  <p className="text-[11px] text-slate-500">Foto kendaraan/driver siap disimpan bersama catatan kepulangan.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewModalImage({ url: vehiclePhotoUrl, title: 'Foto Kendaraan / Driver' })}
                      className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Lihat Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setVehiclePhotoUrl('')}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Foto
                    </button>
                  </div>
                </div>
              </div>
            ) : isCameraActive ? (
              <div className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                <div className="relative max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-sky-500 bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                {cameraError && (
                  <p className="text-xs text-rose-400 font-semibold">{cameraError}</p>
                )}
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={capturePhotoFromCamera}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Jepret Foto Kendaraan
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Batal Kamera
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-sky-600" />
                  Ambil Foto via Kamera
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-slate-600" />
                  Upload Gambar File
                </button>

                <span className="text-[11px] text-slate-500 italic">
                  *Opsional: Ambil foto kendaraan/driver Gojek/Grab/plat nomor untuk arsip keamanan.
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!selectedStudent}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-sky-600/20"
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
            <p className="text-xs text-slate-500">Daftar siswa yang telah tercatat pulang sore ini beserta foto kendaraan / penjemput</p>
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
              className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-emerald-100 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel
            </button>
            <button
              onClick={handleExportPdf}
              className="p-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition-colors"
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
                <th className="p-3">Foto Kendaraan</th>
                <th className="p-3">Petugas Guard</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">Belum ada catatan kepulangan.</td>
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
                      {record.vehiclePlate ? `${record.driverName || '-'} (${record.vehiclePlate})` : (record.driverName || '-')}
                    </td>
                    <td className="p-3">
                      {record.vehiclePhotoUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewModalImage({ url: record.vehiclePhotoUrl!, title: `Foto Kendaraan / Driver - ${record.studentName}` })}
                          className="relative group block overflow-hidden rounded-lg border border-slate-300 w-12 h-12 hover:ring-2 hover:ring-sky-500 transition-all cursor-pointer shadow-2xs"
                        >
                          <img
                            src={record.vehiclePhotoUrl}
                            alt={`Foto Kendaraan ${record.studentName}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-mono italic">- Tidak Ada -</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{record.officerName}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteRecord(record.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Hapus Rekaman"
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

      {/* Lightbox / Enlarged Photo Modal */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                {previewModalImage.title}
              </h4>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-950 min-h-[280px]">
              <img
                src={previewModalImage.url}
                alt="Enlarged Vehicle Photo"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
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
        title="Pilih / Cari Siswa - Kepulangan & Transportasi"
      />

    </div>
  );
};

