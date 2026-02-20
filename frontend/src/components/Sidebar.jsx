import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { Library, LayoutDashboard, Book, History, User, LogOut, Bell, Lightbulb, Calendar, Settings, FileText, PieChart, IndianRupee, Clock, MessageSquare, Crown, Activity, Shield } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            navigate('/');
        }
    };

    const isOwner = user?.profile?.is_owner;
    const isAdmin = user?.profile?.is_admin;

    const dashboardLink = { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard };

    const navLinks = [
        dashboardLink, // Dashboard is always first
        { name: 'Books', path: '/books', icon: Book },
        { name: 'Issues', path: '/issues', icon: History },
        { name: 'Reservations', path: '/reservations', icon: Calendar },
        { name: 'Extensions', path: '/extensions', icon: Clock },
        { name: 'Fines', path: '/fines', icon: IndianRupee },
        { name: 'Reviews', path: '/reviews', icon: MessageSquare },
        { name: 'Notifications', path: '/notifications', icon: Bell },
        { name: 'Suggestions', path: '/suggestions', icon: Lightbulb },
    ];

    const adminLinks = [
        { name: 'Manage Books', path: '/admin/books', icon: Book },
        { name: 'Users', path: '/admin/users', icon: User },
        { name: 'Requests', path: '/admin/requests', icon: History },
        { name: 'Issued Books', path: '/issues', icon: History },
        { name: 'Fines', path: '/admin/fines', icon: IndianRupee },
        { name: 'Extensions', path: '/admin/extensions', icon: Clock },
        { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
        { name: 'Reports', path: '/admin/reports', icon: FileText },
        { name: 'Suggestions', path: '/admin/suggestions', icon: Lightbulb },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    let links = [];

    if (isOwner) {
        // Owner Priority: Dashboard -> Audit Logs -> Admin Features
        links = [
            dashboardLink,
            { name: 'Audit Logs', path: '/owner/audit-logs', icon: Shield },
            ...adminLinks
        ];
    } else if (isAdmin) {
        // Admin Priority: Dashboard -> Admin Features
        links = [
            dashboardLink,
            ...adminLinks
        ];
    } else {
        // Student Priority: Dashboard -> Student Features
        links = navLinks;
    }

    return (
        <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 z-50">
            <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                <div className={`p-2 rounded-lg shadow-sm ${isOwner ? 'bg-yellow-500' : 'bg-blue-600'}`}>
                    {isOwner ? <Crown className="h-6 w-6 text-white" /> : <Library className="h-6 w-6 text-white" />}
                </div>
                <div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">
                        LibSys
                    </span>
                    <p className="text-xs text-slate-500 font-medium">
                        {isOwner ? 'Owner Access' : isAdmin ? 'Admin Portal' : 'Student Portal'}
                    </p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-6">
                <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={clsx(
                                "flex items-center space-x-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-blue-50 text-blue-700 font-semibold pl-6 pr-4"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-4"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                            <span className="font-medium text-sm">{link.name}</span>
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm cursor-pointer mb-2 group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-white shadow-sm overflow-hidden bg-cover bg-center shrink-0"
                        style={user?.profile?.avatar ? { backgroundImage: `url(http://127.0.0.1:8000${user.profile.avatar})` } : {}}>
                        {!user?.profile?.avatar && <User className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-700">{user?.username || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate uppercase tracking-wider">{user?.profile?.role || 'Guest'}</p>
                    </div>
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full space-x-2 px-4 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
