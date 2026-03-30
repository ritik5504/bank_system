import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ size = 24, className = '', text = '' }) => {
    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <Loader2
                size={size}
                className="animate-spin text-primary"
                style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }}
            />
            {text && <p className="text-muted text-sm" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{text}</p>}
        </div>
    );
};

// Add keyframes for the spinner since we aren't using Tailwind
const style = document.createElement('style');
style.innerHTML = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
