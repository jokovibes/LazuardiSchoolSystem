import React from 'react';
import { 
  LayoutDashboard, 
  Sunrise, 
  Clock, 
  LogOut, 
  Car, 
  FileText, 
  ScanFace, 
  Users, 
  Bell, 
  Database, 
  Settings, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { RoleType } from '../types';

export type ActiveTab = 
  | 'dashboard'
  | 'early-arrival'
  | 'late-arrival'
  | 'exit-permission'
  | 'transportation'
  | 'reports'
  | 'face-mgmt'
  | 'users-rbac'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userRole: RoleType;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  isOpenMobile,
  onCloseMobile
}) => {
  const menuItems: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: string;
    allowedRoles: RoleType[];
    category?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Analitik',
      icon: LayoutDashboard,
      allowedRoles: ['Super Admin', 'Admin', 'Security', 'Guru', 'Kepala Unit', 'Manajemen'],
      category: 'UTAMA'
    },
    {
      id: 'early-arrival',
      label: '1. Datang Terlalu Pagi',
      icon: Sunrise,
      allowedRoles: ['Super Admin', 'Admin', 'Security', 'Kepala Unit', 'Manajemen'],
      category: 'PENCATATAN PRESENSI'
    },
    {
      id: 'late-arrival',
      label: '2. Terlambat Datang',
      icon: Clock,
      allowedRoles: ['Super Admin', 'Admin', 'Security', 'Guru', 'Kepala Unit', 'Manajemen'],
      category: 'PENCATATAN PRESENSI'
    },
    {
      id: 'exit-permission',
      label: '3. Izin Keluar Sekolah',
      icon: LogOut,
      allowedRoles: ['Super Admin', 'Admin', 'Security', 'Guru', 'Kepala Unit', 'Manajemen'],
      category: 'PENCATATAN PRESENSI'
    },
    {
      id: 'transportation',
      label: '4. Pulang & Transportasi',
      icon: Car,
      allowedRoles: ['Super Admin', 'Admin', 'Security', 'Guru', 'Kepala Unit', 'Manajemen'],
      category: 'PENCATATAN PRESENSI'
    },
    {
      id: 'reports',
      label: 'Rekap & Laporan',
      icon: FileText,
      allowedRoles: ['Super Admin', 'Admin', 'Guru', 'Kepala Unit', 'Manajemen'],
      category: 'ANALISIS & LAPORAN'
    },
    {
      id: 'face-mgmt',
      label: 'Daftar Siswa',
      icon: Users,
      allowedRoles: ['Super Admin', 'Admin', 'Security'],
      category: 'SISTEM & AKUNTABILITAS'
    },
    {
      id: 'users-rbac',
      label: 'Pengguna & RBAC',
      icon: Users,
      allowedRoles: ['Super Admin', 'Admin'],
      category: 'SISTEM & AKUNTABILITAS'
    },    
    {
      id: 'settings',
      label: 'Pengaturan Sekolah',
      icon: Settings,
      allowedRoles: ['Super Admin', 'Admin'],
      category: 'PENGATURAN'
    }
  ];

  const categories = ['UTAMA', 'PENCATATAN PRESENSI', 'ANALISIS & LAPORAN', 'SISTEM & AKUNTABILITAS', 'PENGATURAN'];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile} 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden" 
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-[#1E3A8A] text-white border-r border-blue-900/50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6 custom-scrollbar">
          {categories.map(cat => {
            const itemsInCat = menuItems.filter(item => item.category === cat);
            if (itemsInCat.length === 0) return null;

            return (
              <div key={cat} className="space-y-1.5">
                <p className="px-3 text-[10px] font-bold text-blue-200/60 uppercase tracking-widest">
                  {cat}
                </p>

                {itemsInCat.map(item => {
                  const isAllowed = item.allowedRoles.includes(userRole);
                  const isActive = activeTab === item.id;

                  if (!isAllowed) {
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-3 py-2 text-xs text-blue-200/30 rounded-lg cursor-not-allowed select-none"
                        title={`Akses dibatasi untuk role: ${userRole}`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-blue-300/30" />
                          <span>{item.label}</span>
                        </div>
                        <ShieldAlert className="w-3.5 h-3.5 text-blue-300/30" />
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white/10 text-white font-bold border-l-4 border-sky-400 shadow-sm'
                          : 'text-blue-100/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-sky-300' : 'text-blue-200/70'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-300" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-[#162B68] flex items-center justify-between text-left">
          <div>
            <p className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider">Lazuardi System v1.1</p>
            <p className="text-[9px] text-blue-300/50 mt-0.5">Monitoring Presensi & Movement</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Connected" />
        </div>
      </aside>
    </>
  );
};
