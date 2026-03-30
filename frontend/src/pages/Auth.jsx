import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import './Auth.css';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let success = false;
        if (isLogin) {
            success = await login(email, password);
            if (success) navigate('/dashboard');
        } else {
            const result = await register(name, email, password);
            if (result.success) {
                setIsLogin(true);
                setPassword('');
            }
        }

        setLoading(false);
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        // Reset form errors/state if needed here
    };

    return (
        <div className="auth-container">
            <div className="bg-blobs">
                <div className="blob-1"></div>
                <div className="blob-2"></div>
            </div>

            <div className="auth-box surface-panel">
                <div className="auth-header">
                    <div className="logo-icon">
                        <Landmark size={32} />
                    </div>
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-muted">
                        {isLogin
                            ? 'Enter your credentials to access your account'
                            : 'Sign up to get started with next-generation banking'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-fields">
                        {!isLogin && (
                            <div className="form-group slide-in">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                    disabled={loading}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                disabled={loading}
                            />
                            {!isLogin && (
                                <p className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                                    Must be at least 6 characters
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full submit-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner"></span>
                        ) : isLogin ? (
                            <><LogIn size={18} /> Sign In</>
                        ) : (
                            <><UserPlus size={18} /> Create Account</>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="text-muted">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                        type="button"
                        className="toggle-btn text-gradient"
                        onClick={toggleMode}
                        disabled={loading}
                    >
                        {isLogin ? 'Sign up' : 'Sign in'} <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
