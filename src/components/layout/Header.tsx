import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Check,
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';
import { useFMS } from '../../context/FMSContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearAllNotifications, 
    setActiveTab 
  } = useFMS();
  const { user, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications based on user domain isolation & maker-checker role
  const userNotifications = useMemo(() => {
    if (!user) return [];
    const domain = user.riskDomain;
    const username = user.username;

    return notifications.filter(n => {
      if (domain === 'FULL ACCESS' || username === 'sysadmin') return true;

      // Fraud Domain Isolation
      if (domain === 'FRAUD ONLY' && n.domain === 'FRAUD') {
        if (!n.targetRole) return true;
        if (n.targetRole === username) return true;
        if (username === 'afcl1' && (n.targetRole === 'afcl1' || n.targetRole === 'MAKER')) return true;
        if (username === 'afcl2' && (n.targetRole === 'afcl2' || n.targetRole === 'CHECKER')) return true;
        return false;
      }

      // AML Domain Isolation
      if (domain === 'AML ONLY' && n.domain === 'AML') {
        if (!n.targetRole) return true;
        if (n.targetRole === username) return true;
        if (username === 'analystl1' && (n.targetRole === 'analystl1' || n.targetRole === 'MAKER')) return true;
        if (username === 'analystl2' && (n.targetRole === 'analystl2' || n.targetRole === 'CHECKER')) return true;
        return false;
      }

      return false;
    });
  }, [notifications, user]);

  const unreadCount = userNotifications.filter(n => !n.isRead).length;
  const domainFilterType = user?.riskDomain === 'FRAUD ONLY' ? 'FRAUD' : user?.riskDomain === 'AML ONLY' ? 'AML' : 'ALL';

  const handleNotificationClick = (targetTab?: string, id?: string) => {
    if (id) {
      markNotificationAsRead(id);
    }
    if (targetTab) {
      setActiveTab(targetTab as any);
      setShowNotifications(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 text-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left: Brand Identity & Telemetry */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
          N
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-2">
              <span>Neo FMS</span>
              <span className="text-[10px] font-bold text-slate-500 mt-1">v1.22</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Bento Engine
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-500">Bank Sampoerna • Real-Time Fraud & AML Defense Architecture</p>
        </div>
      </div>

      {/* Center: Engine Status (Empty placeholder for spacing) */}
      <div className="hidden md:flex items-center space-x-4 max-w-md w-full">
      </div>

      {/* Right: Notification & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Interactive Notification Center Bell */}
        <div className="relative" ref={popoverRef}>
          <button 
            id="notification-bell-btn"
            onClick={() => setShowNotifications(prev => !prev)}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition relative cursor-pointer"
            title={`${unreadCount} Notifikasi Belum Dibaca`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Interactive Popover / Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              {/* Popover Header */}
              <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs uppercase tracking-wider">Pusat Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsAsRead(domainFilterType as any)}
                      className="text-[10px] text-slate-300 hover:text-white underline cursor-pointer"
                      title="Tandai semua dibaca"
                    >
                      Tandai Dibaca
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Popover Content / Notification List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {userNotifications.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    Tidak ada notifikasi untuk domain Anda.
                  </div>
                ) : (
                  userNotifications.map(n => {
                    const isApproved = n.title.toLowerCase().includes('disetujui');
                    const isRejected = n.title.toLowerCase().includes('ditolak');

                    return (
                      <div 
                        key={n.id} 
                        className={`p-3.5 transition hover:bg-slate-50 relative flex items-start space-x-3 ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                      >
                        {/* Icon indicator */}
                        <div className="mt-0.5 shrink-0">
                          {isApproved ? (
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : isRejected ? (
                            <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center shadow-xs">
                              <XCircle className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Message Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-xs font-bold ${isApproved ? 'text-emerald-800' : isRejected ? 'text-red-800' : 'text-blue-900'}`}>
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {n.message}
                          </p>

                          {/* Bottom Actions */}
                          <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-slate-100">
                            <div className="flex items-center space-x-2">
                              {!n.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markNotificationAsRead(n.id);
                                  }}
                                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3 h-3" /> Tandai Dibaca
                                </button>
                              )}
                            </div>
                            {n.targetTab && (
                              <button
                                onClick={() => handleNotificationClick(n.targetTab, n.id)}
                                className="text-[10px] font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-md transition shadow-xs"
                              >
                                <span>Lihat Detail</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Unread Dot */}
                        {!n.isRead && (
                          <span className="absolute top-3.5 right-3 w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Popover Footer */}
              {userNotifications.length > 0 && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                  <button
                    onClick={clearAllNotifications}
                    className="text-slate-500 hover:text-red-600 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
                  </button>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Total: {userNotifications.length} Notifikasi
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs ${
            user?.riskDomain === 'FULL ACCESS' 
              ? 'bg-purple-600' 
              : user?.riskDomain === 'FRAUD ONLY'
              ? 'bg-red-600'
              : 'bg-amber-600'
          }`}>
            {user?.avatar || 'YS'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                {user?.fullName || 'Yoseph Sanjaya'}
              </span>
              {user?.riskDomain && (
                <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                  user.riskDomain === 'FULL ACCESS'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : user.riskDomain === 'FRAUD ONLY'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {user.riskDomain}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <span>{user?.role || 'Lead Fraud Ops & AML'}</span>
              {user?.group && (
                <>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">{user.group}</span>
                </>
              )}
            </div>
          </div>

          {/* Logout Action Button */}
          <button
            id="btn-header-logout"
            onClick={logout}
            className="p-1.5 ml-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-all cursor-pointer flex items-center gap-1 text-xs font-medium"
            title="Logout dari Sistem"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
