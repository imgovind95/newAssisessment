import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud, FileDown, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Detector = ({ user, setView }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    // Batch Processing State
    const [batchResults, setBatchResults] = useState(null);
    const [batchLoading, setBatchLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleCheck = async () => {
        if (!phoneNumber) return;

        if (!user) {
            toast.error("Please login to use the Analyzer");
            if (setView) setView('auth');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/detector/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ phone_number: phoneNumber })
            });
            if (!res.ok) throw new Error('API Error checking number.');
            const data = await res.json();
            setResult(data);
            toast.success("Analysis Complete");
        } catch (error) {
            console.error(error);
            toast.error("Error analyzing number. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!user) {
            toast.error("Please login to use the Batch Analyzer");
            if (setView) setView('auth');
            // reset file input
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (!file.name.endsWith('.csv')) {
            toast.error("Please upload a valid CSV file");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setBatchLoading(true);
        setBatchResults(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/detector/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'API Error uploading file.');
            }

            const data = await res.json();
            setBatchResults(data);
            toast.success(`Batch Analysis Complete: Analyzed ${data.length} numbers.`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Error analyzing batch file.");
        } finally {
            setBatchLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDownloadCSV = () => {
        if (!batchResults || batchResults.length === 0) return;

        const headers = ["Phone Number", "Result", "Confidence", "Risk Level", "Recommendation"];
        const rows = batchResults.map(r => [
            r.phone_number,
            r.label,
            `${r.confidence.toFixed(1)}%`,
            r.risk_level,
            `"${r.recommendation}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "batch_analysis_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleReport = async (type) => {
        if (!user) {
            toast.error(`Please login to report this number as ${type}`);
            if (setView) setView('auth');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/detector/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ phone_number: phoneNumber, report_type: type, description: 'User reported via dashboard' })
            });
            if (res.ok) {
                toast.success(`Number successfully reported as ${type}!`);
            } else {
                throw new Error('Report Failed');
            }
        } catch (err) {
            toast.error("Failed to submit report.");
        }
    }

    const getRiskColor = (label) => {
        if (label === 'Fraud') return 'text-cyber-fraud';
        if (label === 'Spam') return 'text-cyber-spam';
        return 'text-cyber-safe';
    };

    const getRiskIcon = (prediction) => {
        switch (prediction) {
            case 'Fraud': return <ShieldAlert className="w-5 h-5 text-cyber-fraud" />;
            case 'Spam': return <AlertTriangle className="w-5 h-5 text-cyber-spam" />;
            default: return <ShieldCheck className="w-5 h-5 text-cyber-safe" />;
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-1000 pb-16">
            <div className="text-center space-y-4 pt-8">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                    Secure Your <span className="text-cyber-blue">Calls</span>
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    AI-powered classification engine using advanced behavioral patterns and global reputation databases to identify malicious callers instantly.
                </p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                {/* Manual Check Card */}
                <div className="cyber-card shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Manual Analysis</h2>
                        <input
                            type="text"
                            placeholder="Enter phone number (e.g., +1 800 123 4567)"
                            className="cyber-input w-full text-base py-3 px-4 mb-4"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleCheck}
                        disabled={loading}
                        className="cyber-button cyber-button-primary w-full disabled:opacity-50 text-base py-3"
                    >
                        {loading ? 'Analyzing...' : 'Analyze Number'}
                    </button>
                </div>

                {/* Batch Upload Card */}
                <div className="cyber-card shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Batch CSV Analysis</h2>
                        <div className="flex items-center justify-center w-full mb-4">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-black/20 border-white/10 hover:border-cyber-blue/50 hover:bg-cyber-blue/5 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                                    <p className="mb-1 text-sm text-slate-400"><span className="font-semibold text-white">Click to upload</span></p>
                                    <p className="text-xs text-slate-500">CSV file containing phone numbers</p>
                                </div>
                                <input
                                    id="dropzone-file"
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    ref={fileInputRef}
                                    disabled={batchLoading}
                                />
                            </label>
                        </div>
                    </div>
                    {batchLoading && (
                        <div className="text-center text-sm font-semibold text-cyber-blue animate-pulse">
                            Processing Batch File...
                        </div>
                    )}
                </div>
            </div>

            {/* Individual Result Area */}
            {result && (
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
                    <div className="cyber-card flex flex-col items-center justify-center text-center space-y-6">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                                <circle
                                    cx="96" cy="96" r="88"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-white/5"
                                />
                                <circle
                                    cx="96" cy="96" r="88"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeLinecap="round"
                                    strokeDasharray={552}
                                    strokeDashoffset={552 - (552 * result.confidence) / 100}
                                    className={`${getRiskColor(result.label)} transition-all duration-1000 ease-out`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold tracking-tight text-white">{Math.round(result.confidence)}%</span>
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Confidence</span>
                            </div>
                        </div>
                        <h2 className={`text-2xl font-bold uppercase tracking-widest ${getRiskColor(result.label)}`}>
                            {result.label} DETECTED
                        </h2>
                    </div>

                    <div className="cyber-card flex flex-col justify-between">
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Risk Assessment</h3>
                                <div className="inline-block">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${result.label === 'Fraud' ? 'bg-cyber-fraud/20 text-cyber-fraud border border-cyber-fraud/30' :
                                        result.label === 'Spam' ? 'bg-cyber-spam/20 text-cyber-spam border border-cyber-spam/30' :
                                            'bg-cyber-safe/20 text-cyber-safe border border-cyber-safe/30'
                                        }`}>
                                        {result.risk_level} Risk
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Recommendation</h3>
                                <p className="text-slate-200 leading-relaxed font-medium">{result.recommendation}</p>
                            </div>
                        </div>
                        <div className="pt-6 mt-6 border-t border-white/5 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                            <span className="text-slate-500 text-xs font-medium">Model Extracted Features: Hueristics, Region, Reputation</span>
                            {user && (
                                <div className="flex gap-3">
                                    <button onClick={() => handleReport('Spam')} className="text-slate-400 hover:text-cyber-spam text-xs font-bold transition-colors">REPORT SPAM</button>
                                    <button onClick={() => handleReport('Fraud')} className="text-slate-400 hover:text-cyber-fraud text-xs font-bold transition-colors">REPORT FRAUD</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Results Area */}
            {batchResults && batchResults.length > 0 && (
                <div className="cyber-card p-0 overflow-hidden max-w-5xl mx-auto animate-in fade-in duration-700 mt-12">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <h3 className="text-2xl font-bold text-white tracking-tight">Batch Analysis Results</h3>
                        <button
                            onClick={handleDownloadCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-cyber-blue text-black font-bold rounded-lg hover:bg-cyber-blue shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all text-sm"
                        >
                            <FileDown className="w-4 h-4" /> Download CSV
                        </button>
                    </div>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-900 border-b border-white/10 shadow-md">
                                <tr className="text-slate-400 text-xs">
                                    <th className="p-5 font-semibold tracking-wider">PHONE NUMBER</th>
                                    <th className="p-5 font-semibold tracking-wider">RESULT</th>
                                    <th className="p-5 font-semibold tracking-wider text-right">CONFIDENCE</th>
                                    <th className="p-5 font-semibold tracking-wider">RISK LEVEL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {batchResults.map((record, index) => (
                                    <tr key={index} className="hover:bg-cyber-blue/5 transition-colors duration-200">
                                        <td className="p-5 font-mono text-slate-200">{record.phone_number}</td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 font-semibold">
                                                {getRiskIcon(record.label)}
                                                <span className={getRiskColor(record.label)}>{record.label}</span>
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Detector;
