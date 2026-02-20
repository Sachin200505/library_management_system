import api from './api';

const ExtensionService = {
    getAll: async () => {
        const response = await api.get('return_extensions/');
        return response.data;
    },
    request: async (data) => {
        const response = await api.post('return_extensions/', data);
        return response.data;
    },
    approve: async (id) => {
        const response = await api.post(`return_extensions/${id}/approve/`);
        return response.data;
    },
    reject: async (id) => {
        const response = await api.post(`return_extensions/${id}/reject/`);
        return response.data;
    }
};

export default ExtensionService;
