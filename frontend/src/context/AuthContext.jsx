import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('__bank_auth_token');
        const storedUser = localStorage.getItem('__bank_user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('__bank_auth_token');
                localStorage.removeItem('__bank_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await api.post('/auth/login', { email, password });
            const token = data.token || data.accessToken;

            if (token && data.user) {
                localStorage.setItem('__bank_auth_token', token);
                localStorage.setItem('__bank_user', JSON.stringify(data.user));
                setUser(data.user);
                addToast('Successfully signed in!', 'success');
                return true;
            } else {
                addToast('Invalid login response from server', 'error');
                return false;
            }
        } catch (error) {
            addToast(error.message || 'Login failed', 'error');
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const data = await api.post('/auth/register', { name, email, password });
            const customerId = data.user?.customerId;
            if (customerId) {
                addToast(`Registration successful! Your Customer ID: ${customerId}`, 'success', 10000);
            } else {
                addToast('Registration successful! Please sign in.', 'success');
            }
            return { success: true, customerId };
        } catch (error) {
            addToast(error.message || 'Registration failed', 'error');
            return { success: false };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout API error", error);
        } finally {
            localStorage.removeItem('__bank_auth_token');
            localStorage.removeItem('__bank_user');
            setUser(null);
            addToast('Successfully logged out', 'info');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
