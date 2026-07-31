import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Plus, 
  Search, 
  Lock, 
  Activity, 
  Key, 
  CheckCircle2, 
  XCircle,
  FileText,
  Pencil,
  Trash2,
  X,
  Edit3,
  Eye,
  EyeOff,
  Upload,
  Camera,
  Image as ImageIcon,
  Copy,
  Check,
  Code,
  Database
} from 'lucide-react';
import { User, RoleType, AuditLog, SchoolUnit, StudentClass } from '../../types';

interface UserRoleMgmtViewProps {
  users: User[];
  auditLogs: AuditLog[];
  units: SchoolUnit[];
  classes: StudentClass[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
];

export const UserRoleMgmtView: React.FC<UserRoleMgmtViewProps> = ({
  users,
  auditLogs,
  units,
  classes,
  onAddUser,
  onEditUser,
  onDeleteUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'matrix' | 'audit'>('users');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // New user state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [role, setRole] = useState<RoleType>('Security');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);

  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserTarget, setDeletingUserTarget] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editRole, setEditRole] = useState<RoleType>('Security');
  const [editUnitId, setEditUnitId] = useState('');
  const [editAssignedClass, setEditAssignedClass] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');

  // Table visible passwords state
  const [visiblePasswordUserIds, setVisiblePasswordUserIds] = useState<Record<string, boolean>>({});
  const [copiedSql, setCopiedSql] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopySql = () => {
    const sqlText = `-- 1. Buat Tabel Users jika belum ada di Supabase
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  unit_id TEXT,
  assigned_class TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Jika tabel 'users' sudah ada, tambahkan kolom password & avatar_url:
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const rolesList: RoleType[] = ['Super Admin', 'Admin', 'Security', 'Guru', 'Kepala Unit', 'Manajemen'];

  // Interactive RBAC Matrix State
  const [permissionsMatrix, setPermissionsMatrix] = useState<
    { id: string; module: string; roles: Record<RoleType, 'Full' | 'Read' | 'None'> }[]
  >([
    {
      id: 'mod-1',
      module: '1. Datang Terlalu Pagi',
      roles: { 'Super Admin': 'Full', 'Admin': 'Full', 'Security': 'Full', 'Guru': 'Read', 'Kepala Unit': 'Read', 'Manajemen': 'Read' }
    },
    {
      id: 'mod-2',
      module: '2. Terlambat Datang',
      roles: { 'Super Admin': 'Full', 'Admin': 'Full', 'Security': 'Full', 'Guru': 'Read', 'Kepala Unit': 'Read', 'Manajemen': 'Read' }
    },
    {
      id: 'mod-3',
      module: '3. Izin Keluar Sekolah',
      roles: { 'Super Admin': 'Full', 'Admin': 'Full', 'Security': 'Full', 'Guru': 'Read', 'Kepala Unit': 'Read', 'Manajemen': 'Read' }
    },
    {
      id: 'mod-4',
      module: '4. Transportasi Kepulangan',
      roles: { 'Super Admin': 'Full', 'Admin': 'Full', 'Security': 'Full', 'Guru': 'Read', 'Kepala Unit': 'Read', 'Manajemen': 'Read' }
    },
    {
      id: 'mod-5',
      module: '5. Face Recognition Datasets',
      roles: { 'Super Admin': 'Full', 'Admin': 'Full', 'Security': 'Read', 'Guru': 'None', 'Kepala Unit': 'None', 'Manajemen': 'None' }
    },
    {
      id: 'mod-6',
      module: '6. Manajemen Pengguna & RBAC',
      roles: { 'Super Admin': 'Full', 'Admin': 'Read', 'Security': 'None', 'Guru': 'None', 'Kepala Unit': 'None', 'Manajemen': 'None' }
    },
    {
      id: 'mod-7',
      module: '7. Laporan & Rekap Eksekutif',
      roles: { 'Super Admin': 'Full', 'Admin': 'Full', 'Security': 'None', 'Guru': 'Read', 'Kepala Unit': 'Full', 'Manajemen': 'Full' }
    }
  ]);

  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');

  const startEditUser = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditUsername(u.username);
    setEditEmail(u.email);
    setEditPassword(u.password || '');
    setShowEditPassword(false);
    setEditRole(u.role);
    setEditUnitId(u.unitId || '');
    setEditAssignedClass(u.assignedClass || '');
    setEditStatus(u.status || 'Active');
    setEditAvatarUrl(u.avatarUrl || PRESET_AVATARS[0]);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onEditUser({
      ...editingUser,
      name: editName,
      username: editUsername,
      email: editEmail,
      password: editPassword,
      role: editRole,
      unitId: editUnitId || undefined,
      assignedClass: editAssignedClass || undefined,
      status: editStatus,
      avatarUrl: editAvatarUrl || PRESET_AVATARS[0]
    });
    setEditingUser(null);
    alert(`Akun pengguna ${editName} berhasil diperbarui!`);
  };

  const handleDeleteUserClick = (u: User) => {
    setDeletingUserTarget(u);
  };

  const confirmDeleteUser = () => {
    if (!deletingUserTarget) return;
    onDeleteUser(deletingUserTarget.id);
    setDeletingUserTarget(null);
  };

  const handleTogglePermission = (moduleId: string, role: RoleType) => {
    setPermissionsMatrix(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      const current = m.roles[role];
      const next: 'Full' | 'Read' | 'None' = current === 'Full' ? 'Read' : current === 'Read' ? 'None' : 'Full';
      return {
        ...m,
        roles: { ...m.roles, [role]: next }
      };
    }));
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;
    setPermissionsMatrix(prev => [
      ...prev,
      {
        id: `mod-${Date.now()}`,
        module: newModuleName,
        roles: { 'Super Admin': 'Full', 'Admin': 'Read', 'Security': 'None', 'Guru': 'None', 'Kepala Unit': 'None', 'Manajemen': 'None' }
      }
    ]);
    setNewModuleName('');
    setIsAddingModule(false);
  };

  const handleDeleteModule = (moduleId: string, moduleName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus modul "${moduleName}" dari matriks hak akses RBAC?`)) {
      setPermissionsMatrix(prev => prev.filter(m => m.id !== moduleId));
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswordUserIds(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      name,
      username,
      email,
      password: password,
      role,
      avatarUrl: avatarUrl || PRESET_AVATARS[0],
      status: 'Active'
    });
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setAvatarUrl(PRESET_AVATARS[0]);
    setShowNewPassword(false);
    setIsAddingUser(false);
    alert(`Pengguna baru ${name} dengan role ${role} berhasil dibuat!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Sistem Autentikasi, Hak Akses (RBAC), & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mengelola akun pengguna, matriks perizinan role (Super Admin, Admin, Security, Guru, Kepala Unit, Manajemen), serta jejak audit sistem.
          </p>
        </div>

        <button
          onClick={() => setIsAddingUser(!isAddingUser)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Sub-tab Selectors */}
      <div className="flex border-b border-slate-200 bg-white px-6 pt-3 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'users'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Daftar Pengguna Sistem
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'matrix'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          Matriks Hak Akses RBAC
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-5 py-2.5 font-bold text-xs border-b-2 flex items-center gap-2 transition-all ${
            activeSubTab === 'audit'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Audit Trail & Activity Log
        </button>
      </div>

      {/* New User Form Modal/Panel */}
      {isAddingUser && (
        <form onSubmit={handleCreateUser} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="font-bold text-slate-800 text-base">Tambah Akun Pengguna Baru</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ahmad Subandi, S.Pd"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ahmad_piket"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmad@lazuardi.sch.id"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi (Password)</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Hak Akses</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-blue-700"
              >
                {rolesList.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Photo Upload Section for New User */}
            <div className="sm:col-span-2 lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <img src={avatarUrl} alt="Preview Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-xs" />
                <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="space-y-2 flex-1 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Foto Profil
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setAvatarUrl)}
                    />
                  </label>
                  <span className="text-xs text-slate-500">atau pilih avatar preset:</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((pUrl, idx) => (
                    <img
                      key={idx}
                      src={pUrl}
                      alt={`Preset Avatar ${idx + 1}`}
                      onClick={() => setAvatarUrl(pUrl)}
                      className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                        avatarUrl === pUrl ? 'border-blue-600 ring-2 ring-blue-300' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-600 shrink-0" />
                  Foto otomatis disimpan ke kolom <code className="font-mono bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">avatar_url</code> di database Supabase.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingUser(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md shadow-blue-600/20"
            >
              Buat Akun Pengguna
            </button>
          </div>
        </form>
      )}

      {/* Edit User Form Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <form onSubmit={handleSaveEditUser} className="bg-white p-6 rounded-2xl border border-amber-300 shadow-2xl max-w-2xl w-full space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" />
                Edit Akun Pengguna: <span className="text-blue-600">{editingUser.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi (Password)</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Sandi Baru..."
                    className="w-full px-3 py-2 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Hak Akses</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as RoleType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-blue-700 focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                >
                  {rolesList.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Tugas</label>
                <select
                  value={editUnitId}
                  onChange={(e) => setEditUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                >
                  <option value="">Semua Unit</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Akun</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                >
                  <option value="Active">Active (Aktif)</option>
                  <option value="Inactive">Inactive (Nonaktif)</option>
                </select>
              </div>

              {/* Photo Upload Section for Edit User */}
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative group shrink-0">
                  <img src={editAvatarUrl || PRESET_AVATARS[0]} alt="Preview Edit Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-xs" />
                  <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="space-y-2 flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Ganti Foto Profil
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, setEditAvatarUrl)}
                      />
                    </label>
                    <span className="text-xs text-slate-500">atau pilih preset:</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {PRESET_AVATARS.map((pUrl, idx) => (
                      <img
                        key={idx}
                        src={pUrl}
                        alt={`Preset Avatar ${idx + 1}`}
                        onClick={() => setEditAvatarUrl(pUrl)}
                        className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                          editAvatarUrl === pUrl ? 'border-amber-600 ring-2 ring-amber-300' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-600 shrink-0" />
                    Perubahan foto akan langsung memperbarui <code className="font-mono bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">avatar_url</code> di Supabase.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-600/20"
              >
                <Pencil className="w-3.5 h-3.5" />
                Simpan Perubahan Akun
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 1: Users List */}
      {activeSubTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Daftar Akun Pengguna Aktif</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Pengguna</th>
                  <th className="p-3">Username & Email</th>
                  <th className="p-3">Password / Sandi</th>
                  <th className="p-3">Role Hak Akses</th>
                  <th className="p-3">Unit / Tugas</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Aksi Menu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800 flex items-center gap-3">
                      <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3">
                      <p className="font-mono text-slate-800">{u.username}</p>
                      <p className="text-[10px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="p-3 font-mono text-xs">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 w-fit">
                        <Key className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-800">
                          {visiblePasswordUserIds[u.id] ? (u.password || '••••••••') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-slate-400 hover:text-slate-700 ml-1 p-0.5 rounded cursor-pointer"
                          title={visiblePasswordUserIds[u.id] ? "Sembunyikan Password" : "Lihat Password"}
                        >
                          {visiblePasswordUserIds[u.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-blue-50 text-blue-800 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{u.assignedClass || u.unitId || 'Semua Unit'}</td>
                    <td className="p-3">
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEditUser(u)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                          title="Edit Pengguna"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUserClick(u)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Matriks Otorisasi Hak Akses Modul (RBAC)</h3>
              <p className="text-xs text-slate-500">Klik pada badge izin untuk mengubah level akses (Full Access &rarr; Read Only &rarr; No Access).</p>
            </div>

            <button
              onClick={() => setIsAddingModule(!isAddingModule)}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Modul RBAC
            </button>
          </div>

          {isAddingModule && (
            <form onSubmit={handleAddModule} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <input
                type="text"
                placeholder="Nama Modul Baru..."
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                required
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
              >
                Simpan Modul
              </button>
              <button
                type="button"
                onClick={() => setIsAddingModule(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
              >
                Batal
              </button>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-3">Modul Aplikasi</th>
                  {rolesList.map(r => (
                    <th key={r} className="p-3 text-center">{r}</th>
                  ))}
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map(pm => (
                  <tr key={pm.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{pm.module}</td>
                    {rolesList.map(r => {
                      const access = pm.roles[r];
                      return (
                        <td key={r} className="p-3 text-center">
                          <button
                            onClick={() => handleTogglePermission(pm.id, r)}
                            className="cursor-pointer transition-transform active:scale-95"
                            title={`Klik untuk ubah izin ${r} pada ${pm.module}`}
                          >
                            {access === 'Full' && (
                              <span className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px] border border-emerald-300 inline-block">
                                Full Access
                              </span>
                            )}
                            {access === 'Read' && (
                              <span className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[10px] border border-blue-300 inline-block">
                                Read Only
                              </span>
                            )}
                            {access === 'None' && (
                              <span className="bg-slate-100 hover:bg-slate-200 text-slate-400 font-semibold px-2 py-0.5 rounded-md text-[10px] inline-block">
                                No Access
                              </span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteModule(pm.id, pm.module)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Hapus Modul ini dari Matriks"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Trail */}
      {activeSubTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Audit Trail & Log Aktivitas Sistem</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Waktu Log</th>
                  <th className="p-3">User & Role</th>
                  <th className="p-3">Aksi Ops</th>
                  <th className="p-3">Modul</th>
                  <th className="p-3">Detail Rincian</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 font-mono">
                    <td className="p-3 text-slate-500">{log.timestamp}</td>
                    <td className="p-3 font-sans font-bold text-slate-800">{log.userName} ({log.userRole})</td>
                    <td className="p-3 font-sans text-blue-700 font-semibold">{log.action}</td>
                    <td className="p-3 font-sans">{log.module}</td>
                    <td className="p-3 font-sans text-slate-600 max-w-xs truncate">{log.details}</td>
                    <td className="p-3 text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUserTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full space-y-4 my-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Akun Pengguna</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus akun pengguna <span className="font-bold text-slate-800">{deletingUserTarget.name}</span> (@{deletingUserTarget.username})?
                </p>
                <p className="text-[11px] text-rose-600 font-semibold mt-2 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  ⚠️ Akun ini dan seluruh hak akses RBAC-nya akan dihapus permanen dari Supabase.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUserTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

     

    </div>
  );
};
