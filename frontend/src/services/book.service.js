import api from './api';

const BookService = {
    getAll: async (params = {}) => {
        const response = await api.get('books/', { params });
        return response.data;
    },

    get: async (id) => {
        const response = await api.get(`books/${id}/`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('books/', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`books/${id}/`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`books/${id}/`);
    },

    getAuthors: async () => {
        const response = await api.get('authors/');
        return response.data;
    },

    createAuthor: async (data) => {
        const response = await api.post('authors/', data);
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('categories/');
        return response.data;
    },

    createCategory: async (data) => {
        const response = await api.post('categories/', data);
        return response.data;
    }
};

export default BookService;
