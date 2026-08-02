import React, { useState } from 'react';
import { 
  School, 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Key, 
  Eye, 
  EyeOff, 
  LogIn, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Database,
  Building2,
  Users
} from 'lucide-react';
import { User, RoleType, SchoolUnit } from '../../types';

interface LoginViewProps {
  availableUsers: User[];
  units: SchoolUnit[];
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  availableUsers,
  units,
  onLoginSuccess
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const trimmedIdentifier = identifier.trim().toLowerCase();
      const trimmedPassword = password.trim();

      // Find matching user by username or email from Supabase users list
      const matched = availableUsers.find(
        u => (u.username && u.username.toLowerCase() === trimmedIdentifier) ||
             (u.email && u.email.toLowerCase() === trimmedIdentifier)
      );

      if (!matched) {
        setErrorMsg('Username/Email atau Password tidak ditemukan pada database.');
        setIsLoading(false);
        return;
      }

      if (matched.status === 'Inactive') {
        setErrorMsg('Akun pengguna ini nonaktif. Silakan hubungi Administrator.');
        setIsLoading(false);
        return;
      }

      if (!matched.password || trimmedPassword !== matched.password) {
        setErrorMsg('Kata sandi (password) salah. Silakan periksa kembali.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onLoginSuccess(matched);
    }, 300);
  };

  const getRoleBadgeColor = (role: RoleType) => {
    switch (role) {
      case 'Super Admin': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Admin': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Security': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Guru': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Kepala Unit': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Manajemen': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1E3A8A] to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-800 relative overflow-hidden">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
        
        {/* Left Side: School Branding & Portal Description (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#1E3A8A] to-blue-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          
          <div className="space-y-6">
            {/* Header Brand */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/30 border border-white/20">
                <School className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white leading-tight">LAZUARDI SCHOOL</h1>
                <p className="text-xs text-sky-200 font-medium">Integrated Attendance System</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-blue-800/60">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Cloud Database Ready
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                Portal Presensi & Pemantauan Siswa
              </h2>
              <p className="text-xs text-blue-200 leading-relaxed">
                Sistem terpadu pengawasan kedatangan dini, keterlambatan, izin keluar, penjemputan, serta verifikasi wajah face recognition.
              </p>
            </div>

            {/* School Units Overview */}
            <div className="space-y-2 pt-2">
              <p className="text-[11px] uppercase tracking-wider text-sky-300 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Unit Sekolah Lazuardi:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {units.map(u => (
                  <span key={u.id} className="text-[11px] bg-white/10 text-blue-100 px-2.5 py-1 rounded-lg border border-white/10 font-medium">
                    {u.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-blue-800/60 flex items-center justify-between text-[11px] text-blue-300">
            <span>Tahun Ajaran 2026/2027</span>
            <div className="flex items-center gap-1 font-mono">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>v1.1 Live</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form & Persona Switcher (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 space-y-6 flex flex-col justify-between bg-white">
          
          <div className="space-y-6">
            
            {/* Form Header */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <LogIn className="w-5 h-5 text-blue-600" />
                Masuk ke Akun Anda
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan nama pengguna / e-mail dan kata sandi yang telah terdaftar.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Input */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Username atau Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. admin.utama / guru.sd"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Ingat Saya di Perangkat Ini</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Lupa Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Masuk ke Dashboard Presensi
                  </>
                )}
              </button>

            </form>           

          </div>

          <p className="text-[11px] text-center text-slate-400 pt-4">
            &copy; 2026 Lazuardi School System &bull; Hak Cipta Dilindungi Undang-Undang
          </p>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Petunjuk Akses Login & Reset Password</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Untuk menambah akses login dan reset password silahkan hubungi tim IT Lazuardi
                </p>                
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Paham
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
