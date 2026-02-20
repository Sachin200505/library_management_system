import api from './api';

const AnalyticsService = {
    getDashboard: async () => {
        const response = await api.get('analytics/dashboard/stats/');
        return response.data;
    }
};

export default AnalyticsService;
