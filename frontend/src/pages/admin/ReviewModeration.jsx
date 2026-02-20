import React, { useEffect, useState } from 'react';
import ReviewService from '../../services/review.service';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Check, EyeOff, Star, AlertCircle, ShieldCheck } from 'lucide-react';

const ReviewModeration = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAdminOrOwner = user?.profile?.is_admin || user?.profile?.is_owner;

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const data = await ReviewService.getAll();
            setReviews(data.results || data);
        } catch (error) {
            console.error("Error fetching reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await ReviewService.updateStatus(id, status);
            fetchReviews();
        } catch (error) {
            console.error("Error updating review status", error);
            alert("Failed to update status.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl glass-card shadow-lg backdrop-blur-md border border-white/20 sticky top-0 z-10 w-full text-slate-800">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-heading">
                    <div className={`p-2 ${isAdminOrOwner ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'} rounded-lg`}>
                        {isAdminOrOwner ? <ShieldCheck className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
                    </div>
                    {isAdminOrOwner ? 'Review Moderation' : 'Community Reviews'}
                </h1>
                {!isAdminOrOwner && (
                    <p className="text-slate-500 font-medium hidden md:block">Sharing experiences, building a better library.</p>
                )}
            </div>

            <div className="glass-card bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Review</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                {isAdminOrOwner && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reviews.map((review) => (
                                <tr key={review.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800">{review.book_title || review.book?.title}</td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                                                {(review.user_username || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            {review.user_username}
                                            {review.user === user?.id && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold border border-blue-100">You</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-amber-500">
                                            <span className="mr-1 font-bold">{review.rating}</span>
                                            <Star className="w-4 h-4 fill-current" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate text-slate-600" title={review.text}>
                                        {review.text || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border shadow-sm uppercase tracking-wider
                                            ${review.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                review.status === 'HIDDEN' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                                                    'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                            {review.status}
                                        </span>
                                    </td>
                                    {isAdminOrOwner && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {review.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleStatusChange(review.id, 'APPROVED')}
                                                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                                                        title="Approve"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {review.status !== 'HIDDEN' && (
                                                    <button
                                                        onClick={() => handleStatusChange(review.id, 'HIDDEN')}
                                                        className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                                                        title="Hide"
                                                    >
                                                        <EyeOff className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {reviews.length === 0 && (
                                <tr>
                                    <td colSpan={isAdminOrOwner ? "6" : "5"} className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-300">
                                                <MessageSquare className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium">No reviews found.</p>
                                            <p className="text-sm text-slate-400 mt-1">Be the first to share your experience!</p>
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

export default ReviewModeration;
