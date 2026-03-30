import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Landmark } from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar-container glass-panel">
            <div className="navbar-content">
                <div className="navbar-brand">
                    <div className="logo-container">
                        <Landmark size={28} className="text-primary" />
                    </div>
                    <h1>LedgerX</h1>
                </div>

                {user && (
                    <div className="navbar-user">
                        <div className="user-details">
                            <span className="user-name">{user.name || 'User'}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                        <button onClick={logout} className="logout-btn btn btn-danger">
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};
