import React from 'react';
import { AppNotification } from '../../types';
import { X, Bell, CheckCircle2, AlertTriangle, Info, ArrowRight } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onNavigate: (route: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onNavigate
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold">
                {notifications.filter(n => !n.read).length} Unread
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkRead(notif.id);
                    if (notif.link) {
                      onNavigate(notif.link);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-slate-50/70 border-slate-200 text-slate-600'
                      : 'bg-indigo-50/40 border-indigo-200 text-slate-900 font-medium shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold truncate text-slate-900">{notif.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {notif.createdAt?.slice(11, 16) || 'Now'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-center"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
