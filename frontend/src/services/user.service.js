import api from './api';

const UserService = {
    getAll: async (params) => {
        const response = await api.get('users/', { params });
        return response.data;
    },

    // Placeholder for potential future features like promoting users or blocking
    update: async (id, data) => {
        const response = await api.patch(`users/${id}/`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`users/${id}/`);
        return response.data;
    },

    changePassword: async (data) => {
        const response = await api.post('users/change_password/', data);
        return response.data;
    },

    toggleActivation: async (id) => {
        const response = await api.post(`users/${id}/toggle_activation/`);
        return response.data;
    },

    updateProfile: async (id, data) => {
        const headers = data instanceof FormData
            ? { 'Content-Type': 'multipart/form-data' }
            : { 'Content-Type': 'application/json' };

        const response = await api.patch(`users/${id}/`, data, { headers });
        return response.data;
    },

    registerAdmin: async (data) => {
        const response = await api.post('users/register_admin/', data);
        return response.data;
    }
};

export default UserService;
