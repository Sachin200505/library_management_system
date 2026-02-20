import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Library, User, Lock, ArrowRight, BookOpen } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showForgotResult, setShowForgotResult] = useState({ type: '', message: '' });
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotLoading(true);
        try {
            const { default: AuthService } = await import('../services/auth.service');
            await AuthService.requestPasswordReset(forgotEmail);
            setShowForgotResult({ type: 'success', message: 'If an account exists, a reset link has been sent to your email.' });
            setTimeout(() => {
                setShowForgotModal(false);
                setShowForgotResult({ type: '', message: '' });
                setForgotEmail('');
            }, 3000);
        } catch (err) {
            setShowForgotResult({ type: 'error', message: 'Failed to send reset link. Please try again.' });
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-slate-50">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-100/50 blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-slate-200/50 blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-6">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
                    <p className="text-slate-500 mt-2 text-sm">Sign in to your library account</p>
                </div>

                <div className="card p-8 shadow-xl shadow-slate-200/50 border-slate-200">
                    {error && (
                        <div className="p-3 mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg text-center font-medium flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Username or Email</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter your username or email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field !pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field !pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Sign In <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="card w-full max-w-md p-8 relative animate-scale-up">
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Reset Password</h2>
                        <p className="text-slate-500 mb-6 text-sm">Enter your email address to receive a reset link.</p>

                        {showForgotResult.message && (
                            <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${showForgotResult.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {showForgotResult.message}
                            </div>
                        )}

                        <form onSubmit={handleForgotSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={forgotLoading}
                                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                            >
                                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
