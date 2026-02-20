import React, { useEffect, useState } from 'react';
import ExtensionService from '../services/extension.service';
import IssueService from '../services/issue.service';
import { Clock, Plus, AlertCircle, BookOpen, Calendar, X } from 'lucide-react';

const Extensions = () => {
    const [requests, setRequests] = useState([]);
    const [issues, setIssues] = useState([]); // Books available for extension
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ issue_id: '', days_requested: 7, reason: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reqs, issuesData] = await Promise.all([
                ExtensionService.getAll(),
                IssueService.getAll()
            ]);
            setRequests(reqs.results || reqs);
            // Filter issues that are currently ISSUED and don't have pending requests (simplified logic)
            // ideally backend should filter eligible issues, but we'll list all active issues here
            const activeIssues = (issuesData.results || issuesData).filter(i => i.status === 'ISSUED');
            setIssues(activeIssues);
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await ExtensionService.request({
                issue: formData.issue_id,
                days_requested: formData.days_requested,
                reason: formData.reason
            });
            setShowForm(false);
            setFormData({ issue_id: '', days_requested: 7, reason: '' });
            fetchData();
        } catch (error) {
            console.error("Error submitting request", error);
            alert("Failed to submit request");
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
                    My Extensions
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Request Extension
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card bg-white w-full max-w-lg p-8 rounded-2xl shadow-2xl relative animate-slide-up">
                        <button
                            onClick={() => setShowForm(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3 font-heading">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Plus className="w-6 h-6 text-blue-600" />
                            </div>
                            New Extension Request
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Select Book</label>
                                <select
                                    value={formData.issue_id}
                                    onChange={(e) => setFormData({ ...formData, issue_id: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
                                    required
                                >
                                    <option value="">Select a book...</option>
                                    {issues.map(issue => (
                                        <option key={issue.id} value={issue.id}>
                                            {issue.book?.title} (Due: {issue.due_date})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Days Requested</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="14"
                                    value={formData.days_requested}
                                    onChange={(e) => setFormData({ ...formData, days_requested: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                    required
                                />
                                <p className="text-xs text-slate-500">Maximum 14 days per extension.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Reason</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none h-24 resize-none transition-all"
                                    placeholder="Why do you need an extension?"
                                    required
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="glass-card bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Requested Days</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <span className="font-semibold text-slate-700">{req.issue_book_title || 'Unknown Title'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {req.days_requested} Days
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                            req.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                'bg-amber-100 text-amber-700 border-amber-200'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(req.created_at).toLocaleDateString()}
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
                                            <p className="font-medium">No extension requests found.</p>
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

export default Extensions;
