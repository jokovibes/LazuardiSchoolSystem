/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  initialUnits, 
  initialClasses, 
  initialUsers, 
  DEFAULT_FALLBACK_USER,
  initialStudents, 
  initialEarlyArrivals, 
  initialLateArrivals, 
  initialExitPermissions, 
  initialTransportRecords, 
  initialFaceProfiles, 
  initialNotifications, 
  initialAuditLogs, 
  initialSettings 
} from './data/mockData';

import { 
  User, 
  Student, 
  EarlyArrivalRecord, 
  LateArrivalRecord, 
  ExitPermissionRecord, 
  TransportRecord, 
  FaceProfile, 
  NotificationItem, 
  AuditLog, 
  SystemSetting,
  SchoolUnit,
  StudentClass
} from './types';

import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';

import { DashboardView } from './components/views/DashboardView';
import { EarlyArrivalView } from './components/views/EarlyArrivalView';
import { LateArrivalView } from './components/views/LateArrivalView';
import { ExitPermissionView } from './components/views/ExitPermissionView';
import { TransportationView } from './components/views/TransportationView';
import { ReportsView } from './components/views/ReportsView';
import { StudentFaceMgmtView } from './components/views/StudentFaceMgmtView';
import { UserRoleMgmtView } from './components/views/UserRoleMgmtView';
import { NotificationsView } from './components/views/NotificationsView';
import { DatabaseErdView } from './components/views/DatabaseErdView';
import { SettingsView } from './components/views/SettingsView';
import { LoginView } from './components/views/LoginView';

import {
  fetchAllDataFromSupabase,
  seedInitialDataToSupabase,
  dbInsertEarlyArrival,
  dbDeleteEarlyArrival,
  dbInsertLateArrival,
  dbDeleteLateArrival,
  dbInsertExitPermission,
  dbUpdateExitPermissionStatus,
  dbDeleteExitPermission,
  dbInsertTransportRecord,
  dbDeleteTransportRecord,
  dbInsertStudent,
  dbUpdateStudent,
  dbDeleteStudent,
  dbUpdateStudentFaceData,
  dbResetStudentFaceData,
  dbInsertUser,
  dbUpdateUser,
  dbDeleteUser,
  dbInsertNotification,
  dbMarkNotificationRead,
  dbMarkAllNotificationsRead,
  dbDeleteNotification,
  dbClearAllNotifications,
  dbInsertAuditLog,
  dbInsertUnit,
  dbUpdateUnit,
  dbDeleteUnit,
  dbInsertClass,
  dbUpdateClass,
  dbDeleteClass,
  dbSaveSettings,
  testSupabaseConnection
} from './lib/supabase';

export default function App() {
  // Auth State - Default to Login page on initial open
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('lazuardi_auth_logged_in') === 'true';
  });

  // Global State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUserId = sessionStorage.getItem('lazuardi_auth_user_id');
    const matched = initialUsers.find(u => u.id === savedUserId);
    return matched || initialUsers[0] || DEFAULT_FALLBACK_USER;
  });
  const [users, setUsers] = useState<User[]>(initialUsers);
  
  const [units, setUnits] = useState<SchoolUnit[]>(initialUnits);
  const [classes, setClasses] = useState<StudentClass[]>(initialClasses);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [faceProfiles, setFaceProfiles] = useState<FaceProfile[]>(initialFaceProfiles);

  const [earlyArrivals, setEarlyArrivals] = useState<EarlyArrivalRecord[]>(initialEarlyArrivals);
  const [lateArrivals, setLateArrivals] = useState<LateArrivalRecord[]>(initialLateArrivals);
  const [exitPermissions, setExitPermissions] = useState<ExitPermissionRecord[]>(initialExitPermissions);
  const [transportRecords, setTransportRecords] = useState<TransportRecord[]>(initialTransportRecords);

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [settings, setSettings] = useState<SystemSetting>(() => {
    const saved = localStorage.getItem('lazuardi_system_settings');
    if (saved) {
      try {
        return { ...initialSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error loading settings from localStorage:', e);
      }
    }
    return initialSettings;
  });

  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ isConnected: boolean; isSynced: boolean; message: string }>({
    isConnected: false,
    isSynced: false,
    message: 'Memeriksa koneksi Supabase...'
  });

  // Load initial data from Supabase on mount
  useEffect(() => {
    let isMounted = true;

    async function initSupabaseData() {
      const conn = await testSupabaseConnection();
      if (!conn.success) {
        if (isMounted) {
          setDbStatus({
            isConnected: false,
            isSynced: false,
            message: conn.message
          });
        }
        return;
      }

      // Supabase is accessible! Try fetching data
      const data = await fetchAllDataFromSupabase();
      if (data && isMounted) {
        if (data.users && data.users.length > 0) {
          const sanitizedUsers = data.users.map(u => {
            if (u.name?.includes('Joko Raharjo')) {
              const updated: User = {
                ...u,
                name: 'Super Admin Lazuardi',
                email: u.email?.includes('joko') ? 'admin@lazuardi.sch.id' : (u.email || '')
              };
              dbUpdateUser(updated).catch(console.error);
              return updated;
            }
            return u;
          });
          setUsers(sanitizedUsers);

          // Sync active session user with loaded Supabase user record
          const savedUserId = sessionStorage.getItem('lazuardi_auth_user_id');
          if (savedUserId) {
            const activeUser = sanitizedUsers.find(u => u.id === savedUserId);
            if (activeUser) {
              setCurrentUser(activeUser);
            }
          }
        }

        // If Supabase returned rows
        if (data.students.length > 0) {
          setUnits(data.units.length > 0 ? data.units : initialUnits);
          setClasses(data.classes.length > 0 ? data.classes : initialClasses);
          setStudents(data.students);
          setFaceProfiles(data.faceProfiles);
          setEarlyArrivals(data.earlyArrivals);
          setLateArrivals(data.lateArrivals);
          setExitPermissions(data.exitPermissions);
          setTransportRecords(data.transportRecords);
          setNotifications(data.notifications.length > 0 ? data.notifications : initialNotifications);
          setAuditLogs(data.auditLogs.length > 0 ? data.auditLogs : initialAuditLogs);
          if (data.settings) {
            setSettings(data.settings);
            localStorage.setItem('lazuardi_system_settings', JSON.stringify(data.settings));
          }
          
          setDbStatus({
            isConnected: true,
            isSynced: true,
            message: 'Database Supabase Terkoneksi & Ter-sinkronisasi'
          });
        } else {
          // Tables exist but empty -> Seed initial data to Supabase
          setDbStatus({
            isConnected: true,
            isSynced: false,
            message: 'Mengisi data awal ke database Supabase...'
          });

          await seedInitialDataToSupabase(
            initialUnits,
            initialClasses,
            initialUsers,
            initialStudents,
            initialFaceProfiles,
            initialEarlyArrivals,
            initialLateArrivals,
            initialExitPermissions,
            initialTransportRecords,
            initialNotifications,
            initialAuditLogs
          );

          setDbStatus({
            isConnected: true,
            isSynced: true,
            message: 'Database Supabase Berhasil Di-seed & Terkoneksi'
          });
        }
      }
    }

    initSupabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to append audit log
  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: currentUser?.name || 'Sistem',
      userRole: currentUser?.role || 'Super Admin',
      action,
      module,
      details,
      ipAddress: '192.168.1.108'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    dbInsertAuditLog(newLog).catch(err => console.error('Supabase Audit Log error:', err));
  };

  // Handlers for Module 1: Early Arrivals
  const handleAddEarlyArrival = (record: Omit<EarlyArrivalRecord, 'id' | 'createdAt'>) => {
    const newRecord: EarlyArrivalRecord = {
      ...record,
      id: `ear-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setEarlyArrivals(prev => [newRecord, ...prev]);
    dbInsertEarlyArrival(newRecord).catch(err => console.error('Supabase error:', err));

    // Trigger Notification to Supabase
    const newNotif: NotificationItem = {
      id: `ntf-${Date.now()}`,
      type: 'early',
      title: 'Kedatangan Siswa Dini',
      message: `${record.studentName} (${record.className}) terdata hadir pukul ${record.arrivalTime} WIB di ${record.assemblyLocation}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      isRead: false,
      channel: 'In-App',
      targetUnit: record.unitName
    };
    setNotifications(prev => [newNotif, ...prev]);
    dbInsertNotification(newNotif).catch(err => console.error('Supabase error:', err));

    addAuditLog('Pencatatan Kedatangan Dini', 'Kedatangan Dini', `Mencatat ${record.studentName} (${record.className}) di ${record.assemblyLocation}`);
  };

  const handleDeleteEarlyArrival = (id: string) => {
    setEarlyArrivals(prev => prev.filter(r => r.id !== id));
    dbDeleteEarlyArrival(id).catch(err => console.error('Supabase error:', err));
    addAuditLog('Hapus Kedatangan Dini', 'Kedatangan Dini', `Menghapus catatan ID ${id}`);
  };

  // Handlers for Module 2: Late Arrivals
  const handleAddLateArrival = (record: Omit<LateArrivalRecord, 'id' | 'createdAt'>) => {
    const newRecord: LateArrivalRecord = {
      ...record,
      id: `lat-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setLateArrivals(prev => [newRecord, ...prev]);
    dbInsertLateArrival(newRecord).catch(err => console.error('Supabase error:', err));

    // Trigger Notification
    const newNotif: NotificationItem = {
      id: `ntf-${Date.now()}`,
      type: 'late',
      title: 'Siswa Terlambat Datang',
      message: `${record.studentName} (${record.className}) terdata terlambat jam ${record.arrivalTime} WIB. Alasan: ${record.lateReason}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      channel: 'WhatsApp',
      targetUnit: record.unitName
    };
    setNotifications(prev => [newNotif, ...prev]);
    dbInsertNotification(newNotif).catch(err => console.error('Supabase error:', err));

    addAuditLog('Pencatatan Keterlambatan', 'Keterlambatan', `Mencatat keterlambatan ${record.studentName} - ${record.lateReason}`);
  };

  const handleDeleteLateArrival = (id: string) => {
    setLateArrivals(prev => prev.filter(r => r.id !== id));
    dbDeleteLateArrival(id).catch(err => console.error('Supabase error:', err));
    addAuditLog('Hapus Keterlambatan', 'Keterlambatan', `Menghapus catatan ID ${id}`);
  };

  // Handlers for Module 3: Exit Permissions
  const handleAddExitPermission = (record: Omit<ExitPermissionRecord, 'id' | 'createdAt'>) => {
    const newRecord: ExitPermissionRecord = {
      ...record,
      id: `ext-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setExitPermissions(prev => [newRecord, ...prev]);
    dbInsertExitPermission(newRecord).catch(err => console.error('Supabase error:', err));

    // Trigger Notification to Supabase
    const newNotif: NotificationItem = {
      id: `ntf-${Date.now()}`,
      type: 'exit',
      title: 'Izin Keluar Diterbitkan',
      message: `${record.studentName} (${record.className}) izin keluar jam ${record.exitTime} WIB. Alasan: ${record.purpose}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      isRead: false,
      channel: 'WhatsApp',
      targetUnit: record.unitName
    };
    setNotifications(prev => [newNotif, ...prev]);
    dbInsertNotification(newNotif).catch(err => console.error('Supabase error:', err));

    addAuditLog('Pencatatan Izin Keluar', 'Izin Keluar', `Penerbitan surat izin keluar ${record.studentName} (${record.purpose})`);
  };

  const handleUpdateExitStatus = (id: string, newStatus: 'Sudah Kembali', actualReturnTime: string) => {
    setExitPermissions(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, actualReturnTime } : r));
    dbUpdateExitPermissionStatus(id, newStatus, actualReturnTime).catch(err => console.error('Supabase error:', err));
    addAuditLog('Update Status Izin Keluar', 'Izin Keluar', `Konfirmasi siswa kembali ID ${id} pada jam ${actualReturnTime}`);
  };

  const handleDeleteExitPermission = (id: string) => {
    setExitPermissions(prev => prev.filter(r => r.id !== id));
    dbDeleteExitPermission(id).catch(err => console.error('Supabase error:', err));
    addAuditLog('Hapus Izin Keluar', 'Izin Keluar', `Menghapus izin ID ${id}`);
  };

  // Handlers for Module 4: Transportation
  const handleAddTransport = (record: Omit<TransportRecord, 'id' | 'createdAt'>) => {
    const newRecord: TransportRecord = {
      ...record,
      id: `trp-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setTransportRecords(prev => [newRecord, ...prev]);
    dbInsertTransportRecord(newRecord).catch(err => console.error('Supabase error:', err));

    // Trigger Notification to Supabase
    const newNotif: NotificationItem = {
      id: `ntf-${Date.now()}`,
      type: 'system',
      title: 'Kepulangan Siswa Terdata',
      message: `${record.studentName} (${record.className}) terdata pulang jam ${record.dismissalTime} WIB via ${record.transportMode}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      isRead: false,
      channel: 'In-App',
      targetUnit: record.unitName
    };
    setNotifications(prev => [newNotif, ...prev]);
    dbInsertNotification(newNotif).catch(err => console.error('Supabase error:', err));

    addAuditLog('Pencatatan Transportasi', 'Moda Transportasi', `Pencatatan kepulangan ${record.studentName} - ${record.transportMode}`);
  };

  const handleDeleteTransport = (id: string) => {
    setTransportRecords(prev => prev.filter(r => r.id !== id));
    dbDeleteTransportRecord(id).catch(err => console.error('Supabase error:', err));
    addAuditLog('Hapus Transportasi', 'Moda Transportasi', `Menghapus catatan ID ${id}`);
  };

  // Handlers for Module 7: Students & Face
  const handleAddStudent = (newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `std-${Date.now()}`
    };
    setStudents(prev => [newStudent, ...prev]);
    dbInsertStudent(newStudent).catch(err => console.error('Supabase error:', err));
    addAuditLog('Tambah Siswa', 'Master Siswa', `Menambahkan siswa baru ${newStudent.name} (NIS: ${newStudent.nis})`);
  };

  const handleBulkAddStudents = (newStudentsList: Omit<Student, 'id'>[]) => {
    const createdList: Student[] = newStudentsList.map((st, idx) => ({
      ...st,
      id: `std-${Date.now()}-${idx}`
    }));
    setStudents(prev => [...createdList, ...prev]);
    createdList.forEach(s => {
      dbInsertStudent(s).catch(err => console.error('Supabase bulk insert error:', err));
    });
    addAuditLog('Impor Masal Siswa', 'Master Siswa', `Berhasil mengimpor ${createdList.length} siswa baru via CSV/Excel`);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    dbUpdateStudent(updatedStudent).catch(err => console.error('Supabase edit student error:', err));
    addAuditLog('Edit Siswa', 'Master Siswa', `Memperbarui data siswa ${updatedStudent.name} (NIS: ${updatedStudent.nis})`);
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    dbDeleteStudent(studentId).catch(err => console.error('Supabase delete student error:', err));
    addAuditLog('Hapus Siswa', 'Master Siswa', `Menghapus data siswa ${student?.name || studentId}`);
  };

  const handleRegisterFace = (
    studentId: string, 
    photoUrl: string, 
    accuracyScore: number = 99.8,
    anglePhotos?: Record<string, string | undefined>,
    capturedAnglesCount: number = 5
  ) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, hasFaceData: true, photoUrl, faceAccuracyScore: accuracyScore } : s));
    
    // Synchronize faceProfiles local state
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFaceProfiles(prev => {
        const exists = prev.some(fp => fp.studentId === studentId);
        if (exists) {
          return prev.map(fp => fp.studentId === studentId ? {
            ...fp,
            photoUrl,
            confidenceThreshold: accuracyScore,
            sampleCount: capturedAnglesCount,
            registeredAt: new Date().toISOString().split('T')[0]
          } : fp);
        } else {
          return [...prev, {
            id: `fp-${studentId}`,
            studentId: studentId,
            studentName: student.name,
            nis: student.nis,
            registeredAt: new Date().toISOString().split('T')[0],
            photoUrl,
            confidenceThreshold: accuracyScore,
            sampleCount: capturedAnglesCount,
            status: 'Registered'
          }];
        }
      });
    }

    dbUpdateStudentFaceData(studentId, photoUrl, accuracyScore, anglePhotos, capturedAnglesCount)
      .catch(err => console.error('Supabase error:', err));
    addAuditLog('Registrasi Vektor Wajah Multi-Sudut', 'Face Profiles', `Mendaftarkan ${capturedAnglesCount} sudut vektor wajah ke Supabase untuk ID ${studentId} (Akurasi: ${accuracyScore}%)`);
  };

  const handleDeleteFaceData = (studentId: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, hasFaceData: false, faceAccuracyScore: 0 } : s));
    dbResetStudentFaceData(studentId).catch(err => console.error('Supabase error:', err));
    addAuditLog('Reset Vektor Wajah', 'Face Profiles', `Mereset dataset wajah untuk ID ${studentId}`);
  };

  // Handlers for Module 5: Users
  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`
    };
    setUsers(prev => [newUser, ...prev]);
    dbInsertUser(newUser).catch(err => console.error('Supabase error:', err));
    addAuditLog('Buat Akun User', 'Pengguna & RBAC', `Membuat akun ${newUser.name} role ${newUser.role}`);
  };

  const handleEditUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    dbUpdateUser(updatedUser).catch(err => console.error('Supabase edit user error:', err));
    addAuditLog('Edit User', 'Pengguna & RBAC', `Memperbarui akun user ${updatedUser.name} (${updatedUser.username})`);
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    dbDeleteUser(userId).catch(err => console.error('Supabase delete user error:', err));
    addAuditLog('Hapus User', 'Pengguna & RBAC', `Menghapus akun user ${user?.name || userId}`);
  };

  // Handlers for Units & Classes
  const handleAddUnit = (unitData: Omit<SchoolUnit, 'id'>) => {
    const newUnit: SchoolUnit = {
      ...unitData,
      id: `unit-${Date.now()}`
    };
    setUnits(prev => [...prev, newUnit]);
    dbInsertUnit(newUnit).catch(err => console.error('Supabase error:', err));
    addAuditLog('Tambah Unit', 'Pengaturan Sistem', `Menambahkan unit sekolah ${newUnit.name}`);
  };

  const handleEditUnit = (updatedUnit: SchoolUnit) => {
    setUnits(prev => prev.map(u => u.id === updatedUnit.id ? updatedUnit : u));
    dbUpdateUnit(updatedUnit).catch(err => console.error('Supabase error:', err));
    addAuditLog('Edit Unit', 'Pengaturan Sistem', `Memperbarui unit sekolah ${updatedUnit.name}`);
  };

  const handleDeleteUnit = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    setUnits(prev => prev.filter(u => u.id !== unitId));
    setClasses(prev => prev.filter(c => c.unitId !== unitId));
    dbDeleteUnit(unitId).catch(err => console.error('Supabase error:', err));
    addAuditLog('Hapus Unit', 'Pengaturan Sistem', `Menghapus unit sekolah ${unit?.name || unitId}`);
  };

  const handleAddClass = (classData: Omit<StudentClass, 'id'>) => {
    const newClass: StudentClass = {
      ...classData,
      id: `cls-${Date.now()}`
    };
    setClasses(prev => [...prev, newClass]);
    dbInsertClass(newClass).catch(err => console.error('Supabase error:', err));
    addAuditLog('Tambah Kelas', 'Pengaturan Sistem', `Menambahkan kelas ${newClass.name}`);
  };

  const handleEditClass = (updatedClass: StudentClass) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
    dbUpdateClass(updatedClass).catch(err => console.error('Supabase error:', err));
    addAuditLog('Edit Kelas', 'Pengaturan Sistem', `Memperbarui kelas ${updatedClass.name}`);
  };

  const handleDeleteClass = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    setClasses(prev => prev.filter(c => c.id !== classId));
    dbDeleteClass(classId).catch(err => console.error('Supabase error:', err));
    addAuditLog('Hapus Kelas', 'Pengaturan Sistem', `Menghapus kelas ${cls?.name || classId}`);
  };

  // Notification Supabase CRUD Handlers
  const handleSendNotification = (notifData: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: `ntf-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    dbInsertNotification(newNotif).catch(err => console.error('Supabase notification insert error:', err));
    addAuditLog('Kirim Notifikasi', 'Pusat Notifikasi', `Mengirim notifikasi "${newNotif.title}" via ${newNotif.channel}`);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    dbMarkNotificationRead(id).catch(err => console.error('Supabase error:', err));
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    dbMarkAllNotificationsRead().catch(err => console.error('Supabase error:', err));
    addAuditLog('Tandai Dibaca Semua Notifikasi', 'Pusat Notifikasi', 'Menandai seluruh notifikasi sebagai sudah dibaca');
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    dbDeleteNotification(id).catch(err => console.error('Supabase notification delete error:', err));
    addAuditLog('Hapus Notifikasi', 'Pusat Notifikasi', `Menghapus notifikasi ID ${id}`);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    dbClearAllNotifications().catch(err => console.error('Supabase clear notifications error:', err));
    addAuditLog('Bersihkan Seluruh Notifikasi', 'Pusat Notifikasi', 'Menghapus seluruh notifikasi dari database');
  };

  // Login & Logout Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    sessionStorage.setItem('lazuardi_auth_logged_in', 'true');
    sessionStorage.setItem('lazuardi_auth_user_id', user.id);
    addAuditLog('Login Sistem', 'Autentikasi', `Pengguna ${user.name} (${user.role}) berhasil masuk ke sistem`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('lazuardi_auth_logged_in');
    sessionStorage.removeItem('lazuardi_auth_user_id');
    addAuditLog('Logout Sistem', 'Autentikasi', `Pengguna ${currentUser?.name || 'User'} keluar dari sistem`);
  };

  if (!isLoggedIn) {
    return (
      <LoginView
        availableUsers={users}
        units={units}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      
      {/* Top Fixed Header Bar */}
      <Navbar
        currentUser={currentUser}
        availableUsers={users}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          addAuditLog('Ganti Persona User', 'Autentikasi', `Beralih persona ke ${user.name} (${user.role})`);
        }}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onOpenNotificationsModal={() => setActiveTab('notifications')}
        onToggleSidebar={() => setIsOpenMobileSidebar(!isOpenMobileSidebar)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        
        {/* Left Role-Aware Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          userRole={currentUser.role}
          isOpenMobile={isOpenMobileSidebar}
          onCloseMobile={() => setIsOpenMobileSidebar(false)}
        />

        {/* Main View Area */}
        <main className="flex-1 lg:pl-64 min-w-0">
          
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              earlyArrivals={earlyArrivals}
              lateArrivals={lateArrivals}
              exitPermissions={exitPermissions}
              transportRecords={transportRecords}
              units={units}
              classes={classes}
            />
          )}

          {activeTab === 'early-arrival' && (
            <EarlyArrivalView
              students={students}
              earlyArrivals={earlyArrivals}
              units={units}
              classes={classes}
              currentUser={currentUser}
              onAddRecord={handleAddEarlyArrival}
              onDeleteRecord={handleDeleteEarlyArrival}
            />
          )}

          {activeTab === 'late-arrival' && (
            <LateArrivalView
              students={students}
              lateArrivals={lateArrivals}
              units={units}
              classes={classes}
              currentUser={currentUser}
              onAddRecord={handleAddLateArrival}
              onDeleteRecord={handleDeleteLateArrival}
            />
          )}

          {activeTab === 'exit-permission' && (
            <ExitPermissionView
              students={students}
              exitPermissions={exitPermissions}
              units={units}
              classes={classes}
              currentUser={currentUser}
              onAddRecord={handleAddExitPermission}
              onUpdateStatus={handleUpdateExitStatus}
              onDeleteRecord={handleDeleteExitPermission}
            />
          )}

          {activeTab === 'transportation' && (
            <TransportationView
              students={students}
              transportRecords={transportRecords}
              units={units}
              classes={classes}
              currentUser={currentUser}
              onAddRecord={handleAddTransport}
              onDeleteRecord={handleDeleteTransport}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              students={students}
              earlyArrivals={earlyArrivals}
              lateArrivals={lateArrivals}
              exitPermissions={exitPermissions}
              transportRecords={transportRecords}
              units={units}
              classes={classes}
            />
          )}

          {activeTab === 'face-mgmt' && (
            <StudentFaceMgmtView
              students={students}
              faceProfiles={faceProfiles}
              units={units}
              classes={classes}
              onAddStudent={handleAddStudent}
              onBulkAddStudents={handleBulkAddStudents}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onRegisterFace={handleRegisterFace}
              onDeleteFaceData={handleDeleteFaceData}
            />
          )}

          {activeTab === 'users-rbac' && (
            <UserRoleMgmtView
              users={users}
              auditLogs={auditLogs}
              units={units}
              classes={classes}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              settings={settings}
              units={units}
              onSendNotification={handleSendNotification}
              onMarkNotificationRead={handleMarkNotificationRead}
              onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
              onDeleteNotification={handleDeleteNotification}
              onClearAllNotifications={handleClearAllNotifications}
            />
          )}

          {activeTab === 'database-erd' && (
            <DatabaseErdView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={(newSettings) => {
                setSettings(newSettings);
                localStorage.setItem('lazuardi_system_settings', JSON.stringify(newSettings));
                dbSaveSettings(newSettings).catch(err => console.error('Supabase settings save error:', err));
                addAuditLog('Update Pengaturan System', 'Pengaturan', `Memperbarui parameter operasional & threshold ArcFace (${newSettings.faceConfidenceThreshold}%)`);
              }}
              units={units}
              classes={classes}
              onAddUnit={handleAddUnit}
              onEditUnit={handleEditUnit}
              onDeleteUnit={handleDeleteUnit}
              onAddClass={handleAddClass}
              onEditClass={handleEditClass}
              onDeleteClass={handleDeleteClass}
            />
          )}

        </main>

      </div>

    </div>
  );
}
