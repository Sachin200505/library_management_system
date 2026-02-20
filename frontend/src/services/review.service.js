import api from './api';

const ReviewService = {
    getAll: async () => {
        const response = await api.get('reviews/');
        return response.data;
    },

    getForBook: async (bookId) => {
        const response = await api.get(`reviews/?book=${bookId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('reviews/', data);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`reviews/${id}/`, { status });
        return response.data;
    }
};

export default ReviewService;
