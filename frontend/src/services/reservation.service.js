import api from './api';

const ReservationService = {
    getAll: async () => {
        const response = await api.get('reservations/');
        return response.data;
    },

    create: async (bookId) => {
        const response = await api.post('reservations/', { book: bookId });
        return response.data;
    },

    cancel: async (id) => {
        await api.delete(`reservations/${id}/`);
    }
};

export default ReservationService;
