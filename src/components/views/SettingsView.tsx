import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Database, 
  RefreshCw,
  Building2,
  Copy,
  Check,
  AlertCircle,
  Code,
  Plus,
  Pencil,
  Trash2,
  X,
  GraduationCap,
  Building,
  Filter,
  Layers,
  Users,
  Cpu
} from 'lucide-react';
import { SystemSetting, SchoolUnit, StudentClass } from '../../types';
import { testSupabaseConnection, SUPABASE_CONFIG, SUPABASE_POSTGRES_DDL } from '../../lib/supabase';

interface SettingsViewProps {
  settings: SystemSetting;
  onSaveSettings: (newSettings: SystemSetting) => void;
  units: SchoolUnit[];
  classes: StudentClass[];
  onAddUnit: (unit: Omit<SchoolUnit, 'id'>) => void;
  onEditUnit: (unit: SchoolUnit) => void;
  onDeleteUnit: (unitId: string) => void;
  onAddClass: (cls: Omit<StudentClass, 'id'>) => void;
  onEditClass: (cls: StudentClass) => void;
  onDeleteClass: (classId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  units,
  classes,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onAddClass,
  onEditClass,
  onDeleteClass
}) => {
  const [activeTab, setActiveTab] = useState<'system' | 'units-classes'>('system');
  const [formData, setFormData] = useState<SystemSetting>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ testing: boolean; success?: boolean; message?: string }>({ testing: false });
  const [copiedDdl, setCopiedDdl] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  // Unit State
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [unitCode, setUnitCode] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitHeadmaster, setUnitHeadmaster] = useState('');
  const [editingUnit, setEditingUnit] = useState<SchoolUnit | null>(null);
  const [deletingUnitTarget, setDeletingUnitTarget] = useState<SchoolUnit | null>(null);

  // Class State
  const [filterClassUnit, setFilterClassUnit] = useState<string>('ALL');
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [classUnitId, setClassUnitId] = useState('');
  const [classNameStr, setClassNameStr] = useState('');
  const [classTeacher, setClassTeacher] = useState('');
  const [editingClass, setEditingClass] = useState<StudentClass | null>(null);
  const [deletingClassTarget, setDeletingClassTarget] = useState<StudentClass | null>(null);

  useEffect(() => {
    handleTestDbConnection();
  }, []);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleTestDbConnection = async () => {
    setDbStatus({ testing: true });
    const res = await testSupabaseConnection();
    setDbStatus({ testing: false, success: res.success, message: res.message });
  };

  const handleCopyDdl = () => {
    navigator.clipboard.writeText(SUPABASE_POSTGRES_DDL);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  const handleSubmitSystem = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Unit Handlers
  const handleSaveAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitCode.trim() || !unitName.trim()) return;
    onAddUnit({
      code: unitCode.toUpperCase(),
      name: unitName,
      headmasterName: unitHeadmaster || 'Belum Ditentukan',
      totalStudents: 0
    });
    setUnitCode('');
    setUnitName('');
    setUnitHeadmaster('');
    setIsAddingUnit(false);
  };

  const startEditUnitModal = (u: SchoolUnit) => {
    setEditingUnit(u);
    setUnitCode(u.code);
    setUnitName(u.name);
    setUnitHeadmaster(u.headmasterName);
  };

  const handleSaveEditUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    onEditUnit({
      ...editingUnit,
      code: unitCode.toUpperCase(),
      name: unitName,
      headmasterName: unitHeadmaster
    });
    setEditingUnit(null);
    setUnitCode('');
    setUnitName('');
    setUnitHeadmaster('');
  };

  const confirmDeleteUnit = () => {
    if (!deletingUnitTarget) return;
    onDeleteUnit(deletingUnitTarget.id);
    setDeletingUnitTarget(null);
  };

  // Class Handlers
  const handleSaveAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUnitId = classUnitId || units[0]?.id || '';
    if (!classNameStr.trim() || !targetUnitId) return;
    onAddClass({
      unitId: targetUnitId,
      name: classNameStr,
      homeroomTeacher: classTeacher || 'Belum Ditentukan',
      totalStudents: 0
    });
    setClassNameStr('');
    setClassTeacher('');
    setIsAddingClass(false);
  };

  const startEditClassModal = (c: StudentClass) => {
    setEditingClass(c);
    setClassUnitId(c.unitId);
    setClassNameStr(c.name);
    setClassTeacher(c.homeroomTeacher);
  };

  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    onEditClass({
      ...editingClass,
      unitId: classUnitId || editingClass.unitId,
      name: classNameStr,
      homeroomTeacher: classTeacher
    });
    setEditingClass(null);
    setClassNameStr('');
    setClassTeacher('');
  };

  const confirmDeleteClass = () => {
    if (!deletingClassTarget) return;
    onDeleteClass(deletingClassTarget.id);
    setDeletingClassTarget(null);
  };

  const filteredClasses = classes.filter(c => filterClassUnit === 'ALL' || c.unitId === filterClassUnit);

  return (
    <div className="space-y-6">
      
      {/* Top Navigation Tabs */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Pengaturan Sistem & Struktur Sekolah
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi database Cloud, jam operasional presensi, sensitivitas AI, dan manajemen unit/kelas.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'system'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-600" />
            Parameter Sistem & Database
          </button>

          <button
            onClick={() => setActiveTab('units-classes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'units-classes'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-amber-500" />
            Unit Sekolah & Kelas ({units.length} Unit, {classes.length} Kelas)
          </button>
        </div>
      </div>

      {activeTab === 'system' && (
        <div className="space-y-6">        
          

          <form onSubmit={handleSubmitSystem} className="space-y-6">
            
            {/* Section 1: School Identity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                1. Identitas Sekolah & Tahun Akademik
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Instansi Sekolah</label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Ajaran & Semester</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Time Cutoffs */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                2. Batas Jam Operasional Presensi
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Maksimal Datang Terlalu Pagi</label>
                  <input
                    type="time"
                    value={formData.earlyArrivalCutoff}
                    onChange={(e) => setFormData({ ...formData, earlyArrivalCutoff: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-amber-600"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Siswa hadir sebelum jam ini dicatat sebagai Kedatangan Dini.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Kedatangan Normal</label>
                  <input
                    type="time"
                    value={formData.normalArrivalCutoff}
                    onChange={(e) => setFormData({ ...formData, normalArrivalCutoff: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Mulai Terlambat</label>
                  <input
                    type="time"
                    value={formData.lateArrivalCutoff}
                    onChange={(e) => setFormData({ ...formData, lateArrivalCutoff: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-rose-600"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Siswa hadir setelah jam ini ditandai Terlambat.</p>
                </div>
              </div>
            </div>



            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
              >
                <Save className="w-5 h-5" />
                Simpan Seluruh Pengaturan
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Tab: Units & Classes Management */}
      {activeTab === 'units-classes' && (
        <div className="space-y-6">
          
          {/* Section 1: School Units */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-500" />
                  Daftar Unit Sekolah (TK / SD / SMP / SMA)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Seluruh perubahan unit otomatis disinkronkan ke Database.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingUnit(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Tambah Unit Sekolah
              </button>
            </div>

            {/* Add Unit Form Modal */}
            {isAddingUnit && (
              <form onSubmit={handleSaveAddUnit} className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                  <h4 className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-blue-600" />
                    Formulir Unit Sekolah Baru
                  </h4>
                  <button type="button" onClick={() => setIsAddingUnit(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kode Unit (e.g., SD, SMP)</label>
                    <input
                      type="text"
                      value={unitCode}
                      onChange={(e) => setUnitCode(e.target.value)}
                      placeholder="e.g. SMA"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Lengkap Unit</label>
                    <input
                      type="text"
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      placeholder="e.g. SMA Lazuardi High"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Kepala Unit / Sekolah</label>
                    <input
                      type="text"
                      value={unitHeadmaster}
                      onChange={(e) => setUnitHeadmaster(e.target.value)}
                      placeholder="e.g. Dr. H. Ahmad Fauzi, M.Pd"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setIsAddingUnit(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
                    Batal
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs">
                    Simpan Unit
                  </button>
                </div>
              </form>
            )}

            {/* Units Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Unit Sekolah</th>
                    <th className="p-3">Kepala Unit</th>
                    <th className="p-3 text-center">Jumlah Kelas</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {units.map(u => {
                    const unitClassesCount = classes.filter(c => c.unitId === u.id).length;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-blue-700">{u.code}</td>
                        <td className="p-3 font-bold text-slate-800">{u.name}</td>
                        <td className="p-3 text-slate-600">{u.headmasterName}</td>
                        <td className="p-3 text-center">
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                            {unitClassesCount} Kelas
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEditUnitModal(u)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg cursor-pointer"
                              title="Edit Unit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingUnitTarget(u)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg cursor-pointer"
                              title="Hapus Unit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Student Classes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Daftar Kelas Siswa
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Kelola nama kelas dan wali kelas yang terhubung dengan database.</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Unit */}
                <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={filterClassUnit}
                    onChange={(e) => setFilterClassUnit(e.target.value)}
                    className="bg-transparent font-semibold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="ALL">Semua Unit Sekolah</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingClass(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Kelas Baru
                </button>
              </div>
            </div>

            {/* Add Class Form Modal */}
            {isAddingClass && (
              <form onSubmit={handleSaveAddClass} className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200">
                  <h4 className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-600" />
                    Formulir Kelas Baru
                  </h4>
                  <button type="button" onClick={() => setIsAddingClass(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Unit Sekolah</label>
                    <select
                      value={classUnitId || units[0]?.id || ''}
                      onChange={(e) => setClassUnitId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      required
                    >
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Kelas (e.g., 10-IPA-1)</label>
                    <input
                      type="text"
                      value={classNameStr}
                      onChange={(e) => setClassNameStr(e.target.value)}
                      placeholder="e.g. Kelas 8-C"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Wali Kelas</label>
                    <input
                      type="text"
                      value={classTeacher}
                      onChange={(e) => setClassTeacher(e.target.value)}
                      placeholder="e.g. Ibu Siti Nurhaliza, S.Pd"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setIsAddingClass(false)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
                    Batal
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs">
                    Simpan Kelas
                  </button>
                </div>
              </form>
            )}

            {/* Classes Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Nama Kelas</th>
                    <th className="p-3">Unit Sekolah</th>
                    <th className="p-3">Wali Kelas</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClasses.map(c => {
                    const parentUnit = units.find(u => u.id === c.unitId);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-800">{c.name}</td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md border border-blue-100">
                            {parentUnit?.name || 'Unit Unknown'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{c.homeroomTeacher}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => startEditClassModal(c)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg cursor-pointer"
                              title="Edit Kelas"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingClassTarget(c)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg cursor-pointer"
                              title="Hapus Kelas"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Edit Unit Modal */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditUnit} className="bg-white p-6 rounded-2xl border border-amber-300 shadow-2xl max-w-lg w-full space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" />
                Edit Unit Sekolah
              </h3>
              <button type="button" onClick={() => setEditingUnit(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Unit</label>
                <input
                  type="text"
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Unit Sekolah</label>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kepala Unit / Kepala Sekolah</label>
                <input
                  type="text"
                  value={unitHeadmaster}
                  onChange={(e) => setUnitHeadmaster(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setEditingUnit(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md">
                Simpan Perubahan Unit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Unit Confirmation Modal */}
      {deletingUnitTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full space-y-4 my-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Unit Sekolah</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus unit <span className="font-bold text-slate-800">{deletingUnitTarget.name}</span>?
                </p>
                <p className="text-[11px] text-rose-600 font-semibold mt-2 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  ⚠️ Menghapus unit juga akan menghapus seluruh data kelas yang terkait dari Supabase.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setDeletingUnitTarget(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer">
                Batal
              </button>
              <button type="button" onClick={confirmDeleteUnit} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md">
                Ya, Hapus Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEditClass} className="bg-white p-6 rounded-2xl border border-amber-300 shadow-2xl max-w-lg w-full space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" />
                Edit Kelas Siswa
              </h3>
              <button type="button" onClick={() => setEditingClass(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Sekolah</label>
                <select
                  value={classUnitId}
                  onChange={(e) => setClassUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  required
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  value={classNameStr}
                  onChange={(e) => setClassNameStr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Wali Kelas</label>
                <input
                  type="text"
                  value={classTeacher}
                  onChange={(e) => setClassTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setEditingClass(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer">
                Batal
              </button>
              <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md">
                Simpan Perubahan Kelas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Class Confirmation Modal */}
      {deletingClassTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full space-y-4 my-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Kelas Siswa</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus kelas <span className="font-bold text-slate-800">{deletingClassTarget.name}</span>?
                </p>
                <p className="text-[11px] text-rose-600 font-semibold mt-2 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  ⚠️ Data kelas ini akan dihapus dari Supabase.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setDeletingClassTarget(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer">
                Batal
              </button>
              <button type="button" onClick={confirmDeleteClass} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md">
                Ya, Hapus Kelas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SQL Script Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Supabase PostgreSQL Schema (DDL)</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto font-mono text-xs text-emerald-400 bg-slate-950 leading-relaxed custom-scrollbar flex-1">
              <pre className="whitespace-pre-wrap">{SUPABASE_POSTGRES_DDL}</pre>
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
              <p className="text-xs text-slate-400">Jalankan di: Supabase Dashboard ➔ SQL Editor ➔ Run</p>
              <button
                onClick={handleCopyDdl}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                {copiedDdl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedDdl ? 'Berhasil Di-copy!' : 'Copy Script SQL'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
