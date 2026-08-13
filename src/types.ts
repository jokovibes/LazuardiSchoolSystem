export type RoleType = 
  | 'Super Admin'
  | 'Admin'
  | 'Security'
  | 'Guru'
  | 'Kepala Unit'
  | 'Manajemen';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: RoleType;
  unitId?: string; // Optional if tied to specific unit
  assignedClass?: string; // For Guru
  avatarUrl: string;
  status: 'Active' | 'Inactive';
}

export interface SchoolUnit {
  id: string;
  code: string; // e.g. SD, SMP, SMA
  name: string; // e.g. SD Lazuardi, SMP Lazuardi
  headmasterName: string;
  totalStudents: number;
}

export interface StudentClass {
  id: string;
  unitId: string;
  name: string; // e.g. 10-IPA-1, 8-A, 4-B
  homeroomTeacher: string;
  totalStudents: number;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  unitId: string;
  unitName: string;
  classId: string;
  className: string;
  parentName: string;
  parentPhone: string;
  address: string;
  photoUrl: string;
  hasFaceData: boolean;
  faceEmbeddings?: number[];
  faceAccuracyScore?: number;
}

export interface EarlyArrivalRecord {
  id: string;
  studentId: string;
  nis: string;
  studentName: string;
  unitName: string;
  className: string;
  date: string; // YYYY-MM-DD
  arrivalTime: string; // HH:mm
  assemblyLocation: string; // e.g., Selasar Utama, Perpustakaan, Lapangan Basket
  officerName: string;
  notes: string;
  status: 'Datang Terlalu Pagi';
  createdAt: string;
}

export interface LateArrivalRecord {
  id: string;
  studentId: string;
  nis: string;
  studentName: string;
  unitName: string;
  className: string;
  date: string; // YYYY-MM-DD
  arrivalTime: string; // HH:mm
  lateReason: string; // e.g., Ban bocor, Hujan deras, Kemacetan
  officerName: string;
  photoProofUrl?: string;
  attendanceStatus: 'Terlambat';
  createdAt: string;
}

export type TransportMode = 
  | 'Kendaraan Online'
  | 'Jalan Kaki'
  | 'Sepeda'
  | 'Dijemput Orang Tua'
  | 'Bus Sekolah'
  | 'Kendaraan Pribadi';

export interface ExitPermissionRecord {
  id: string;
  studentId: string;
  nis: string;
  studentName: string;
  unitName: string;
  className: string;
  date: string;
  exitTime: string; // HH:mm
  expectedReturnTime: string; // HH:mm
  actualReturnTime?: string; // HH:mm
  purpose: string; // e.g., Berobat, Acara Keluarga, Lomba
  pickupBy: string; // e.g., Ayah, Ibu, Supir
  permitLetterUrl?: string; // Uploaded permit letter image
  officerName: string;
  status: 'Belum Kembali' | 'Sudah Kembali' | 'Langsung Pulang';
  createdAt: string;
}

export interface TransportRecord {
  id: string;
  studentId: string;
  nis: string;
  studentName: string;
  unitName: string;
  className: string;
  date: string; // YYYY-MM-DD
  dismissalTime: string; // HH:mm
  transportMode: TransportMode;
  driverName?: string; // For online driver or pickup
  vehiclePlate?: string; // e.g. B 1234 XYZ
  vehiclePhotoUrl?: string; // Foto kendaraan / driver / penjemput
  officerName: string;
  createdAt: string;
}

export interface FaceProfile {
  id: string;
  studentId: string;
  studentName: string;
  nis: string;
  registeredAt: string;
  photoUrl: string;
  confidenceThreshold: number;
  sampleCount: number;
  status: 'Registered' | 'Pending';
}

export interface FaceRecognitionResult {
  matchedStudent: Student | null;
  confidenceScore: number; // 0-100%
  timestamp: string;
  faceBox?: { x: number; y: number; width: number; height: number };
}

export interface NotificationItem {
  id: string;
  type: 'early' | 'late' | 'exit' | 'overdue' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  channel: 'In-App' | 'WhatsApp' | 'Email' | 'Telegram';
  targetUnit?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: RoleType;
  action: string; // e.g., "Mencatat Siswa Terlambat", "Registrasi Wajah"
  module: string;
  details: string;
  ipAddress: string;
}

export interface SystemSetting {
  schoolName: string;
  academicYear: string;
  earlyArrivalCutoff: string; // e.g., "06:15"
  normalArrivalCutoff: string; // e.g., "07:00"
  lateArrivalCutoff: string; // e.g., "07:15"
  faceConfidenceThreshold: number; // e.g. 85
  enableWhatsAppApi: boolean;
  waApiKey: string;
  waPhoneSender: string;
  enableEmailAlerts: boolean;
}
