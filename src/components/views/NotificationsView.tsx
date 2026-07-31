import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Bot, 
  Sparkles,
  ExternalLink,
  Trash2,
  CheckCheck,
  Filter,
  Database,
  RefreshCw,
  Plus,
  ShieldAlert,
  Clock,
  School
} from 'lucide-react';
import { NotificationItem, SystemSetting, SchoolUnit } from '../../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  settings: SystemSetting;
  units: SchoolUnit[];
  onSendNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  settings,
  units,
  onSendNotification,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onDeleteNotification,
  onClearAllNotifications
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [testPhone, setTestPhone] = useState('081298765432');
  
  // Custom Notification Broadcast Form State
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<'early' | 'late' | 'exit' | 'overdue' | 'system'>('system');
  const [newChannel, setNewChannel] = useState<'In-App' | 'WhatsApp' | 'Email' | 'Telegram'>('WhatsApp');
  const [newTargetUnit, setNewTargetUnit] = useState<string>('Semua Unit');
  
  const [isDeletingAllModal, setIsDeletingAllModal] = useState(false);
  const [deletingNotifTarget, setDeletingNotifTarget] = useState<NotificationItem | null>(null);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    onSendNotification({
      type: newType,
      title: newTitle,
      message: newMessage,
      channel: newChannel,
      targetUnit: newTargetUnit
    });

    if (newChannel === 'WhatsApp') {
      const encoded = encodeURIComponent(`*[${newTitle}]*\n${newMessage}`);
      window.open(`https://api.whatsapp.com/send?phone=62${testPhone.replace(/^0/, '')}&text=${encoded}`, '_blank');
    }

    setNewTitle('');
    setNewMessage('');
    setBroadcastSuccess(true);
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'ALL') return true;
    if (filterType === 'UNREAD') return !n.isRead;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      
      {/* Title & Supabase Status Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Pusat Notifikasi & Supabase Sync
            </h2>
            <span className="bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Supabase DB Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan pesan otomatis presensi, keterlambatan, izin keluar, dan broadcast langsung ke database Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onMarkAllNotificationsRead}
            disabled={unreadCount === 0}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold flex items-center gap-1.5 border border-blue-200 cursor-pointer transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Tandai Semua Dibaca ({unreadCount})
          </button>

          <button
            onClick={() => setIsDeletingAllModal(true)}
            disabled={notifications.length === 0}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-200 cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Bersihkan Semua
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Notifikasi</span>
          <p className="text-xl font-black text-slate-800">{notifications.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Belum Dibaca</span>
          <p className="text-xl font-black text-rose-600">{unreadCount}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Warning Overdue</span>
          <p className="text-xl font-black text-amber-600">
            {notifications.filter(n => n.type === 'overdue').length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Broadcast Terkirim</span>
          <p className="text-xl font-black text-emerald-600">
            {notifications.filter(n => n.type === 'system').length}
          </p>
        </div>
      </div>

      {/* Form Broadcast & Console WhatsApp */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form Broadcast Baru */}
        <form onSubmit={handleSendBroadcast} className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Kirim Notifikasi / Broadcast Baru ke Database
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Tersimpan ke table 'notifications'</span>
          </div>

          {broadcastSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Notifikasi berhasil disimpan ke Supabase Database & terkirim ke target!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Notifikasi</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="system">Sistem / Broadcast Sekolah</option>
                <option value="late">Keterlambatan Siswa</option>
                <option value="exit">Izin Keluar Meninggalkan Sekolah</option>
                <option value="overdue">Peringatan Overdue Izin</option>
                <option value="early">Kedatangan Dini</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kanal Pengiriman</label>
              <select
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="WhatsApp">WhatsApp Gateway</option>
                <option value="In-App">In-App Notification</option>
                <option value="Email">Email Notification</option>
                <option value="Telegram">Telegram Bot Alert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Unit Sekolah</label>
              <select
                value={newTargetUnit}
                onChange={(e) => setNewTargetUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="Semua Unit">Semua Unit Sekolah</option>
                {units.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Notifikasi</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Pengumuman Kegiatan Pagi Sekolah Lazuardi"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Pesan Notifikasi</label>
            <textarea
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tuliskan isi informasi yang akan dikirim..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-sans"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-semibold text-slate-600">No. WA Uji Coba:</label>
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-bold w-32"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
              Kirim & Simpan ke Supabase
            </button>
          </div>
        </form>

        {/* Right 1 Col: Info Config Supabase & WA API */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between border border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              Konfigurasi WhatsApp & Supabase
            </h3>
            <p className="text-xs text-slate-400 mt-1">Status integrasi pesan otomatis Lazuardi:</p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between">
                <span className="text-slate-400">Database Table:</span>
                <span className="font-mono font-bold text-emerald-400">public.notifications</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between">
                <span className="text-slate-400">Sender No:</span>
                <span className="font-mono font-bold text-sky-300">{settings.waPhoneSender}</span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between">
                <span className="text-slate-400">Auto Overdue Alert:</span>
                <span className="font-bold text-emerald-400">Aktif (Tiap 15m)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Sinkronisasi otomatis aktif</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

      </div>

      {/* Log History & Filter Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Daftar Notifikasi di Supabase ({filteredNotifications.length})
          </h3>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'ALL' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('UNREAD')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'UNREAD' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
            <button
              onClick={() => setFilterType('late')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'late' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Terlambat
            </button>
            <button
              onClick={() => setFilterType('overdue')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'overdue' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilterType('system')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterType === 'system' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Broadcast
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">Tidak ada notifikasi yang sesuai filter.</p>
          ) : (
            filteredNotifications.map(n => (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between gap-4 text-xs transition-colors hover:bg-slate-50/80 ${
                  !n.isRead ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'overdue' ? (
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                    ) : n.type === 'late' ? (
                      <Clock className="w-5 h-5 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{n.title}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md font-mono">
                        {n.channel}
                      </span>
                      {n.targetUnit && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md border border-blue-100">
                          {n.targetUnit}
                        </span>
                      )}
                      {!n.isRead && (
                        <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                          Baru
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 font-sans text-xs leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{n.timestamp}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => onMarkNotificationRead(n.id)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg cursor-pointer"
                      title="Tandai Dibaca"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setDeletingNotifTarget(n)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                    title="Hapus Notifikasi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Delete Single Notification Modal */}
      {deletingNotifTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full space-y-4 my-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Notifikasi</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hapus notifikasi "<span className="font-bold text-slate-800">{deletingNotifTarget.title}</span>"?
                </p>
                <p className="text-[11px] text-rose-600 font-semibold mt-2 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  ⚠️ Notifikasi ini akan dihapus permanen dari Supabase Database.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeletingNotifTarget(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteNotification(deletingNotifTarget.id);
                  setDeletingNotifTarget(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
              >
                Hapus dari DB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Modal */}
      {isDeletingAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full space-y-4 my-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bersihkan Semua Notifikasi</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus seluruh {notifications.length} notifikasi dari database Supabase?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsDeletingAllModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onClearAllNotifications();
                  setIsDeletingAllModal(false);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md"
              >
                Hapus Semua Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
