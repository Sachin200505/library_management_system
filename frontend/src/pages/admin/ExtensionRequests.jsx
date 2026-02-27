import React, { useEffect, useState } from 'react';
import ExtensionService from '../../services/extension.service';
import { Clock, Check, X, AlertCircle, User, BookOpen, Calendar } from 'lucide-react';

const ExtensionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await ExtensionService.getAll();
            setRequests(data.results || data);
        } catch (error) {
            console.error("Error fetching requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            if (action === 'approve') {
                await ExtensionService.approve(id);
            } else {
                await ExtensionService.reject(id);
            }
            fetchRequests();
        } catch (error) {
            console.error(`Error ${action}ing request`, error);
            alert(`Failed to ${action} request`);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl glass-card shadow-lg backdrop-blur-md border border-white/20 sticky top-0 z-10 w-full">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-heading">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="text-blue-600 w-8 h-8" />
                    </div>
                    Extension Requests
                </h1>
            </div>

            <div className="glass-card bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <span className="font-semibold text-slate-700">{req.user_username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 font-medium text-slate-700">
                                                <BookOpen className="w-4 h-4 text-slate-400" />
                                                {req.issue_book_title || '-'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Calendar className="w-3 h-3" />
                                                Requested: {req.days_requested} days
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 max-w-xs truncate" title={req.reason}>
                                            {req.reason}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                            req.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                'bg-amber-100 text-amber-700 border-amber-200'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {req.status === 'PENDING' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(req.id, 'approve')}
                                                    className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                                    title="Approve"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req.id, 'reject')}
                                                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                                    title="Reject"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-100">
                    {requests.map((req) => (
                        <div key={req.id} className="p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-tight">{req.user_username}</h3>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                            <Calendar className="w-3 h-3" /> Requested: {req.days_requested} days
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                        'bg-amber-100 text-amber-700 border-amber-200'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-2.5 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                                    <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                    <p className="text-sm font-bold text-slate-800 leading-snug">{req.issue_book_title || 'Unknown Book'}</p>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">Reason for Extension</p>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">"{req.reason || 'No reason provided'}"</p>
                                </div>
                            </div>

                            {req.status === 'PENDING' && (
                                <div className="flex items-center gap-2 pt-2">
                                    <button
                                        onClick={() => handleAction(req.id, 'approve')}
                                        className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                    >
                                        <Check className="w-4 h-4" /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'reject')}
                                        className="flex-1 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                    >
                                        <X className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {requests.length === 0 && (
                    <div className="px-6 py-16 text-center text-slate-500">
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-medium">No extension requests found.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExtensionRequests;
