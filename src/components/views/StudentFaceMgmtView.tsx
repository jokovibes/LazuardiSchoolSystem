import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  Filter, 
  Upload, 
  X, 
  CheckCircle2, 
  GraduationCap, 
  Building, 
  UserCheck,
  UserPlus,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { Student, FaceProfile, SchoolUnit, StudentClass } from '../../types';

interface StudentFaceMgmtViewProps {
  students: Student[];
  faceProfiles?: FaceProfile[];
  units: SchoolUnit[];
  classes: StudentClass[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onBulkAddStudents?: (students: Omit<Student, 'id'>[]) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onRegisterFace?: (studentId: string, photoUrl: string) => void;
  onDeleteFaceData?: (studentId: string) => void;
}

export const StudentFaceMgmtView: React.FC<StudentFaceMgmtViewProps> = ({
  students,
  units,
  classes,
  onAddStudent,
  onBulkAddStudents,
  onEditStudent,
  onDeleteStudent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterClass, setFilterClass] = useState('ALL');

  // Form Modals
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudentTarget, setDeletingStudentTarget] = useState<Student | null>(null);

  // Bulk Import State
  const [parsedImportRows, setParsedImportRows] = useState<Omit<Student, 'id'>[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedCountAlert, setImportedCountAlert] = useState<number | null>(null);

  // New Student State
  const [newNis, setNewNis] = useState('');
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [newUnitId, setNewUnitId] = useState(units[0]?.id || 'unit-1');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || 'cls-1');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Edit Student State
  const [editNis, setEditNis] = useState('');
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editUnitId, setEditUnitId] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');

  // Filtered Classes based on unit
  const filteredClassesNew = classes.filter(c => c.unitId === newUnitId);
  const filteredClassesEdit = classes.filter(c => c.unitId === editUnitId);

  // Download Template CSV/Excel
  const downloadCSVTemplate = () => {
    const csvContent = "\uFEFF" + 
      "NIS,Nama_Lengkap,Jenis_Kelamin,Unit_Sekolah,Kelas,Nama_Orang_Tua,No_HP_Orang_Tua,Alamat\n" +
      "2026010,Ahmad Albar,L,SD Lazuardi,1-A,Dedi Albar,081234567890,Jl. Margonda No. 12 Depok\n" +
      "2026011,Nadia Safira,P,SD Lazuardi,1-B,Safriadi,081298765432,Jl. Juanda No. 45 Depok\n" +
      "2026012,Bagas Pratama,L,SMP Lazuardi,7-A,Irwan Pratama,081311223344,Jl. Raya Cinere No. 88\n" +
      "2026013,Aisyah Putri,P,SMA Lazuardi,10-IPA,Suryadi,081599887766,Jl. Akses UI No. 10";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_impor_siswa_lazuardi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV File Parser
  const handleFileUploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (!text) {
          setImportError('File kosong atau tidak dapat dibaca.');
          return;
        }

        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          setImportError('File CSV minimal harus berisi 1 baris header dan 1 baris data siswa.');
          return;
        }

        const headerLine = lines[0];
        const delimiter = headerLine.includes(';') ? ';' : ',';

        const parseLine = (line: string): string[] => {
          const res: string[] = [];
          let curr = '';
          let quotes = false;
          for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') {
              quotes = !quotes;
            } else if (c === delimiter && !quotes) {
              res.push(curr.trim().replace(/^"|"$/g, ''));
              curr = '';
            } else {
              curr += c;
            }
          }
          res.push(curr.trim().replace(/^"|"$/g, ''));
          return res;
        };

        const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'));

        const findIndex = (keys: string[]) => {
          return headers.findIndex(h => keys.some(k => h.includes(k)));
        };

        const nisIdx = findIndex(['nis', 'no_induk', 'id_siswa']);
        const nameIdx = findIndex(['nama', 'name', 'siswa']);
        const genderIdx = findIndex(['jenis_kelamin', 'gender', 'jk']);
        const unitIdx = findIndex(['unit', 'sekolah']);
        const classIdx = findIndex(['kelas', 'class']);
        const parentIdx = findIndex(['orang_tua', 'wali', 'parent']);
        const phoneIdx = findIndex(['hp', 'phone', 'wa', 'telepon']);
        const addressIdx = findIndex(['alamat', 'address']);

        const parsedStudents: Omit<Student, 'id'>[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = parseLine(lines[i]);
          if (row.length === 0 || (row.length === 1 && !row[0])) continue;

          const rawNis = nisIdx !== -1 ? row[nisIdx] : row[0] || `2026${100 + i}`;
          const rawName = nameIdx !== -1 ? row[nameIdx] : row[1] || `Siswa ${i}`;
          const rawGenderStr = genderIdx !== -1 ? row[genderIdx] : row[2] || 'L';
          const gender: 'L' | 'P' = rawGenderStr.toUpperCase().startsWith('P') ? 'P' : 'L';

          const rawUnit = unitIdx !== -1 ? row[unitIdx] : row[3] || 'SD Lazuardi';
          const rawClass = classIdx !== -1 ? row[classIdx] : row[4] || '1-A';
          const rawParent = parentIdx !== -1 ? row[parentIdx] : row[5] || 'Orang Tua';
          const rawPhone = phoneIdx !== -1 ? row[phoneIdx] : row[6] || '08123456789';
          const rawAddress = addressIdx !== -1 ? row[addressIdx] : row[7] || 'Depok';

          // Match unit object if exists
          const unitObj = units.find(u => u.name.toLowerCase().includes(rawUnit.toLowerCase()) || rawUnit.toLowerCase().includes(u.name.toLowerCase()));
          const matchedUnitId = unitObj?.id || units[0]?.id || 'unit-1';
          const matchedUnitName = unitObj?.name || rawUnit || 'SD Lazuardi';

          // Match class object if exists
          const classObj = classes.find(c => c.name.toLowerCase() === rawClass.toLowerCase() && c.unitId === matchedUnitId) || classes.find(c => c.name.toLowerCase() === rawClass.toLowerCase());
          const matchedClassId = classObj?.id || classes[0]?.id || 'cls-1';
          const matchedClassName = classObj?.name || rawClass || '1-A';

          if (rawName && rawNis) {
            parsedStudents.push({
              nis: rawNis,
              name: rawName,
              gender,
              unitId: matchedUnitId,
              unitName: matchedUnitName,
              classId: matchedClassId,
              className: matchedClassName,
              parentName: rawParent,
              parentPhone: rawPhone,
              address: rawAddress,
              photoUrl: `https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80`,
              hasFaceData: true
            });
          }
        }

        if (parsedStudents.length === 0) {
          setImportError('Tidak ada data siswa yang valid ditemukan dalam file.');
        } else {
          setParsedImportRows(parsedStudents);
        }
      } catch (err) {
        console.error('Error parsing file:', err);
        setImportError('Gagal membaca file. Pastikan format file adalah CSV ber-delimiter koma/titik-koma.');
      }
    };

    reader.readAsText(file);
  };

  const handleExecuteBulkImport = () => {
    if (parsedImportRows.length === 0) return;

    if (onBulkAddStudents) {
      onBulkAddStudents(parsedImportRows);
    } else {
      parsedImportRows.forEach(st => onAddStudent(st));
    }

    setImportedCountAlert(parsedImportRows.length);
    setParsedImportRows([]);
    setIsImportModalOpen(false);
  };

  // Handle Photo Upload (Base64)
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditPhotoUrl(reader.result as string);
        } else {
          setNewPhotoUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNis || !newName) {
      alert('Mohon isi NIS dan Nama Siswa.');
      return;
    }

    const unitObj = units.find(u => u.id === newUnitId);
    const classObj = classes.find(c => c.id === newClassId);

    const defaultPhoto = newPhotoUrl || `https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80`;

    onAddStudent({
      nis: newNis,
      name: newName,
      gender: newGender,
      unitId: newUnitId,
      unitName: unitObj?.name || 'SD Lazuardi',
      classId: newClassId,
      className: classObj?.name || '1-A',
      parentName: newParentName || 'Orang Tua Siswa',
      parentPhone: newParentPhone || '08123456789',
      address: 'Depok, Jawa Barat',
      photoUrl: defaultPhoto,
      hasFaceData: true
    });

    // Reset Form
    setNewNis('');
    setNewName('');
    setNewParentName('');
    setNewParentPhone('');
    setNewPhotoUrl('');
    setIsAddingStudent(false);
    alert(`Siswa ${newName} berhasil ditambahkan!`);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setEditNis(student.nis);
    setEditName(student.name);
    setEditGender(student.gender);
    setEditUnitId(student.unitId);
    setEditClassId(student.classId);
    setEditParentName(student.parentName || '');
    setEditParentPhone(student.parentPhone || '');
    setEditPhotoUrl(student.photoUrl || '');
  };

  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const unitObj = units.find(u => u.id === editUnitId);
    const classObj = classes.find(c => c.id === editClassId);

    onEditStudent({
      ...editingStudent,
      nis: editNis,
      name: editName,
      gender: editGender,
      unitId: editUnitId,
      unitName: unitObj?.name || editingStudent.unitName,
      classId: editClassId,
      className: classObj?.name || editingStudent.className,
      parentName: editParentName,
      parentPhone: editParentPhone,
      photoUrl: editPhotoUrl || editingStudent.photoUrl
    });

    setEditingStudent(null);
    alert(`Data siswa ${editName} berhasil diperbarui!`);
  };

  const confirmDeleteStudent = () => {
    if (deletingStudentTarget) {
      onDeleteStudent(deletingStudentTarget.id);
      alert(`Siswa ${deletingStudentTarget.name} telah dihapus.`);
      setDeletingStudentTarget(null);
    }
  };

  // Filtered Students
  const filteredStudents = students.filter(student => {
    const matchUnit = filterUnit === 'ALL' || student.unitId === filterUnit || (student.unitName || '').includes(filterUnit);
    const matchClass = filterClass === 'ALL' || student.classId === filterClass || student.className === filterClass;
    const matchQuery = 
      (student.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nis || '').includes(searchQuery) ||
      (student.className || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.unitName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchUnit && matchClass && matchQuery;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner Notice when bulk import completes */}
      {importedCountAlert !== null && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-semibold">
              Berhasil mengimpor <strong>{importedCountAlert} siswa baru</strong> ke dalam sistem master data.
            </p>
          </div>
          <button 
            onClick={() => setImportedCountAlert(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Daftar Siswa
            </h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              Total {students.length} Siswa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen data seluruh siswa Lazuardi SG. Informasi Foto, Nama, NIS, Kelas, dan Unit Sekolah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Impor Masal (CSV/Excel)
          </button>

          <button
            onClick={() => setIsAddingStudent(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Siswa Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama, NIS, Kelas, atau Unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filter Unit:</span>
          </div>
          <select
            value={filterUnit}
            onChange={(e) => {
              setFilterUnit(e.target.value);
              setFilterClass('ALL');
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="ALL">Semua Unit</option>
            {units.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="ALL">Semua Kelas</option>
            {classes
              .filter(c => filterUnit === 'ALL' || c.unitId === filterUnit)
              .map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))
            }
          </select>
        </div>
      </div>

      {/* Table & Cards List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Foto</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">NIS</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Unit Sekolah</th>
                <th className="py-3.5 px-4">Orang Tua / Wali</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada data siswa yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Foto */}
                    <td className="py-3 px-4 text-center">
                      <img
                        src={student.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 mx-auto shadow-xs"
                      />
                    </td>

                    {/* Nama */}
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {student.name}
                      <span className="block text-[10px] font-normal text-slate-400">
                        Gender: {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>

                    {/* NIS */}
                    <td className="py-3 px-4 font-mono text-slate-700 font-semibold">
                      {student.nis}
                    </td>

                    {/* Kelas */}
                    <td className="py-3 px-4">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2.5 py-1 rounded-md text-[11px] inline-flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        {student.className}
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-800 border border-slate-200 font-semibold px-2.5 py-1 rounded-md text-[11px] inline-flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {student.unitName}
                      </span>
                    </td>

                    {/* Orang Tua / Wali */}
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-medium text-slate-700">{student.parentName || '-'}</p>
                      <p className="text-[10px] font-mono text-slate-400">{student.parentPhone || '-'}</p>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                          title="Edit Data Siswa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingStudentTarget(student)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Impor Masal (CSV / Excel) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-700 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Impor Masal Data Siswa (CSV / Excel)</h3>
                  <p className="text-xs text-emerald-200">Unggah berkas data siswa masal sekaligus untuk dimasukkan ke database</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedImportRows([]);
                  setImportError(null);
                }}
                className="p-1 hover:bg-white/10 rounded-lg text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Step 1: Download Template format */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-emerald-700" />
                      Langkah 1: Unduh Contoh Template CSV / Excel
                    </h4>
                    <p className="text-[11px] text-emerald-800 mt-1">
                      Gunakan format kolom baku di bawah ini agar sistem membaca data siswa dengan presisi.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadCSVTemplate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Template CSV
                  </button>
                </div>

                {/* Example format table */}
                <div className="overflow-x-auto border border-emerald-200 rounded-lg bg-white">
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead>
                      <tr className="bg-emerald-100/60 text-emerald-900 font-bold border-b border-emerald-200">
                        <th className="p-2 border-r border-emerald-200">NIS</th>
                        <th className="p-2 border-r border-emerald-200">Nama_Lengkap</th>
                        <th className="p-2 border-r border-emerald-200">Jenis_Kelamin</th>
                        <th className="p-2 border-r border-emerald-200">Unit_Sekolah</th>
                        <th className="p-2 border-r border-emerald-200">Kelas</th>
                        <th className="p-2 border-r border-emerald-200">Nama_Orang_Tua</th>
                        <th className="p-2 border-r border-emerald-200">No_HP_Orang_Tua</th>
                        <th className="p-2">Alamat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100 text-slate-700 font-mono text-[10px]">
                      <tr>
                        <td className="p-2 border-r border-emerald-100 font-bold text-slate-900">2026010</td>
                        <td className="p-2 border-r border-emerald-100 font-sans font-medium text-slate-900">Ahmad Albar</td>
                        <td className="p-2 border-r border-emerald-100">L</td>
                        <td className="p-2 border-r border-emerald-100 font-sans">SD Lazuardi</td>
                        <td className="p-2 border-r border-emerald-100">1-A</td>
                        <td className="p-2 border-r border-emerald-100 font-sans">Dedi Albar</td>
                        <td className="p-2 border-r border-emerald-100">081234567890</td>
                        <td className="p-2 font-sans">Jl. Margonda Depok</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2 border-r border-emerald-100 font-bold text-slate-900">2026011</td>
                        <td className="p-2 border-r border-emerald-100 font-sans font-medium text-slate-900">Nadia Safira</td>
                        <td className="p-2 border-r border-emerald-100">P</td>
                        <td className="p-2 border-r border-emerald-100 font-sans">SD Lazuardi</td>
                        <td className="p-2 border-r border-emerald-100">1-B</td>
                        <td className="p-2 border-r border-emerald-100 font-sans">Safriadi</td>
                        <td className="p-2 border-r border-emerald-100">081298765432</td>
                        <td className="p-2 font-sans">Jl. Juanda Depok</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Step 2: Upload File */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Langkah 2: Pilih Berkas CSV / Excel (*.csv, *.txt)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50 hover:bg-emerald-50/30 transition-all relative">
                  <Upload className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Klik atau Drag & Drop Berkas CSV / Excel ke Sini</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Mendukung format .csv dengan pemisah koma (,) atau titik koma (;)</p>
                  <input
                    type="file"
                    accept=".csv,.txt,.xlsx,.xls"
                    onChange={handleFileUploadCSV}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              {/* Error Banner */}
              {importError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Step 3: Parsed Data Preview */}
              {parsedImportRows.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Preview Hasil Pembacaan Berkas ({parsedImportRows.length} Siswa Terbaca)
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Siap Diimpor
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                          <th className="p-2.5">NIS</th>
                          <th className="p-2.5">Nama Siswa</th>
                          <th className="p-2.5">JK</th>
                          <th className="p-2.5">Unit</th>
                          <th className="p-2.5">Kelas</th>
                          <th className="p-2.5">Orang Tua</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {parsedImportRows.map((row, idx) => {
                          const isDuplicate = students.some(s => s.nis === row.nis);
                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2.5 font-mono font-bold text-slate-800">{row.nis}</td>
                              <td className="p-2.5 font-semibold text-slate-800">{row.name}</td>
                              <td className="p-2.5">{row.gender}</td>
                              <td className="p-2.5 text-slate-600">{row.unitName}</td>
                              <td className="p-2.5 font-medium text-blue-700">{row.className}</td>
                              <td className="p-2.5 text-slate-500">{row.parentName || '-'}</td>
                              <td className="p-2.5 text-center">
                                {isDuplicate ? (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block">
                                    Duplikat NIS
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block">
                                    Valid
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedImportRows([]);
                  setImportError(null);
                }}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={parsedImportRows.length === 0}
                onClick={handleExecuteBulkImport}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                  parsedImportRows.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {parsedImportRows.length > 0
                  ? `Proses Impor ${parsedImportRows.length} Data Siswa`
                  : 'Pilih File Terlebih Dahulu'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Tambah Siswa Baru */}
      {isAddingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-800 rounded-xl">
                  <UserPlus className="w-5 h-5 text-sky-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Tambah Siswa Baru</h3>
                  <p className="text-xs text-blue-200">Masukkan data lengkap Foto, Nama, NIS, Kelas, dan Unit</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddingStudent(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-blue-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudentSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <img
                  src={newPhotoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                  alt="Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Foto Siswa</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoFileUpload(e, false)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIS (Nomor Induk Siswa) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2026001"
                    value={newNis}
                    onChange={(e) => setNewNis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ketik nama lengkap siswa..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Sekolah *</label>
                  <select
                    value={newUnitId}
                    onChange={(e) => {
                      setNewUnitId(e.target.value);
                      const matchingClass = classes.find(c => c.unitId === e.target.value);
                      if (matchingClass) setNewClassId(matchingClass.id);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
                  >
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas *</label>
                  <select
                    value={newClassId}
                    onChange={(e) => setNewClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
                  >
                    {filteredClassesNew.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    placeholder="Nama wali..."
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP Orang Tua (WA)</label>
                  <input
                    type="text"
                    placeholder="0812xxxx"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingStudent(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Siswa */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-xl text-blue-400">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Edit Data Siswa</h3>
                  <p className="text-xs text-slate-300">Ubah data Foto, Nama, NIS, Kelas, atau Unit</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingStudent(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditStudentSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <img
                  src={editPhotoUrl || editingStudent.photoUrl}
                  alt="Preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ganti Foto Siswa</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoFileUpload(e, true)}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIS *</label>
                  <input
                    type="text"
                    required
                    value={editNis}
                    onChange={(e) => setEditNis(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Sekolah *</label>
                  <select
                    value={editUnitId}
                    onChange={(e) => {
                      setEditUnitId(e.target.value);
                      const matchingClass = classes.find(c => c.unitId === e.target.value);
                      if (matchingClass) setEditClassId(matchingClass.id);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
                  >
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas *</label>
                  <select
                    value={editClassId}
                    onChange={(e) => setEditClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
                  >
                    {filteredClassesEdit.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={editParentName}
                    onChange={(e) => setEditParentName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. HP Orang Tua (WA)</label>
                  <input
                    type="text"
                    value={editParentPhone}
                    onChange={(e) => setEditParentPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Siswa */}
      {deletingStudentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Hapus Siswa Ini?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data siswa <strong>{deletingStudentTarget.name}</strong> (NIS: {deletingStudentTarget.nis})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingStudentTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteStudent}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
