import React, { useEffect, useState } from 'react';
import NotificationService from '../services/notification.service';
import { Bell, Check, MailOpen, Clock } from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await NotificationService.getAll();
            setNotifications(data.results || data);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await NotificationService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-20 md:top-0 z-30">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                    <Bell className="text-blue-600 w-6 h-6" />
                    Notifications
                </h1>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors font-medium text-sm"
                    >
                        <Check className="w-4 h-4" />
                        Mark All Read
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`card p-5 transition-all hover:shadow-md flex items-start justify-between group border-l-4 ${notification.is_read ? 'border-l-slate-200 bg-slate-50/50' : 'border-l-blue-500 bg-white'}`}
                    >
                        <div className="flex-1">
                            <p className={`text-base ${notification.is_read ? 'text-slate-500' : 'text-slate-900 font-semibold'}`}>
                                {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(notification.created_at).toLocaleString()}
                            </p>
                        </div>
                        {!notification.is_read && (
                            <button
                                onClick={() => handleMarkRead(notification.id)}
                                className="ml-4 p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Mark as read"
                            >
                                <MailOpen className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
                {notifications.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Bell className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg mb-1">No notifications</h3>
                        <p className="text-slate-500">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
