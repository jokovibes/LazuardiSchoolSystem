import { createClient } from '@supabase/supabase-js';
import { 
  User, 
  SchoolUnit, 
  StudentClass, 
  Student, 
  EarlyArrivalRecord, 
  LateArrivalRecord, 
  ExitPermissionRecord, 
  TransportRecord, 
  FaceProfile, 
  NotificationItem, 
  AuditLog, 
  SystemSetting 
} from '../types';

const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL) || 'https://plwpghfvhgafpvqvpypc.supabase.co';
const SUPABASE_ANON_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsd3BnaGZ2aGdhZnB2cXZweXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyOTU2MDYsImV4cCI6MjEwMDg3MTYwNn0.-wvmOJTF3vq495yZgN7xVYLI8NxY4iqT6E3bGvVyfws';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SUPABASE_CONFIG = {
  projectId: 'plwpghfvhgafpvqvpypc',
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

// PostgreSQL / Supabase SQL DDL Schema creation script
export const SUPABASE_POSTGRES_DDL = `-- =================================================================
-- SUPABASE POSTGRESQL SCHEMA: Lazuardi School System
-- Project: Lazuardi School System (ID: plwpghfvhgafpvqvpypc)
-- Execute this script in your Supabase SQL Editor if tables are not yet created!
-- =================================================================

-- 1. UNITS TABLE
CREATE TABLE IF NOT EXISTS public.units (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  headmaster_name TEXT,
  total_students INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  unit_id TEXT REFERENCES public.units(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  homeroom_teacher TEXT,
  total_students INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS TABLE
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

-- Migration for existing database table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  nis TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  unit_id TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  parent_name TEXT,
  parent_phone TEXT,
  address TEXT,
  photo_url TEXT,
  has_face_data BOOLEAN DEFAULT FALSE,
  face_accuracy_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FACE_PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.face_profiles (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  nis TEXT NOT NULL,
  registered_at TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  confidence_threshold NUMERIC(5,2) DEFAULT 85.00,
  sample_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Registered'
);

-- 6. EARLY_ARRIVALS TABLE
CREATE TABLE IF NOT EXISTS public.early_arrivals (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  nis TEXT NOT NULL,
  student_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  date TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  assembly_location TEXT NOT NULL,
  officer_name TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'Datang Terlalu Pagi',
  created_at TEXT NOT NULL
);

-- 7. LATE_ARRIVALS TABLE
CREATE TABLE IF NOT EXISTS public.late_arrivals (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  nis TEXT NOT NULL,
  student_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  date TEXT NOT NULL,
  arrival_time TEXT NOT NULL,
  late_reason TEXT NOT NULL,
  officer_name TEXT NOT NULL,
  photo_proof_url TEXT,
  attendance_status TEXT DEFAULT 'Terlambat',
  created_at TEXT NOT NULL
);

-- 8. EXIT_PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.exit_permissions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  nis TEXT NOT NULL,
  student_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  date TEXT NOT NULL,
  exit_time TEXT NOT NULL,
  expected_return_time TEXT NOT NULL,
  actual_return_time TEXT,
  purpose TEXT NOT NULL,
  pickup_by TEXT NOT NULL,
  permit_letter_url TEXT,
  officer_name TEXT NOT NULL,
  status TEXT DEFAULT 'Belum Kembali',
  created_at TEXT NOT NULL
);

-- 9. TRANSPORT_RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.transport_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  nis TEXT NOT NULL,
  student_name TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  date TEXT NOT NULL,
  dismissal_time TEXT NOT NULL,
  transport_mode TEXT NOT NULL,
  driver_name TEXT,
  vehicle_plate TEXT,
  officer_name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  channel TEXT NOT NULL,
  target_unit TEXT
);

-- 11. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT,
  ip_address TEXT NOT NULL
);

-- Disable Row Level Security for demo tables or Enable public read/write
ALTER TABLE public.units DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.early_arrivals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.late_arrivals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.exit_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- =================================================================
-- SEED DATA INSERTS
-- =================================================================

-- 1. UNITS SEED DATA
INSERT INTO public.units (id, code, name, headmaster_name, total_students) VALUES
('unit-1', 'SD', 'SD Lazuardi Global', 'Dr. H. Ahmad Fauzi, M.Pd', 320),
('unit-2', 'SMP', 'SMP Lazuardi Junior', 'Dra. Hj. Siti Nurhaliza', 280),
('unit-3', 'SMA', 'SMA Lazuardi Senior High', 'Bambang Supriyadi, S.T, M.M', 240)
ON CONFLICT (id) DO NOTHING;

-- 2. CLASSES SEED DATA
INSERT INTO public.classes (id, unit_id, name, homeroom_teacher, total_students) VALUES
('cls-1', 'unit-1', 'SD 4-A', 'Rina Wijaya, S.Pd', 28),
('cls-2', 'unit-1', 'SD 5-B', 'Hendra Saputra, S.Pd', 30),
('cls-3', 'unit-2', 'SMP 8-A', 'Nirmala Dewi, M.Si', 32),
('cls-4', 'unit-2', 'SMP 9-B', 'Agus Pratama, S.Kom', 30),
('cls-5', 'unit-3', 'SMA 10-IPA-1', 'Dian Permata, M.Pd', 32),
('cls-6', 'unit-3', 'SMA 11-IPS-2', 'Farhan Hakim, S.Sos', 28),
('cls-7', 'unit-3', 'SMA 12-IPA-2', 'Santi Rahayu, S.Si', 30)
ON CONFLICT (id) DO NOTHING;

-- 3. USERS SEED DATA
INSERT INTO public.users (id, name, username, email, password, role, unit_id, assigned_class, avatar_url, status) VALUES
('usr-1', 'Super Admin Lazuardi', 'admin', 'admin@lazuardi.sch.id', '@lazuardi123', 'Super Admin', NULL, NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', 'Active'),
('usr-2', 'Siti Aminah, S.Kom', 'admin_data', 'siti.admin@lazuardi.sch.id', '@lazuardi123', 'Admin', NULL, NULL, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250', 'Active'),
('usr-3', 'Pak Pakus (Pos Gerbang Utama)', 'security', 'security.pos1@lazuardi.sch.id', '@lazuardi123', 'Security', NULL, NULL, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250', 'Active'),
('usr-4', 'Dian Permata, M.Pd (Wali Kelas)', 'guru_dian', 'dian.guru@lazuardi.sch.id', '@lazuardi123', 'Guru', 'unit-3', 'SMA 10-IPA-1', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250', 'Active'),
('usr-5', 'Bambang Supriyadi, M.M (Kepala Unit)', 'kepala_sma', 'bambang.kepala@lazuardi.sch.id', '@lazuardi123', 'Kepala Unit', 'unit-3', NULL, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250', 'Active'),
('usr-6', 'Dr. Hj. Ratna Sari (Manajemen Yayasan)', 'manajemen', 'ratna.yayasan@lazuardi.sch.id', '@lazuardi123', 'Manajemen', NULL, NULL, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250', 'Active')
ON CONFLICT (id) DO NOTHING;

-- 4. STUDENTS SEED DATA
INSERT INTO public.students (id, nis, name, gender, unit_id, unit_name, class_id, class_name, parent_name, parent_phone, address, photo_url, has_face_data, face_accuracy_score) VALUES
('std-1', '20241001', 'Aditya Pratama Putra', 'L', 'unit-3', 'SMA Lazuardi Senior High', 'cls-5', 'SMA 10-IPA-1', 'Rudi Pratama', '081298765432', 'Jl. Merdeka No. 45, Jakarta Selatan', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300', TRUE, 98.6),
('std-2', '20241002', 'Anisa Rahmawati', 'P', 'unit-3', 'SMA Lazuardi Senior High', 'cls-5', 'SMA 10-IPA-1', 'Heri Rahmawan', '081311223344', 'Jl. Melati No. 12, Kebayoran', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300', TRUE, 97.2),
('std-3', '20241003', 'Bagas Satria Nugraha', 'L', 'unit-3', 'SMA Lazuardi Senior High', 'cls-6', 'SMA 11-IPS-2', 'Tono Nugraha', '081577889900', 'Jl. Mawar No. 88, Cilandak', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300', TRUE, 99.1),
('std-4', '20242004', 'Clarissa Maharani', 'P', 'unit-2', 'SMP Lazuardi Junior', 'cls-3', 'SMP 8-A', 'Dewi Maharani', '081809090909', 'Jl. Anggrek No. 34, Depok', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300', TRUE, 96.8),
('std-5', '20243005', 'Darel Alghifari', 'L', 'unit-1', 'SD Lazuardi Global', 'cls-1', 'SD 4-A', 'Surya Alghifari', '081912345678', 'Jl. Kenanga No. 5, Cinere', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=300', FALSE, 0.0)
ON CONFLICT (id) DO NOTHING;

-- 5. FACE PROFILES SEED DATA
INSERT INTO public.face_profiles (id, student_id, student_name, nis, registered_at, photo_url, confidence_threshold, sample_count, status) VALUES
('fp-1', 'std-1', 'Aditya Pratama Putra', '20241001', '2024-01-15 08:30:00', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300', 98.6, 5, 'Registered'),
('fp-2', 'std-2', 'Anisa Rahmawati', '20241002', '2024-01-16 09:15:00', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300', 97.2, 5, 'Registered'),
('fp-3', 'std-3', 'Bagas Satria Nugraha', '20241003', '2024-01-17 10:00:00', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300', 99.1, 5, 'Registered'),
('fp-4', 'std-4', 'Clarissa Maharani', '20242004', '2024-01-18 11:30:00', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300', 96.8, 5, 'Registered')
ON CONFLICT (id) DO NOTHING;

`;

// Helper: Check connection to Supabase
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('units').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST301' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return { 
          success: false, 
          message: 'Terhubung ke Supabase, namun tabel database belum dibuat. Silakan jalankan Script DDL SQL Supabase di SQL Editor.' 
        };
      }
      return { success: false, message: `Supabase Error: ${error.message}` };
    }
    return { success: true, message: 'Koneksi ke Supabase Database Aktif & Terverifikasi!' };
  } catch (err: any) {
    return { success: false, message: `Gagal terhubung ke Supabase: ${err.message || err}` };
  }
}

// Data Loaders and Mappers
export async function fetchAllDataFromSupabase() {
  try {
    const [
      unitsRes,
      classesRes,
      usersRes,
      studentsRes,
      faceProfilesRes,
      earlyArrivalsRes,
      lateArrivalsRes,
      exitPermissionsRes,
      transportRecordsRes,
      notificationsRes,
      auditLogsRes
    ] = await Promise.all([
      supabase.from('units').select('*'),
      supabase.from('classes').select('*'),
      supabase.from('users').select('*'),
      supabase.from('students').select('*'),
      supabase.from('face_profiles').select('*'),
      supabase.from('early_arrivals').select('*').order('created_at', { ascending: false }),
      supabase.from('late_arrivals').select('*').order('created_at', { ascending: false }),
      supabase.from('exit_permissions').select('*').order('created_at', { ascending: false }),
      supabase.from('transport_records').select('*').order('created_at', { ascending: false }),
      supabase.from('notifications').select('*'),
      supabase.from('audit_logs').select('*').order('timestamp', { ascending: false })
    ]);

    // Check if any major table error occurred (e.g. table not created)
    if (unitsRes.error || studentsRes.error) {
      console.warn('Supabase tables not found or query error:', unitsRes.error || studentsRes.error);
      return null;
    }

    const units: SchoolUnit[] = (unitsRes.data || []).map((u: any) => ({
      id: u.id,
      code: u.code,
      name: u.name,
      headmasterName: u.headmaster_name,
      totalStudents: u.total_students
    }));

    const classes: StudentClass[] = (classesRes.data || []).map((c: any) => ({
      id: c.id,
      unitId: c.unit_id,
      name: c.name,
      homeroomTeacher: c.homeroom_teacher,
      totalStudents: c.total_students
    }));

    const users: User[] = (usersRes.data || []).map((usr: any) => ({
      id: usr.id,
      name: usr.name,
      username: usr.username,
      email: usr.email,
      password: usr.password || '',
      role: usr.role,
      unitId: usr.unit_id,
      assignedClass: usr.assigned_class,
      avatarUrl: usr.avatar_url,
      status: usr.status
    }));

    const students: Student[] = (studentsRes.data || []).map((s: any) => ({
      id: s.id,
      nis: s.nis,
      name: s.name,
      gender: s.gender,
      unitId: s.unit_id,
      unitName: s.unit_name,
      classId: s.class_id,
      className: s.class_name,
      parentName: s.parent_name,
      parentPhone: s.parent_phone,
      address: s.address,
      photoUrl: s.photo_url,
      hasFaceData: Boolean(s.has_face_data),
      faceAccuracyScore: Number(s.face_accuracy_score || 0)
    }));

    const faceProfiles: FaceProfile[] = (faceProfilesRes.data || []).map((fp: any) => ({
      id: fp.id,
      studentId: fp.student_id,
      studentName: fp.student_name,
      nis: fp.nis,
      registeredAt: fp.registered_at,
      photoUrl: fp.photo_url,
      confidenceThreshold: Number(fp.confidence_threshold || 85),
      sampleCount: fp.sample_count,
      status: fp.status
    }));

    const earlyArrivals: EarlyArrivalRecord[] = (earlyArrivalsRes.data || []).map((ea: any) => ({
      id: ea.id,
      studentId: ea.student_id,
      nis: ea.nis,
      studentName: ea.student_name,
      unitName: ea.unit_name,
      className: ea.class_name,
      date: ea.date,
      arrivalTime: ea.arrival_time,
      assemblyLocation: ea.assembly_location,
      officerName: ea.officer_name,
      notes: ea.notes,
      status: ea.status,
      createdAt: ea.created_at
    }));

    const lateArrivals: LateArrivalRecord[] = (lateArrivalsRes.data || []).map((la: any) => ({
      id: la.id,
      studentId: la.student_id,
      nis: la.nis,
      studentName: la.student_name,
      unitName: la.unit_name,
      className: la.class_name,
      date: la.date,
      arrivalTime: la.arrival_time,
      lateReason: la.late_reason,
      officerName: la.officer_name,
      photoProofUrl: la.photo_proof_url,
      attendanceStatus: la.attendance_status,
      createdAt: la.created_at
    }));

    const exitPermissions: ExitPermissionRecord[] = (exitPermissionsRes.data || []).map((ep: any) => ({
      id: ep.id,
      studentId: ep.student_id,
      nis: ep.nis,
      studentName: ep.student_name,
      unitName: ep.unit_name,
      className: ep.class_name,
      date: ep.date,
      exitTime: ep.exit_time,
      expectedReturnTime: ep.expected_return_time,
      actualReturnTime: ep.actual_return_time,
      purpose: ep.purpose,
      pickupBy: ep.pickup_by,
      permitLetterUrl: ep.permit_letter_url,
      officerName: ep.officer_name,
      status: ep.status,
      createdAt: ep.created_at
    }));

    const transportRecords: TransportRecord[] = (transportRecordsRes.data || []).map((tr: any) => ({
      id: tr.id,
      studentId: tr.student_id,
      nis: tr.nis,
      studentName: tr.student_name,
      unitName: tr.unit_name,
      className: tr.class_name,
      date: tr.date,
      dismissalTime: tr.dismissal_time,
      transportMode: tr.transport_mode,
      driverName: tr.driver_name,
      vehiclePlate: tr.vehicle_plate,
      officerName: tr.officer_name,
      createdAt: tr.created_at
    }));

    const notifications: NotificationItem[] = (notificationsRes.data || []).map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp,
      isRead: Boolean(n.is_read),
      channel: n.channel,
      targetUnit: n.target_unit
    }));

    const auditLogs: AuditLog[] = (auditLogsRes.data || []).map((al: any) => ({
      id: al.id,
      timestamp: al.timestamp,
      userName: al.user_name,
      userRole: al.user_role,
      action: al.action,
      module: al.module,
      details: al.details,
      ipAddress: al.ip_address
    }));

    return {
      units,
      classes,
      users,
      students,
      faceProfiles,
      earlyArrivals,
      lateArrivals,
      exitPermissions,
      transportRecords,
      notifications,
      auditLogs
    };
  } catch (err) {
    console.error('Error fetching Supabase data:', err);
    return null;
  }
}

// Seed initial mock data directly into Supabase tables if empty
export async function seedInitialDataToSupabase(
  initialUnits: SchoolUnit[],
  initialClasses: StudentClass[],
  initialUsers: User[],
  initialStudents: Student[],
  initialFaceProfiles: FaceProfile[],
  initialEarlyArrivals: EarlyArrivalRecord[],
  initialLateArrivals: LateArrivalRecord[],
  initialExitPermissions: ExitPermissionRecord[],
  initialTransportRecords: TransportRecord[],
  initialNotifications: NotificationItem[],
  initialAuditLogs: AuditLog[]
) {
  try {
    // 1. Units
    await supabase.from('units').upsert(initialUnits.map(u => ({
      id: u.id,
      code: u.code,
      name: u.name,
      headmaster_name: u.headmasterName,
      total_students: u.totalStudents
    })));

    // 2. Classes
    await supabase.from('classes').upsert(initialClasses.map(c => ({
      id: c.id,
      unit_id: c.unitId,
      name: c.name,
      homeroom_teacher: c.homeroomTeacher,
      total_students: c.totalStudents
    })));

    // 3. Users
    await supabase.from('users').upsert(initialUsers.map(usr => ({
      id: usr.id,
      name: usr.name,
      username: usr.username,
      email: usr.email,
      password: usr.password || '',
      role: usr.role,
      unit_id: usr.unitId,
      assigned_class: usr.assignedClass,
      avatar_url: usr.avatarUrl,
      status: usr.status
    })));

    // 4. Students
    await supabase.from('students').upsert(initialStudents.map(s => ({
      id: s.id,
      nis: s.nis,
      name: s.name,
      gender: s.gender,
      unit_id: s.unitId,
      unit_name: s.unitName,
      class_id: s.classId,
      class_name: s.className,
      parent_name: s.parentName,
      parent_phone: s.parentPhone,
      address: s.address,
      photo_url: s.photoUrl,
      has_face_data: s.hasFaceData,
      face_accuracy_score: s.faceAccuracyScore
    })));

    // 5. Face Profiles
    await supabase.from('face_profiles').upsert(initialFaceProfiles.map(fp => ({
      id: fp.id,
      student_id: fp.studentId,
      student_name: fp.studentName,
      nis: fp.nis,
      registered_at: fp.registeredAt,
      photo_url: fp.photoUrl,
      confidence_threshold: fp.confidenceThreshold,
      sample_count: fp.sampleCount,
      status: fp.status
    })));

    // 6. Early Arrivals
    await supabase.from('early_arrivals').upsert(initialEarlyArrivals.map(ea => ({
      id: ea.id,
      student_id: ea.studentId,
      nis: ea.nis,
      student_name: ea.studentName,
      unit_name: ea.unitName,
      class_name: ea.className,
      date: ea.date,
      arrival_time: ea.arrivalTime,
      assembly_location: ea.assemblyLocation,
      officer_name: ea.officerName,
      notes: ea.notes,
      status: ea.status,
      created_at: ea.createdAt
    })));

    // 7. Late Arrivals
    await supabase.from('late_arrivals').upsert(initialLateArrivals.map(la => ({
      id: la.id,
      student_id: la.studentId,
      nis: la.nis,
      student_name: la.studentName,
      unit_name: la.unitName,
      class_name: la.className,
      date: la.date,
      arrival_time: la.arrivalTime,
      late_reason: la.lateReason,
      officer_name: la.officerName,
      photo_proof_url: la.photoProofUrl,
      attendance_status: la.attendanceStatus,
      created_at: la.createdAt
    })));

    // 8. Exit Permissions
    await supabase.from('exit_permissions').upsert(initialExitPermissions.map(ep => ({
      id: ep.id,
      student_id: ep.studentId,
      nis: ep.nis,
      student_name: ep.studentName,
      unit_name: ep.unitName,
      class_name: ep.className,
      date: ep.date,
      exit_time: ep.exitTime,
      expected_return_time: ep.expectedReturnTime,
      actual_return_time: ep.actualReturnTime,
      purpose: ep.purpose,
      pickup_by: ep.pickupBy,
      permit_letter_url: ep.permitLetterUrl,
      officer_name: ep.officerName,
      status: ep.status,
      created_at: ep.createdAt
    })));

    // 9. Transport
    await supabase.from('transport_records').upsert(initialTransportRecords.map(tr => ({
      id: tr.id,
      student_id: tr.studentId,
      nis: tr.nis,
      student_name: tr.studentName,
      unit_name: tr.unitName,
      class_name: tr.className,
      date: tr.date,
      dismissal_time: tr.dismissalTime,
      transport_mode: tr.transportMode,
      driver_name: tr.driverName,
      vehicle_plate: tr.vehiclePlate,
      officer_name: tr.officerName,
      created_at: tr.createdAt
    })));

    // 10. Notifications
    await supabase.from('notifications').upsert(initialNotifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      timestamp: n.timestamp,
      is_read: n.isRead,
      channel: n.channel,
      target_unit: n.targetUnit
    })));

    // 11. Audit Logs
    await supabase.from('audit_logs').upsert(initialAuditLogs.map(al => ({
      id: al.id,
      timestamp: al.timestamp,
      user_name: al.userName,
      user_role: al.userRole,
      action: al.action,
      module: al.module,
      details: al.details,
      ip_address: al.ipAddress
    })));

    console.log('Successfully seeded initial data to Supabase!');
  } catch (err) {
    console.error('Failed to seed Supabase data:', err);
  }
}

// Single Action Supabase Sync Helpers
export async function dbInsertEarlyArrival(rec: EarlyArrivalRecord) {
  await supabase.from('early_arrivals').insert({
    id: rec.id,
    student_id: rec.studentId,
    nis: rec.nis,
    student_name: rec.studentName,
    unit_name: rec.unitName,
    class_name: rec.className,
    date: rec.date,
    arrival_time: rec.arrivalTime,
    assembly_location: rec.assemblyLocation,
    officer_name: rec.officerName,
    notes: rec.notes,
    status: rec.status,
    created_at: rec.createdAt
  });
}

export async function dbDeleteEarlyArrival(id: string) {
  await supabase.from('early_arrivals').delete().eq('id', id);
}

export async function dbInsertLateArrival(rec: LateArrivalRecord) {
  await supabase.from('late_arrivals').insert({
    id: rec.id,
    student_id: rec.studentId,
    nis: rec.nis,
    student_name: rec.studentName,
    unit_name: rec.unitName,
    class_name: rec.className,
    date: rec.date,
    arrival_time: rec.arrivalTime,
    late_reason: rec.lateReason,
    officer_name: rec.officerName,
    photo_proof_url: rec.photoProofUrl,
    attendance_status: rec.attendanceStatus,
    created_at: rec.createdAt
  });
}

export async function dbDeleteLateArrival(id: string) {
  await supabase.from('late_arrivals').delete().eq('id', id);
}

export async function dbInsertExitPermission(rec: ExitPermissionRecord) {
  await supabase.from('exit_permissions').insert({
    id: rec.id,
    student_id: rec.studentId,
    nis: rec.nis,
    student_name: rec.studentName,
    unit_name: rec.unitName,
    class_name: rec.className,
    date: rec.date,
    exit_time: rec.exitTime,
    expected_return_time: rec.expectedReturnTime,
    actual_return_time: rec.actualReturnTime,
    purpose: rec.purpose,
    pickup_by: rec.pickupBy,
    permit_letter_url: rec.permitLetterUrl,
    officer_name: rec.officerName,
    status: rec.status,
    created_at: rec.createdAt
  });
}

export async function dbUpdateExitPermissionStatus(id: string, status: string, actualReturnTime: string) {
  await supabase.from('exit_permissions').update({
    status,
    actual_return_time: actualReturnTime
  }).eq('id', id);
}

export async function dbDeleteExitPermission(id: string) {
  await supabase.from('exit_permissions').delete().eq('id', id);
}

export async function dbInsertTransportRecord(rec: TransportRecord) {
  await supabase.from('transport_records').insert({
    id: rec.id,
    student_id: rec.studentId,
    nis: rec.nis,
    student_name: rec.studentName,
    unit_name: rec.unitName,
    class_name: rec.className,
    date: rec.date,
    dismissal_time: rec.dismissalTime,
    transport_mode: rec.transportMode,
    driver_name: rec.driverName,
    vehicle_plate: rec.vehiclePlate,
    officer_name: rec.officerName,
    created_at: rec.createdAt
  });
}

export async function dbDeleteTransportRecord(id: string) {
  await supabase.from('transport_records').delete().eq('id', id);
}

export async function dbInsertStudent(std: Student) {
  await supabase.from('students').insert({
    id: std.id,
    nis: std.nis,
    name: std.name,
    gender: std.gender,
    unit_id: std.unitId,
    unit_name: std.unitName,
    class_id: std.classId,
    class_name: std.className,
    parent_name: std.parentName,
    parent_phone: std.parentPhone,
    address: std.address,
    photo_url: std.photoUrl,
    has_face_data: std.hasFaceData,
    face_accuracy_score: std.faceAccuracyScore
  });
}

export async function dbUpdateStudent(std: Student) {
  try {
    const { error } = await supabase.from('students').update({
      nis: std.nis,
      name: std.name,
      gender: std.gender,
      unit_id: std.unitId,
      unit_name: std.unitName,
      class_id: std.classId,
      class_name: std.className,
      parent_name: std.parentName,
      parent_phone: std.parentPhone,
      address: std.address,
      photo_url: std.photoUrl,
      has_face_data: std.hasFaceData,
      face_accuracy_score: std.faceAccuracyScore
    }).eq('id', std.id);

    if (error) {
      console.error('Supabase dbUpdateStudent error:', error);
      return { success: false, message: error.message };
    }

    // Also sync student_name & nis in face_profiles if exists
    await supabase.from('face_profiles').update({
      student_name: std.name,
      nis: std.nis
    }).eq('student_id', std.id);

    return { success: true };
  } catch (err: any) {
    console.error('Catch error in dbUpdateStudent:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

export async function dbDeleteStudent(studentId: string) {
  try {
    // Delete dependent records first to avoid foreign key constraints
    await supabase.from('early_arrivals').delete().eq('student_id', studentId);
    await supabase.from('late_arrivals').delete().eq('student_id', studentId);
    await supabase.from('exit_permissions').delete().eq('student_id', studentId);
    await supabase.from('transport_records').delete().eq('student_id', studentId);
    await supabase.from('face_profiles').delete().eq('student_id', studentId);

    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) {
      console.error('Supabase dbDeleteStudent error:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Catch error in dbDeleteStudent:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

export async function dbUpdateStudentFaceData(
  studentId: string, 
  photoUrl: string, 
  accuracyScore: number = 99.8,
  anglePhotos?: Record<string, string | undefined>,
  capturedAnglesCount: number = 5
) {
  try {
    // 1. Update students table
    await supabase.from('students').update({
      has_face_data: true,
      photo_url: photoUrl,
      face_accuracy_score: accuracyScore
    }).eq('id', studentId);

    // Get student details for face_profiles
    const { data: studentData } = await supabase.from('students').select('name, nis').eq('id', studentId).single();

    // 2. Upsert into face_profiles table
    const profileId = `fp-${studentId}`;
    await supabase.from('face_profiles').upsert({
      id: profileId,
      student_id: studentId,
      student_name: studentData?.name || 'Siswa',
      nis: studentData?.nis || '-',
      registered_at: new Date().toISOString().split('T')[0],
      photo_url: photoUrl,
      confidence_threshold: accuracyScore,
      sample_count: capturedAnglesCount,
      status: 'Registered',
      multi_angle_vectors: anglePhotos ? JSON.stringify(anglePhotos) : null,
      vector_data: anglePhotos ? JSON.stringify(anglePhotos) : JSON.stringify({ primary: photoUrl })
    }, { onConflict: 'student_id' });
  } catch (err) {
    console.error('Error in dbUpdateStudentFaceData:', err);
  }
}

export async function dbResetStudentFaceData(studentId: string) {
  await supabase.from('students').update({
    has_face_data: false,
    face_accuracy_score: 0
  }).eq('id', studentId);
  await supabase.from('face_profiles').delete().eq('student_id', studentId);
}

export async function dbInsertUser(user: User) {
  try {
    const { error } = await supabase.from('users').insert({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password || '',
      role: user.role,
      unit_id: user.unitId || null,
      assigned_class: user.assignedClass || null,
      avatar_url: user.avatarUrl,
      status: user.status
    });

    if (error) {
      console.error('Supabase dbInsertUser error:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Catch error in dbInsertUser:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

export async function dbUpdateUser(user: User) {
  try {
    const { error } = await supabase.from('users').update({
      name: user.name,
      username: user.username,
      email: user.email,
      password: user.password || '',
      role: user.role,
      unit_id: user.unitId || null,
      assigned_class: user.assignedClass || null,
      avatar_url: user.avatarUrl,
      status: user.status
    }).eq('id', user.id);

    if (error) {
      console.error('Supabase dbUpdateUser error:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Catch error in dbUpdateUser:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

export async function dbDeleteUser(userId: string) {
  try {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      console.error('Supabase dbDeleteUser error:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Catch error in dbDeleteUser:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

export async function dbInsertNotification(notif: NotificationItem) {
  try {
    const { error } = await supabase.from('notifications').insert({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      timestamp: notif.timestamp,
      is_read: notif.isRead,
      channel: notif.channel,
      target_unit: notif.targetUnit
    });
    if (error) console.error('Supabase dbInsertNotification error:', error);
  } catch (err) {
    console.error('Catch in dbInsertNotification:', err);
  }
}

export async function dbMarkNotificationRead(id: string) {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) console.error('Supabase dbMarkNotificationRead error:', error);
  } catch (err) {
    console.error('Catch in dbMarkNotificationRead:', err);
  }
}

export async function dbMarkAllNotificationsRead() {
  try {
    const { error } = await supabase.from('notifications').update({ is_read: true }).neq('id', 'non-existent');
    if (error) console.error('Supabase dbMarkAllNotificationsRead error:', error);
  } catch (err) {
    console.error('Catch in dbMarkAllNotificationsRead:', err);
  }
}

export async function dbDeleteNotification(id: string) {
  try {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) console.error('Supabase dbDeleteNotification error:', error);
  } catch (err) {
    console.error('Catch in dbDeleteNotification:', err);
  }
}

export async function dbClearAllNotifications() {
  try {
    const { error } = await supabase.from('notifications').delete().neq('id', 'non-existent');
    if (error) console.error('Supabase dbClearAllNotifications error:', error);
  } catch (err) {
    console.error('Catch in dbClearAllNotifications:', err);
  }
}

export async function dbInsertAuditLog(log: AuditLog) {
  await supabase.from('audit_logs').insert({
    id: log.id,
    timestamp: log.timestamp,
    user_name: log.userName,
    user_role: log.userRole,
    action: log.action,
    module: log.module,
    details: log.details,
    ip_address: log.ipAddress
  });
}

// Unit CRUD
export async function dbInsertUnit(u: SchoolUnit) {
  try {
    const { error } = await supabase.from('units').insert({
      id: u.id,
      code: u.code,
      name: u.name,
      headmaster_name: u.headmasterName,
      total_students: u.totalStudents
    });
    if (error) {
      console.error('Supabase dbInsertUnit error:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Catch in dbInsertUnit:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

export async function dbUpdateUnit(u: SchoolUnit) {
  try {
    const { error } = await supabase.from('units').update({
      code: u.code,
      name: u.name,
      headmaster_name: u.headmasterName,
      total_students: u.totalStudents
    }).eq('id', u.id);
    if (error) {
      console.error('Supabase dbUpdateUnit error:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Catch in dbUpdateUnit:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

export async function dbDeleteUnit(unitId: string) {
  try {
    await supabase.from('classes').delete().eq('unit_id', unitId);
    const { error } = await supabase.from('units').delete().eq('id', unitId);
    if (error) {
      console.error('Supabase dbDeleteUnit error:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Catch in dbDeleteUnit:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

// Class CRUD
export async function dbInsertClass(c: StudentClass) {
  try {
    const { error } = await supabase.from('classes').insert({
      id: c.id,
      unit_id: c.unitId,
      name: c.name,
      homeroom_teacher: c.homeroomTeacher,
      total_students: c.totalStudents
    });
    if (error) {
      console.error('Supabase dbInsertClass error:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Catch in dbInsertClass:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

export async function dbUpdateClass(c: StudentClass) {
  try {
    const { error } = await supabase.from('classes').update({
      unit_id: c.unitId,
      name: c.name,
      homeroom_teacher: c.homeroomTeacher,
      total_students: c.totalStudents
    }).eq('id', c.id);
    if (error) {
      console.error('Supabase dbUpdateClass error:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Catch in dbUpdateClass:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

export async function dbDeleteClass(classId: string) {
  try {
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) {
      console.error('Supabase dbDeleteClass error:', error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Catch in dbDeleteClass:', err);
    return { success: false, message: err?.message || String(err) };
  }
}

