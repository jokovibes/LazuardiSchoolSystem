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

export const initialUnits: SchoolUnit[] = [];

export const initialClasses: StudentClass[] = [];

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Super Admin Lazuardi',
    username: 'admin',
    email: 'it@lazuardi.sch.id',
    password: '@lazuardi123',
    role: 'Super Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    status: 'Active'
  }
];

export const initialStudents: Student[] = [];

export const initialEarlyArrivals: EarlyArrivalRecord[] = [];

export const initialLateArrivals: LateArrivalRecord[] = [];

export const initialExitPermissions: ExitPermissionRecord[] = [];

export const initialTransportRecords: TransportRecord[] = [];

export const initialFaceProfiles: FaceProfile[] = [];

export const initialNotifications: NotificationItem[] = [];

export const initialAuditLogs: AuditLog[] = [];

export const initialSettings: SystemSetting = {
  schoolName: 'Lazuardi Global Compassionate School',
  academicYear: '2026/2027 - Semester Ganjil',
  earlyArrivalCutoff: '06:15',
  normalArrivalCutoff: '07:00',
  lateArrivalCutoff: '07:15',
  faceConfidenceThreshold: 85,
  enableWhatsAppApi: true,
  waApiKey: 'FONNTE_LZ_LIVE_SECRET_KEY_88912',
  waPhoneSender: '+62 812-8888-9999',
  enableEmailAlerts: true
};

