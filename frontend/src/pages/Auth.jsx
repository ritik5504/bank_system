import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowRight, UserPlus, LogIn, KeyRound } from 'lucide-react';
import './Auth.css';

export const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [otpMode, setOtpMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, registerInit, registerVerify } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (isLogin) {
            // STEP 1: DIRECT LOGIN (No OTP)
            const success = await login(email, password);
            if (success) navigate('/dashboard');
        } else {
            // REGISTRATION FLOW
            if (!otpMode) {
                // STEP 1: INITIALIZE REGISTRATION (Send OTP)
                const result = await registerInit(name, email, password);
                if (result.success) {
                    setOtpMode(true);
                }
            } else {
                // STEP 2: VERIFY REGISTRATION OTP
                const result = await registerVerify(name, email, password, otp);
                if (result.success) {
                    setIsLogin(true);
                    setOtpMode(false);
                    setPassword('');
                    setOtp('');
                }
            }
        }

        setLoading(false);
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setOtpMode(false);
        setOtp('');
    };

    const handleResendOtp = async () => {
        setLoading(true);
        if (!isLogin) {
            await registerInit(name, email, password);
        }
        setLoading(false);
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
                        {otpMode ? <KeyRound size={32} /> : <Landmark size={32} />}
                    </div>
                    <h2>
                        {otpMode ? 'Verify OTP' : isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-muted">
                        {otpMode 
                            ? 'Enter the 6-digit verification code sent to your email'
                            : isLogin
                                ? 'Enter your credentials to access your account'
                                : 'Sign up to get started with next-generation banking'
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-fields">
                        
                        {!otpMode ? (
                            <>
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
                                    <label className="form-label">Email Address {isLogin && '/ Customer ID'}</label>
                                    <input
                                        type="text"
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
                                        pattern={!isLogin ? "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{6,}$" : undefined}
                                        title={!isLogin ? "Password must contain at least 6 characters, including a number and a letter." : undefined}
                                        disabled={loading}
                                    />
                                    {!isLogin && (
                                        <p className="text-muted mt-2" style={{ fontSize: '0.75rem' }}>
                                            Must be at least 6 characters, including a number and a letter.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="form-group slide-in text-center">
                                <label className="form-label">6-Digit OTP</label>
                                <input
                                    type="text"
                                    className="form-input text-center"
                                    placeholder="------"
                                    style={{ letterSpacing: '8px', fontSize: '1.5rem', padding: '15px' }}
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    required
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                        )}

                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full submit-btn"
                        disabled={loading || (otpMode && otp.length < 6)}
                    >
                        {loading ? (
                            <span className="spinner"></span>
                        ) : otpMode ? (
                            <><KeyRound size={18} /> Verify & Continue</>
                        ) : isLogin ? (
                            <><LogIn size={18} /> Sign In</>
                        ) : (
                            <><UserPlus size={18} /> Request OTP</>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    {otpMode ? (
                        <>
                            <p className="text-muted">Didn't receive the code?</p>
                            <button
                                type="button"
                                className="toggle-btn text-gradient"
                                onClick={handleResendOtp}
                                disabled={loading}
                            >
                                Resend OTP
                            </button>
                            <br/>
                            <button
                                type="button"
                                className="toggle-btn text-muted mt-2"
                                style={{fontSize: '0.8rem'}}
                                onClick={() => setOtpMode(false)}
                                disabled={loading}
                            >
                                Back to Registration
                            </button>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
