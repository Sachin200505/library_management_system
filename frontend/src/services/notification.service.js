import api from './api';

const NotificationService = {
    getAll: async () => {
        const response = await api.get('notifications/');
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await api.post(`notifications/${id}/mark_read/`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.post('notifications/mark_all_read/');
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await api.get('notifications/unread_count/');
        return response.data;
    }
};

export default NotificationService;
