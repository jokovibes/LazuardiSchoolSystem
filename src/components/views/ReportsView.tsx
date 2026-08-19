import React, { useState } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  Filter, 
  Search, 
  GraduationCap, 
  Users,
  Sunrise,
  Clock,
  LogOut,
  Car,
  X,
  RotateCcw,
  CheckCircle2
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
import { exportToExcel, exportToPdf } from '../../utils/exporter';

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
  const [periodType, setPeriodType] = useState<'Semua' | 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan' | 'Kustom'>('Semua');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isUnitMatch = (rUnitName?: string, rClassName?: string, unitFilter: string = 'ALL') => {
    if (unitFilter === 'ALL') return true;
    const u = (rUnitName || '').toLowerCase();
    const c = (rClassName || '').toLowerCase();
    const filter = unitFilter.toLowerCase();
    return u.includes(filter) || c.startsWith(filter);
  };

  const isClassMatch = (rClassName?: string, classFilter: string = 'ALL') => {
    if (classFilter === 'ALL') return true;
    return (rClassName || '') === classFilter;
  };

  const isDateMatch = (
    recordDate: string | undefined,
    period: 'Semua' | 'Harian' | 'Mingguan' | 'Bulanan' | 'Tahunan' | 'Kustom',
    targetDate: string,
    start?: string,
    end?: string
  ) => {
    if (period === 'Semua') return true;
    if (!recordDate) return false;

    if (period === 'Harian') {
      return recordDate === targetDate;
    }
    if (period === 'Mingguan') {
      const target = new Date(targetDate);
      const rec = new Date(recordDate);
      const diffDays = (target.getTime() - rec.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    if (period === 'Bulanan') {
      return recordDate.startsWith(targetDate.substring(0, 7));
    }
    if (period === 'Tahunan') {
      return recordDate.startsWith(targetDate.substring(0, 4));
    }
    if (period === 'Kustom') {
      if (start && end) return recordDate >= start && recordDate <= end;
      if (start) return recordDate >= start;
      if (end) return recordDate <= end;
      return true;
    }
    return true;
  };

  // Filter for Module 1: Early Arrivals
  const filteredEarly = earlyArrivals.filter(r => {
    const matchUnit = isUnitMatch(r.unitName, r.className, selectedUnit);
    const matchClass = isClassMatch(r.className, selectedClass);
    const matchDate = isDateMatch(r.date, periodType, selectedDate, startDate, endDate);
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.nis || '').toLowerCase().includes(q) ||
      (r.className || '').toLowerCase().includes(q) ||
      (r.unitName || '').toLowerCase().includes(q) ||
      (r.assemblyLocation || '').toLowerCase().includes(q) ||
      (r.notes || '').toLowerCase().includes(q) ||
      (r.officerName || '').toLowerCase().includes(q) ||
      (r.arrivalTime || '').toLowerCase().includes(q) ||
      (r.date || '').toLowerCase().includes(q)
    );
    return matchUnit && matchClass && matchDate && matchSearch;
  });

  // Filter for Module 2: Late Arrivals
  const filteredLate = lateArrivals.filter(r => {
    const matchUnit = isUnitMatch(r.unitName, r.className, selectedUnit);
    const matchClass = isClassMatch(r.className, selectedClass);
    const matchDate = isDateMatch(r.date, periodType, selectedDate, startDate, endDate);
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.nis || '').toLowerCase().includes(q) ||
      (r.className || '').toLowerCase().includes(q) ||
      (r.unitName || '').toLowerCase().includes(q) ||
      (r.lateReason || '').toLowerCase().includes(q) ||
      (r.officerName || '').toLowerCase().includes(q) ||
      (r.arrivalTime || '').toLowerCase().includes(q) ||
      (r.date || '').toLowerCase().includes(q)
    );
    return matchUnit && matchClass && matchDate && matchSearch;
  });

  // Filter for Module 3: Exit Permissions
  const filteredExit = exitPermissions.filter(r => {
    const matchUnit = isUnitMatch(r.unitName, r.className, selectedUnit);
    const matchClass = isClassMatch(r.className, selectedClass);
    const matchDate = isDateMatch(r.date, periodType, selectedDate, startDate, endDate);
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.nis || '').toLowerCase().includes(q) ||
      (r.className || '').toLowerCase().includes(q) ||
      (r.unitName || '').toLowerCase().includes(q) ||
      (r.purpose || '').toLowerCase().includes(q) ||
      (r.pickupBy || '').toLowerCase().includes(q) ||
      (r.officerName || '').toLowerCase().includes(q) ||
      (r.status || '').toLowerCase().includes(q) ||
      (r.exitTime || '').toLowerCase().includes(q) ||
      (r.expectedReturnTime || '').toLowerCase().includes(q) ||
      (r.date || '').toLowerCase().includes(q)
    );
    return matchUnit && matchClass && matchDate && matchSearch;
  });

  // Filter for Module 4: Transport Records
  const filteredTransport = transportRecords.filter(r => {
    const matchUnit = isUnitMatch(r.unitName, r.className, selectedUnit);
    const matchClass = isClassMatch(r.className, selectedClass);
    const matchDate = isDateMatch(r.date, periodType, selectedDate, startDate, endDate);
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || (
      (r.studentName || '').toLowerCase().includes(q) ||
      (r.nis || '').toLowerCase().includes(q) ||
      (r.className || '').toLowerCase().includes(q) ||
      (r.unitName || '').toLowerCase().includes(q) ||
      (r.transportMode || '').toLowerCase().includes(q) ||
      (r.driverName || '').toLowerCase().includes(q) ||
      (r.vehiclePlate || '').toLowerCase().includes(q) ||
      (r.officerName || '').toLowerCase().includes(q) ||
      (r.dismissalTime || '').toLowerCase().includes(q) ||
      (r.date || '').toLowerCase().includes(q)
    );
    return matchUnit && matchClass && matchDate && matchSearch;
  });

  const getActiveFilteredRecords = () => {
    if (selectedModule === 'early') return filteredEarly;
    if (selectedModule === 'late') return filteredLate;
    if (selectedModule === 'exit') return filteredExit;
    return filteredTransport;
  };

  const getTotalCountForModule = () => {
    if (selectedModule === 'early') return earlyArrivals.length;
    if (selectedModule === 'late') return lateArrivals.length;
    if (selectedModule === 'exit') return exitPermissions.length;
    return transportRecords.length;
  };

  const activeRecords = getActiveFilteredRecords();
  const totalCount = getTotalCountForModule();

  const handleResetFilters = () => {
    setSelectedUnit('ALL');
    setSelectedClass('ALL');
    setPeriodType('Semua');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const isFilterActive = selectedUnit !== 'ALL' || selectedClass !== 'ALL' || periodType !== 'Semua' || searchQuery.trim() !== '' || startDate !== '' || endDate !== '';

  const handleExportPdf = () => {
    if (activeRecords.length === 0) {
      alert('Tidak ada data yang sesuai dengan filter saat ini untuk diekspor!');
      return;
    }

    let title = '';
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    const unitInfo = selectedUnit !== 'ALL' ? ` - Unit ${selectedUnit}` : '';
    const periodInfo = periodType !== 'Semua' ? ` (${periodType})` : '';

    if (selectedModule === 'early') {
      title = `Laporan Siswa Datang Terlalu Pagi${unitInfo}${periodInfo}`;
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Tiba', 'Lokasi Berkumpul', 'Petugas'];
      rows = filteredEarly.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.arrivalTime, r.assemblyLocation, r.officerName]);
    } else if (selectedModule === 'late') {
      title = `Laporan Siswa Terlambat Datang${unitInfo}${periodInfo}`;
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Tiba', 'Alasan Terlambat', 'Petugas'];
      rows = filteredLate.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.arrivalTime, r.lateReason, r.officerName]);
    } else if (selectedModule === 'exit') {
      title = `Laporan Siswa Izin Keluar Sekolah${unitInfo}${periodInfo}`;
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Keluar', 'Target Kembali', 'Keperluan', 'Status'];
      rows = filteredExit.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.exitTime, r.expectedReturnTime, r.purpose, r.status]);
    } else {
      title = `Laporan Kepulangan & Transportasi${unitInfo}${periodInfo}`;
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Pulang', 'Moda Transportasi', 'Driver/Plat', 'Petugas'];
      rows = filteredTransport.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.dismissalTime, r.transportMode, r.vehiclePlate || '-', r.officerName]);
    }

    exportToPdf(title, headers, rows, `Laporan_${selectedModule}_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportExcel = () => {
    if (activeRecords.length === 0) {
      alert('Tidak ada data yang sesuai dengan filter saat ini untuk diekspor!');
      return;
    }

    let sheetName = selectedModule.toUpperCase();
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedModule === 'early') {
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Tiba', 'Lokasi', 'Petugas', 'Keterangan'];
      rows = filteredEarly.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.arrivalTime, r.assemblyLocation, r.officerName, r.notes]);
    } else if (selectedModule === 'late') {
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Tiba', 'Alasan', 'Petugas'];
      rows = filteredLate.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.arrivalTime, r.lateReason, r.officerName]);
    } else if (selectedModule === 'exit') {
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Keluar', 'Estimasi Kembali', 'Keperluan', 'Status'];
      rows = filteredExit.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.exitTime, r.expectedReturnTime, r.purpose, r.status]);
    } else {
      headers = ['NIS', 'Nama Siswa', 'Kelas', 'Unit', 'Tanggal', 'Jam Pulang', 'Moda Transportasi', 'Driver', 'Plat Nomor', 'Petugas'];
      rows = filteredTransport.map(r => [r.nis, r.studentName, r.className, r.unitName, r.date, r.dismissalTime, r.transportMode, r.driverName || '-', r.vehiclePlate || '-', r.officerName]);
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
            Export Excel ({activeRecords.length})
          </button>
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Export PDF ({activeRecords.length})
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak
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
          <p className="text-lg font-black">
            {filteredEarly.length} <span className="text-xs font-normal opacity-80">/ {earlyArrivals.length} Rekap</span>
          </p>
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
          <p className="text-lg font-black">
            {filteredLate.length} <span className="text-xs font-normal opacity-80">/ {lateArrivals.length} Rekap</span>
          </p>
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
          <p className="text-lg font-black">
            {filteredExit.length} <span className="text-xs font-normal opacity-80">/ {exitPermissions.length} Rekap</span>
          </p>
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
          <p className="text-lg font-black">
            {filteredTransport.length} <span className="text-xs font-normal opacity-80">/ {transportRecords.length} Rekap</span>
          </p>
        </button>
      </div>

      {/* Filter Parameters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Period Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Calendar className="w-4 h-4 text-blue-600" />
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value as any)}
                className="bg-transparent text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Semua">Semua Periode Waktu</option>
                <option value="Harian">Periode Harian</option>
                <option value="Mingguan">Periode 7 Hari Terakhir</option>
                <option value="Bulanan">Periode Bulanan</option>
                <option value="Tahunan">Periode Tahunan</option>
                <option value="Kustom">Rentang Tanggal Kustom</option>
              </select>
            </div>

            {/* Target Date for Harian / Mingguan / Bulanan / Tahunan */}
            {periodType !== 'Semua' && periodType !== 'Kustom' && (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1 rounded-xl text-xs font-semibold">
                <span className="text-slate-500 text-[11px]">
                  {periodType === 'Harian' && 'Tanggal:'}
                  {periodType === 'Mingguan' && 'Hingga:'}
                  {periodType === 'Bulanan' && 'Bulan:'}
                  {periodType === 'Tahunan' && 'Tahun:'}
                </span>
                <input
                  type={periodType === 'Bulanan' ? 'month' : 'date'}
                  value={periodType === 'Bulanan' ? selectedDate.substring(0, 7) : selectedDate}
                  onChange={(e) => {
                    if (periodType === 'Bulanan') {
                      setSelectedDate(`${e.target.value}-01`);
                    } else {
                      setSelectedDate(e.target.value);
                    }
                  }}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                />
              </div>
            )}

            {/* Custom Date Range */}
            {periodType === 'Kustom' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-1 rounded-xl text-xs font-semibold">
                <span className="text-slate-500 text-[11px]">Dari:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                />
                <span className="text-slate-500 text-[11px]">Sampai:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                />
              </div>
            )}

            {/* Unit Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
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

            {/* Class Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Users className="w-4 h-4 text-purple-600" />
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

          {/* Search Box & Reset */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, NIS, kelas, alasan, petugas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-300 cursor-pointer transition-colors shrink-0"
                title="Reset Semua Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Status */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">
              Menampilkan {activeRecords.length} dari total {totalCount} data
            </span>
            {isFilterActive && (
              <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                Filter Aktif: {selectedUnit !== 'ALL' ? `Unit ${selectedUnit}` : ''} {selectedClass !== 'ALL' ? `Kelas ${selectedClass}` : ''} {periodType !== 'Semua' ? `Periode ${periodType}` : ''} {searchQuery ? `Pencarian "${searchQuery}"` : ''}
              </span>
            )}
          </div>
          {searchQuery && (
            <span className="text-[11px] text-blue-600 font-medium">
              Hasil pencarian untuk: &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Report Summary Data Sheet */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Pratinjau Dokumen Laporan Resmi &bull; {
                selectedModule === 'early' ? '1. DATANG TERLALU PAGI' :
                selectedModule === 'late' ? '2. TERLAMBAT DATANG' :
                selectedModule === 'exit' ? '3. IZIN KELUAR SEKOLAH' :
                '4. TRANSPORTASI KEPULANGAN'
              }
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
              {activeRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-sm">Tidak ada data yang cocok dengan pencarian / filter</p>
                      <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian, pilih unit/kelas lain, atau ganti periode waktu.</p>
                      {isFilterActive && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer border border-blue-200"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : null}

              {selectedModule === 'early' && filteredEarly.map(r => (
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

              {selectedModule === 'late' && filteredLate.map(r => (
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

              {selectedModule === 'exit' && filteredExit.map(r => (
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

              {selectedModule === 'transport' && filteredTransport.map(r => (
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

