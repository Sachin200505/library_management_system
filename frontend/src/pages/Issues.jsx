import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IssueService from '../services/issue.service';
import { useAuth } from '../context/AuthContext';
import { History, Check, X, AlertOctagon, Calendar, BookOpen, MessageSquare, User as UserIcon } from 'lucide-react';

const Issues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        fetchIssues();
    }, []);

    const fetchIssues = async () => {
        try {
            const data = await IssueService.getAll();
            setIssues(data.results || data);
        } catch (error) {
            console.error("Error fetching issues", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm('Are you sure you want to return this book?')) return;
        try {
            await IssueService.returnBook(id);
            fetchIssues();
        } catch (error) {
            console.error("Error returning book", error);
            alert('Failed to return book');
        }
    };

    // Sorting and Pagination Logic
    const sortedIssues = [...issues].sort((a, b) => {
        const dateA = new Date(a.issue_date || a.created_at);
        const dateB = new Date(b.issue_date || b.created_at);
        return dateB - dateA;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedIssues.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedIssues.length / itemsPerPage);

    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl glass-card shadow-lg backdrop-blur-md border border-white/20 sticky top-0 z-10 w-full mb-6">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-heading">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <History className="text-purple-600 w-8 h-8" />
                    </div>
                    {user?.profile?.is_admin || user?.profile?.is_owner ? 'Issued Books' : 'Issue History'}
                </h1>
            </div>

            <div className="glass-card bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book Details</th>
                                {user?.profile?.is_admin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>}
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentItems.map((issue) => (
                                <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 hover:border-slate-200">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-slate-700">{issue.book?.title || 'Unknown Title'}</span>
                                        </div>
                                    </td>
                                    {user?.profile?.is_admin && (
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {issue.user?.username}
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <span className="font-medium">Issued:</span> {issue.issue_date || '-'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <span className="font-medium text-orange-600">Due:</span> {issue.due_date || '-'}
                                            </div>
                                            {issue.return_date && (
                                                <div className="flex items-center gap-2 text-sm text-green-600">
                                                    <span className="font-medium">Returned:</span> {issue.return_date}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm
                                                ${issue.status === 'ISSUED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    issue.status === 'RETURNED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        issue.status === 'REQUESTED' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                            'bg-red-100 text-red-700 border-red-200'
                                                }`}>
                                                {issue.status}
                                            </span>
                                            {issue.is_overdue && (
                                                <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-200 flex items-center gap-1 animate-pulse-slow">
                                                    <AlertOctagon className="w-3 h-3" /> Overdue
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user?.profile?.is_admin && issue.status === 'ISSUED' && (
                                            <button
                                                onClick={() => handleReturn(issue.id)}
                                                className="px-4 py-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all"
                                            >
                                                Mark Returned
                                            </button>
                                        )}
                                        {user?.profile?.is_student && issue.status === 'RETURNED' && (
                                            <button
                                                onClick={() => navigate(`/books/${issue.book.id}`)}
                                                className="px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
                                            >
                                                <MessageSquare className="w-4 h-4" /> Review Book
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {issues.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <History className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="text-lg font-medium">No history found</p>
                                            <p className="text-sm text-slate-400">You haven't issued or requested any books yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {sortedIssues.length > itemsPerPage && (
                    <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-200">
                        <span className="text-sm text-slate-500">
                            Showing <span className="font-bold">{indexOfFirstItem + 1}</span> to <span className="font-bold">{Math.min(indexOfLastItem, sortedIssues.length)}</span> of <span className="font-bold">{sortedIssues.length}</span> entries
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Issues;
