import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReservationService from '../services/reservation.service';
import { Calendar, XCircle, Clock, BookOpen, CheckCircle } from 'lucide-react';

const Reservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const data = await ReservationService.getAll();
            setReservations(data.results || data);
        } catch (error) {
            console.error("Error fetching reservations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
        try {
            await ReservationService.cancel(id);
            fetchReservations();
        } catch (error) {
            console.error("Error canceling reservation", error);
            alert("Failed to cancel reservation.");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl glass-card shadow-lg backdrop-blur-md border border-white/20 sticky top-0 z-10 w-full mb-6">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-heading">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="text-purple-600 w-8 h-8" />
                    </div>
                    My Reservations
                </h1>
            </div>

            <div className="glass-card bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reserved Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reservations.map((reservation) => (
                                <tr key={reservation.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-slate-700">{reservation.book?.title || 'Unknown Title'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {new Date(reservation.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm inline-flex items-center gap-1
                                            ${reservation.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' :
                                                reservation.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    'bg-red-100 text-red-700 border-red-200'
                                            }`}>
                                            {reservation.status === 'ACTIVE' && <CheckCircle className="w-3 h-3" />}
                                            {reservation.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {reservation.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => handleCancel(reservation.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg text-sm font-semibold transition-colors border border-red-100"
                                            >
                                                <XCircle className="w-4 h-4" /> Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {reservations.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <Clock className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium text-slate-700">No active reservations.</p>
                                            <p className="text-sm text-slate-500 mt-1 max-w-xs text-center">
                                                Reservations are for out-of-stock books. <br />
                                                If you requested an available book, check <Link to="/issues" className="text-primary-600 hover:underline">Issues & Returns</Link>.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default Reservations;
