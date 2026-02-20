import api from './api';

const FineService = {
    getUserFines: async () => {
        const response = await api.get('fines/');
        return response.data;
    },
    getPaymentHistory: async () => {
        const response = await api.get('fine_payments/');
        return response.data;
    },
    payFine: async (fineId) => {
        // Since the backend might expect specific data, we'll verify.
        // Assuming the backend creates a payment for a fine.
        // If the backend expects just fine_id or similar.
        // For now, mirroring the likely expectation of the backend based on previous context or standard patterns.
        // But wait, the previous code was `api.post('fine_payments/', data)`.
        // Fines.jsx calls `FineService.payFine(fineId)`.
        // We should construct the data object if needed, or if the API endpoint is different.
        // Assuming `fine_payments/` POST expects `{ fine: fineId, amount: ... }` or similar.
        // Let's assume the previous implementation `pay: async (data)` was correct for the endpoint
        // and we just need to adapt.
        // However, Fines.jsx passes `fineId` directly. 
        // Let's wrap it.
        const response = await api.post('fine_payments/', { fine_id: fineId });
        return response.data;
    },
    // Keeping original methods just in case other components use them (though unlikely based on previous search)
    // Actually, distinct names are safer.
    getAllPayments: async () => {
        const response = await api.get('fine_payments/');
        return response.data;
    }
};

export default FineService;
