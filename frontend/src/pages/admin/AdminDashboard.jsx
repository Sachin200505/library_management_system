import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnalyticsService from '../../services/analytics.service';
import { Users, BookOpen, AlertCircle, IndianRupee, TrendingUp, Settings, Clock, ClipboardList, CheckCircle, ArrowUpRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, link, trend }) => (
    <Link to={link} className="block group">
        <div className={`bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity bg-${color}-500 blur-2xl rounded-full w-32 h-32 -mr-8 -mt-8`}></div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-800 mt-2 font-heading group-hover:scale-105 transition-transform origin-left">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 shadow-sm ring-1 ring-${color}-100`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-xs font-medium text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span>{trend}</span>
                </div>
            )}
        </div>
    </Link>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        active_users: 0,
        total_books: 0,
        active_issues: 0,
        pending_returns: 0,
        collected_fines: 0,
        recent_activity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await AnalyticsService.getDashboard();
                setStats({
                    active_users: data.active_users || 0,
                    total_books: data.total_books || 0,
                    active_issues: data.active_issues || 0,
                    collected_fines: data.collected_fines || 0,
                    recent_activity: data.recent_activity || []
                });
            } catch (error) {
                console.error("Error fetching admin dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800 font-heading">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">Overview of library system performance</p>
                </div>
                <div className="flex gap-4">
                    <Link to="/admin/reports" className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-medium flex items-center gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Generate Reports
                    </Link>
                    <Link to="/admin/settings" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 font-medium flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        System Settings
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Users"
                    value={stats.active_users}
                    icon={Users}
                    color="blue"
                    link="/admin/users"
                    trend="+5% growth"
                />
                <StatCard
                    title="Collected Fines"
                    value={`₹${stats.collected_fines}`}
                    icon={IndianRupee}
                    color="green"
                    link="/admin/fines"
                    trend="Revenue"
                />
                <StatCard
                    title="Active Issues"
                    value={stats.active_issues}
                    icon={ClipboardList}
                    color="amber"
                    link="/admin/issues"
                    trend="Current loans"
                />
                <StatCard
                    title="Total Books"
                    value={stats.total_books}
                    icon={BookOpen}
                    color="purple"
                    link="/admin/books"
                    trend="Library Size"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary-500" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { to: "/admin/books", icon: BookOpen, color: "blue", title: "Manage Books", desc: "Edit & Delete books" },
                            { to: "/admin/reviews", icon: AlertCircle, color: "orange", title: "Review Moderation", desc: "Manage book reviews" },
                            { to: "/admin/requests", icon: ClipboardList, color: "indigo", title: "Issue Requests", desc: "Approve book loans" },
                            { to: "/admin/extensions", icon: Clock, color: "yellow", title: "Extension Requests", desc: "Review extensions" },
                            { to: "/admin/suggestions", icon: BookOpen, color: "pink", title: "Book Suggestions", desc: "Review user ideas" },
                            { to: "/admin/settings", icon: Settings, color: "purple", title: "Settings", desc: "Configure system" }
                        ].map((action, idx) => (
                            <Link key={idx} to={action.to} className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary-200 hover:shadow-md transition-all duration-300 flex flex-col items-start">
                                <div className={`p-3 rounded-xl bg-${action.color}-50 text-${action.color}-600 mb-3 group-hover:scale-110 transition-transform`}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-800 group-hover:text-primary-700 transition-colors">{action.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">{action.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        Recent System Activity
                    </h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats.recent_activity && stats.recent_activity.length > 0 ? (
                            stats.recent_activity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-slate-100 hover:bg-white transition-colors">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${activity.status === 'ISSUED' ? 'bg-green-500' :
                                        activity.status === 'RETURNED' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                                    <div>
                                        <p className="text-sm text-slate-700">
                                            <span className="font-bold text-slate-900">{activity.user__username}</span>
                                            <span className="text-slate-500"> - {activity.book__title}</span>
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${activity.status === 'ISSUED' ? 'bg-green-50 text-green-600 border-green-100' :
                                                activity.status === 'RETURNED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {activity.status}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(activity.updated_at).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Clock className="w-6 h-6 text-slate-300" />
                                </div>
                                <p className="text-slate-500 text-sm">No recent activity found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
