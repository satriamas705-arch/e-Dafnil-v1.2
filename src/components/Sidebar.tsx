import React, { useState } from 'react';
import { AppState, AuthUser, MenuCategory } from '../types';
import {
  LayoutDashboard,
  FolderKanban,
  UserCheck,
  Layers,
  BookOpen,
  GraduationCap,
  Calculator,
  PenLine,
  FileSpreadsheet,
  ClipboardList,
  FileCheck,
  Award,
  FileBadge,
  Settings,
  School,
  CalendarDays,
  DatabaseBackup,
  KeyRound,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  appState: AppState;
  authUser?: AuthUser | null;
  activeMenu: MenuCategory;
  onSelectMenu: (menu: MenuCategory) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  appState,
  authUser,
  activeMenu,
  onSelectMenu,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Collapsible submenus state - starts closed so submenus only appear when clicked
  const [openDataManagement, setOpenDataManagement] = useState(false);
  const [openNilaiSumatif, setOpenNilaiSumatif] = useState(false);
  const [openAnalisisKelas9, setOpenAnalisisKelas9] = useState(false);
  const [openPengaturan, setOpenPengaturan] = useState(false);

  const handleSubmenuClick = (menu: MenuCategory) => {
    onSelectMenu(menu);
    onCloseMobile();
  };

  const isDataManagementActive = [
    'data-guru',
    'data-kelas',
    'data-mapel',
    'data-siswa',
  ].includes(activeMenu);

  const isNilaiSumatifActive = ['input-nilai', 'rekap-nilai'].includes(activeMenu);

  const isAnalisisKelas9Active = [
    'input-kelas9',
    'cetak-sknr',
    'cetak-skl',
    'cetak-transkrip',
  ].includes(activeMenu);

  const isPengaturanActive = [
    'pengaturan-sekolah',
    'tahun-ajaran',
    'backup-restore',
    'ubah-password',
  ].includes(activeMenu);

  // Auto-expand group if a child item is active upon navigation
  React.useEffect(() => {
    if (isDataManagementActive) setOpenDataManagement(true);
    if (isNilaiSumatifActive) setOpenNilaiSumatif(true);
    if (isAnalisisKelas9Active) setOpenAnalisisKelas9(true);
    if (isPengaturanActive) setOpenPengaturan(true);
  }, [activeMenu]);

  // Role Checks
  const isGuru = authUser?.role === 'guru';
  const isAdmin = !authUser || authUser.role === 'admin';

  const currentGuru = isGuru
    ? appState.guruList.find(
        (g) =>
          g.id === authUser.guruId ||
          (authUser.nip && g.nip === authUser.nip) ||
          g.nama.toLowerCase() === authUser.nama.toLowerCase() ||
          g.nama.toLowerCase().includes(authUser.username.toLowerCase()) ||
          authUser.username.toLowerCase().includes(g.nama.toLowerCase().split(' ')[0])
      )
    : null;

  // Check if current user is Wali Kelas (any grade)
  const waliKelasObj = currentGuru
    ? appState.kelasList.find(
        (k) =>
          k.waliKelasId === currentGuru.id ||
          k.waliKelasNama?.toLowerCase() === currentGuru.nama.toLowerCase() ||
          (authUser?.nama && k.waliKelasNama?.toLowerCase().includes(authUser.nama.toLowerCase()))
      )
    : null;

  const isWaliKelas = isAdmin || Boolean(waliKelasObj);

  // Check if current user is Wali Kelas 9 specifically
  const waliKelas9Obj = currentGuru
    ? appState.kelasList.find((k) => {
        const isClass9 =
          Number(k.tingkat) === 9 ||
          k.kodeKelas.startsWith('9') ||
          k.kodeKelas.startsWith('IX') ||
          k.namaKelas.includes('9') ||
          k.namaKelas.includes('IX');
        const isWali =
          k.waliKelasId === currentGuru.id ||
          k.waliKelasNama?.toLowerCase() === currentGuru.nama.toLowerCase() ||
          (authUser?.nama && k.waliKelasNama?.toLowerCase().includes(authUser.nama.toLowerCase()));
        return isClass9 && isWali;
      })
    : null;

  const isWaliKelas9 = isAdmin || Boolean(waliKelas9Obj);

  // Hak Akses:
  // - Analisis Kelas 9 (Kelulusan K9): Hanya Admin dan Wali Kelas 9
  // - Rekap Nilai: Hanya Admin dan Wali Kelas (semua tingkat)
  const canAccessAnalisisKelas9 = isAdmin || isWaliKelas9;
  const canAccessRekapNilai = isAdmin || isWaliKelas;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 z-40 h-screen md:h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shrink-0 print:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/favicon.svg"
                alt="e-Dafnil logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/favicon.png';
                }}
              />
            </div>
            <div>
              <span className="font-black text-white text-base tracking-tight block leading-none">
                e-Dafnil
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide truncate max-w-[150px] block" title={appState.sekolah?.namaSekolah || 'e-Dafnil'}>
                {appState.sekolah?.namaSekolah || 'SMP Negeri 2 Kemranjen'}
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Item Scroll List */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
          {/* Section: UTAMA */}
          <div className="pt-2 pb-1.5 px-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
            Utama
          </div>

          {/* Menu Dashboard */}
          <button
            onClick={() => handleSubmenuClick('dashboard')}
            className={`w-full flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition-all ${
              activeMenu === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} className={activeMenu === 'dashboard' ? 'text-white' : 'text-blue-400'} />
            <span className="text-sm font-medium">Dashboard</span>
          </button>

          {/* Section: MASTER DATA (Only visible for Admin, completely hidden for Guru Pengampu) */}
          {isAdmin && (
            <>
              <div className="pt-3 pb-1.5 px-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Master Data
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setOpenDataManagement(!openDataManagement)}
                  className={`w-full flex items-center justify-between p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition-all ${
                    isDataManagementActive ? 'text-white bg-slate-800/80' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FolderKanban size={18} className="text-indigo-400" />
                    <span className="text-sm font-medium">Master Data</span>
                  </div>
                  <span className="text-[10px] opacity-60">
                    {openDataManagement ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>

                {openDataManagement && (
                  <div className="pl-4 space-y-1 text-xs text-slate-400 border-l border-slate-800/80 ml-5 my-1">
                    {/* Submenu Data Guru */}
                    <button
                      onClick={() => handleSubmenuClick('data-guru')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'data-guru'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <UserCheck
                        size={15}
                        className={activeMenu === 'data-guru' ? 'text-white' : 'text-blue-400 shrink-0'}
                      />
                      <span className="truncate">Data Guru</span>
                    </button>

                    {/* Submenu Data Kelas */}
                    <button
                      onClick={() => handleSubmenuClick('data-kelas')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'data-kelas'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Layers
                        size={15}
                        className={activeMenu === 'data-kelas' ? 'text-white' : 'text-emerald-400 shrink-0'}
                      />
                      <span className="truncate">Data Kelas</span>
                    </button>

                    {/* Submenu Data Mapel */}
                    <button
                      onClick={() => handleSubmenuClick('data-mapel')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'data-mapel'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <BookOpen
                        size={15}
                        className={activeMenu === 'data-mapel' ? 'text-white' : 'text-amber-400 shrink-0'}
                      />
                      <span className="truncate">Data Mapel</span>
                    </button>

                    {/* Submenu Data Siswa */}
                    <button
                      onClick={() => handleSubmenuClick('data-siswa')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'data-siswa'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <GraduationCap
                        size={15}
                        className={activeMenu === 'data-siswa' ? 'text-white' : 'text-purple-400 shrink-0'}
                      />
                      <span className="truncate">Data Siswa</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Section: PENILAIAN (Visible for Admin and Guru) */}
          <div className="pt-3 pb-1.5 px-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
            Penilaian
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setOpenNilaiSumatif(!openNilaiSumatif)}
              className={`w-full flex items-center justify-between p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition-all ${
                isNilaiSumatifActive ? 'text-white bg-slate-800/80' : 'text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Calculator size={18} className="text-emerald-400" />
                <span className="text-sm font-medium">Nilai Sumatif</span>
              </div>
              <span className="text-[10px] opacity-60">
                {openNilaiSumatif ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            </button>

            {openNilaiSumatif && (
              <div className="pl-4 space-y-1 text-xs text-slate-400 border-l border-slate-800/80 ml-5 my-1">
                {/* Submenu Input Nilai */}
                <button
                  onClick={() => handleSubmenuClick('input-nilai')}
                  className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                    activeMenu === 'input-nilai'
                      ? 'text-white bg-blue-600 font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <PenLine
                    size={15}
                    className={activeMenu === 'input-nilai' ? 'text-white' : 'text-emerald-400 shrink-0'}
                  />
                  <span className="truncate">Input Nilai</span>
                </button>

                {/* Submenu Rekap Nilai (Hanya Admin dan Wali Kelas) */}
                {canAccessRekapNilai && (
                  <button
                    onClick={() => handleSubmenuClick('rekap-nilai')}
                    className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                      activeMenu === 'rekap-nilai'
                        ? 'text-white bg-blue-600 font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <FileSpreadsheet
                      size={15}
                      className={activeMenu === 'rekap-nilai' ? 'text-white' : 'text-teal-400 shrink-0'}
                    />
                    <span className="truncate">Rekap Nilai</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section: KELULUSAN KELAS 9 (Hanya Admin dan Wali Kelas) */}
          {canAccessAnalisisKelas9 && (
            <>
              <div className="pt-3 pb-1.5 px-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Kelulusan K9
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setOpenAnalisisKelas9(!openAnalisisKelas9)}
                  className={`w-full flex items-center justify-between p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition-all ${
                    isAnalisisKelas9Active ? 'text-white bg-slate-800/80' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <GraduationCap size={18} className="text-amber-400" />
                    <span className="text-sm font-medium">Analisis Kelas 9</span>
                  </div>
                  <span className="text-[10px] opacity-60">
                    {openAnalisisKelas9 ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>

                {openAnalisisKelas9 && (
                  <div className="pl-4 space-y-1 text-xs text-slate-400 border-l border-slate-800/80 ml-5 my-1">
                    {/* Submenu Input Nilai K9 */}
                    <button
                      onClick={() => handleSubmenuClick('input-kelas9')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'input-kelas9'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <ClipboardList
                        size={15}
                        className={activeMenu === 'input-kelas9' ? 'text-white' : 'text-amber-400 shrink-0'}
                      />
                      <span className="truncate">Input Nilai K9</span>
                    </button>

                    {/* Submenu Cetak SKNR */}
                    <button
                      onClick={() => handleSubmenuClick('cetak-sknr')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'cetak-sknr'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <FileCheck
                        size={15}
                        className={activeMenu === 'cetak-sknr' ? 'text-white' : 'text-blue-400 shrink-0'}
                      />
                      <span className="truncate">Cetak SKNR</span>
                    </button>

                    {/* Submenu Cetak SKL */}
                    <button
                      onClick={() => handleSubmenuClick('cetak-skl')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'cetak-skl'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Award
                        size={15}
                        className={activeMenu === 'cetak-skl' ? 'text-white' : 'text-emerald-400 shrink-0'}
                      />
                      <span className="truncate">Cetak SKL</span>
                    </button>

                    {/* Submenu Cetak Transkrip */}
                    <button
                      onClick={() => handleSubmenuClick('cetak-transkrip')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'cetak-transkrip'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <FileBadge
                        size={15}
                        className={activeMenu === 'cetak-transkrip' ? 'text-white' : 'text-purple-400 shrink-0'}
                      />
                      <span className="truncate">Cetak Transkrip</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Section: SISTEM (Only visible for Admin) */}
          {isAdmin && (
            <>
              <div className="pt-3 pb-1.5 px-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Sistem
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setOpenPengaturan(!openPengaturan)}
                  className={`w-full flex items-center justify-between p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition-all ${
                    isPengaturanActive ? 'text-white bg-slate-800/80' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Settings size={18} className="text-cyan-400" />
                    <span className="text-sm font-medium">Pengaturan</span>
                  </div>
                  <span className="text-[10px] opacity-60">
                    {openPengaturan ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </button>

                {openPengaturan && (
                  <div className="pl-4 space-y-1 text-xs text-slate-400 border-l border-slate-800/80 ml-5 my-1">
                    {/* Submenu Pengaturan Sekolah */}
                    <button
                      onClick={() => handleSubmenuClick('pengaturan-sekolah')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'pengaturan-sekolah'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <School
                        size={15}
                        className={activeMenu === 'pengaturan-sekolah' ? 'text-white' : 'text-sky-400 shrink-0'}
                      />
                      <span className="truncate">Pengaturan Sekolah</span>
                    </button>

                    {/* Submenu Tahun Ajaran */}
                    <button
                      onClick={() => handleSubmenuClick('tahun-ajaran')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'tahun-ajaran'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <CalendarDays
                        size={15}
                        className={activeMenu === 'tahun-ajaran' ? 'text-white' : 'text-amber-400 shrink-0'}
                      />
                      <span className="truncate">Tahun Ajaran</span>
                    </button>

                    {/* Submenu Backup & Restore */}
                    <button
                      onClick={() => handleSubmenuClick('backup-restore')}
                      className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'backup-restore'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <DatabaseBackup
                          size={15}
                          className={activeMenu === 'backup-restore' ? 'text-white' : 'text-indigo-400 shrink-0'}
                        />
                        <span className="truncate">Backup & Restore</span>
                      </div>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          activeMenu === 'backup-restore'
                            ? 'bg-blue-700 text-blue-100'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        SQL
                      </span>
                    </button>

                    {/* Submenu Ubah Password */}
                    <button
                      onClick={() => handleSubmenuClick('ubah-password')}
                      className={`w-full flex items-center space-x-2.5 py-2 px-2.5 rounded-lg cursor-pointer transition-all text-left ${
                        activeMenu === 'ubah-password'
                          ? 'text-white bg-blue-600 font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <KeyRound
                        size={15}
                        className={activeMenu === 'ubah-password' ? 'text-white' : 'text-rose-400 shrink-0'}
                      />
                      <span className="truncate">Ubah Password</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Section: AKUN (Visible for Guru) */}
          {isGuru && (
            <>
              <div className="pt-3 pb-1.5 px-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Akun
              </div>
              <button
                onClick={() => handleSubmenuClick('ubah-password')}
                className={`w-full flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                  activeMenu === 'ubah-password'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-500/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <KeyRound size={18} className="text-cyan-400" />
                <span className="text-sm font-medium">Ubah Password</span>
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

