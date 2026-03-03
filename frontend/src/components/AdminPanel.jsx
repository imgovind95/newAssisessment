import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { API_BASE_URL } from '../config';
const AdminPanel = () => {
    const [stats, setStats] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/admin/analytics`);
                if (!res.ok) throw new Error('API Error fetching admin stats');
                const data = await res.json();
                setStats({
                    totalUsers: data.total_users,
                    totalChecks: data.total_checks,
                    totalReports: data.total_reports,
                    spamCount: data.spam_count,
                    fraudCount: data.fraud_count,
                    safeCount: data.safe_count,
                    recentReports: data.recent_reports || [],
                    model: {
                        name: data.model_metrics.model_name,
                        accuracy: data.model_metrics.accuracy,
                        lastTrained: new Date(data.model_metrics.last_trained).toLocaleString(),
                        comparison: {
                            lr: data.model_metrics.comparison["Logistic Regression"],
                            rf: data.model_metrics.comparison["Random Forest"]
                        }
                    }
                });
            } catch (err) {
                console.error(err);
                setErrorMsg('Failed to load system monitoring data. Is backend running?');
            }
        };
        fetchStats();
    }, []);

    if (errorMsg) return <div className="text-center text-cyber-fraud p-8 border border-cyber-fraud/20 rounded cyber-card">{errorMsg}</div>;
    if (!stats) return <div className="text-center p-8 text-cyber-blue animate-pulse">Establishing secure connection to Admin Core...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-1">Admin <span className="text-cyber-blue">Command Center</span></h2>
                    <p className="text-slate-400 text-sm">System Monitoring & Analytics Performance</p>
                </div>
                <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">System Status</span>
                    <span className="text-cyber-safe font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyber-safe rounded-full animate-pulse"></span>
                        OPERATIONAL
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: stats.totalUsers },
                    { label: 'Total Checks', value: stats.totalChecks },
                    { label: 'Fraud Selected', value: stats.fraudCount, color: 'text-cyber-fraud' },
                    { label: 'Spam Selected', value: stats.spamCount, color: 'text-cyber-spam' },
                ].map((stat, i) => (
                    <div key={i} className="cyber-card p-6 flex flex-col justify-center">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                        <div className={`text-3xl font-bold mt-2 ${stat.color || 'text-white'}`}>{stat.value.toLocaleString()}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Distribution Chart */}
                <div className="cyber-card md:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Danger Distribution</h3>
                    <div className="h-64 px-4 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Safe', count: stats.safeCount },
                                { name: 'Spam', count: stats.spamCount },
                                { name: 'Fraud', count: stats.fraudCount }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff15', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#ffffff05' }}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {
                                        [
                                            { name: 'Safe', count: stats.safeCount },
                                            { name: 'Spam', count: stats.spamCount },
                                            { name: 'Fraud', count: stats.fraudCount }
                                        ].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === 'Safe' ? '#00ff9d' : entry.name === 'Spam' ? '#ffcc00' : '#ff003c'} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Model Metrics */}
                <div className="cyber-card flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">ML Core Status</h3>
                        <div className="space-y-5">
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Active Model</span>
                                <p className="font-mono text-cyber-blue font-medium">{stats.model.name}</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Accuracy</span>
                                <p className="text-3xl font-bold text-white">{(stats.model.accuracy * 100).toFixed(1)}%</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1">Last Training Epoch</span>
                                <p className="text-sm text-slate-300 font-medium">{stats.model.lastTrained}</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6 mt-6 border-t border-white/5">
                        <span className="text-xs font-semibold text-slate-400 uppercase block mb-3">Performance Matrix</span>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span>Logistic Regression</span>
                                <span>{(stats.model.comparison.lr * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div className="bg-white/20 h-full" style={{ width: `${stats.model.comparison.lr * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-cyber-blue">
                                <span>Random Forest</span>
                                <span>{(stats.model.comparison.rf * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div className="bg-cyber-blue h-full" style={{ width: `${stats.model.comparison.rf * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Over Time */}
            <div className="cyber-card">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Report Frequency Timeline</h3>
                <div className="h-64 px-4 w-full">
                    {stats.recentReports && stats.recentReports.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={
                                // Process the raw timestamps into a simple daily/hourly count
                                stats.recentReports.reduce((acc, report) => {
                                    const date = new Date(report.reported_at).toLocaleDateString();
                                    const existing = acc.find(item => item.date === date);
                                    if (existing) {
                                        existing.Spam += report.report_type === 'Spam' ? 1 : 0;
                                        existing.Fraud += report.report_type === 'Fraud' ? 1 : 0;
                                    } else {
                                        acc.push({
                                            date,
                                            Spam: report.report_type === 'Spam' ? 1 : 0,
                                            Fraud: report.report_type === 'Fraud' ? 1 : 0
                                        });
                                    }
                                    return acc;
                                }, []).reverse()
                            }>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff15', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="Spam" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Line type="monotone" dataKey="Fraud" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                            Insufficient data to generate frequency analytics.
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AdminPanel;
