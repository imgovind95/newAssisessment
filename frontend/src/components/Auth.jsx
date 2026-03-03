import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                const formDataUrlEncoded = new URLSearchParams();
                formDataUrlEncoded.append('username', formData.username);
                formDataUrlEncoded.append('password', formData.password);

                const res = await fetch('http://localhost:8001/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formDataUrlEncoded
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || 'Login failed');
                }
                const data = await res.json();

                // For simplicity, defining admin based on username matching first user or specific names
                // In a real app, this should come from a /me endpoint checking the JWT
                const mockUser = {
                    username: formData.username,
                    is_admin: formData.username === 'admin' || formData.username === 'testuser',
                    token: data.access_token
                };
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(mockUser));
                toast.success('Access Granted');
                onLogin(mockUser);
            } else {
                const res = await fetch('http://localhost:8001/api/v1/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password
                    })
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || 'Registration failed');
                }

                setIsLogin(true);
                toast.success('Registration successful! Please login.');
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative max-w-md mx-auto py-16 animate-in fade-in zoom-in-95 duration-700">
            {/* Subtle background gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyber-blue/5 to-transparent rounded-3xl blur-2xl -z-10"></div>

            <div className="cyber-card">
                <div className="mb-8 text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {isLogin ? 'Enter your credentials to access the system' : 'Sign up for secure, AI-powered call analysis'}
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Email Address</label>
                            <input
                                type="email"
                                className="cyber-input"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Username</label>
                        <input
                            type="text"
                            className="cyber-input"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Password</label>
                        <input
                            type="password"
                            className="cyber-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="w-full cyber-button cyber-button-primary mt-6 py-3 shadow-md">
                        {isLogin ? 'Sign In' : 'Register'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-cyber-blue font-medium hover:text-cyber-neon hover:underline transition-colors"
                    >
                        {isLogin ? 'Create one' : 'Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
