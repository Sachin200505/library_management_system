import React, { useEffect, useState } from 'react';
import SettingService from '../../services/setting.service';
import { Settings as SettingsIcon, Save } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await SettingService.getAll();
            setSettings(data.results || data);
        } catch (error) {
            console.error("Error fetching settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (id, value) => {
        try {
            await SettingService.update(id, { value });
            // Optionally show success toast
        } catch (error) {
            console.error("Error updating setting", error);
            alert("Failed to update setting");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl glass-card shadow-lg backdrop-blur-md border border-white/20 sticky top-0 z-10 w-full text-slate-800">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 font-heading">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <SettingsIcon className="text-blue-600 w-8 h-8" />
                    </div>
                    System Settings
                </h1>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-8 space-y-4">
                {settings.map((setting) => (
                    <div key={setting.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-slate-50 pb-4 last:border-0 last:pb-0 group">
                        <div className="md:col-span-1">
                            <label className="block text-lg font-bold text-slate-900 capitalize mb-1 group-hover:text-blue-600 transition-colors">
                                {setting.key.replace(/_/g, ' ')}
                            </label>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {setting.key === 'fine_per_day' ? 'Amount charged per day for overdue books.' :
                                    setting.key === 'return_period_days' ? 'Maximum duration for book issues.' :
                                        setting.key === 'currency_symbol' ? 'Currency symbol used system-wide.' :
                                            'System configuration constant.'}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <div className="relative group">
                                <input
                                    type={setting.value_type === 'int' || setting.value_type === 'float' ? 'number' : 'text'}
                                    defaultValue={setting.value}
                                    onBlur={(e) => handleUpdate(setting.id, e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 pr-12 text-slate-800 font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-slate-400"
                                    placeholder={`Set ${setting.key.replace(/_/g, ' ')}`}
                                />
                                <Save className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                            </div>
                        </div>
                    </div>
                ))}
                {settings.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SettingsIcon className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-lg font-medium">No configuration settings available.</p>
                        <button onClick={fetchSettings} className="mt-6 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95">
                            Refresh Data
                        </button>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm italic">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                Changes saved automatically on blur.
            </div>
        </div>
    );
};

export default Settings;
