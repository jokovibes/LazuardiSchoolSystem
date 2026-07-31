import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Share2, 
  Calendar, 
  Filter, 
  Download, 
  Search, 
  GraduationCap, 
  Users,
  Sunrise,
  Clock,
  LogOut,
  Car
} from 'lucide-react';
import { 
  Student, 
  EarlyArrivalRecord, 
  LateArrivalRecord, 
  ExitPermissionRecord, 
  TransportRecord, 
  SchoolUnit, 
  StudentClass 
} from '../../types';
import { exportToExcel, exportToPdf, shareRekapToUnit } from '../../utils/exporter';

interface ReportsViewProps {
  students: Student[];
  earlyArrivals: EarlyArrivalRecord[];
  lateArrivals: LateArrivalRecord[];
  exitPermissions: ExitPermissionRecord[];
  transportRecords: TransportRecord[];
  units: SchoolUnit[];
  classes: StudentClass[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  earlyArrivals,
  lateArrivals,
  exitPermissions,
  transportRecords,
  units,
  classes
}) => {
  const [selectedModule, setSelectedModule] = useState<'early' | 'late' | 'exit' | 'transport'>('early');
  const [periodType, setPeriodType] = useState<'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan'>('Harian');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleExportPdf = () => {
    let title = '';
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedModule === 'early') {
      title = 'Laporan Siswa Datang Terlalu Pagi';
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Tiba', 'Lokasi Berkumpul', 'Petugas'];
      rows = earlyArrivals.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.arrivalTime, r.assemblyLocation, r.officerName]);
    } else if (selectedModule === 'late') {
      title = 'Laporan Siswa Terlambat Datang';
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Tiba', 'Alasan Terlambat', 'Petugas'];
      rows = lateArrivals.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.arrivalTime, r.lateReason, r.officerName]);
    } else if (selectedModule === 'exit') {
      title = 'Laporan Siswa Izin Keluar Sekolah';
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Jam Keluar', 'Target Kembali', 'Keperluan', 'Status'];
      rows = exitPermissions.map(r => [r.nis, r.studentName, r.className, r.unitName, r.exitTime, r.expectedReturnTime, r.purpose, r.status]);
    } else {
      title = 'Laporan Kepulangan & Transportasi';
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Jam Pulang', 'Moda Transportasi', 'Driver/Plat', 'Petugas'];
      rows = transportRecords.map(r => [r.nis, r.studentName, r.className, r.unitName, r.dismissalTime, r.transportMode, r.vehiclePlate || '-', r.officerName]);
    }

    exportToPdf(title, headers, rows, `Laporan_${selectedModule}_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportExcel = () => {
    let sheetName = selectedModule.toUpperCase();
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedModule === 'early') {
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Tiba', 'Lokasi', 'Petugas', 'Keterangan'];
      rows = earlyArrivals.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.arrivalTime, r.assemblyLocation, r.officerName, r.notes]);
    } else if (selectedModule === 'late') {
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Tiba', 'Alasan', 'Petugas'];
      rows = lateArrivals.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.arrivalTime, r.lateReason, r.officerName]);
    } else if (selectedModule === 'exit') {
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Jam Keluar', 'Estimasi Kembali', 'Keperluan', 'Status'];
      rows = exitPermissions.map(r => [r.nis, r.studentName, r.className, r.unitName, r.exitTime, r.expectedReturnTime, r.purpose, r.status]);
    } else {
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Jam Pulang', 'Moda Transportasi', 'Driver', 'Plat Nomor', 'Petugas'];
      rows = transportRecords.map(r => [r.nis, r.studentName, r.className, r.unitName, r.dismissalTime, r.transportMode, r.driverName || '-', r.vehiclePlate || '-', r.officerName]);
    }

    exportToExcel(sheetName, headers, rows, `Laporan_Lazuardi_${selectedModule}_${new Date().toISOString().split('T')[0]}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Laporan & Rekap Multi-Format (Harian, Mingguan, Bulanan, Tahunan)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ekspor rekapitulasi data lengkap ke PDF, Excel, dan Print-Friendly untuk Kepala Unit & Yayasan.
          </p>
        </div>

        {/* Quick Exporters */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* Module Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSelectedModule('early')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedModule === 'early' 
              ? 'bg-amber-500 text-white border-amber-600 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sunrise className="w-6 h-6 mb-2" />
          <p className="text-xs uppercase font-semibold">1. Datang Terlalu Pagi</p>
          <p className="text-lg font-black">{earlyArrivals.length} Rekap</p>
        </button>

        <button
          onClick={() => setSelectedModule('late')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedModule === 'late' 
              ? 'bg-rose-600 text-white border-rose-700 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-6 h-6 mb-2" />
          <p className="text-xs uppercase font-semibold">2. Terlambat Datang</p>
          <p className="text-lg font-black">{lateArrivals.length} Rekap</p>
        </button>

        <button
          onClick={() => setSelectedModule('exit')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedModule === 'exit' 
              ? 'bg-blue-600 text-white border-blue-700 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <LogOut className="w-6 h-6 mb-2" />
          <p className="text-xs uppercase font-semibold">3. Izin Keluar Sekolah</p>
          <p className="text-lg font-black">{exitPermissions.length} Rekap</p>
        </button>

        <button
          onClick={() => setSelectedModule('transport')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            selectedModule === 'transport' 
              ? 'bg-sky-600 text-white border-sky-700 shadow-md font-bold'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Car className="w-6 h-6 mb-2" />
          <p className="text-xs uppercase font-semibold">4. Transportasi Kepulangan</p>
          <p className="text-lg font-black">{transportRecords.length} Rekap</p>
        </button>
      </div>

      {/* Filter Parameters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as any)}
              className="bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="Harian">Periode Harian</option>
              <option value="Mingguan">Periode Mingguan</option>
              <option value="Bulanan">Periode Bulanan</option>
              <option value="Tahunan">Periode Tahunan</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-slate-500" />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Unit (SD, SMP, SMA)</option>
              {units.map(u => (
                <option key={u.id} value={u.code}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Users className="w-4 h-4 text-slate-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kata kunci laporan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Report Summary Data Sheet */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Pratinjau Dokumen Laporan Resmi &bull; {selectedModule.toUpperCase()}
            </h3>
            <p className="text-xs text-slate-500">
              Format Laporan Resmi Sekolah Lazuardi Global Compassionate School
            </p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 font-mono font-bold px-3 py-1 rounded-full border border-blue-200">
            {periodType.toUpperCase()} REKAPITULASI
          </span>
        </div>

        {/* Dynamic Table Preview */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">NIS</th>
                <th className="p-3">Nama Siswa</th>
                <th className="p-3">Kelas / Unit</th>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Jam Waktu</th>
                <th className="p-3">Detail & Keterangan</th>
                <th className="p-3">Petugas Author</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {selectedModule === 'early' && earlyArrivals.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{r.nis}</td>
                  <td className="p-3 font-bold text-slate-800">{r.studentName}</td>
                  <td className="p-3">{r.className} ({r.unitName})</td>
                  <td className="p-3">{r.date}</td>
                  <td className="p-3 font-bold text-amber-600">{r.arrivalTime} WIB</td>
                  <td className="p-3 text-slate-600">{r.assemblyLocation} - {r.notes}</td>
                  <td className="p-3 text-slate-500">{r.officerName}</td>
                </tr>
              ))}

              {selectedModule === 'late' && lateArrivals.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{r.nis}</td>
                  <td className="p-3 font-bold text-slate-800">{r.studentName}</td>
                  <td className="p-3">{r.className} ({r.unitName})</td>
                  <td className="p-3">{r.date}</td>
                  <td className="p-3 font-bold text-rose-600">{r.arrivalTime} WIB</td>
                  <td className="p-3 text-slate-600">{r.lateReason}</td>
                  <td className="p-3 text-slate-500">{r.officerName}</td>
                </tr>
              ))}

              {selectedModule === 'exit' && exitPermissions.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{r.nis}</td>
                  <td className="p-3 font-bold text-slate-800">{r.studentName}</td>
                  <td className="p-3">{r.className} ({r.unitName})</td>
                  <td className="p-3">{r.date}</td>
                  <td className="p-3 font-bold text-blue-600">{r.exitTime} - {r.expectedReturnTime} WIB</td>
                  <td className="p-3 text-slate-600">{r.purpose} (Penjemput: {r.pickupBy})</td>
                  <td className="p-3 text-slate-500">{r.officerName}</td>
                </tr>
              ))}

              {selectedModule === 'transport' && transportRecords.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{r.nis}</td>
                  <td className="p-3 font-bold text-slate-800">{r.studentName}</td>
                  <td className="p-3">{r.className} ({r.unitName})</td>
                  <td className="p-3">{r.date}</td>
                  <td className="p-3 font-bold text-sky-600">{r.dismissalTime} WIB</td>
                  <td className="p-3 text-slate-600">{r.transportMode} {r.vehiclePlate ? `(${r.vehiclePlate})` : ''}</td>
                  <td className="p-3 text-slate-500">{r.officerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
