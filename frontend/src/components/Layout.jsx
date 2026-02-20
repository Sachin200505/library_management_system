import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Library, LayoutDashboard, Book, History, User, LogOut, Menu, X, Bell, Lightbulb, Calendar, PieChart, FileText, DollarSign, Clock, Settings } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Books', path: '/books', icon: Book },
        { name: 'Issues', path: '/issues', icon: History },
        { name: 'Reservations', path: '/reservations', icon: Calendar },
        { name: 'Suggestions', path: '/suggestions', icon: Lightbulb },
        { name: 'Notifications', path: '/notifications', icon: Bell },
    ];

    const adminLinks = [
        { name: 'Manage Books', path: '/admin/books', icon: Book },
        { name: 'Requests', path: '/admin/requests', icon: History },
        { name: 'Analytics', path: '/admin/analytics', icon: PieChart },
        { name: 'Reports', path: '/admin/reports', icon: FileText },
        { name: 'Fines', path: '/admin/fines', icon: DollarSign },
        { name: 'Extensions', path: '/admin/extensions', icon: Clock },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    const links = user?.profile?.is_admin ? [...navLinks.filter(link => link.name !== 'Books'), ...adminLinks] : navLinks;

    return (
        <nav className="fixed md:hidden w-full z-40 bg-white border-b border-slate-200 top-0 left-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
                                <Library className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-slate-900 tracking-tight">
                                LibSys
                            </span>
                        </Link>
                    </div>

                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-slate-200">
                    <div className="px-4 pt-4 pb-6 space-y-2 h-[calc(100vh-4rem)] overflow-y-auto">
                        <div className="flex items-center px-4 py-4 mb-4 border border-slate-100 bg-slate-50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center border border-white shadow-sm mr-3">
                                <User className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{user?.username}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{user?.profile?.role}</p>
                            </div>
                        </div>

                        {links.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={clsx(
                                    "block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                    location.pathname === link.path
                                        ? "bg-blue-50 text-blue-700 font-semibold"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <div className="flex items-center space-x-3">
                                    <link.icon className={clsx("w-5 h-5", location.pathname === link.path ? "text-blue-600" : "text-slate-400")} />
                                    <span>{link.name}</span>
                                </div>
                            </Link>
                        ))}
                        <button
                            onClick={() => { logout(); setIsOpen(false); }}
                            className="w-full text-left flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg mt-4 transition-colors font-medium border-t border-slate-100 pt-4"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

const Layout = () => {
    return (
        <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Sidebar: Fixed width on desktop, hidden on mobile */}
            <div className="hidden md:block w-72 flex-shrink-0">
                <Sidebar />
            </div>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-h-screen w-full relative md:pl-0 transition-all duration-300">
                {/* Mobile Navbar: Visible only on mobile */}
                <Navbar />

                {/* Content Area */}
                <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 pt-20 md:pt-10 animate-fade-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;



