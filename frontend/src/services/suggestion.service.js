import api from './api';

const SuggestionService = {
    getAll: async () => {
        const response = await api.get('suggestions/');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('suggestions/', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`suggestions/${id}/`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`suggestions/${id}/`);
    }
};

export default SuggestionService;
