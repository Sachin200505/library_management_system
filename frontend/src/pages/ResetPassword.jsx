import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Library, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Dynamic import to avoid circular dependencies if any, though standard import is fine usually
            const { default: AuthService } = await import('../services/auth.service');
            await AuthService.resetPassword({ uid, token, password, confirmation_password: confirmPassword });

            setStatus({ type: 'success', message: 'Password reset successfully! Redirecting to login...' });

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to reset password. The link may be invalid or expired.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-[url('https://images.unsplash.com/photo-1507842217121-9e96e477c9ef?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

            <div className="relative z-10 w-full max-w-md p-8 bg-white/10 border border-white/20 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-blue-600/20 rounded-full mb-4 ring-2 ring-blue-500/50">
                        <Library className="w-10 h-10 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">set New Password</h1>
                    <p className="text-gray-400 mt-2">Enter your new password below</p>
                </div>

                {status.message && (
                    <div className={`p-4 mb-6 rounded-lg flex items-start gap-3 ${status.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                        {status.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                        <p className="text-sm">{status.message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-200 outline-none"
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-200 outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || status.type === 'success'}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
