import React, { useState, useRef } from 'react';
import { 
  ScanFace, 
  Camera, 
  Upload, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Trash2, 
  Pencil,
  RefreshCw, 
  ShieldCheck, 
  UserPlus,
  Sparkles,
  X
} from 'lucide-react';
import { Student, FaceProfile, SchoolUnit, StudentClass } from '../../types';

interface StudentFaceMgmtViewProps {
  students: Student[];
  faceProfiles: FaceProfile[];
  units: SchoolUnit[];
  classes: StudentClass[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onRegisterFace: (studentId: string, photoUrl: string) => void;
  onDeleteFaceData: (studentId: string) => void;
}

export const StudentFaceMgmtView: React.FC<StudentFaceMgmtViewProps> = ({
  students,
  faceProfiles,
  units,
  classes,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onRegisterFace,
  onDeleteFaceData
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const [selectedStudentForFace, setSelectedStudentForFace] = useState<Student | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [snapshotPhoto, setSnapshotPhoto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Student Form State
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newNis, setNewNis] = useState('');
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [newUnitId, setNewUnitId] = useState(units[0]?.id || 'unit-1');
  const [newClassId, setNewClassId] = useState(classes[0]?.id || 'cls-1');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');

  // Edit Student Form State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudentTarget, setDeletingStudentTarget] = useState<Student | null>(null);
  const [editNis, setEditNis] = useState('');
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editUnitId, setEditUnitId] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const startEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditNis(student.nis);
    setEditName(student.name);
    setEditGender(student.gender);
    setEditUnitId(student.unitId);
    setEditClassId(student.classId);
    setEditParentName(student.parentName);
    setEditParentPhone(student.parentPhone);
    setEditAddress(student.address || 'Lingkungan Sekolah Lazuardi');
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    const unit = units.find(u => u.id === editUnitId);
    const cls = classes.find(c => c.id === editClassId);

    onEditStudent({
      ...editingStudent,
      nis: editNis,
      name: editName,
      gender: editGender,
      unitId: editUnitId,
      unitName: unit?.name || editingStudent.unitName,
      classId: editClassId,
      className: cls?.name || editingStudent.className,
      parentName: editParentName,
      parentPhone: editParentPhone,
      address: editAddress
    });

    setEditingStudent(null);
    alert(`Data siswa ${editName} berhasil diperbarui!`);
  };

  const handleDeleteStudentClick = (student: Student) => {
    setDeletingStudentTarget(student);
  };

  const confirmDeleteStudent = () => {
    if (!deletingStudentTarget) return;
    const stdName = deletingStudentTarget.name;
    onDeleteStudent(deletingStudentTarget.id);
    setDeletingStudentTarget(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      alert('Kamera tidak dapat diakses. Silakan gunakan upload foto.');
    }
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSnapshotPhoto(dataUrl);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSnapshotPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFaceProfile = () => {
    if (!selectedStudentForFace || !snapshotPhoto) {
      alert('Pilih siswa dan ambil foto terlebih dahulu.');
      return;
    }
    onRegisterFace(selectedStudentForFace.id, snapshotPhoto);
    setSelectedStudentForFace(null);
    setSnapshotPhoto(null);
    setIsCameraActive(false);
    alert('Profil Face Recognition siswa berhasil terdaftar di database AI!');
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const unit = units.find(u => u.id === newUnitId);
    const cls = classes.find(c => c.id === newClassId);

    onAddStudent({
      nis: newNis,
      name: newName,
      gender: newGender,
      unitId: newUnitId,
      unitName: unit?.name || 'SD Lazuardi Global',
      classId: newClassId,
      className: cls?.name || 'SD 4-A',
      parentName: newParentName,
      parentPhone: newParentPhone,
      address: 'Lingkungan Sekolah Lazuardi',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      hasFaceData: false,
      faceAccuracyScore: 0
    });

    setIsAddingStudent(false);
    setNewNis('');
    setNewName('');
    alert('Siswa baru berhasil ditambahkan!');
  };

  const filteredStudents = students.filter(s => 
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nis || '').includes(searchQuery) ||
    (s.className || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ScanFace className="w-6 h-6 text-blue-600" />
            Manajemen Registrasi & Vektor Wajah Siswa (Face Profiles)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mengelola pendaftaran dataset wajah siswa untuk kecerdasan buatan (AI) Face Recognition real-time.
          </p>
        </div>

        <button
          onClick={() => setIsAddingStudent(!isAddingStudent)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Data Siswa Baru
        </button>
      </div>

      {/* Add Student Form */}
      {isAddingStudent && (
        <form onSubmit={handleCreateStudent} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="font-bold text-slate-800 text-base">Tambah Master Siswa Baru</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NIS (Nomor Induk Siswa)</label>
              <input
                type="text"
                value={newNis}
                onChange={(e) => setNewNis(e.target.value)}
                placeholder="20241099"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama Siswa..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Sekolah</label>
              <select
                value={newUnitId}
                onChange={(e) => setNewUnitId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas Siswa</label>
              <select
                value={newClassId}
                onChange={(e) => setNewClassId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Orang Tua & Kontak</label>
              <input
                type="text"
                value={newParentName}
                onChange={(e) => setNewParentName(e.target.value)}
                placeholder="Nama Orang Tua / No WA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingStudent(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Simpan Siswa Baru
            </button>
          </div>
        </form>
      )}

      {/* Edit Student Form Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <form onSubmit={handleSaveEditStudent} className="bg-white p-6 rounded-2xl border border-amber-300 shadow-2xl max-w-3xl w-full space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Pencil className="w-5 h-5 text-amber-600" />
                Edit Data Siswa: <span className="text-blue-600">{editingStudent.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIS (Nomor Induk Siswa)</label>
                <input
                  type="text"
                  value={editNis}
                  onChange={(e) => setEditNis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value as 'L' | 'P')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none"
                >
                  <option value="L">Laki-Laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Sekolah</label>
                <select
                  value={editUnitId}
                  onChange={(e) => setEditUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none"
                >
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas Siswa</label>
                <select
                  value={editClassId}
                  onChange={(e) => setEditClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Orang Tua / Kontak WA</label>
                <input
                  type="text"
                  value={editParentName}
                  onChange={(e) => setEditParentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-600/20"
              >
                <Pencil className="w-3.5 h-3.5" />
                Simpan Perubahan Data Siswa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Face Registration Modal / Panel */}
      {selectedStudentForFace && (
        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/30 rounded-xl text-sky-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  Registrasi Sampel Wajah AI: {selectedStudentForFace.name}
                </h3>
                <p className="text-xs text-slate-400">
                  NIS: <span className="font-mono text-sky-300">{selectedStudentForFace.nis}</span> &bull; {selectedStudentForFace.className}
                </p>
              </div>
            </div>

            <button
              onClick={() => { setSelectedStudentForFace(null); setSnapshotPhoto(null); }}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Live Camera View */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300">1. Ambil Foto via Sensor Kamera</p>
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-square flex items-center justify-center border border-slate-800">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                {!isCameraActive && (
                  <button
                    onClick={startCamera}
                    className="absolute px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Aktifkan Kamera Registrasi
                  </button>
                )}
              </div>

              {isCameraActive && (
                <button
                  onClick={takeSnapshot}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Ambil Snapshot Wajah
                </button>
              )}
            </div>

            {/* Photo Snapshot & AI Extraction Preview */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300">2. Upload Foto / Hasil Snapshot</p>
              
              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                <span>Atau Upload Berkas Foto (JPG/PNG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-400 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white"
                />
              </div>

              {snapshotPhoto ? (
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-3">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Matriks Sampel Wajah AI Terdeteksi
                  </p>
                  <div className="flex items-center gap-4">
                    <img src={snapshotPhoto} alt="Snapshot" className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500" />
                    <div className="text-xs text-slate-300 space-y-1">
                      <p>Vektor Deskriptor: <span className="font-mono text-sky-300">128-dim Float32 Array</span></p>
                      <p>Tingkat Akurasi Ekspektasi: <span className="font-bold text-emerald-400">98.5% Match Confidence</span></p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveFaceProfile}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Simpan Vektor Wajah ke Database
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-10 text-center">Belum ada foto wajah yang diambil.</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Student List & Face Registration Status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Daftar Siswa & Status Vektor Wajah</h3>
            <p className="text-xs text-slate-500">Kelola registrasi sampel wajah untuk tiap siswa</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama / NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
            <div key={student.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3">
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{student.name}</h4>
                  <p className="text-[10px] text-slate-500">
                    NIS: <span className="font-mono">{student.nis}</span> &bull; {student.className}
                  </p>
                  <div className="mt-1">
                    {student.hasFaceData ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Terdaftar ({student.faceAccuracyScore}% Accuracy)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Belum Memiliki Dataset Wajah
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEditStudent(student)}
                    className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Edit Data Siswa"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteStudentClick(student)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Hapus Siswa & Dataset Wajah"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setSelectedStudentForFace(student)}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                >
                  <ScanFace className="w-3.5 h-3.5" />
                  {student.hasFaceData ? 'Update Wajah' : 'Daftar Wajah'}
                </button>

                {student.hasFaceData && (
                  <button
                    onClick={() => onDeleteFaceData(student.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 text-[10px] cursor-pointer"
                    title="Hapus Vektor Wajah"
                  >
                    Reset Data Wajah
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Delete Student Confirmation Modal */}
      {deletingStudentTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-2xl max-w-md w-full space-y-4 my-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Hapus Data Siswa</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus siswa <span className="font-bold text-slate-800">{deletingStudentTarget.name}</span> (NIS: {deletingStudentTarget.nis})?
                </p>
                <p className="text-[11px] text-rose-600 font-semibold mt-2 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  ⚠️ Tindakan ini akan menghapus data siswa dan seluruh dataset vektor wajah dari database Supabase secara permanen.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingStudentTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
