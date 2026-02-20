import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookService from '../../services/book.service';
import { Plus, Edit2, Trash2, Search, BookOpen, CheckCircle, AlertOctagon, ChevronLeft, ChevronRight } from 'lucide-react';
import { debounce } from 'lodash';

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });



    const fetchBooks = async (searchTerm, pageNum) => {
        setLoading(true);
        try {
            const data = await BookService.getAll({ search: searchTerm, page: pageNum });
            if (data.results) {
                setBooks(data.results);
                setPagination({
                    next: data.next,
                    previous: data.previous,
                    count: data.count
                });
            } else {
                setBooks(data);
                setPagination({ next: null, previous: null, count: data.length });
            }
        } catch (error) {
            console.error("Error fetching books", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetch = React.useCallback(
        debounce((searchTerm, pageNum) => {
            fetchBooks(searchTerm, pageNum);
        }, 500),
        []
    );

    useEffect(() => {
        debouncedFetch(search, page);
        return () => debouncedFetch.cancel();
    }, [search, page, debouncedFetch]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        try {
            await BookService.delete(id);
            fetchBooks(search, page);
        } catch (error) {
            console.error("Error deleting book", error);
            alert('Failed to delete book.');
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    if (loading && !books.length) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white/50 p-6 rounded-2xl glass-card shadow-lg backdrop-blur-md border border-white/20 gap-4 sticky top-0 z-10 w-full mb-6 text-slate-800">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 font-heading">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="text-blue-600 w-8 h-8" />
                    </div>
                    Manage Books
                </h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search books..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <Link
                        to="/admin/books/new"
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Book
                    </Link>
                </div>
            </div>

            <div className="glass-card bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ISBN</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {books.map((book) => (
                                <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-bold text-slate-800 text-base">{book.title}</div>
                                            <div className="text-sm text-slate-500">by {book.author?.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                        {book.isbn}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                                            {book.category?.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${book.available_count > 0
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {book.available_count > 0 ? <CheckCircle className="w-3 h-3" /> : <AlertOctagon className="w-3 h-3" />}
                                            {book.available_count} / {book.quantity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/books/edit/${book.id}`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                title="Edit Book"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(book.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                title="Delete Book"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {books.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                                <BookOpen className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium">No books found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {(pagination.next || pagination.previous) && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={!pagination.previous}
                        className={`p-2.5 rounded-lg border transition-all ${!pagination.previous
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        Page {page}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!pagination.next}
                        className={`p-2.5 rounded-lg border transition-all ${!pagination.next
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                            }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ManageBooks;
