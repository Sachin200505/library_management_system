import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, FileText, Search, Filter, Download } from 'lucide-react';
import api from '../../services/api';

const AuditLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL');

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [filter, searchTerm]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // In a real scenario, we would pass filter/search as params
            // const response = await api.get('/analytics/audit_logs/', { params: { search: searchTerm } });
            // For now, let's fetch all and filter client side if needed, or rely on backend search
            const response = await api.get('/analytics/audit_logs/');
            let data = response.data.results || response.data;

            // Client-side filtering for now if backend doesn't support it yet
            if (searchTerm) {
                const lower = searchTerm.toLowerCase();
                data = data.filter(log =>
                    log.action.toLowerCase().includes(lower) ||
                    log.username.toLowerCase().includes(lower) ||
                    log.details.toLowerCase().includes(lower)
                );
            }

            setLogs(data);
        } catch (error) {
            console.error("Error fetching audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (action) => {
        if (action.includes('LOGIN') || action.includes('REGISTER') || action.includes('SUCCESS')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (action.includes('DELETE') || action.includes('FAILED')) return 'bg-red-100 text-red-700 border-red-200';
        if (action.includes('UPDATE') || action.includes('CHANGE')) return 'bg-blue-100 text-blue-700 border-blue-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                        <Shield className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
                        <p className="text-slate-500">Track all system activities and security events.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search logs by user, action, or details..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div className="card overflow-hidden border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="p-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="p-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                <th className="p-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                                <th className="p-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(log.action)}`}>
                                            <FileText className="w-3 h-3" />
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {log.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{log.username}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm text-slate-600">{log.details}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-xs text-slate-500">{log.ip_address || 'N/A'}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1 text-slate-400 text-sm">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">No logs found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
