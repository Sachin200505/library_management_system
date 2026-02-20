import api from './api';

const SettingService = {
    getAll: async () => {
        const response = await api.get('settings/');
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.patch(`settings/${id}/`, data);
        return response.data;
    }
};

export default SettingService;
