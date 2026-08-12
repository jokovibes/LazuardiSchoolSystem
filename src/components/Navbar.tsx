import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  School, 
  ChevronDown, 
  LogOut, 
  Check, 
  User, 
  AlertTriangle,
  Menu,
  Sparkles,
  CheckCheck,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { User as UserType, RoleType, NotificationItem } from '../types';

interface NavbarProps {
  currentUser: UserType;
  availableUsers: UserType[];
  onSwitchUser: (user: UserType) => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onClearAllNotifications?: () => void;
  onDeleteNotification?: (id: string) => void;
  onOpenNotificationsModal: () => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  availableUsers,
  onSwitchUser,
  onLogout,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onClearAllNotifications,
  onDeleteNotification,
  onOpenNotificationsModal,
  onToggleSidebar
}) => {
  const [time, setTime] = useState<string>('');
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const getRoleBadgeStyle = (role: RoleType) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-amber-500/20 text-amber-200 border-amber-400/30';
      case 'Admin':
        return 'bg-blue-500/20 text-blue-200 border-blue-400/30';
      case 'Security':
        return 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30';
      case 'Guru':
        return 'bg-purple-500/20 text-purple-200 border-purple-400/30';
      case 'Kepala Unit':
        return 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30';
      case 'Manajemen':
        return 'bg-rose-500/20 text-rose-200 border-rose-400/30';
      default:
        return 'bg-slate-500/20 text-slate-200 border-slate-400/30';
    }
  };

  return (
    <header className="bg-[#1E3A8A] text-white sticky top-0 z-40 shadow-md border-b border-blue-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand & Mobile Sidebar Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-blue-200 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-300/30">
                <School className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base tracking-tight text-white leading-tight">
                    LAZUARDI SCHOOL SYSTEM
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Database Connected
                  </span>
                </div>
                <p className="text-[11px] text-blue-200 font-medium">Student Attendance & Movement Monitoring</p>
              </div>
            </div>
          </div>

          {/* Center: Live WIB Clock */}
          <div className="hidden md:flex items-center gap-2 bg-blue-900/60 border border-blue-700/40 px-3.5 py-1.5 rounded-full text-xs text-blue-100 font-mono">
            <Clock className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>{time || '00:00:00 WIB'}</span>
          </div>

          {/* Right: Notifications & User Persona Switcher */}
          <div className="flex items-center gap-3">

            {/* Notification Drawer Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Notifikasi Sistem"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification Popup Menu */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Header Bar */}
                  <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-400" />
                      <span className="font-semibold text-sm">Notifikasi Sistem</span>
                    </div>
                    <span className="text-xs bg-blue-800 text-blue-200 px-2 py-0.5 rounded-md font-mono">
                      {unreadNotifs.length} Baru
                    </span>
                  </div>

                  {/* Quick Actions Bar */}
                  <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between text-xs font-semibold px-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (onMarkAllNotificationsRead) onMarkAllNotificationsRead();
                      }}
                      disabled={unreadNotifs.length === 0}
                      className="text-blue-700 hover:text-blue-900 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                      title="Tandai semua notifikasi sebagai sudah dibaca"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Sudah Dibaca Semua
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onClearAllNotifications && window.confirm('Hapus seluruh notifikasi dari sistem?')) {
                          onClearAllNotifications();
                        }
                      }}
                      disabled={notifications.length === 0}
                      className="text-rose-600 hover:text-rose-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                      title="Clear / Hapus seluruh notifikasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear Notifikasi
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 space-y-1">
                        <Bell className="w-6 h-6 text-slate-300 mx-auto" />
                        <p className="text-xs font-medium">Tidak ada notifikasi saat ini.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 6).map(n => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors flex items-start gap-2.5 ${
                            !n.isRead ? 'bg-blue-50/60 font-medium' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === 'overdue' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-500" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => onMarkNotificationRead(n.id)}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-slate-800 text-xs">{n.title}</p>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-snug">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-mono">{n.timestamp} &bull; {n.channel}</p>
                          </div>
                          {onDeleteNotification && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteNotification(n.id);
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                              title="Hapus Notifikasi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer Link */}
                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    
                  </div>
                </div>
              )}
            </div>

            {/* Role / User Persona Dropdown Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 rounded-xl transition-all"
              >
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={currentUser?.name || 'User'}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-400/50"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-white leading-tight max-w-[130px] truncate">
                    {currentUser?.name || 'User'}
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(currentUser?.role || 'Super Admin')}`}>
                    {currentUser?.role || 'Super Admin'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-blue-200" />
              </button>

              {/* User Profile Dropdown */}
              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3.5 bg-slate-100 border-b border-slate-200 flex items-center gap-3">
                    <img
                      src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={currentUser?.name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name || 'User'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser?.email || currentUser?.username || ''}</p>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 mt-1 rounded border ${getRoleBadgeStyle(currentUser?.role || 'Super Admin')}`}>
                        {currentUser?.role || 'Super Admin'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 space-y-2">
                    <button
                      onClick={() => {
                        setIsRoleMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-200/60"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar / Logout
                    </button>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 pt-0.5">
                      <span>Hak Akses Terverifikasi</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Quick Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-blue-200 hover:text-rose-200 hover:bg-white/10 transition-colors"
              title="Keluar / Logout dari Sistem"
            >
              <LogOut className="w-5 h-5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
