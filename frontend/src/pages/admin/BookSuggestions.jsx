import React, { useEffect, useState } from 'react';
import { Lightbulb, Check, X, BookPlus, AlertCircle } from 'lucide-react';
// Assuming a service exists, or use generic api
import api from '../../services/api';

const BookSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const response = await api.get('suggestions/');
            setSuggestions(response.data.results || response.data);
        } catch (error) {
            console.error("Error fetching suggestions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.patch(`suggestions/${id}/`, { status });
            fetchSuggestions();
        } catch (error) {
            console.error("Error updating suggestion", error);
            alert("Failed to update status.");
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
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <Lightbulb className="text-yellow-600 w-8 h-8" />
                    </div>
                    Book Suggestions
                </h1>
            </div>

            <div className="glass-card bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title / Author</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Suggested By</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {suggestions.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{item.title}</div>
                                        <div className="text-sm text-slate-500">{item.author}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{item.category}</td>
                                    <td className="px-6 py-4 max-w-xs truncate text-slate-600" title={item.reason}>{item.reason}</td>
                                    <td className="px-6 py-4 text-slate-600">{item.created_by?.username || 'Unknown'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-sm
                                            ${item.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                item.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    item.status === 'ADDED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        'bg-red-100 text-red-700 border-red-200'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {item.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                                                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                                                        title="Reject"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {item.status === 'APPROVED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(item.id, 'ADDED')}
                                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                                                    title="Mark as Added to Library"
                                                >
                                                    <BookPlus className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {suggestions.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <Lightbulb className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium">No suggestions found.</p>
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

export default BookSuggestions;
