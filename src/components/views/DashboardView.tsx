import React, { useState } from 'react';
import { 
  Sunrise, 
  Clock, 
  LogOut, 
  AlertTriangle, 
  Car, 
  Footprints, 
  Bike, 
  Bus, 
  Calendar, 
  Filter, 
  Download, 
  Share2, 
  Search, 
  TrendingUp,
  UserCheck,
  Building2,
  GraduationCap,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';

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

interface DashboardViewProps {
  students: Student[];
  earlyArrivals: EarlyArrivalRecord[];
  lateArrivals: LateArrivalRecord[];
  exitPermissions: ExitPermissionRecord[];
  transportRecords: TransportRecord[];
  units: SchoolUnit[];
  classes: StudentClass[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  earlyArrivals,
  lateArrivals,
  exitPermissions,
  transportRecords,
  units,
  classes
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-28');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtering records by unit, class, and date
  const filteredEarly = earlyArrivals.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    (selectedDate === '' || r.date === selectedDate)
  );

  const filteredLate = lateArrivals.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    (selectedDate === '' || r.date === selectedDate)
  );

  const filteredExit = exitPermissions.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    (selectedDate === '' || r.date === selectedDate)
  );

  const filteredTransport = transportRecords.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    (selectedDate === '' || r.date === selectedDate)
  );

  // Widget metric totals
  const totalEarly = filteredEarly.length;
  const totalLate = filteredLate.length;
  const totalExit = filteredExit.length;
  const totalBelumKembali = filteredExit.filter(r => r.status === 'Belum Kembali').length;

  const totalOnlineTransport = filteredTransport.filter(r => r.transportMode === 'Kendaraan Online').length;
  const totalJalanKaki = filteredTransport.filter(r => r.transportMode === 'Jalan Kaki').length;
  const totalSepeda = filteredTransport.filter(r => r.transportMode === 'Sepeda').length;
  const totalDijemput = filteredTransport.filter(r => r.transportMode === 'Dijemput Orang Tua').length;
  const totalBusSekolah = filteredTransport.filter(r => r.transportMode === 'Bus Sekolah').length;

  // Filter helper by unit and class across all dates (for multi-day trend calculation)
  const unitClassEarly = earlyArrivals.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass)
  );
  const unitClassLate = lateArrivals.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass)
  );
  const unitClassExit = exitPermissions.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass)
  );
  const unitClassTransport = transportRecords.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass)
  );

  // Helper to format date string to "Day (DD/MM)" e.g. "Senin (28/7)"
  const getDayLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return `${days[d.getDay()]} (${day}/${month + 1})`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Helper to collect recent dates for the trend chart
  const getRecentDates = () => {
    const datesSet = new Set<string>();

    // 1. Add dates from actual Supabase records
    unitClassEarly.forEach(r => r.date && datesSet.add(r.date));
    unitClassLate.forEach(r => r.date && datesSet.add(r.date));
    unitClassExit.forEach(r => r.date && datesSet.add(r.date));
    unitClassTransport.forEach(r => r.date && datesSet.add(r.date));

    // 2. Ensure at least a 5-day window around selectedDate or today
    const anchorDateStr = selectedDate || new Date().toISOString().split('T')[0];
    const anchorParts = anchorDateStr.split('-');
    if (anchorParts.length === 3) {
      const y = parseInt(anchorParts[0], 10);
      const m = parseInt(anchorParts[1], 10) - 1;
      const d = parseInt(anchorParts[2], 10);
      const anchor = new Date(y, m, d);
      for (let i = 4; i >= 0; i--) {
        const dt = new Date(anchor);
        dt.setDate(dt.getDate() - i);
        const yStr = dt.getFullYear();
        const mStr = String(dt.getMonth() + 1).padStart(2, '0');
        const dStr = String(dt.getDate()).padStart(2, '0');
        datesSet.add(`${yStr}-${mStr}-${dStr}`);
      }
    }

    const sortedDates = Array.from(datesSet).sort((a, b) => a.localeCompare(b));
    return sortedDates.slice(-7);
  };

  const recentDates = getRecentDates();

  // Chart 1: Real Daily Trend Data from Supabase
  const dailyTrendData = recentDates.map(dateStr => {
    const TerlaluPagi = unitClassEarly.filter(r => r.date === dateStr).length;
    const Terlambat = unitClassLate.filter(r => r.date === dateStr).length;
    const IzinKeluar = unitClassExit.filter(r => r.date === dateStr).length;
    const PulangOnline = unitClassTransport.filter(r => r.date === dateStr && r.transportMode === 'Kendaraan Online').length;

    return {
      day: getDayLabel(dateStr),
      dateStr,
      TerlaluPagi,
      Terlambat,
      IzinKeluar,
      PulangOnline
    };
  });

  // Chart 2: Unit Breakdown from Supabase
  const unitBreakdownData = units.map(u => ({
    name: u.code,
    TerlaluPagi: earlyArrivals.filter(r => (r.unitName || '').includes(u.code || '')).length,
    Terlambat: lateArrivals.filter(r => (r.unitName || '').includes(u.code || '')).length,
    IzinKeluar: exitPermissions.filter(r => (r.unitName || '').includes(u.code || '')).length,
  }));

  // Chart 3: Real Transport Modes Distribution from Supabase
  const transportPieData = [
    { name: 'Kendaraan Online', value: totalOnlineTransport, color: '#0284c7' },
    { name: 'Dijemput Ortu', value: totalDijemput, color: '#10b981' },
    { name: 'Bus Sekolah', value: totalBusSekolah, color: '#f59e0b' },
    { name: 'Jalan Kaki', value: totalJalanKaki, color: '#8b5cf6' },
    { name: 'Sepeda', value: totalSepeda, color: '#ec4899' },
  ];

  const totalTransportCount = transportPieData.reduce((acc, item) => acc + item.value, 0);

  // Export Summary
  const handleExportDashboardExcel = () => {
    const headers = ['Kategori Indikator', 'Jumlah Siswa (Orang)', 'Status / Catatan'];
    const rows = [
      ['Datang Terlalu Pagi', totalEarly, 'Didata oleh Security di Pintu Utama'],
      ['Siswa Terlambat Datang', totalLate, 'Presensi > 07:15 WIB'],
      ['Izin Keluar Sekolah', totalExit, 'Dengan Surat Izin dari Unit'],
      ['Siswa Belum Kembali', totalBelumKembali, 'Peringatan Overdue Status Active'],
      ['Pulang Kendaraan Online (Gojek/Grab)', totalOnlineTransport, 'Siswa terpindai Face Recognition saat penjemputan'],
      ['Pulang Jalan Kaki', totalJalanKaki, 'Izin Khusus Area Terdekat'],
      ['Pulang Sepeda', totalSepeda, 'Fasilitas Parkir Sepeda'],
      ['Pulang Bus Sekolah', totalBusSekolah, 'Armada Bus Lazuardi'],
      ['Pulang Dijemput Orang Tua', totalDijemput, 'Izin Penjemput Resmi']
    ];
    exportToExcel('Ringkasan_Dashboard', headers, rows, `Ringkasan_Dashboard_Presensi_${selectedDate}`);
  };

  const handleExportDashboardPdf = () => {
    const headers = ['Indikator Aktivitas', 'Jumlah Siswa', 'Keterangan Analitik'];
    const rows = [
      ['Total Datang Terlalu Pagi', `${totalEarly} Siswa`, 'Hadir sebelum jam 06:15 WIB'],
      ['Total Terlambat Datang', `${totalLate} Siswa`, 'Hadir setelah jam 07:15 WIB'],
      ['Total Izin Keluar Sekolah', `${totalExit} Siswa`, 'Prosedur Izin Meninggalkan Kelas'],
      ['Masih Belum Kembali', `${totalBelumKembali} Siswa`, 'Memerlukan Konfirmasi Petugas'],
      ['Transportasi Online (Gojek/Grab)', `${totalOnlineTransport} Siswa`, 'Izin Penjemputan Driver'],
      ['Jalan Kaki', `${totalJalanKaki} Siswa`, 'Area Radius < 1 KM'],
      ['Sepeda', `${totalSepeda} Siswa`, 'Jalur Sepeda Sekolah'],
      ['Dijemput Orang Tua', `${totalDijemput} Siswa`, 'Zona Drop-off / Pickup']
    ];
    exportToPdf('Dashboard_Analitik_Lazuardi', headers, rows, `Dashboard_Analitik_${selectedDate}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section Banner & Global Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Dashboard Analitik Presensi & Pergerakan Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan terpadu aktivitas kedatangan, keterlambatan, izin keluar, dan moda transportasi seluruh unit.
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Unit Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs">
            <GraduationCap className="w-4 h-4 text-slate-500" />
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Unit (SD, SMP, SMA)</option>
              {units.map(u => (
                <option key={u.id} value={u.code}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs">
            <Users className="w-4 h-4 text-slate-500" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Export & Share Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDashboardExcel}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Export Excel"
            >
              <Download className="w-3.5 h-3.5" />
              Excel
            </button>
            <button
              onClick={handleExportDashboardPdf}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Export PDF"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
            <button
              onClick={() => shareRekapToUnit('SEMUA UNIT', 'Dashboard Utama', totalEarly + totalLate + totalExit, [
                `Terlalu Pagi: ${totalEarly} Siswa`,
                `Terlambat: ${totalLate} Siswa`,
                `Izin Keluar: ${totalExit} Siswa`,
                `Transport Online: ${totalOnlineTransport} Siswa`
              ])}
              className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Bagikan Rekap ke Unit"
            >
              <Share2 className="w-3.5 h-3.5" />
              Bagikan
            </button>
          </div>
        </div>
      </div>

      {/* Widget Cards Row 1: Primary Attendance Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* Card 1: Datang Terlalu Pagi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between h-full min-h-[135px]">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Datang Terlalu Pagi</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalEarly} <span className="text-xs font-semibold text-slate-500">Siswa</span></h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
              <Sunrise className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
            <Sunrise className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Hadir &lt; 06:15 WIB</span>
          </div>
        </div>

        {/* Card 2: Terlambat Datang */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between h-full min-h-[135px]">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Terlambat Datang</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalLate} <span className="text-xs font-semibold text-slate-500">Siswa</span></h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center gap-1.5 text-[11px] font-medium text-rose-700">
            <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Hadir &gt; 07:15 WIB</span>
          </div>
        </div>

        {/* Card 3: Total Izin Keluar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between h-full min-h-[135px]">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Izin Keluar Sekolah</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{totalExit} <span className="text-xs font-semibold text-slate-500">Siswa</span></h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
              <LogOut className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center gap-1.5 text-[11px] font-medium text-blue-700">
            <LogOut className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Izin Meninggalkan Kelas</span>
          </div>
        </div>

        {/* Card 4: Siswa Belum Kembali (Alert Overdue) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all flex flex-col justify-between h-full min-h-[135px]">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Masih Belum Kembali</p>
              <h3 className="text-2xl font-black text-rose-600 tracking-tight">{totalBelumKembali} <span className="text-xs font-semibold text-slate-500">Siswa</span></h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Peringatan Petugas Active</span>
          </div>
        </div>

      </div>

      {/* Widget Cards Row 2: Transportation Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-stretch">
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 h-full min-h-[72px]">
          <div className="p-2.5 bg-sky-100/80 text-sky-700 border border-sky-200/60 rounded-lg shrink-0 flex items-center justify-center">
            <Car className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Kendaraan Online</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">{totalOnlineTransport} <span className="text-[10px] font-normal text-slate-500">Siswa</span></p>
          </div>
        </div>

        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 h-full min-h-[72px]">
          <div className="p-2.5 bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 rounded-lg shrink-0 flex items-center justify-center">
            <Footprints className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Jalan Kaki</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">{totalJalanKaki} <span className="text-[10px] font-normal text-slate-500">Siswa</span></p>
          </div>
        </div>

        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 h-full min-h-[72px]">
          <div className="p-2.5 bg-pink-100/80 text-pink-700 border border-pink-200/60 rounded-lg shrink-0 flex items-center justify-center">
            <Bike className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Naik Sepeda</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">{totalSepeda} <span className="text-[10px] font-normal text-slate-500">Siswa</span></p>
          </div>
        </div>

        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 h-full min-h-[72px]">
          <div className="p-2.5 bg-amber-100/80 text-amber-700 border border-amber-200/60 rounded-lg shrink-0 flex items-center justify-center">
            <Bus className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Bus Sekolah</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">{totalBusSekolah} <span className="text-[10px] font-normal text-slate-500">Siswa</span></p>
          </div>
        </div>

        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 h-full min-h-[72px]">
          <div className="p-2.5 bg-indigo-100/80 text-indigo-700 border border-indigo-200/60 rounded-lg shrink-0 flex items-center justify-center">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">Dijemput Ortu</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">{totalDijemput} <span className="text-[10px] font-normal text-slate-500">Siswa</span></p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Daily Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Grafik Tren Aktivitas Harian Presensi
              </h3>
              <p className="text-xs text-slate-500">Perbandingan volume kedatangan dini, keterlambatan, dan izin keluar pekan ini.</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="TerlaluPagi" name="Datang Terlalu Pagi" stroke="#0284c7" fillOpacity={1} fill="url(#colorEarly)" />
                <Area type="monotone" dataKey="Terlambat" name="Keterlambatan" stroke="#f43f5e" fillOpacity={1} fill="url(#colorLate)" />
                <Area type="monotone" dataKey="IzinKeluar" name="Izin Keluar" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorExit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Transportation Pie Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="mb-2">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Car className="w-5 h-5 text-indigo-600" />
              Distribusi Moda Transportasi
            </h3>
            <p className="text-xs text-slate-500">Persentase kendaraan & metode kepulangan siswa.</p>
          </div>

          {totalTransportCount === 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
              <Car className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
              <p className="font-semibold text-slate-600">Belum ada data moda transportasi</p>
              <p className="text-[11px] text-slate-400 mt-1">Data akan otomatis muncul di grafik ini saat ada kepulangan siswa terdata di database.</p>
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transportPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {transportPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Custom Pie Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {transportPieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}: <strong className="text-slate-800">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Chart 3 & Top Late Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Breakdown Per Unit Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-800 text-base mb-1">
            Rekap Indikator Per Unit Sekolah (SD, SMP, SMA)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Jumlah presensi khusus per tingkat unit pendidikan.</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="TerlaluPagi" name="Terlalu Pagi" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Terlambat" name="Terlambat" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="IzinKeluar" name="Izin Keluar" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Late Students Highlight Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-600" />
                Daftar Keterlambatan Terkini
              </h3>
              <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-semibold border border-rose-200">
                Live Update
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Siswa yang terdata terlambat pada hari ini:</p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lateArrivals.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">Belum ada catatan keterlambatan untuk tanggal ini.</p>
              ) : (
                lateArrivals.map(item => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                        {item.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{item.studentName}</p>
                        <p className="text-[11px] text-slate-500">{item.className} &bull; NIS: {item.nis}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {item.arrivalTime} WIB
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5 max-w-[140px] truncate">{item.lateReason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 text-right">
            <span className="text-xs text-slate-500 font-medium">Sistem Notifikasi Aktif</span>
          </div>
        </div>

      </div>

    </div>
  );
};
