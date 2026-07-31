import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  GitBranch, 
  Table, 
  Key, 
  ShieldCheck, 
  Layers,
  Server,
  Code
} from 'lucide-react';
import { SUPABASE_CONFIG, SUPABASE_POSTGRES_DDL } from '../../lib/supabase';

export const DatabaseErdView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'supabase' | 'mysql'>('supabase');

  const mysqlDDL = `-- =================================================================
-- DATABASE SCHEMA: Lazuardi Student Attendance & Movement System
-- Target Engine: MySQL 8.0+ / MariaDB 10.5+
-- Generated for School Operational Management
-- =================================================================

CREATE DATABASE IF NOT EXISTS \`lazuardi_attendance_db\` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`lazuardi_attendance_db\`;

-- 1. UNITS TABLE
CREATE TABLE \`units\` (
  \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
  \`code\` VARCHAR(10) NOT NULL UNIQUE,
  \`name\` VARCHAR(100) NOT NULL,
  \`headmaster_name\` VARCHAR(100),
  \`total_students\` INT DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. CLASSES TABLE
CREATE TABLE \`classes\` (
  \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
  \`unit_id\` VARCHAR(36) NOT NULL,
  \`name\` VARCHAR(50) NOT NULL,
  \`homeroom_teacher\` VARCHAR(100),
  \`total_students\` INT DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`unit_id\`) REFERENCES \`units\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. USERS TABLE
CREATE TABLE \`users\` (
  \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('Super Admin', 'Admin', 'Security', 'Guru', 'Kepala Unit', 'Manajemen') NOT NULL,
  \`unit_id\` VARCHAR(36) NULL,
  \`assigned_class\` VARCHAR(50) NULL,
  \`status\` ENUM('Active', 'Inactive') DEFAULT 'Active',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`unit_id\`) REFERENCES \`units\`(\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. STUDENTS TABLE
CREATE TABLE \`students\` (
  \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
  \`nis\` VARCHAR(20) NOT NULL UNIQUE,
  \`name\` VARCHAR(100) NOT NULL,
  \`gender\` ENUM('L', 'P') NOT NULL,
  \`unit_id\` VARCHAR(36) NOT NULL,
  \`class_id\` VARCHAR(36) NOT NULL,
  \`parent_name\` VARCHAR(100),
  \`parent_phone\` VARCHAR(20),
  \`address\` TEXT,
  \`photo_url\` TEXT,
  \`has_face_data\` TINYINT(1) DEFAULT 0,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`unit_id\`) REFERENCES \`units\`(\`id\`),
  FOREIGN KEY (\`class_id\`) REFERENCES \`classes\`(\`id\`),
  INDEX \`idx_nis\` (\`nis\`),
  INDEX \`idx_student_name\` (\`name\`)
) ENGINE=InnoDB;

-- 5. FACE_PROFILES TABLE (AI Face Recognition Dataset)
CREATE TABLE \`face_profiles\` (
  \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
  \`student_id\` VARCHAR(36) NOT NULL UNIQUE,
  \`confidence_threshold\` DECIMAL(5,2) DEFAULT 85.00,
  \`vector_data\` JSON NOT NULL, -- 128-dimensional float array
  \`registered_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. EARLY_ARRIVALS TABLE
CREATE TABLE \`early_arrivals\` (
  \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
  \`student_id\` VARCHAR(36) NOT NULL,
  \`date\` DATE NOT NULL,
  \`arrival_time\` TIME NOT NULL,
  \`assembly_location\` VARCHAR(100) NOT NULL,
  \`officer_name\` VARCHAR(100) NOT NULL,
  \`notes\` TEXT,
  \`status\` VARCHAR(50) DEFAULT 'Datang Terlalu Pagi',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`),
  INDEX \`idx_early_date\` (\`date\`)
) ENGINE=InnoDB;

-- 7. LATE_ARRIVALS TABLE
CREATE TABLE \`late_arrivals\` (
  \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
  \`student_id\` VARCHAR(36) NOT NULL,
  \`date\` DATE NOT NULL,
  \`arrival_time\` TIME NOT NULL,
  \`late_reason\` TEXT NOT NULL,
  \`photo_proof_url\` TEXT NULL,
  \`officer_name\` VARCHAR(100) NOT NULL,
  \`attendance_status\` VARCHAR(50) DEFAULT 'Terlambat',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`),
  INDEX \`idx_late_date\` (\`date\`)
) ENGINE=InnoDB;

-- 8. EXIT_PERMISSIONS TABLE
CREATE TABLE \`exit_permissions\` (
  \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
  \`student_id\` VARCHAR(36) NOT NULL,
  \`date\` DATE NOT NULL,
  \`exit_time\` TIME NOT NULL,
  \`expected_return_time\` TIME NOT NULL,
  \`actual_return_time\` TIME NULL,
  \`purpose\` TEXT NOT NULL,
  \`pickup_by\` VARCHAR(100) NOT NULL,
  \`permit_letter_url\` TEXT NULL,
  \`officer_name\` VARCHAR(100) NOT NULL,
  \`status\` ENUM('Belum Kembali', 'Sudah Kembali') DEFAULT 'Belum Kembali',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`),
  INDEX \`idx_exit_status\` (\`status\`)
) ENGINE=InnoDB;

-- 9. ONLINE_TRANSPORT TABLE
CREATE TABLE \`online_transport\` (
  \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
  \`student_id\` VARCHAR(36) NOT NULL,
  \`date\` DATE NOT NULL,
  \`dismissal_time\` TIME NOT NULL,
  \`transport_mode\` VARCHAR(50) NOT NULL,
  \`driver_name\` VARCHAR(100) NULL,
  \`vehicle_plate\` VARCHAR(20) NULL,
  \`officer_name\` VARCHAR(100) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`)
) ENGINE=InnoDB;

-- 10. AUDIT_LOGS TABLE
CREATE TABLE \`audit_logs\` (
  \`id\` VARCHAR(36) NOT NULL PRIMARY KEY,
  \`user_name\` VARCHAR(100) NOT NULL,
  \`user_role\` VARCHAR(50) NOT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`module\` VARCHAR(50) NOT NULL,
  \`details\` TEXT,
  \`ip_address\` VARCHAR(45) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`;

  const activeScript = activeTab === 'supabase' ? SUPABASE_POSTGRES_DDL : mysqlDDL;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const filename = activeTab === 'supabase' ? 'supabase_lazuardi_schema.sql' : 'lazuardi_mysql_schema.sql';
    const blob = new Blob([activeScript], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            Modul 10: Skema Database Supabase (PostgreSQL) & ERD
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Arsitektur database Supabase (Project ID: {SUPABASE_CONFIG.projectId}) lengkap dengan DDL script PostgreSQL dan relasi foreign key.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tercopy!' : 'Copy SQL'}
          </button>

          <button
            onClick={handleDownloadSql}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download .SQL DDL
          </button>
        </div>
      </div>

      {/* Supabase Active Connection Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Active Database Instance: Supabase Cloud</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{SUPABASE_CONFIG.url}</p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-400">Project ID:</span> <span className="font-mono text-emerald-400 font-bold">{SUPABASE_CONFIG.projectId}</span>
        </div>
      </div>

      {/* Visual ERD Diagram Summary Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-600" />
          Peta Skema Relasi Antar Tabel (Entity Relationship Map)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-blue-700 font-bold text-xs">
              <span className="flex items-center gap-1.5"><Table className="w-4 h-4" /> units</span>
              <span className="bg-blue-100 px-2 py-0.5 rounded-md text-[10px]">Primary Master</span>
            </div>
            <p className="text-[11px] text-slate-600">id, code, name, headmaster_name, total_students</p>
            <p className="text-[10px] text-slate-400 border-t border-slate-200 pt-1">1 to Many ➔ classes, users, students</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-indigo-700 font-bold text-xs">
              <span className="flex items-center gap-1.5"><Table className="w-4 h-4" /> students</span>
              <span className="bg-indigo-100 px-2 py-0.5 rounded-md text-[10px]">Core Student</span>
            </div>
            <p className="text-[11px] text-slate-600">id, nis, name, gender, unit_id, class_id, parent_name</p>
            <p className="text-[10px] text-slate-400 border-t border-slate-200 pt-1">1 to 1 ➔ face_profiles | 1 to Many ➔ logs</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-emerald-700 font-bold text-xs">
              <span className="flex items-center gap-1.5"><Table className="w-4 h-4" /> face_profiles</span>
              <span className="bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">AI Vector</span>
            </div>
            <p className="text-[11px] text-slate-600">id, student_id, confidence_threshold, photo_url</p>
            <p className="text-[10px] text-slate-400 border-t border-slate-200 pt-1">Relasi Kunci Foreign Key: student_id</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-rose-700 font-bold text-xs">
              <span className="flex items-center gap-1.5"><Table className="w-4 h-4" /> attendance_logs</span>
              <span className="bg-rose-100 px-2 py-0.5 rounded-md text-[10px]">Movement Logs</span>
            </div>
            <p className="text-[11px] text-slate-600">early_arrivals, late_arrivals, exit_permissions, transport_records</p>
            <p className="text-[10px] text-slate-400 border-t border-slate-200 pt-1">Indexed by Date, Status, StudentID</p>
          </div>
        </div>
      </div>

      {/* SQL DDL Code View with Tab Switcher */}
      <div className="bg-slate-950 text-slate-200 p-6 rounded-2xl shadow-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('supabase')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                activeTab === 'supabase'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Supabase (PostgreSQL 15+)
            </button>
            <button
              onClick={() => setActiveTab('mysql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                activeTab === 'mysql'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              MySQL 8.0 DDL
            </button>
          </div>

          <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md">UTF8MB4 Unicode</span>
        </div>

        <pre className="text-xs font-mono overflow-x-auto max-h-96 p-4 bg-slate-900 rounded-xl text-emerald-400 leading-relaxed custom-scrollbar">
          {activeScript}
        </pre>
      </div>

    </div>
  );
};

