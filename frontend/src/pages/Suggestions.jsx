import React, { useEffect, useState } from 'react';
import SuggestionService from '../services/suggestion.service';
import { Lightbulb, Plus, Check } from 'lucide-react';

const Suggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', author: '', category: '', reason: '' });

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            const data = await SuggestionService.getAll();
            setSuggestions(data.results || data);
        } catch (error) {
            console.error("Error fetching suggestions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await SuggestionService.create(newItem);
            setShowForm(false);
            setNewItem({ title: '', author: '', category: '', reason: '' });
            fetchSuggestions();
        } catch (error) {
            console.error("Error creating suggestion", error);
            alert("Failed to submit suggestion.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 pb-10 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-20 md:top-0 z-30">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                    <Lightbulb className="text-yellow-500 w-6 h-6" />
                    Book Suggestions
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Suggest Book
                </button>
            </div>

            {showForm && (
                <div className="card p-6 mb-6 animate-slide-up bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">New Suggestion</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Book Title"
                                value={newItem.title}
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                className="input-field"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Category (e.g., Sci-Fi, Fiction)"
                                value={newItem.category}
                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Author"
                            value={newItem.author}
                            onChange={(e) => setNewItem({ ...newItem, author: e.target.value })}
                            className="input-field"
                            required
                        />
                        <textarea
                            placeholder="Why should we add this book?"
                            value={newItem.reason}
                            onChange={(e) => setNewItem({ ...newItem, reason: e.target.value })}
                            className="input-field min-h-[100px] resize-y"
                            rows="3"
                        ></textarea>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-sm shadow-yellow-500/20 transition-all active:scale-95"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="card p-5 hover:shadow-md transition-all duration-200 group border-l-4 border-l-yellow-400">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-slate-900 truncate pr-2">{suggestion.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide
                                ${suggestion.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    suggestion.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                {suggestion.status}
                            </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 font-medium">by {suggestion.author}</p>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                            <p className="text-slate-600 italic text-sm">"{suggestion.reason}"</p>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
                            <span className="font-medium text-slate-500">Suggested by: {suggestion.created_by?.username || 'Anonymous'}</span>
                            <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
            {suggestions.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-100">
                        <Lightbulb className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-1">No suggestions yet</h3>
                    <p className="text-slate-500">Be the first to suggest a book for our collection!</p>
                </div>
            )}
        </div>
    );
};

export default Suggestions;
