import api from './api';

const ReportService = {
    downloadIssuedPdf: async () => {
        const response = await api.get('reports/issued/pdf/', { responseType: 'blob' });
        return response.data;
    },
    downloadIssuedCsv: async () => {
        const response = await api.get('reports/issued/csv/', { responseType: 'blob' });
        return response.data;
    },
    downloadOverdueCsv: async () => {
        const response = await api.get('reports/overdue/csv/', { responseType: 'blob' });
        return response.data;
    },
    downloadFinesCsv: async () => {
        const response = await api.get('reports/fines/csv/', { responseType: 'blob' });
        return response.data;
    },
    downloadSuggestionsCsv: async () => {
        const response = await api.get('reports/suggestions/csv/', { responseType: 'blob' });
        return response.data;
    },
    downloadSuggestionsPdf: async () => {
        const response = await api.get('reports/suggestions/pdf/', { responseType: 'blob' });
        return response.data;
    }
};

export default ReportService;
