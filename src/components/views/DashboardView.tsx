import React, { useState, useEffect, useRef } from 'react';
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
import { exportToExcel, exportToPdf, exportDashboardWithChartsToPdf, shareRekapToUnit } from '../../utils/exporter';

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
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const chart1Ref = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const chart3Ref = useRef<HTMLDivElement>(null);

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLatestDate = () => {
    const today = getTodayString();
    const allDates: string[] = [];

    earlyArrivals.forEach(r => r.date && allDates.push(r.date));
    lateArrivals.forEach(r => r.date && allDates.push(r.date));
    exitPermissions.forEach(r => r.date && allDates.push(r.date));
    transportRecords.forEach(r => r.date && allDates.push(r.date));

    if (allDates.length === 0) return today;

    allDates.sort((a, b) => b.localeCompare(a));
    const latestInDb = allDates[0];

    return latestInDb > today ? latestInDb : (allDates.includes(today) ? today : latestInDb);
  };

  const [dateFilterMode, setDateFilterMode] = useState<'single' | 'range'>('single');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const latest = getLatestDate();
    if (latest) {
      setSelectedDate(latest);
      if (!startDate || !endDate) {
        const parts = latest.split('-');
        if (parts.length === 3) {
          setStartDate(`${parts[0]}-${parts[1]}-01`);
          setEndDate(latest);
        }
      }
    }
  }, [earlyArrivals, lateArrivals, exitPermissions, transportRecords]);

  // Helper to check if a record's date falls within active filter (single or range)
  const isRecordInDateFilter = (recordDate?: string) => {
    if (!recordDate) return false;
    if (dateFilterMode === 'single') {
      return selectedDate === '' || recordDate === selectedDate;
    } else {
      if (startDate && endDate) {
        return recordDate >= startDate && recordDate <= endDate;
      }
      if (startDate) return recordDate >= startDate;
      if (endDate) return recordDate <= endDate;
      return true;
    }
  };

  // Quick preset dates handler
  const handleSetPreset = (preset: 'today' | 'this_month' | 'last_7_days' | 'last_30_days') => {
    const today = getTodayString();
    const d = new Date();
    if (preset === 'today') {
      setDateFilterMode('single');
      setSelectedDate(today);
    } else if (preset === 'this_month') {
      setDateFilterMode('range');
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      setStartDate(`${year}-${month}-01`);
      setEndDate(today);
    } else if (preset === 'last_7_days') {
      setDateFilterMode('range');
      const past = new Date();
      past.setDate(d.getDate() - 6);
      const pastStr = past.toISOString().split('T')[0];
      setStartDate(pastStr);
      setEndDate(today);
    } else if (preset === 'last_30_days') {
      setDateFilterMode('range');
      const past = new Date();
      past.setDate(d.getDate() - 29);
      const pastStr = past.toISOString().split('T')[0];
      setStartDate(pastStr);
      setEndDate(today);
    }
  };

  // Helper to format date in Indonesian e.g. "22 September 2026"
  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const d = parseInt(parts[2], 10);
        const m = parseInt(parts[1], 10) - 1;
        const y = parts[0];
        return `${d} ${months[m] || ''} ${y}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const activePeriodText = dateFilterMode === 'range'
    ? (startDate && endDate 
        ? `${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}`
        : (startDate ? `Mulai ${formatDateIndo(startDate)}` : (endDate ? `Sampai ${formatDateIndo(endDate)}` : 'Semua Tanggal')))
    : formatDateIndo(selectedDate);

  // Filtering records by unit, class, and date (supporting single date or custom range)
  const filteredEarly = earlyArrivals.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    isRecordInDateFilter(r.date)
  );

  const filteredLate = lateArrivals.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    isRecordInDateFilter(r.date)
  );

  const filteredExit = exitPermissions.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    isRecordInDateFilter(r.date)
  );

  const filteredTransport = transportRecords.filter(r => 
    (selectedUnit === 'ALL' || (r.unitName || '').includes(selectedUnit)) &&
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    isRecordInDateFilter(r.date)
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

  const getDatesBetween = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return [];
    const result: string[] = [];
    const curr = new Date(startStr);
    const end = new Date(endStr);
    
    // Safety guard to avoid browser freeze: max 62 days
    let iterations = 0;
    while (curr <= end && iterations < 62) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      result.push(`${y}-${m}-${d}`);
      curr.setDate(curr.getDate() + 1);
      iterations++;
    }
    return result;
  };

  const recentDates = getRecentDates();

  const trendDates = dateFilterMode === 'range' && startDate && endDate
    ? getDatesBetween(startDate, endDate)
    : recentDates;

  // Chart 1: Real Daily Trend Data from Supabase
  const dailyTrendData = trendDates.map(dateStr => {
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

  // Chart 2: Unit Breakdown filtered by active date & class
  const effectiveUnits = units.length > 0 ? units : [
    { id: 'unit-sd', code: 'SD', name: 'SD Lazuardi Global', headmasterName: '', totalStudents: 0 },
    { id: 'unit-smp', code: 'SMP', name: 'SMP Lazuardi Junior', headmasterName: '', totalStudents: 0 },
    { id: 'unit-sma', code: 'SMA', name: 'SMA Lazuardi Senior High', headmasterName: '', totalStudents: 0 }
  ];

  const dateClassEarly = earlyArrivals.filter(r => 
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    isRecordInDateFilter(r.date)
  );

  const dateClassLate = lateArrivals.filter(r => 
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    isRecordInDateFilter(r.date)
  );

  const dateClassExit = exitPermissions.filter(r => 
    (selectedClass === 'ALL' || r.className === selectedClass) &&
    isRecordInDateFilter(r.date)
  );

  const isRecordInUnit = (rUnitName: string | undefined, rClassName: string | undefined, unitCode: string, unitName: string) => {
    const uCode = (unitCode || '').toLowerCase().trim();
    const uName = (unitName || '').toLowerCase().trim();
    const rUnit = (rUnitName || '').toLowerCase().trim();
    const rClass = (rClassName || '').toLowerCase().trim();

    if (!uCode && !uName) return false;
    if (uCode && (rUnit.includes(uCode) || rClass.startsWith(uCode))) return true;
    if (uName && rUnit.includes(uName)) return true;
    return false;
  };

  const unitBreakdownData = effectiveUnits.map(u => ({
    name: u.code || u.name,
    TerlaluPagi: dateClassEarly.filter(r => isRecordInUnit(r.unitName, r.className, u.code, u.name)).length,
    Terlambat: dateClassLate.filter(r => isRecordInUnit(r.unitName, r.className, u.code, u.name)).length,
    IzinKeluar: dateClassExit.filter(r => isRecordInUnit(r.unitName, r.className, u.code, u.name)).length,
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
  const dateFileLabel = dateFilterMode === 'range' 
    ? `${startDate || 'awal'}_sd_${endDate || 'akhir'}`
    : selectedDate;

  const handleExportDashboardExcel = () => {
    const headers = ['Kategori Indikator', 'Jumlah Siswa (Orang)', 'Status / Catatan'];
    const rows = [
      ['Datang Terlalu Pagi', totalEarly, 'Didata oleh Security di Pintu Utama'],
      ['Siswa Terlambat Datang', totalLate, 'Presensi > 07:15 WIB'],
      ['Izin Keluar Sekolah', totalExit, 'Dengan Surat Izin dari Unit'],
      ['Siswa Belum Kembali', totalBelumKembali, 'Peringatan Overdue Status Active'],
      ['Pulang Kendaraan Online (Gojek/Grab)', totalOnlineTransport, 'Siswa terdata saat penjemputan'],
      ['Pulang Jalan Kaki', totalJalanKaki, 'Izin Khusus Area Terdekat'],
      ['Pulang Sepeda', totalSepeda, 'Fasilitas Parkir Sepeda'],
      ['Pulang Bus Sekolah', totalBusSekolah, 'Armada Bus Lazuardi'],
      ['Pulang Dijemput Orang Tua', totalDijemput, 'Izin Penjemput Resmi']
    ];
    exportToExcel('Ringkasan_Dashboard', headers, rows, `Ringkasan_Dashboard_Presensi_${dateFileLabel}`);
  };

  const handleExportDashboardPdf = async () => {
    setIsExportingPdf(true);
    try {
      const headers = ['Indikator Aktivitas', 'Jumlah Siswa', 'Keterangan Analitik'];
      const rows = [
        ['Total Datang Terlalu Pagi', `${totalEarly} Siswa`, 'Hadir sebelum jam 06:15 WIB'],
        ['Total Terlambat Datang', `${totalLate} Siswa`, 'Hadir setelah jam 07:15 WIB'],
        ['Total Izin Keluar Sekolah', `${totalExit} Siswa`, 'Prosedur Izin Meninggalkan Kelas'],
        ['Masih Belum Kembali', `${totalBelumKembali} Siswa`, 'Memerlukan Konfirmasi Petugas'],
        ['Transportasi Online (Gojek/Grab)', `${totalOnlineTransport} Siswa`, 'Izin Penjemputan Driver'],
        ['Jalan Kaki', `${totalJalanKaki} Siswa`, 'Area Radius < 1 KM'],
        ['Sepeda', `${totalSepeda} Siswa`, 'Jalur Sepeda Sekolah'],
        ['Bus Sekolah', `${totalBusSekolah} Siswa`, 'Armada Bus Lazuardi'],
        ['Dijemput Orang Tua', `${totalDijemput} Siswa`, 'Zona Drop-off / Pickup']
      ];

      const chartElements = [chart1Ref.current, chart2Ref.current, chart3Ref.current];
      const filterInfo = `Unit: ${selectedUnit === 'ALL' ? 'Semua Unit' : selectedUnit} | Kelas: ${selectedClass === 'ALL' ? 'Semua Kelas' : selectedClass} | Periode: ${activePeriodText}`;

      await exportDashboardWithChartsToPdf(
        'Dashboard Analitik Presensi & Pergerakan Siswa',
        headers,
        rows,
        chartElements,
        `Dashboard_Analitik_Grafik_${dateFileLabel}`,
        filterInfo
      );
    } catch (err) {
      console.error('Error generating PDF with charts:', err);
      alert('Terjadi kesalahan saat mengunduh PDF. Silakan coba lagi.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Section Banner & Global Filters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Dashboard Analitik Presensi & Pergerakan Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ringkasan terpadu aktivitas kedatangan, keterlambatan, izin keluar, dan moda transportasi seluruh unit.
            </p>
          </div>

          {/* Export & Share Action Buttons */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={handleExportDashboardExcel}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Export Excel"
            >
              <Download className="w-3.5 h-3.5" />
              Excel
            </button>
            <button
              onClick={handleExportDashboardPdf}
              disabled={isExportingPdf}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              title="Export PDF dengan Grafik"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              {isExportingPdf ? 'Mengekspor...' : 'PDF'}
            </button>
            <button
              onClick={() => shareRekapToUnit('SEMUA UNIT', 'Dashboard Utama', totalEarly + totalLate + totalExit, [
                `Terlalu Pagi: ${totalEarly} Siswa`,
                `Terlambat: ${totalLate} Siswa`,
                `Izin Keluar: ${totalExit} Siswa`,
                `Transport Online: ${totalOnlineTransport} Siswa`
              ])}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Bagikan Rekap ke Unit"
            >
              <Share2 className="w-3.5 h-3.5" />
              Bagikan
            </button>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
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

          {/* Mode Toggle: Tanggal Tunggal vs Rentang Tanggal */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setDateFilterMode('single')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                dateFilterMode === 'single'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tanggal Tunggal
            </button>
            <button
              type="button"
              onClick={() => {
                setDateFilterMode('range');
                if (!startDate || !endDate) {
                  const latest = getLatestDate();
                  const parts = latest.split('-');
                  if (parts.length === 3) {
                    setStartDate(`${parts[0]}-${parts[1]}-01`);
                    setEndDate(latest);
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                dateFilterMode === 'range'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Rentang Tanggal (Kustom)
            </button>
          </div>

          {/* Single Date Picker */}
          {dateFilterMode === 'single' ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => setSelectedDate(getLatestDate())}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-colors shrink-0 flex items-center gap-1"
                title="Tampilkan Data Tanggal Terbaru"
              >
                Terbaru
              </button>
            </div>
          ) : (
            /* Custom Range Date Pickers */
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-400 text-[11px] font-medium">Dari:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>

              <span className="text-xs text-slate-400 font-semibold">s/d</span>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-400 text-[11px] font-medium">Sampai:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSetPreset('this_month')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                  title="Filter Bulan Ini"
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPreset('last_7_days')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                  title="Filter 7 Hari Terakhir"
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPreset('last_30_days')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                  title="Filter 30 Hari Terakhir"
                >
                  30 Hari
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Period Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/60 border border-blue-100 px-4 py-2 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-blue-900">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Periode Aktif: <strong className="font-bold text-blue-950">{activePeriodText}</strong>
              {dateFilterMode === 'range' && (
                <span className="ml-2 text-[10px] bg-blue-200/80 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
                  Rentang Kustom
                </span>
              )}
            </span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Total Catatan Terfilter: <strong className="text-slate-800 font-bold">{totalEarly + totalLate + totalExit + filteredTransport.length}</strong> siswa
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
        <div ref={chart1Ref} className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Grafik Tren Aktivitas Harian Presensi
              </h3>
              <p className="text-xs text-slate-500">
                {dateFilterMode === 'range'
                  ? `Tren pergerakan harian presensi periode ${activePeriodText}`
                  : 'Perbandingan volume kedatangan dini, keterlambatan, dan izin keluar pekan ini.'}
              </p>
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
        <div ref={chart2Ref} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
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
        <div ref={chart3Ref} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-800 text-base mb-1">
            Rekap Indikator Per Unit Sekolah
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {dateFilterMode === 'range'
              ? `Akumulasi presensi khusus per unit untuk periode ${activePeriodText}.`
              : 'Jumlah presensi khusus per tingkat unit pendidikan.'}
          </p>

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
            <p className="text-xs text-slate-500 mb-3">
              {dateFilterMode === 'range'
                ? `Siswa yang terdata terlambat pada periode terpilih (${activePeriodText}):`
                : `Siswa yang terdata terlambat pada hari ini (${formatDateIndo(selectedDate)}):`}
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {filteredLate.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">Belum ada catatan keterlambatan untuk periode ini ({activePeriodText}).</p>
              ) : (
                filteredLate.map(item => (
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
                      <div className="flex items-center justify-end gap-1">
                        {dateFilterMode === 'range' && item.date && (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                            {item.date.slice(5)}
                          </span>
                        )}
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {item.arrivalTime} WIB
                        </span>
                      </div>
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
