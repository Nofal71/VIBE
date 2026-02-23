import React, { useEffect, useRef, useState } from 'react';
import api from '../api/axiosConfig';

interface NotificationItem {
    id: string;
    message: string;
    is_read: boolean;
    createdAt: string;
}

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchUnread = async () => {
        try {
            const res = await api.get('/notifications/unread');
            setNotifications(res.data.notifications || []);
        } catch (err) {
            
        }
    };

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 30_000); 
        return () => clearInterval(interval);
    }, []);

    
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markOneAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read', {});
            setNotifications([]);
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    const unreadCount = notifications.length;

    return (
        <div className="relative" ref={dropdownRef}>
            {}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                aria-label="Notifications"
            >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {}
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-extrabold text-gray-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-medium">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className="px-4 py-3 hover:bg-blue-50 transition group cursor-default"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                            <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                            <p className="text-sm text-gray-700 leading-snug">{notif.message}</p>
                                        </div>
                                        <button
                                            onClick={() => markOneAsRead(notif.id)}
                                            className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition flex-shrink-0 text-lg leading-none font-bold"
                                            title="Dismiss"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 ml-4">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
