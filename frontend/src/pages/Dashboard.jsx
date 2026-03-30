import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { AccountsTab } from '../components/dashboard/AccountsTab';
import { TransferTab } from '../components/dashboard/TransferTab';
import { TransactionsTab } from '../components/dashboard/TransactionsTab';
import { CreditCard, Send, History } from 'lucide-react';
import './Dashboard.css';

export const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('accounts');

    const renderTab = () => {
        switch (activeTab) {
            case 'accounts': return <AccountsTab />;
            case 'transfer': return <TransferTab />;
            case 'transactions': return <TransactionsTab />;
            default: return <AccountsTab />;
        }
    };

    return (
        <div className="dashboard-container">
            <div className="bg-blobs">
                <div className="blob-1"></div>
                <div className="blob-2"></div>
            </div>
            
            <Navbar />

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Welcome to Your Dashboard</h2>
                    <p className="text-muted">Manage your finances elegantly and securely.</p>
                </div>

                <div className="tabs-container surface-panel">
                    <div className="tabs-list">
                        <button
                            className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
                            onClick={() => setActiveTab('accounts')}
                        >
                            <CreditCard size={18} />
                            Accounts
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'transfer' ? 'active' : ''}`}
                            onClick={() => setActiveTab('transfer')}
                        >
                            <Send size={18} />
                            Transfer
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            <History size={18} />
                            History
                        </button>
                    </div>
                </div>

                <div className="tab-content-wrapper fade-in">
                    {renderTab()}
                </div>
            </main>
        </div>
    );
};
