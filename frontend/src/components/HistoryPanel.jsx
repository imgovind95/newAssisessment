import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, ShieldAlert, AlertTriangle, ChevronLeft, ChevronRight, Clock, Hash } from 'lucide-react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function HistoryPanel({ user }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const limit = 10;

    useEffect(() => {
        fetchHistory();
    }, [page]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/history/?skip=${page * limit}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch history');
            const data = await response.json();
            setHistory(data);
        } catch (error) {
            toast.error('Could not load call history');
        } finally {
            setLoading(false);
        }
    };

    const getRiskIcon = (prediction) => {
        switch (prediction) {
            case 'Fraud': return <ShieldAlert className="w-5 h-5 text-cyber-fraud" />;
            case 'Spam': return <AlertTriangle className="w-5 h-5 text-cyber-spam" />;
            default: return <ShieldCheck className="w-5 h-5 text-cyber-safe" />;
        }
    };

    const getRiskColor = (prediction) => {
        switch (prediction) {
            case 'Fraud': return 'text-cyber-fraud';
            case 'Spam': return 'text-cyber-spam';
            default: return 'text-cyber-safe';
        }
    };

    return (
        <div className="animate-in fade-in duration-700 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <History className="w-8 h-8 text-cyber-blue" />
                <h2 className="text-3xl font-bold tracking-tight text-white">Call Verification History</h2>
            </div>

            <div className="cyber-card p-0 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 animate-pulse">
                        Decrypting historical records...
                    </div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No numbers have been analyzed yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-400 text-xs">
                                    <th className="p-5 font-semibold tracking-wider">PHONE NUMBER</th>
                                    <th className="p-5 font-semibold tracking-wider">RESULT</th>
                                    <th className="p-5 font-semibold tracking-wider text-right">CONFIDENCE</th>
                                    <th className="p-5 font-semibold tracking-wider">RISK LEVEL</th>
                                    <th className="p-5 font-semibold tracking-wider text-right">DATE / TIME</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {history.map((record) => (
                                    <tr key={record.id} className="hover:bg-cyber-blue/5 transition-colors duration-200">
                                        <td className="p-5 font-mono text-slate-200">{record.phone_number}</td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 font-semibold">
                                                {getRiskIcon(record.prediction)}
                                                <span className={getRiskColor(record.prediction)}>{record.prediction}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right font-mono text-slate-300">
                                            {record.confidence.toFixed(1)}%
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${record.risk_level === 'High' ? 'border-cyber-fraud text-cyber-fraud bg-cyber-fraud/10' : record.risk_level === 'Medium' ? 'border-cyber-spam text-cyber-spam bg-cyber-spam/10' : 'border-cyber-safe text-cyber-safe bg-cyber-safe/10'}`}>
                                                {record.risk_level}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right text-slate-400 text-sm">
                                            {new Date(record.checked_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {(!loading && (history.length > 0 || page > 0)) && (
                    <div className="p-4 border-t border-white/5 flex justify-between items-center bg-black/10">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <span className="text-sm text-slate-500 font-medium tracking-widest">PAGE {page + 1}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={history.length < limit}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
