import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Landing = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (user) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/auth', { replace: true });
            }
        }, 2000); // 2-second splash screen
        
        return () => clearTimeout(timer);
    }, [navigate, user]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '20px', textAlign: 'center', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>Welcome to LedgerX</h1>
                <p style={{ fontSize: '1.2rem', opacity: 0.9, margin: 0 }}>Secure, Fast, Premium Banking.</p>
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: 'white', animation: 'spin 1s ease-in-out infinite' }} />
                </div>
            </div>
            <style>
                {`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};
