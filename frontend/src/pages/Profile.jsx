import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/user.service';
import { User, Mail, Shield, GraduationCap, Crown, Lock, Key, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [passData, setPassData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const getRoleIcon = (role) => {
        switch (role) {
            case 'OWNER': return <Crown className="w-5 h-5 text-yellow-500" />;
            case 'ADMIN': return <Shield className="w-5 h-5 text-purple-500" />;
            default: return <GraduationCap className="w-5 h-5 text-blue-500" />;
        }
    };

    const handleChange = (e) => {
        setPassData({ ...passData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passData.new_password !== passData.confirm_password) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (passData.new_password.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }

        setLoading(true);
        try {
            await UserService.changePassword({
                current_password: passData.current_password,
                new_password: passData.new_password
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPassData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            const msg = error.response?.data?.detail || 'Failed to change password.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const [basicData, setBasicData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        roll_number: user?.profile?.roll_number || '',
        avatar: null
    });
    const [preview, setPreview] = useState(user?.profile?.avatar || null);

    const handleBasicChange = (e) => {
        if (e.target.name === 'avatar') {
            const file = e.target.files[0];
            if (file) {
                setBasicData({ ...basicData, avatar: file });
                setPreview(URL.createObjectURL(file));
            }
        } else {
            setBasicData({ ...basicData, [e.target.name]: e.target.value });
        }
    };

    const handleBasicSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!user?.profile?.id) {
            setMessage({ type: 'error', text: 'User profile ID missing. Please logout and login again.' });
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', basicData.username);
            formData.append('email', basicData.email);
            formData.append('first_name', basicData.first_name);
            formData.append('last_name', basicData.last_name);
            formData.append('roll_number', basicData.roll_number);
            if (basicData.avatar) {
                formData.append('avatar', basicData.avatar);
            }

            await UserService.updateProfile(user.profile.id, formData);
            setMessage({ type: 'success', text: 'Profile updated successfully! Refreshing...' });
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Profile update error:", error);
            let msg = "Failed to update profile.";
            if (error.response?.data) {
                const data = error.response.data;
                if (data.username) msg = `Username: ${data.username[0]}`;
                else if (data.email) msg = `Email: ${data.email[0]}`;
                else if (data.detail) msg = data.detail;
            }
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <User className="text-blue-600 w-6 h-6" />
                My Profile
            </h1>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="card p-6 text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6 group">
                            <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden bg-cover bg-center"
                                style={preview ? { backgroundImage: `url(${preview})` } : {}}>
                                {!preview && <span className="text-4xl font-bold text-slate-300">{user?.username?.charAt(0).toUpperCase()}</span>}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 border-2 border-white">
                                <Shield className="w-4 h-4" />
                                <input type="file" name="avatar" className="hidden" accept="image/*" onChange={handleBasicChange} />
                            </label>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900">{user?.username}</h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <div className="p-1 px-3 bg-slate-50 rounded-full flex items-center gap-2 border border-slate-100">
                                {getRoleIcon(user?.profile?.role)}
                                <span className="font-bold text-slate-600 text-sm uppercase tracking-wider">{user?.profile?.role || 'STUDENT'}</span>
                            </div>
                        </div>
                        {user?.email && (
                            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500 bg-slate-50/50 p-2 rounded-lg">
                                <Mail className="w-4 h-4 text-blue-400" />
                                {user.email}
                            </div>
                        )}
                        {user?.profile?.roll_number && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-1">Library ID / Roll No</p>
                                <p className="font-mono text-slate-800 font-bold bg-slate-50 p-2 rounded border border-slate-100">{user.profile.roll_number}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    {/* Basic Details Form */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-slate-400" />
                            Basic Details
                        </h3>
                        <form onSubmit={handleBasicSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">First Name</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={basicData.first_name}
                                        onChange={handleBasicChange}
                                        className="input-field"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={basicData.last_name}
                                        onChange={handleBasicChange}
                                        className="input-field"
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={basicData.username}
                                    onChange={handleBasicChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={basicData.email}
                                        onChange={handleBasicChange}
                                        className="input-field !pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-slate-400" />
                            Change Password
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Current Password</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={passData.current_password}
                                        onChange={handleChange}
                                        className="input-field !pl-10"
                                        required
                                        placeholder="Enter current password"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            name="new_password"
                                            value={passData.new_password}
                                            onChange={handleChange}
                                            className="input-field !pl-10"
                                            required
                                            placeholder="Min 6 chars"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={passData.confirm_password}
                                            onChange={handleChange}
                                            className="input-field !pl-10"
                                            required
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
