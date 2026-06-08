// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, MessageSquare, Calendar, FileText, Star } from 'lucide-react';
import { useNotifications } from '~/hooks/api/useNotifications';

const ICONS: Record<string, React.ReactNode> = {
  chat_message: <MessageSquare className="w-[14px] h-[14px] text-[#4A90D9]" />,
  tour_reminder: <Calendar className="w-[14px] h-[14px] text-[#4ADE80]" />,
  application_update: <FileText className="w-[14px] h-[14px] text-[#FBBF24]" />,
  review_approved: <Star className="w-[14px] h-[14px] text-[#FBBF24]" />,
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: { id: string; type: string; data?: Record<string, unknown> }) => {
    markAsRead(notification.id);
    // Close dropdown after clicking
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-[36px] h-[36px] rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-[2px] right-[2px] w-[16px] h-[16px] rounded-full bg-[#F87171] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[44px] w-[360px] bg-[#0F172A] border border-white/[0.08] rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-[16px] py-[12px] border-b border-white/[0.06]">
            <h3 className="text-[14px] font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[12px] text-[#4A90D9] hover:text-[#7C3AED] transition-colors cursor-pointer border-none bg-transparent"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-[40px] text-center">
                <Bell className="w-[24px] h-[24px] text-[#64748B] mx-auto mb-[8px]" />
                <p className="text-[13px] text-[#94A3B8]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-[12px] px-[16px] py-[12px] cursor-pointer transition-colors hover:bg-white/[0.04] ${
                    !notification.isRead ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <div className="w-[32px] h-[32px] rounded-[8px] bg-white/5 flex items-center justify-center flex-shrink-0">
                    {ICONS[notification.type] || <Bell className="w-[14px] h-[14px] text-[#64748B]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#F1F5F9] truncate">{notification.title}</p>
                    <p className="text-[12px] text-[#94A3B8] mt-[2px] line-clamp-2">{notification.message}</p>
                    <p className="text-[11px] text-[#64748B] mt-[4px]">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-[8px] h-[8px] rounded-full bg-[#4A90D9] flex-shrink-0 mt-[4px]" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
