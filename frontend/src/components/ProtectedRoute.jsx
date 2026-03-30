import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader size={40} text="Loading your data..." />
            </div>
        );
    }

    if (!user) {
        // Redirect to login page, but save current location they were trying to go to
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
};
