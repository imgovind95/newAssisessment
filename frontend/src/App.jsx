import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Shield, LayoutDashboard, History, LogOut, User as UserIcon } from 'lucide-react';
import Detector from './components/Detector';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import HistoryPanel from './components/HistoryPanel';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [view, setView] = useState('home'); // home, history, admin, auth

  return (
    <div className="min-h-screen bg-cyber-dark text-white font-sans">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1c1c21', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      }} />

      {/* Navigation */}
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-cyber-dark/90 backdrop-blur-xl z-50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div
            className="text-xl font-bold tracking-tight text-white cursor-pointer flex items-center gap-2.5 transition-transform hover:scale-105"
            onClick={() => setView('home')}
          >
            <Shield className="w-6 h-6 text-cyber-blue" />
            <span>Fraud Detector</span>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setView('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${view === 'home' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Shield className="w-4 h-4" /> Analyzer
            </button>

            {user && (
              <button
                onClick={() => setView('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${view === 'history' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <History className="w-4 h-4" /> History
              </button>
            )}

            {user?.is_admin && (
              <button
                onClick={() => setView('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${view === 'admin' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Admin Panel
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-4 ml-2 border-l border-white/10 pl-6">
                <span className="text-slate-300 flex items-center gap-2 text-sm font-medium">
                  <UserIcon className="w-4 h-4 text-slate-400" /> {user.username}
                </span>
                <button
                  onClick={() => {
                    setUser(null);
                    setView('home');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 text-slate-300 hover:bg-cyber-fraud/10 hover:text-cyber-fraud hover:border-cyber-fraud/50 transition-all duration-200 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="ml-2 pl-6 border-l border-white/10">
                <button
                  onClick={() => setView('auth')}
                  className="cyber-button cyber-button-primary text-sm shadow-sm"
                >
                  Login / Register
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {view === 'home' && <Detector user={user} setView={setView} />}
        {view === 'history' && <HistoryPanel user={user} />}
        {view === 'auth' && <Auth onLogin={(u) => { setUser(u); setView('home'); }} />}
        {view === 'admin' && <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Fraud & Spam Call Detector. All Rights Reserved.</p>
        <div className="mt-2 text-slate-600 font-medium">Secure • Encrypted • AI Powered</div>
      </footer>
    </div>
  );
}

export default App;
