import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(2);

        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onDismiss }) => {
    const icons = {
        success: <CheckCircle className="toast-icon success" size={20} />,
        error: <AlertCircle className="toast-icon error" size={20} />,
        info: <Info className="toast-icon info" size={20} />
    };

    return (
        <div className={`toast-item toast-${toast.type}`}>
            {icons[toast.type] || icons.info}
            <p className="toast-message">{toast.message}</p>
            <button onClick={onDismiss} className="toast-close">
                <X size={16} />
            </button>
        </div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
