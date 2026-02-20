import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Book, Clock, AlertCircle, History, Lightbulb, Library, CheckCircle, PieChart as PieIcon, TrendingUp, Users, DollarSign, Activity, BookOpen, ArrowUpRight, BarChart as BarIcon, IndianRupee } from 'lucide-react';
import AnalyticsService from '../services/analytics.service';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899'];

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, link, trend }) => (
    <div className="card p-6 flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-200 group relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity bg-${color}-500 blur-2xl rounded-full w-32 h-32 -mr-8 -mt-8`}></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wide">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2 font-heading">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600 shadow-sm border border-${color}-100`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
        {trend && (
            <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                <span>{trend}</span>
            </div>
        )}
        {link && (
            <Link to={link} className="absolute inset-0 z-20" aria-label={`View ${title}`} />
        )}
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        // Admin/Owner Stats
        total_books: 0,
        active_users: 0,
        active_issues: 0,
        overdue_count: 0,
        total_fines: 0,
        collected_fines: 0,
        user_distribution: { admins: 0, students: 0, owners: 0 },
        // Student Stats
        books: 0,
        issued: 0,
        pending: 0,
        fines: 0,
        current_issues: [],
        category_distribution: []
    });
    const [activityData, setActivityData] = useState([]); // For System Activity Chart
    const [loading, setLoading] = useState(true);

    const isAdminOrOwner = user?.profile?.role === 'ADMIN' || user?.profile?.role === 'OWNER';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await AnalyticsService.getDashboard();
                setStats(data);

                if (isAdminOrOwner) {
                    // Fetch System Activity for Admin/Owner
                    try {
                        const activityRes = await api.get('/analytics/dashboard/system_activity/');
                        setActivityData(activityRes.data);
                    } catch (err) {
                        console.error("Failed to fetch system activity", err);
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Auto-refresh for Admin/Owner stats every 30 seconds
        let interval;
        if (isAdminOrOwner) {
            interval = setInterval(fetchData, 30000);
        }
        return () => clearInterval(interval);

    }, [user, isAdminOrOwner]);

    // Role-specific Chart Data Preparation
    const roleData = isAdminOrOwner ? [
        { name: 'Students', value: stats.user_distribution?.students || 0, color: '#3b82f6' },
        { name: 'Admins', value: stats.user_distribution?.admins || 0, color: '#a855f7' },
        { name: 'Owners', value: stats.user_distribution?.owners || 0, color: '#eab308' },
    ] : [];

    const monthlyData = stats.monthly?.map(m => ({
        name: new Date(m.month).toLocaleString('default', { month: 'short' }),
        Issues: m.count
    })) || [];

    // Student Category Data
    const categoryData = stats.category_distribution?.map(item => ({
        name: item.category__name || 'Uncategorized',
        value: item.count
    })) || [];

    if (loading) return (
        <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    // --- ADMIN / OWNER VIEW ---
    if (isAdminOrOwner) {
        return (
            <div className="space-y-8 animate-fade-in pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 font-heading">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Overview of library performance and activity.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-500 flex items-center shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                            Live Updates
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={stats.active_users} icon={Users} color="blue" link="/admin/users" trend="+ New" />
                    <StatCard title="Total Books" value={stats.total_books} icon={BookOpen} color="purple" link="/admin/books" />
                    <StatCard title="Active Issues" value={stats.active_issues} icon={Activity} color="amber" link="/admin/requests" />
                    <StatCard title="Revenue" value={`₹${stats.collected_fines}`} icon={IndianRupee} color="emerald" link="/admin/fines" trend="Collected" />
                </div>

                {/* Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Monthly Trends */}
                    <div className="card p-6 shadow-lg border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Monthly Issue Trends
                        </h2>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                    <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="Issues" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIssues)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* System Activity */}
                    <div className="card p-6 shadow-lg border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <BarIcon className="w-5 h-5 text-purple-500" />
                            Weekly Activity
                        </h2>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activityData.length > 0 ? activityData : [{ name: 'No Data' }]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                    <Bar dataKey="logins" name="Logins" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="actions" name="Actions" fill="#a855f7" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Distribution */}
                    <div className="card p-6 shadow-lg border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-500" />
                            User Distribution
                        </h2>
                        <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {roleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
                                <span className="text-3xl font-bold text-slate-900 block">{stats.active_users + (stats.user_distribution?.admins || 0)}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase">Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity List */}
                    <div className="lg:col-span-2 card p-6 shadow-lg border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <History className="w-5 h-5 text-amber-500" />
                                Recent Transactions
                            </h2>
                            <Link to="/admin/requests" className="text-sm text-blue-600 font-medium hover:underline">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {stats.recent_activity && stats.recent_activity.length > 0 ? (
                                stats.recent_activity.slice(0, 5).map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${activity.status === 'ISSUED' ? 'bg-emerald-500' : activity.status === 'RETURNED' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{activity.book__title}</p>
                                                <p className="text-xs text-slate-500">
                                                    {activity.user__username} • {new Date(activity.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${activity.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-700' :
                                            activity.status === 'RETURNED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-sm text-center py-4">No recent activity.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- STUDENT VIEW (Unchanged) ---
    return (
        <div className="space-y-8 pb-10">
            {/* ... Existing Student Layout ... */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {user?.username}.</p>
                </div>
                <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    </span>
                    <span className="text-sm font-medium text-slate-600">System Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Active Issues" value={stats.issued_books || 0} icon={Book} color="blue" link="/issues" />
                <StatCard title="Pending Requests" value={stats.pending_requests || 0} icon={Clock} color="yellow" link="/issues" />
                <StatCard title="Overdue Books" value={stats.overdue_count || 0} icon={AlertCircle} color="red" link="/fines" />
                <StatCard title="Fines Due" value={`₹${stats.fines_due || 0}`} icon={CheckCircle} color="emerald" link="/fines" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Activity */}
                    <div className="card h-[400px] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <History className="w-5 h-5 text-slate-400" />
                                Recent Activity
                            </h2>
                            <Link to="/issues" className="text-sm text-blue-600 hover:underline">View Full History</Link>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {stats.recent_activity && stats.recent_activity.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.recent_activity.map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-white border border-slate-100 hover:border-slate-300 transition-colors">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${activity.status === 'ISSUED' ? 'bg-emerald-500' :
                                                activity.status === 'RETURNED' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-semibold text-slate-900 truncate pr-2">{activity.book__title}</p>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border px-1 rounded">{activity.status}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(activity.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 text-slate-500">No recent activity.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Category Distribution Chart */}
                    <div className="card p-6 h-[400px] flex flex-col">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <PieIcon className="w-5 h-5 text-slate-400" />
                            Collections
                        </h2>
                        {categoryData.length > 0 ? (
                            <div className="flex-1 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
