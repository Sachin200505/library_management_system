import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BookService from '../services/book.service';
import IssueService from '../services/issue.service';
import ReservationService from '../services/reservation.service';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, BookOpen, Check, Clock, X, ChevronLeft, ChevronRight, Edit2, Trash2, Filter, Book } from 'lucide-react';
import { debounce } from 'lodash';

const Books = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { user } = useAuth();
    const [requestStatus, setRequestStatus] = useState({});
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ next: null, previous: null, count: 0 });

    // Add Book Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newBook, setNewBook] = useState({
        title: '',
        author_id: '',
        category_id: '',
        isbn: '',
        quantity: 1,
        description: '',
        published_year: new Date().getFullYear()
    });

    const [isNewAuthor, setIsNewAuthor] = useState(false);
    const [newAuthorName, setNewAuthorName] = useState('');
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

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

    // Debounced search function
    const debouncedFetch = useCallback(
        debounce((searchTerm, pageNum) => {
            fetchBooks(searchTerm, pageNum);
        }, 500),
        []
    );

    useEffect(() => {
        debouncedFetch(search, page);
        return () => debouncedFetch.cancel();
    }, [search, page, debouncedFetch]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    const handleRequest = async (bookId) => {
        try {
            await IssueService.requestBook(bookId);
            setRequestStatus({ ...requestStatus, [bookId]: 'requested' });
        } catch (error) {
            console.error("Error requesting book", error);
            setRequestStatus({ ...requestStatus, [bookId]: 'error' });
        }
    };

    const handleReserve = async (bookId) => {
        try {
            await ReservationService.create(bookId);
            setRequestStatus({ ...requestStatus, [bookId]: 'reserved' });
            alert("Book reserved successfully!");
        } catch (error) {
            console.error("Error reserving book", error);
            alert("Failed to reserve book.");
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        try {
            await BookService.delete(id);
            fetchBooks(search, page);
        } catch (error) {
            console.error("Error deleting book", error);
            alert('Failed to delete book.');
        }
    };

    const fetchMetadata = async () => {
        try {
            const [authorsData, categoriesData] = await Promise.all([
                BookService.getAuthors(),
                BookService.getCategories()
            ]);
            setAuthors(authorsData.results || authorsData);
            setCategories(categoriesData.results || categoriesData);
        } catch (error) {
            console.error("Error fetching metadata", error);
        }
    };

    const handleAddClick = () => {
        fetchMetadata();
        setShowAddModal(true);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            let authorId = newBook.author_id;
            let categoryId = newBook.category_id;

            if (isNewAuthor && newAuthorName) {
                const author = await BookService.createAuthor({ name: newAuthorName, bio: 'Auto-created' });
                authorId = author.id;
            }

            if (isNewCategory && newCategoryName) {
                const category = await BookService.createCategory({ name: newCategoryName });
                categoryId = category.id;
            }

            const bookData = {
                ...newBook,
                author_id: authorId,
                category_id: categoryId
            };

            await BookService.create(bookData);
            alert("Book added successfully!");
            setShowAddModal(false);
            setNewBook({
                title: '',
                author_id: '',
                category_id: '',
                isbn: '',
                quantity: 1,
                description: '',
                published_year: new Date().getFullYear()
            });
            setIsNewAuthor(false);
            setNewAuthorName('');
            setIsNewCategory(false);
            setNewCategoryName('');

            fetchBooks(search, page);
        } catch (error) {
            console.error("Error adding book", error);
            alert("Failed to add book.");
        }
    };

    if (loading && !books.length) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-20 md:top-0 z-30">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <BookOpen className="text-blue-600 w-6 h-6" />
                        Library Catalog
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Browse and manage your library collection</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by title, author, or ISBN..."
                            value={search}
                            onChange={handleSearch}
                            className="input-field !pl-12 py-2.5"
                        />
                    </div>
                    {user?.profile?.is_admin && (
                        <button
                            onClick={handleAddClick}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Add Book
                        </button>
                    )}
                </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 gap-2">
                {books.map((book) => (
                    <div key={book.id} className="card p-3 flex flex-row gap-3 hover:border-blue-300 transition-colors duration-200 group items-center">
                        {/* Type/Icon Placeholder */}
                        <div className="hidden sm:flex flex-shrink-0 w-10 h-10 bg-slate-50 rounded-lg items-center justify-center border border-slate-100">
                            <Book className="w-5 h-5 text-slate-300" />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                                        <Link to={`/books/${book.id}`}>
                                            {book.title}
                                        </Link>
                                    </h3>
                                    <div className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${book.available_count > 0
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                        {book.available_count > 0 ? `${book.available_count} Avail` : 'Out of Stock'}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 text-[10px] text-slate-500 mt-0.5">
                                    <span className="font-medium text-slate-700">{book.author?.name || 'Unknown'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span>{book.category?.name || 'General'}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-mono bg-slate-50 px-1 rounded border border-slate-100">{book.isbn}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {user?.profile?.is_student && (
                                    <>
                                        {book.available_count > 0 ? (
                                            <button
                                                onClick={() => handleRequest(book.id)}
                                                disabled={requestStatus[book.id] === 'requested'}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap border
                                                    ${requestStatus[book.id] === 'requested'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                                                        : 'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-blue-500/20'
                                                    }`}
                                            >
                                                {requestStatus[book.id] === 'requested' ? <Check className="w-3.5 h-3.5" /> : 'Request'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleReserve(book.id)}
                                                disabled={requestStatus[book.id] === 'reserved'}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap border
                                                    ${requestStatus[book.id] === 'reserved'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200 cursor-default'
                                                        : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
                                                    }`}
                                            >
                                                <Clock className="w-3.5 h-3.5" />
                                                {requestStatus[book.id] === 'reserved' ? 'Reserved' : 'Reserve'}
                                            </button>
                                        )}
                                    </>
                                )}
                                {user?.profile?.is_admin && (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/admin/books/edit/${book.id}`}
                                            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={(e) => handleDelete(e, book.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Book"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {books.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                        <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg mb-1">No books found</h3>
                    <p className="text-slate-500">We couldn't find any books matching your search.</p>
                    <button
                        onClick={() => { setSearch(''); setPage(1); }}
                        className="mt-4 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Clear Search
                    </button>
                </div>
            )}

            {/* Pagination Controls */}
            {(pagination.next || pagination.previous) && (
                <div className="flex justify-center items-center gap-3 pt-6 border-t border-slate-200 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={!pagination.previous}
                        className={`p-2 rounded-lg border transition-all ${!pagination.previous
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-slate-600 px-4">
                        Page <span className="text-slate-900 font-bold">{page}</span>
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!pagination.next}
                        className={`p-2 rounded-lg border transition-all ${!pagination.next
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                            }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Add Book Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-slide-up border border-slate-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-xl sticky top-0 bg-opacity-95 backdrop-blur z-10">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <Plus className="w-5 h-5 text-blue-600" />
                                Add New Book
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleAddSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Title</label>
                                        <input type="text" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} className="input-field" required placeholder="e.g. The Great Gatsby" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">ISBN</label>
                                        <input type="text" value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} className="input-field" required placeholder="e.g. 978-3-16-148410-0" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Author</label>
                                        <select value={isNewAuthor ? 'others' : newBook.author_id} onChange={(e) => { e.target.value === 'others' ? setIsNewAuthor(true) : setIsNewAuthor(false) || setNewBook({ ...newBook, author_id: e.target.value }) }} className="input-field appearance-none bg-no-repeat bg-right" required={!isNewAuthor}>
                                            <option value="">Select Author</option>
                                            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            <option value="others" className="font-semibold text-blue-600">+ Add New Author</option>
                                        </select>
                                        {isNewAuthor && <input type="text" placeholder="Enter New Author Name" value={newAuthorName} onChange={(e) => setNewAuthorName(e.target.value)} className="input-field mt-2 border-blue-300 ring-2 ring-blue-50" required />}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Category</label>
                                        <select value={isNewCategory ? 'others' : newBook.category_id} onChange={(e) => { e.target.value === 'others' ? setIsNewCategory(true) : setIsNewCategory(false) || setNewBook({ ...newBook, category_id: e.target.value }) }} className="input-field appearance-none bg-no-repeat bg-right" required={!isNewCategory}>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            <option value="others" className="font-semibold text-blue-600">+ Add New Category</option>
                                        </select>
                                        {isNewCategory && <input type="text" placeholder="Enter New Category Name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="input-field mt-2 border-blue-300 ring-2 ring-blue-50" required />}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Quantity</label>
                                        <input type="number" min="1" value={newBook.quantity} onChange={(e) => setNewBook({ ...newBook, quantity: e.target.value })} className="input-field" required />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-semibold text-slate-700">Year</label>
                                        <input type="number" min="1900" max={new Date().getFullYear() + 1} value={newBook.published_year} onChange={(e) => setNewBook({ ...newBook, published_year: e.target.value })} className="input-field" required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-slate-700">Description</label>
                                    <textarea value={newBook.description} onChange={(e) => setNewBook({ ...newBook, description: e.target.value })} className="input-field h-32 resize-none" required placeholder="Brief summary of the book..."></textarea>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                    <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-500/30">Save Book</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Books;
