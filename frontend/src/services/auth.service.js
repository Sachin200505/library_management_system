import api from './api';

const AuthService = {
    login: async (username, password) => {
        const response = await api.post('auth/login/', { username, password });
        if (response.data) {
            // Store user or token if needed, though session auth is used
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('auth/register/', userData);
        return response.data;
    },

    logout: async () => {
        await api.post('auth/logout/');
    },

    getCurrentUser: async () => {
        const response = await api.get('auth/me/');
        return response.data;
    },

    requestPasswordReset: async (email) => {
        const response = await api.post('auth/request_password_reset/', { email });
        return response.data;
    },

    resetPassword: async (data) => {
        const response = await api.post('auth/reset_password_confirm/', data);
        return response.data;
    }
};

export default AuthService;
