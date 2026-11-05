import React, { useState, useRef } from 'react';
import { AppState, PengaturanSekolah as SchoolType, NotificationLog } from '../../types';
import { createNotification } from '../../lib/storage';
import {
  School,
  Save,
  CheckCircle2,
  Building,
  MapPin,
  UserCheck,
  Upload,
  HardDrive,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Info,
  FileText,
  Link as LinkIcon,
  Camera,
  Wallpaper,
  Sparkles,
} from 'lucide-react';

interface PengaturanSekolahProps {
  appState: AppState;
  onUpdateSekolah: (newSekolah: SchoolType, notif: NotificationLog) => void;
}

/** Helper function to convert Google Drive sharing links to direct viewable image URLs */
function processImageUrlInput(inputUrl: string): { directUrl: string; fileId: string | null; isDrive: boolean } {
  if (!inputUrl) return { directUrl: '', fileId: null, isDrive: false };
  const trimmed = inputUrl.trim();

  // If input is a raw Google Drive File ID (25-50 alphanumeric chars)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return {
      directUrl: `https://lh3.googleusercontent.com/d/${trimmed}`,
      fileId: trimmed,
      isDrive: true,
    };
  }

  // Check for google drive patterns
  const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const matchLh3 = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);

  const fileId = matchFileD?.[1] || matchIdParam?.[1] || matchLh3?.[1] || null;

  if (fileId) {
    return {
      directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
      fileId: fileId,
      isDrive: true,
    };
  }

  return {
    directUrl: trimmed,
    fileId: null,
    isDrive: false,
  };
}

export const PengaturanSekolah: React.FC<PengaturanSekolahProps> = ({
  appState,
  onUpdateSekolah,
}) => {
  const [form, setForm] = useState<SchoolType>({
    ...appState.sekolah,
    pemerintahDaerah: appState.sekolah.pemerintahDaerah ?? 'PEMERINTAH KABUPATEN BANYUMAS',
    namaSekolah: appState.sekolah.namaSekolah ?? 'SMP NEGERI 2 KEMRANJEN',
    sistemHariSekolah: appState.sekolah.sistemHariSekolah ?? '5 Hari (Senin - Jumat)',
    alamatLengkapKop:
      appState.sekolah.alamatLengkapKop ??
      'Karangsalam ✆ 08112627753 Kemranjen Banyumas ✉ 53194\nEmail : smpn2.kemranjen@banyumaskab.go.id',
    logoPemdaUrl: appState.sekolah.logoPemdaUrl || '/logo-banyumas.svg',
    logoUrl: appState.sekolah.logoUrl || '/logo-smpn2kemranjen.svg',
    bgLoginUrl: appState.sekolah.bgLoginUrl || '',
  });
  const [saved, setSaved] = useState(false);

  // File input refs for quick camera button click
  const logoPemdaInputRef = useRef<HTMLInputElement>(null);
  const logoSekolahInputRef = useRef<HTMLInputElement>(null);
  const bgLoginInputRef = useRef<HTMLInputElement>(null);

  // Logo Input States for Drive
  const [logoDriveInput, setLogoDriveInput] = useState('');
  const [logoPemdaDriveInput, setLogoPemdaDriveInput] = useState('');

  // Background Login Drive / URL Input State
  const [bgLoginDriveInput, setBgLoginDriveInput] = useState('');

  // Handlers for Background Login
  const handleBgLoginUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Ukuran file background terlalu besar. Maksimal 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm((prev) => ({ ...prev, bgLoginUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearBgLogin = () => {
    setForm((prev) => ({ ...prev, bgLoginUrl: '' }));
    setBgLoginDriveInput('');
    if (bgLoginInputRef.current) bgLoginInputRef.current.value = '';
  };

  const handleApplyBgLoginDrive = () => {
    if (!bgLoginDriveInput.trim()) {
      setForm((prev) => ({ ...prev, bgLoginUrl: '' }));
      return;
    }
    const processed = processImageUrlInput(bgLoginDriveInput);
    setForm((prev) => ({ ...prev, bgLoginUrl: processed.directUrl }));
  };

  // Handlers for Logo Pemda (Kiri)
  const handleLogoPemdaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file logo terlalu besar. Maksimal 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm((prev) => ({ ...prev, logoPemdaUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogoPemda = () => {
    setForm((prev) => ({ ...prev, logoPemdaUrl: '' }));
    if (logoPemdaInputRef.current) logoPemdaInputRef.current.value = '';
  };

  // Handlers for Logo Sekolah (Kanan)
  const handleLogoSekolahUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file logo terlalu besar. Maksimal 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearLogoSekolah = () => {
    setForm((prev) => ({ ...prev, logoUrl: '' }));
    if (logoSekolahInputRef.current) logoSekolahInputRef.current.value = '';
  };

  // Kop Sekolah Banner Input States (Advanced)
  const [showAdvancedKop, setShowAdvancedKop] = useState(false);
  const [kopMode, setKopMode] = useState<'upload' | 'drive'>('upload');
  const [kopDriveInput, setKopDriveInput] = useState(form.kopSekolahUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const notif = createNotification(
      'Pengaturan Sekolah Diperbarui',
      `Profil ${form.namaSekolah}, Logo, Background Login, Kop Sekolah, dan data Kepala Sekolah (${form.namaKepalaSekolah}) berhasil diperbarui.`,
      'pengaturan'
    );
    onUpdateSekolah(form, notif);
    setSaved(true);
    setTimeout(() => setSaved(false), 5000);
  };

  // Handlers for Logo
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran file logo terlalu besar. Maksimal 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogoDrive = () => {
    if (!logoDriveInput.trim()) {
      setForm((prev) => ({ ...prev, logoUrl: '' }));
      return;
    }
    const processed = processImageUrlInput(logoDriveInput);
    setForm((prev) => ({ ...prev, logoUrl: processed.directUrl }));
  };

  const handleClearLogo = () => {
    setForm((prev) => ({ ...prev, logoUrl: '' }));
    setLogoDriveInput('');
  };

  // Handlers for Kop Sekolah
  const handleKopFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file kop sekolah terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm((prev) => ({ ...prev, kopSekolahUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleApplyKopDrive = () => {
    if (!kopDriveInput.trim()) {
      setForm((prev) => ({ ...prev, kopSekolahUrl: '' }));
      return;
    }
    const processed = processImageUrlInput(kopDriveInput);
    setForm((prev) => ({ ...prev, kopSekolahUrl: processed.directUrl }));
  };

  const handleClearKop = () => {
    setForm((prev) => ({ ...prev, kopSekolahUrl: '' }));
    setKopDriveInput('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <School className="text-blue-600" size={24} />
            <span>Pengaturan Profil Sekolah</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur identitas resmi sekolah, Logo, Kop Surat, NPSN, alamat lengkap, nama Kepala Sekolah, dan tanggal cetak dokumen.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-2 shrink-0 cursor-pointer transition-all"
        >
          <Save size={16} />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>Pengaturan profil sekolah berhasil disimpan! Seluruh cetakan dokumen SKNR/SKL telah diperbarui.</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-8 text-xs">
        {/* Section 1: Pengaturan Kop Sekolah (Sesuai Desain Baru) */}
        <div className="space-y-5">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <ImageIcon size={18} className="text-blue-600" />
              <span>Kop Surat & Logo Sekolah</span>
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
              Header Resmi Dokumen
            </span>
          </div>

          {/* Baris 1: Tombol Upload 2 Logo (Pemda di Kiri, Sekolah di Kanan) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Pemda (Kiri) */}
            <div>
              <button
                type="button"
                onClick={() => logoPemdaInputRef.current?.click()}
                className="w-full flex items-center justify-start space-x-2.5 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium transition cursor-pointer shadow-2xs"
              >
                <Camera size={19} className="text-slate-600 shrink-0" />
                <span className="text-slate-700 font-normal">Logo Pemerintah Daerah (Kiri)</span>
              </button>
              <input
                ref={logoPemdaInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoPemdaUpload}
                className="hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 pl-0.5">
                Rekomendasi ukuran: 200x200 pixel
              </p>

              {form.logoPemdaUrl && (
                <div className="mt-3 inline-block relative border border-slate-200 rounded-xl p-1 bg-white shadow-xs">
                  <img
                    src={form.logoPemdaUrl}
                    alt="Logo Pemerintah Daerah"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleClearLogoPemda}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md cursor-pointer transition"
                    title="Hapus Logo Pemda"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Logo Sekolah (Kanan) */}
            <div>
              <button
                type="button"
                onClick={() => logoSekolahInputRef.current?.click()}
                className="w-full flex items-center justify-start space-x-2.5 px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium transition cursor-pointer shadow-2xs"
              >
                <Camera size={19} className="text-slate-600 shrink-0" />
                <span className="text-slate-700 font-normal">Logo Sekolah (Kanan)</span>
              </button>
              <input
                ref={logoSekolahInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSekolahUpload}
                className="hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 pl-0.5">
                Rekomendasi ukuran: 200x200 pixel
              </p>

              {form.logoUrl && (
                <div className="mt-3 inline-block relative border border-slate-200 rounded-xl p-1 bg-white shadow-xs">
                  <img
                    src={form.logoUrl}
                    alt="Logo Sekolah"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleClearLogoSekolah}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md cursor-pointer transition"
                    title="Hapus Logo Sekolah"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Baris 2: Sistem Hari Sekolah */}
          <div className="pt-2">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Sistem Hari Sekolah</h4>
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-800">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="sistemHariSekolah"
                  value="5 Hari (Senin - Jumat)"
                  checked={form.sistemHariSekolah === '5 Hari (Senin - Jumat)' || !form.sistemHariSekolah}
                  onChange={(e) => setForm({ ...form, sistemHariSekolah: e.target.value })}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-normal text-slate-800">5 Hari (Senin - Jumat)</span>
              </label>
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="sistemHariSekolah"
                  value="6 Hari (Senin - Sabtu)"
                  checked={form.sistemHariSekolah === '6 Hari (Senin - Sabtu)'}
                  onChange={(e) => setForm({ ...form, sistemHariSekolah: e.target.value })}
                  className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-normal text-slate-800">6 Hari (Senin - Sabtu)</span>
              </label>
            </div>
          </div>

          {/* Baris 3: Pemerintah Daerah (Kop Surat) & Nama Sekolah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            <fieldset className="border border-slate-300 rounded-lg px-3.5 pt-1.5 pb-2.5 bg-white focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
              <legend className="px-1 text-xs text-slate-500 font-normal">
                Pemerintah Daerah (Kop Surat)
              </legend>
              <input
                type="text"
                value={form.pemerintahDaerah ?? ''}
                onChange={(e) => setForm({ ...form, pemerintahDaerah: e.target.value })}
                className="w-full bg-transparent text-sm font-normal text-slate-800 focus:outline-none uppercase tracking-wide py-0.5"
                placeholder="PEMERINTAH KABUPATEN BANYUMAS"
              />
            </fieldset>

            <fieldset className="border border-slate-300 rounded-lg px-3.5 pt-1.5 pb-2.5 bg-white focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
              <legend className="px-1 text-xs text-slate-500 font-normal">
                Nama Sekolah
              </legend>
              <input
                type="text"
                value={form.namaSekolah ?? ''}
                onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
                className="w-full bg-transparent text-sm font-normal text-slate-800 focus:outline-none uppercase tracking-wide py-0.5"
                placeholder="SMP NEGERI 2 KEMRANJEN"
                required
              />
            </fieldset>
          </div>

          {/* Baris 4: Alamat Lengkap (Kontak & Email) */}
          <div className="pt-1">
            <fieldset className="border border-slate-300 rounded-lg px-3.5 pt-1.5 pb-2.5 bg-white focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
              <legend className="px-1 text-xs text-slate-500 font-normal">
                Alamat Lengkap (Kontak & Email)
              </legend>
              <textarea
                rows={3}
                value={form.alamatLengkapKop ?? ''}
                onChange={(e) => setForm({ ...form, alamatLengkapKop: e.target.value })}
                className="w-full bg-transparent text-sm font-normal text-slate-800 focus:outline-none resize-y leading-relaxed py-0.5"
                placeholder="Karangsalam ✆ 08112627753 Kemranjen Banyumas ✉ 53194&#10;Email : smpn2.kemranjen@banyumaskab.go.id"
              />
            </fieldset>
          </div>

          {/* Opsi Banner Gambar Kop (Lanjutan) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedKop(!showAdvancedKop)}
              className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center space-x-1.5 cursor-pointer transition"
            >
              <span>{showAdvancedKop ? '▼ Sembunyikan' : '▶ Tampilkan'} Opsi Banner Gambar Kop Lengkap (Opsional)</span>
            </button>

            {showAdvancedKop && (
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                      <FileText size={14} className="text-purple-600" />
                      <span>Banner Kop Gambar Siap Pakai</span>
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Jika Anda memiliki file banner kop resmi yang sudah didesain lengkap (1 gambar penuh).
                    </p>
                  </div>
                  {form.kopSekolahUrl && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, kopSekolahUrl: '' }))}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Hapus Banner</span>
                    </button>
                  )}
                </div>

                {form.kopSekolahUrl && (
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <img
                      src={form.kopSekolahUrl}
                      alt="Banner Kop"
                      className="max-h-24 w-full object-contain"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <label className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold cursor-pointer transition flex items-center space-x-1.5">
                    <Upload size={14} />
                    <span>Upload Banner Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKopFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">PNG, JPG (Maks 5MB)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section: Background Halaman Login */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Wallpaper size={18} className="text-indigo-600" />
              <span>Background Halaman Login</span>
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center space-x-1">
              <Sparkles size={11} className="text-indigo-500" />
              <span>Tampilan Layar Masuk</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Unggah foto gedung, gerbang, atau halaman sekolah untuk dijadikan gambar latar belakang (background) pada halaman login. 
            Gambar akan otomatis diberi lapisan efek gelap halus agar formulir login tetap kontras, nyaman dibaca, dan tampak profesional.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Upload Controls & Link Input */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <button
                  type="button"
                  onClick={() => bgLoginInputRef.current?.click()}
                  className="w-full flex items-center justify-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Camera size={17} />
                  <span>Upload Foto Background Login</span>
                </button>
                <input
                  ref={bgLoginInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBgLoginUpload}
                  className="hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 pl-0.5">
                  Format didukung: JPG, PNG, WebP (Maksimal 8MB). Disarankan resolusi 1920x1080 (16:9).
                </p>
              </div>

              {/* Opsi Google Drive / Link URL Langsung */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">
                  Atau Gunakan Link Gambar / Google Drive
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bgLoginDriveInput}
                    onChange={(e) => setBgLoginDriveInput(e.target.value)}
                    placeholder="Tempel link URL / ID Google Drive..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBgLoginDrive}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

              {form.bgLoginUrl && (
                <button
                  type="button"
                  onClick={handleClearBgLogin}
                  className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-xl text-xs font-bold border border-rose-200 transition cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Hapus & Reset Background ke Bawaan</span>
                </button>
              )}
            </div>

            {/* Live Interactive Preview Box */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-slate-950 aspect-[16/9] flex items-center justify-center group">
                {form.bgLoginUrl ? (
                  <>
                    <img
                      src={form.bgLoginUrl}
                      alt="Preview Background Login"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={() => {
                        alert('Gambar tidak dapat dimuat. Pastikan URL atau file valid.');
                      }}
                    />
                    {/* Dark gradient overlay mimicking login screen */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-slate-900/50" />
                    
                    {/* Simulated Mini Card */}
                    <div className="relative z-10 p-4 max-w-xs text-center text-white space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-xl bg-white p-1.5 shadow-lg border border-slate-200 flex items-center justify-center">
                        <img
                          src={form.logoUrl || '/logo-smpn2kemranjen.svg'}
                          alt="Logo"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/favicon.svg';
                          }}
                        />
                      </div>
                      <h4 className="font-extrabold text-sm tracking-tight text-white drop-shadow-md truncate">
                        {form.namaSekolah || 'Nama Sekolah'}
                      </h4>
                      <p className="text-[10px] text-blue-200 font-medium">
                        Simulasi Tampilan Pada Halaman Login
                      </p>
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-20">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>Background Aktif</span>
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center text-slate-400 space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400">
                      <Wallpaper size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200">
                        Menggunakan Background Default
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-sm">
                        Belum ada gambar kustom yang diunggah. Halaman login saat ini menggunakan latar gradien gelap bawaan.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Identitas Satuan Pendidikan */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Building size={16} className="text-blue-600" />
            <span>Identitas Satuan Pendidikan</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                value={form.namaSekolah}
                onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NPSN (Nomor Pokok Sekolah Nasional)</label>
              <input
                type="text"
                value={form.npsn}
                onChange={(e) => setForm({ ...form, npsn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode / Nomor Seri Sekolah (NSERI)</label>
              <input
                type="text"
                value={form.nseri}
                onChange={(e) => setForm({ ...form, nseri: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Alamat & Kontak */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
            <MapPin size={16} className="text-emerald-600" />
            <span>Alamat Lengkap & Kontak</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Jalan / Alamat Sekolah</label>
              <input
                type="text"
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Desa / Kelurahan</label>
              <input
                type="text"
                value={form.desaKelurahan}
                onChange={(e) => setForm({ ...form, desaKelurahan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                value={form.kecamatan}
                onChange={(e) => setForm({ ...form, kecamatan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                value={form.kabupatenKota}
                onChange={(e) => setForm({ ...form, kabupatenKota: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Provinsi</label>
              <input
                type="text"
                value={form.provinsi}
                onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Telepon Sekolah</label>
              <input
                type="text"
                value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Resmi Sekolah</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Website Sekolah</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://smpn1merdeka-jkt.sch.id"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Pimpinan & Penandatangan Dokumen */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-2">
            <UserCheck size={16} className="text-purple-600" />
            <span>Kepala Sekolah & Tanggal Terbit Dokumen</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={form.namaKepalaSekolah}
                onChange={(e) => setForm({ ...form, namaKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={form.nipKepalaSekolah}
                onChange={(e) => setForm({ ...form, nipKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Cetak Surat SKL/SKNR</label>
              <input
                type="text"
                value={form.tanggalSurat}
                onChange={(e) => setForm({ ...form, tanggalSurat: e.target.value })}
                placeholder="Contoh: 15 Juni 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 cursor-pointer transition-all"
          >
            Simpan Profil Sekolah
          </button>
        </div>
      </form>
    </div>
  );
};
