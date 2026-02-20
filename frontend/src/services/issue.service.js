import api from './api';

const IssueService = {
    getAll: async () => {
        const response = await api.get('issues/');
        return response.data;
    },

    requestBook: async (bookId) => {
        const response = await api.post('issues/', { book_id: bookId });
        return response.data;
    },

    approveIssue: async (id) => {
        const response = await api.post(`issues/${id}/approve/`);
        return response.data;
    },

    rejectIssue: async (id) => {
        const response = await api.post(`issues/${id}/reject/`);
        return response.data;
    },

    returnBook: async (id) => {
        const response = await api.post(`issues/${id}/return_book/`);
        return response.data;
    }
};

export default IssueService;
