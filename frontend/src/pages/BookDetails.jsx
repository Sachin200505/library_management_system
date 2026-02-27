import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookService from '../services/book.service';
import IssueService from '../services/issue.service';
import ReservationService from '../services/reservation.service';
import ReviewService from '../services/review.service';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Book, Calendar, Tag, Clock, Check, Star, MessageSquare } from 'lucide-react';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState(null); // 'requested', 'reserved', 'none'
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const data = await BookService.get(id);
                setBook(data);
                setRequestStatus('none');

                // Fetch real reviews
                const reviewsData = await ReviewService.getForBook(id);
                setReviews(reviewsData.results || reviewsData);
            } catch (error) {
                console.error("Error fetching book details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id, navigate]);

    const handleRequest = async () => {
        try {
            await IssueService.requestBook(id);
            setRequestStatus('requested');
            alert("Book requested successfully!");
        } catch (error) {
            console.error("Error requesting book", error);
            alert("Failed to request book.");
        }
    };

    const handleReserve = async () => {
        try {
            await ReservationService.create(id);
            setRequestStatus('reserved');
            alert("Book reserved successfully!");
        } catch (error) {
            console.error("Error reserving book", error);
            alert("Failed to reserve book.");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await ReviewService.create({
                book_id: id,
                rating: newReview.rating,
                text: newReview.comment
            });
            setNewReview({ rating: 5, comment: '' });
            alert("Review submitted! It will appear after moderation.");

            // Refresh reviews
            const reviewsData = await ReviewService.getForBook(id);
            setReviews(reviewsData.results || reviewsData);
        } catch (error) {
            console.error("Error submitting review", error);
            alert("Failed to submit review. You can only review each book once.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!book) return <div className="text-center p-10 text-slate-500">Book not found</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
            <button
                onClick={() => navigate('/books')}
                className="flex items-center text-slate-500 hover:text-slate-800 transition-all font-medium group"
            >
                <div className="p-2 bg-slate-100 rounded-lg mr-3 group-hover:bg-slate-200 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                Back to Catalog
            </button>

            <div className="card overflow-hidden shadow-2xl border-none ring-1 ring-slate-200">
                <div className="flex flex-col lg:flex-row">
                    {/* Book Cover / Visual Placeholder */}
                    <div className="lg:w-1/3 p-10 bg-slate-50 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100">
                        <div className="w-48 h-64 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col items-center justify-center p-6 text-center transform hover:scale-105 transition-transform duration-300">
                            <Book className="w-16 h-16 text-blue-100 mb-4" />
                            <div className="space-y-2 opacity-20">
                                <div className="h-2 w-24 bg-slate-200 rounded mx-auto"></div>
                                <div className="h-2 w-16 bg-slate-200 rounded mx-auto"></div>
                                <div className="h-2 w-20 bg-slate-200 rounded mx-auto"></div>
                            </div>
                        </div>
                    </div>

                    {/* Book Info */}
                    <div className="p-8 lg:w-2/3 space-y-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-2 font-heading tracking-tight">{book.title}</h1>
                                <p className="text-xl text-slate-500 font-medium">by <span className="text-slate-800 font-bold">{book.author?.name || 'Unknown Author'}</span></p>
                            </div>
                            <div className={`px-5 py-2 rounded-2xl text-xs font-black border uppercase tracking-widest shadow-sm ${book.available_count > 0
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                {book.available_count > 0 ? 'Available' : 'Out of Stock'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Tag className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="font-bold w-20 uppercase text-[10px] tracking-wider text-slate-400">Category</span>
                                <span className="font-bold text-slate-700">{book.category?.name || 'General'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <span className="text-[10px] font-black text-blue-400">#</span>
                                </div>
                                <span className="font-bold w-20 uppercase text-[10px] tracking-wider text-slate-400">ISBN</span>
                                <span className="font-mono font-bold text-slate-700">{book.isbn}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="font-bold w-20 uppercase text-[10px] tracking-wider text-slate-400">Published</span>
                                <span className="font-bold text-slate-700">{book.published_year}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Library className="w-4 h-4 text-blue-500" />
                                </div>
                                <span className="font-bold w-20 uppercase text-[10px] tracking-wider text-slate-400">Inventory</span>
                                <span className="font-bold text-slate-700">{book.quantity} copies</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">About this book</h3>
                            <p className="text-slate-600 leading-relaxed font-medium bg-white p-6 rounded-2xl border border-slate-100 shadow-inner italic">
                                "{book.description || "No description avaiable for this book."}"
                            </p>
                        </div>

                        {/* Actions */}
                        {user?.profile?.is_student && (
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                {book.available_count > 0 ? (
                                    <button
                                        onClick={handleRequest}
                                        disabled={requestStatus === 'requested'}
                                        className={`flex-1 py-4 rounded-2xl text-base font-bold transition-all shadow-xl flex items-center justify-center gap-3
                                            ${requestStatus === 'requested'
                                                ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-100 cursor-default'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 active:scale-95'
                                            }`}
                                    >
                                        {requestStatus === 'requested' ? (
                                            <>
                                                <CheckCircle className="w-6 h-6" /> Requested Successfully
                                            </>
                                        ) : (
                                            <>Request to Borrow</>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleReserve}
                                        disabled={requestStatus === 'reserved'}
                                        className={`flex-1 py-4 rounded-2xl text-base font-bold transition-all shadow-xl flex items-center justify-center gap-3
                                            ${requestStatus === 'reserved'
                                                ? 'bg-purple-50 text-purple-700 border-2 border-purple-100 cursor-default'
                                                : 'bg-white text-purple-700 border-2 border-purple-100 hover:bg-purple-50 active:scale-95'
                                            }`}
                                    >
                                        <Clock className="w-6 h-6" />
                                        {requestStatus === 'reserved' ? 'Reserved Successfully' : 'Reserve Book'}
                                    </button>
                                )}
                            </div>
                        )}

                        {user?.profile?.is_admin && (
                            <div className="pt-4">
                                <button className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                                    Edit Book Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="card p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-slate-400" />
                                Student Reviews
                            </h2>
                        </div>

                        {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((review, idx) => (
                                    <div key={idx} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-white shadow-sm overflow-hidden bg-cover bg-center"
                                                    style={review.user?.profile?.avatar ? { backgroundImage: `url(http://127.0.0.1:8000${review.user.profile.avatar})` } : {}}>
                                                    {!review.user?.profile?.avatar && <span className="text-xs font-bold text-slate-400">{(review.user_username || 'U').charAt(0).toUpperCase()}</span>}
                                                </div>
                                                <span className="font-semibold text-slate-900">{review.user_username}</span>
                                            </div>
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed pl-10">{review.text}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No reviews yet.</p>
                                <p className="text-sm text-slate-400">Be the first to share your thoughts!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-24">
                        <h3 className="font-bold text-slate-900 mb-4">Write a Review</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= newReview.rating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-slate-200'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Your Review</label>
                                <textarea
                                    className="input-field h-32 resize-none text-sm border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none rounded-xl p-4"
                                    placeholder="What did you think about this book?"
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
                            >
                                Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
