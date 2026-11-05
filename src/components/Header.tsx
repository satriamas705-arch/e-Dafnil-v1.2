import React, { useState } from 'react';
import { AppState, MenuCategory, NotificationLog, AuthUser } from '../types';
import { PhotoUploadModal } from './common/PhotoUploadModal';
import {
  Bell,
  Search,
  Calendar,
  X,
  Menu,
  LogOut,
  Camera,
  KeyRound,
  Info,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface HeaderProps {
  appState: AppState;
  activeMenu: MenuCategory;
  authUser?: AuthUser | null;
  onLogout?: () => void;
  onSelectMenu: (menu: MenuCategory) => void;
  onUpdateNotifications: (notifs: NotificationLog[]) => void;
  onToggleSidebar?: () => void;
  onSearchGlobal: (query: string) => void;
  globalQuery: string;
  onUpdateUserProfilePhoto?: (newPhotoUrl: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  appState,
  authUser,
  onLogout,
  onSelectMenu,
  onUpdateNotifications,
  onToggleSidebar,
  onSearchGlobal,
  globalQuery,
  onUpdateUserProfilePhoto,
}) => {
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const activeTA =
    appState.tahunAjaranList.find((t) => t.id === appState.activeTahunAjaranId) ||
    appState.tahunAjaranList[0];

  const unreadCount = appState.notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = appState.notifications.map((n) => ({ ...n, read: true }));
    onUpdateNotifications(updated);
  };

  const handleClearAll = () => {
    onUpdateNotifications([]);
  };

  const handleNotifClick = (notif: NotificationLog) => {
    const updated = appState.notifications.map((n) =>
      n.id === notif.id ? { ...n, read: true } : n
    );
    onUpdateNotifications(updated);

    if (notif.category === 'data-guru') onSelectMenu('data-guru');
    else if (notif.category === 'data-siswa') onSelectMenu('data-siswa');
    else if (notif.category === 'data-kelas') onSelectMenu('data-kelas');
    else if (notif.category === 'data-mapel') onSelectMenu('data-mapel');
    else if (notif.category === 'nilai') onSelectMenu('rekap-nilai');
    else if (notif.category === 'kelas9') onSelectMenu('cetak-skl');
    else if (notif.category === 'pengaturan') onSelectMenu('pengaturan-sekolah');

    setShowNotifPanel(false);
  };

  // Helper to extract initials
  const getUserInitials = (name?: string): string => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Role Checks & Permissions
  const isGuru = authUser?.role === 'guru';
  const displayName = authUser?.nama || 'Administrator';
  const displayRoleSubtitle = isGuru
    ? authUser?.nip
      ? `NIP. ${authUser.nip}`
      : 'Guru Pengampu'
    : 'Administrator Sistem';

  // Resolved user photo URL
  const userPhotoUrl =
    authUser?.fotoUrl ||
    (isGuru
      ? appState.guruList.find(
          (g) =>
            g.id === authUser?.guruId ||
            (authUser?.nip && g.nip === authUser.nip) ||
            g.nama.toLowerCase() === authUser?.nama.toLowerCase()
        )?.fotoUrl
      : appState.sekolah.adminFotoUrl ||
        appState.userAccounts?.find((a) => a.role === 'admin')?.fotoUrl);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs print:hidden">
        {/* ========================================================= */}
        {/* TOP BAR: School Brand, Search, User Info & Hamburger      */}
        {/* ========================================================= */}
        <div className="px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => onSelectMenu('dashboard')}
                className="flex items-center space-x-3 text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 p-1 flex items-center justify-center border border-blue-200 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src={appState.sekolah.logoUrl || '/logo-smpn2kemranjen.svg'}
                    alt={appState.sekolah.namaSekolah || 'Logo'}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/favicon.svg';
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors truncate">
                      {appState.sekolah.namaSekolah}
                    </h1>
                    <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      e-Dafnil
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5">
                    <span>Aplikasi Penilaian Siswa</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline font-semibold text-blue-600">
                      T.P {authUser?.tahunAjaran || activeTA.tahun} ({authUser?.semester || activeTA.semester})
                    </span>
                  </p>
                </div>
              </button>
            </div>

            {/* Middle: Global Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={globalQuery}
                  onChange={(e) => onSearchGlobal(e.target.value)}
                  placeholder="Cari data siswa, NISN, guru, mapel..."
                  className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
                {globalQuery && (
                  <button
                    onClick={() => onSearchGlobal('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Side: Semester Badge, Notifications, User Profile & Mobile Toggle */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              {/* Academic Year pill (desktop) */}
              <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-xl text-slate-700 text-xs font-semibold border border-slate-200/80">
                <Calendar size={13} className="text-blue-600" />
                <span>Semester {authUser?.semester || activeTA.semester}</span>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifPanel(!showNotifPanel)}
                  className="relative p-2 text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors focus:outline-hidden cursor-pointer"
                  title="Notifikasi Aktivitas"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-extrabold animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Panel */}
                {showNotifPanel && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifPanel(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell size={15} className="text-blue-400" />
                          <h3 className="font-bold text-xs uppercase tracking-wider">
                            Notifikasi Sistem
                          </h3>
                          {unreadCount > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {unreadCount} baru
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setShowNotifPanel(false)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {appState.notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400">
                            <Info size={28} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Belum ada aktivitas baru.</p>
                          </div>
                        ) : (
                          appState.notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotifClick(notif)}
                              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 ${
                                !notif.read ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                  !notif.read ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-slate-900 truncate">
                                    {notif.title}
                                  </h4>
                                  <span className="text-[10px] text-slate-400 shrink-0">
                                    {notif.timestamp.split(' ')[0]}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {appState.notifications.length > 0 && (
                        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                          <button
                            onClick={handleMarkAllRead}
                            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            <CheckCircle2 size={13} />
                            <span>Tandai Semua Dibaca</span>
                          </button>
                          <button
                            onClick={handleClearAll}
                            className="text-rose-500 hover:text-rose-700 font-semibold flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Hapus Semua</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs overflow-hidden shrink-0 border border-white">
                    {userPhotoUrl ? (
                      <img
                        src={userPhotoUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{getUserInitials(displayName)}</span>
                    )}
                  </div>

                  <div className="hidden md:block text-left leading-tight">
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
                      {isGuru ? 'Guru Pengampu' : 'Administrator'}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                      <div className="p-4 bg-linear-to-br from-slate-900 to-slate-800 text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm border-2 border-white/20 shadow-inner overflow-hidden shrink-0">
                            {userPhotoUrl ? (
                              <img
                                src={userPhotoUrl}
                                alt={displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{getUserInitials(displayName)}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">
                              {displayName}
                            </p>
                            <p className="text-[11px] text-slate-300 truncate">
                              {displayRoleSubtitle}
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                              {isGuru ? 'GURU' : 'ADMINISTRATOR'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 space-y-1 text-xs">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            setShowPhotoModal(true);
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold transition cursor-pointer"
                        >
                          <Camera size={15} className="text-indigo-600" />
                          <span>Ubah Foto Profil</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            onSelectMenu('ubah-password');
                          }}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
                        >
                          <KeyRound size={15} className="text-indigo-600" />
                          <span>Ubah Password</span>
                        </button>

                        {onLogout && (
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              onLogout();
                            }}
                            className="w-full mt-1 flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition cursor-pointer border-t border-slate-100"
                          >
                            <LogOut size={15} />
                            <span>Keluar (Logout)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle Button (Opens left Sidebar on mobile) */}
              <button
                onClick={onToggleSidebar}
                className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl md:hidden transition cursor-pointer"
                title="Buka Navigasi Menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global User Profile Photo Modal */}
      <PhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        title={isGuru ? 'Upload Foto Guru' : 'Upload Foto Administrator'}
        subtitle={`Atur foto profil resmi untuk ${displayName}`}
        currentPhotoUrl={userPhotoUrl || ''}
        userName={displayName}
        userRole={isGuru ? 'guru' : 'admin'}
        onSavePhoto={(url) => {
          if (onUpdateUserProfilePhoto) onUpdateUserProfilePhoto(url);
        }}
      />
    </>
  );
};
