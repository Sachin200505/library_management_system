import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BookService from '../../services/book.service';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

const BookForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        isbn: '',
        author_id: '',
        category_id: '',
        quantity: 1,
        description: '',
        published_year: new Date().getFullYear(),
        newAuthorName: '',
        newCategoryName: ''
    });

    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [authorsData, categoriesData] = await Promise.all([
                    BookService.getAuthors(),
                    BookService.getCategories()
                ]);
                setAuthors(authorsData.results || authorsData);
                setCategories(categoriesData.results || categoriesData);

                if (isEditMode) {
                    const book = await BookService.get(id);
                    setFormData({
                        title: book.title || '',
                        isbn: book.isbn || '',
                        author_id: book.author?.id || '',
                        category_id: book.category?.id || '',
                        quantity: book.quantity || 1,
                        description: book.description || '',
                        published_year: book.published_year || new Date().getFullYear(),
                        newAuthorName: '',
                        newCategoryName: ''
                    });
                }
            } catch (err) {
                console.error("Error fetching data", err);
                setError('Failed to load initial data');
            }
        };
        fetchData();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' || name === 'published_year' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const dataToSubmit = { ...formData };
            delete dataToSubmit.newAuthorName;
            delete dataToSubmit.newCategoryName;

            // Handle New Author creation
            if (formData.author_id === 'others') {
                if (!formData.newAuthorName.trim()) {
                    throw new Error("Please enter the new author name.");
                }
                const newAuthor = await BookService.createAuthor({ name: formData.newAuthorName });
                dataToSubmit.author_id = newAuthor.id;
            }

            // Handle New Category creation
            if (formData.category_id === 'others') {
                if (!formData.newCategoryName.trim()) {
                    throw new Error("Please enter the new category name.");
                }
                const newCategory = await BookService.createCategory({ name: formData.newCategoryName });
                dataToSubmit.category_id = newCategory.id;
            }

            if (isEditMode) {
                await BookService.update(id, dataToSubmit);
            } else {
                await BookService.create(dataToSubmit);
            }
            navigate('/admin/books');
        } catch (err) {
            console.error("Error saving book", err);
            setError(err.message || 'Failed to save book. Please check your data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/books')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Books
                </button>
                <h1 className="text-2xl font-bold text-slate-900">
                    {isEditMode ? 'Edit Book' : 'Add New Book'}
                </h1>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">ISBN</label>
                        <input
                            type="text"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Author</label>
                        <select
                            name="author_id"
                            value={formData.author_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        >
                            <option value="">Select Author</option>
                            {authors.map(author => (
                                <option key={author.id} value={author.id}>{author.name}</option>
                            ))}
                            <option value="others" className="font-bold text-blue-600">+ Others (Add New)</option>
                        </select>
                        {formData.author_id === 'others' && (
                            <input
                                type="text"
                                name="newAuthorName"
                                placeholder="Enter new author name"
                                value={formData.newAuthorName}
                                onChange={handleChange}
                                className="w-full mt-2 px-4 py-2 bg-white border-2 border-blue-100 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none animate-in fade-in slide-in-from-top-1"
                                required
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Category</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                            <option value="others" className="font-bold text-green-600">+ Others (Add New)</option>
                        </select>
                        {formData.category_id === 'others' && (
                            <input
                                type="text"
                                name="newCategoryName"
                                placeholder="Enter new category name"
                                value={formData.newCategoryName}
                                onChange={handleChange}
                                className="w-full mt-2 px-4 py-2 bg-white border-2 border-green-100 rounded-lg text-slate-900 focus:ring-2 focus:ring-green-500 outline-none animate-in fade-in slide-in-from-top-1"
                                required
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            min="1"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Published Year</label>
                        <input
                            type="number"
                            name="published_year"
                            max={new Date().getFullYear()}
                            value={formData.published_year}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Description</label>
                    <textarea
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    ></textarea>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        {loading ? 'Saving...' : 'Save Book'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookForm;
