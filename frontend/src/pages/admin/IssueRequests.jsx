import React, { useEffect, useState } from 'react';
import IssueService from '../../services/issue.service';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

const IssueRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await IssueService.getAll();
            const allIssues = data.results || data;
            // Filter only Requested issues
            const pendingRequests = allIssues.filter(issue => issue.status === 'REQUESTED');
            setRequests(pendingRequests);
        } catch (error) {
            console.error("Error fetching requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await IssueService.approveIssue(id);
            fetchRequests(); // Refresh list
        } catch (error) {
            console.error("Error approving request", error);
            alert("Failed to approve request. Book might be out of stock.");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this request?')) return;
        try {
            await IssueService.rejectIssue(id);
            fetchRequests();
        } catch (error) {
            console.error("Error rejecting request", error);
            alert("Failed to reject request.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl glass-card shadow-lg backdrop-blur-md border border-white/20 sticky top-0 z-10 w-full text-slate-800">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-heading">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Clock className="text-amber-600 w-8 h-8" />
                    </div>
                    Issue Requests
                </h1>
            </div>

            <div className="glass-card bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Requested Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800">{request.user?.username}</td>
                                    <td className="px-6 py-4 text-slate-700">{request.book?.title}</td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(request.created_at || Date.now()).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleApprove(request.id)}
                                                className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                                title="Approve"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(request.id)}
                                                className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                                title="Reject"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <Clock className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium">No pending requests.</p>
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

export default IssueRequests;
