import React, { useEffect, useState } from 'react';
import UserService from '../../services/user.service';
import { useAuth } from '../../context/AuthContext';
import { Search, User, Shield, Calendar, Mail, CheckCircle, MoreHorizontal, Power, Key, Trash2, XCircle, Crown } from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { user: currentUser } = useAuth();

    // Action States
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [adminData, setAdminData] = useState({ username: '', password: '' });

    useEffect(() => {
        fetchUsers();
    }, [search]); // Add search to dependency array or handling debounce

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await UserService.getAll({ search });
            const results = data.results || data;

            // Map UserProfile objects (backend response) to User objects (expected by UI)
            const mappedUsers = results.map(item => {
                if (item.user) {
                    return {
                        ...item.user,
                        profile_id: item.id, // Critical: Keep Profile ID for actions
                        date_joined: item.created_at, // Use profile creation date
                        profile: {
                            ...item.user.profile,
                            role: item.role
                        }
                    };
                }
                return item;
            });

            setUsers(mappedUsers);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleToggleActivation = async (userToToggle) => {
        if (!window.confirm(`Are you sure you want to ${userToToggle.is_active ? 'deactivate' : 'activate'} this user?`)) return;
        try {
            // Need a backend endpoint for this. Assuming /api/profiles/{id}/toggle_activation/
            // But usually we toggle the User model's is_active.
            // Let's assume UserService has this method or we add it. 
            // Since we mocked UserProfileViewSet actions, let's assume we call that.
            // We need the profile ID. userToToggle is a User object mapped above.
            // Wait, we need to know the structure. 'item' had 'id' which was profile ID?
            // Let's check the map logic. 'item' is the UserProfile serializer data. 'item.user' is nested UserSerializer.
            // But we didn't preserve the profile ID in the map logic clearly.
            // Let's rely on the fact that we might need to fetch the profile ID or pass user ID to a custom endpoint.
            // The backend 'toggle_activation' is on UserProfileViewSet, so it needs Profile ID.

            // Let's check if we have profile ID. The map logic:
            // item (UserProfile) -> has id (Profile ID).
            // we return { ...item.user (User), ... }
            // So we lost Profile ID! We need to fix the map logic in fetchUsers first or handle it here.

            // Actually, let's fix fetchUsers to keep profile_id.

            // For now, let's blindly call logic assuming we fix it.
            await UserService.toggleActivation(userToToggle.profile_id); // We need to add profile_id to user object

            setUsers(users.map(u =>
                u.id === userToToggle.id ? { ...u, is_active: !u.is_active } : u
            ));
        } catch (error) {
            console.error("Error toggling activation", error);
            alert("Failed to update user status.");
        }
    };

    const handleDelete = async (userToDelete) => {
        if (!window.confirm(`Are you sure you want to delete user ${userToDelete.username}? This cannot be undone.`)) return;
        try {
            // Delete the profile (which cascades to user if set up that way, or vice versa)
            await UserService.delete(userToDelete.profile_id);
            setUsers(users.filter(u => u.id !== userToDelete.id));
        } catch (error) {
            console.error("Error deleting user", error);
            alert("Failed to delete user.");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            await UserService.changePassword({ user_id: selectedUser.id, new_password: newPassword });
            alert("Password changed successfully.");
            setShowPasswordModal(false);
            setNewPassword('');
            setSelectedUser(null);
        } catch (error) {
            console.error("Error changing password", error);
            alert("Failed to change password.");
        }
    };

    const handleRegisterAdmin = async (e) => {
        e.preventDefault();
        try {
            await UserService.registerAdmin(adminData);
            alert("Admin created successfully.");
            setShowAdminModal(false);
            setAdminData({ username: '', password: '' });
            fetchUsers();
        } catch (error) {
            console.error("Error creating admin", error);
            alert(error.response?.data?.detail || "Failed to create admin.");
        }
    };




    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Users</h1>
                    <p className="text-slate-500 mt-1">View and manage system users and their roles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={handleSearch}
                            className="input-field !pl-10"
                        />
                    </div>
                    {currentUser?.profile?.is_owner && (
                        <button
                            onClick={() => setShowAdminModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md shadow-purple-200 transition-all active:scale-95 whitespace-nowrap"
                        >
                            <Shield className="w-4 h-4" /> Register Admin
                        </button>
                    )}
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">{user.username}</div>
                                                <div className="text-xs text-slate-500">ID: #{user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${user.profile?.role === 'OWNER' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                            user.profile?.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {user.profile?.role === 'OWNER' && <Crown className="w-3 h-3 mr-1" />}
                                            {user.profile?.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                                            {user.profile?.role || 'STUDENT'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {user.email || <span className="text-slate-400 italic">No email</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_active ? (
                                            <div className="flex items-center gap-1.5 text-emerald-700 text-sm font-medium">
                                                <CheckCircle className="w-4 h-4" /> Active
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-red-700 text-sm font-medium">
                                                <XCircle className="w-4 h-4" /> Inactive
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleActivation(user)}
                                                className={`p-1.5 rounded-lg transition-colors ${user.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                                                title={user.is_active ? "Deactivate User" : "Activate User"}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Change Password"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <User className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <p className="font-medium">No users found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-slide-up">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Change Password</h2>
                        <p className="text-slate-500 mb-6 text-sm">
                            Enter a new password for <span className="font-bold text-slate-700">{selectedUser?.username}</span>.
                        </p>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="input-field"
                                required
                                minLength={6}
                            />
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Save Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Register Admin Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-8 animate-slide-up">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Register New Admin</h2>
                        </div>

                        <p className="text-slate-500 mb-6 text-sm">
                            Create a new administrator account. They can login and change their details later.
                        </p>

                        <form onSubmit={handleRegisterAdmin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={adminData.username}
                                    onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Temp Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={adminData.password}
                                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                                    className="input-field"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowAdminModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                                >
                                    Create Admin
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;

