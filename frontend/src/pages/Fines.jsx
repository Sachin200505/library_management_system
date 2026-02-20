import React, { useEffect, useState } from 'react';
import FineService from '../services/fine.service';
import DummyPaymentModal from '../components/DummyPaymentModal';
import { IndianRupee, AlertCircle, CreditCard, CheckCircle2, AlertOctagon, Clock, Calendar } from 'lucide-react';

const Fines = () => {
    const [fines, setFines] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedFine, setSelectedFine] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [finesData, paymentsData] = await Promise.all([
                FineService.getUserFines(),
                FineService.getPaymentHistory()
            ]);
            setFines(finesData.results || finesData);
            setPayments(paymentsData.results || paymentsData);
        } catch (error) {
            console.error("Error fetching fine data", error);
        } finally {
            setLoading(false);
        }
    };

    const initiatePayment = (fine) => {
        setSelectedFine(fine);
        setPaymentModalOpen(true);
    };

    const handlePaymentComplete = async () => {
        if (!selectedFine) return;
        try {
            await FineService.payFine(selectedFine.id);
            setPaymentModalOpen(false);
            fetchData();
            // Optional: Show a toast notification here
        } catch (error) {
            console.error("Payment failed", error);
            alert('Payment failed. Please try again.');
        }
    };

    const unpaidFines = fines.filter(f => f.status === 'UNPAID');

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Fines & Payments</h1>
                <p className="text-slate-500 mt-1">Manage your outstanding fines and view payment history.</p>
            </div>

            {/* Unpaid Fines Section */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-red-50/50">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertOctagon className="text-red-600 w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Outstanding Fines</h2>
                        <p className="text-sm text-slate-500">Fines that need to be paid</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {unpaidFines.map((fine) => (
                                <tr key={fine.id} className="hover:bg-red-50/10 transition-colors group">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{fine.issue?.book?.title || 'Unknown'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 font-mono font-bold text-red-600 text-lg">
                                            <span>₹</span>{fine.amount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(fine.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => initiatePayment(fine)}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Pay Now
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {unpaidFines.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <p className="font-bold text-slate-800">No outstanding fines!</p>
                                            <p className="text-sm text-slate-500">You are all clear.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment History Section */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                        <Clock className="text-slate-600 w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Payment History</h2>
                        <p className="text-sm text-slate-500">Past transactions and receipts</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-600">
                                            <span>₹</span>{payment.amount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-slate-500 bg-slate-100 rounded px-2 py-1 border border-slate-200">
                                            {payment.reference}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${payment.status === 'COMPLETED' || payment.status === 'PAID'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            payment.status === 'FAILED'
                                                ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        <p>No payment history found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <DummyPaymentModal
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                fineAmount={selectedFine?.amount || 0}
                onPaymentComplete={handlePaymentComplete}
            />
        </div>
    );
};

export default Fines;
