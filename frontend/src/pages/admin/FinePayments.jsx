import React, { useEffect, useState } from 'react';
import FineService from '../../services/fine.service';
import { IndianRupee, CheckCircle, AlertCircle, User, Calendar, CreditCard, Clock } from 'lucide-react';

const FinePayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const data = await FineService.getAllPayments();
            setPayments(data.results || data);
        } catch (error) {
            console.error("Error fetching payments", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fine Payments Overview</h1>
                <p className="text-slate-500 mt-1">Track and manage fine payments from all users.</p>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount Paid</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                <User className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-slate-900 block">{payment.user_username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 font-mono font-bold text-emerald-600 text-lg">
                                            <span>₹</span>{payment.amount}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <CreditCard className="w-4 h-4 text-slate-400" />
                                                {payment.mode}
                                            </div>
                                            {payment.reference && (
                                                <div className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded w-fit border border-slate-100">
                                                    Ref: {payment.reference}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${payment.status === 'COMPLETED' || payment.status === 'PAID'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            payment.status === 'FAILED'
                                                ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {payment.status === 'COMPLETED' || payment.status === 'PAID' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                                                payment.status === 'FAILED' ? <AlertCircle className="w-3 h-3 mr-1" /> :
                                                    <Clock className="w-3 h-3 mr-1" />}
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <IndianRupee className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium">No payment records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinePayments;
