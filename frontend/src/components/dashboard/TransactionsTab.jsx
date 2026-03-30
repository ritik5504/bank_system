import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../Toast';
import { Loader } from '../Loader';
import { History, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

export const TransactionsTab = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const data = await api.get('/transactions');
            setTransactions(data.transactions || data || []);
        } catch (error) {
            if (error.status === 404) {
                setTransactions([]); // Endpoint might not exist yet based on vanilla js comments
            } else {
                addToast(error.message || 'Failed to load transaction history', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <div className="tab-section">
            <div className="section-title mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <History className="text-accent" style={{ color: 'var(--accent)' }} /> Transaction History
                    </h3>
                    <p className="text-muted text-sm mt-1">Review your recent financial activities</p>
                </div>
                <button onClick={fetchTransactions} className="btn btn-secondary p-2" title="Refresh" disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {loading ? (
                <div className="py-12"><Loader text="Loading transactions..." /></div>
            ) : transactions.length === 0 ? (
                <div className="empty-state glass-panel">
                    <History size={48} className="text-muted mb-4 opacity-50" />
                    <h4 className="text-lg font-semibold mb-2">No transaction history</h4>
                    <p className="text-muted">You haven't made any transactions yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {transactions.map(txn => {
                        const isCredit = txn.type === 'CREDIT';
                        const date = new Date(txn.createdAt).toLocaleString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        });
                        const amountStr = `$${(txn.amount || 0).toFixed(2)}`;
                        const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;

                        return (
                            <div key={txn._id} className="glass-panel hover-glow flex items-center justify-between p-4" style={{ padding: '1rem' }}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${isCredit ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`} style={{ backgroundColor: isCredit ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isCredit ? 'var(--primary)' : 'var(--danger)' }}>
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{isCredit ? 'Received Funds' : 'Sent Funds'}</h4>
                                        <p className="text-xs text-muted mt-1">{date} • Ref: {txn._id.toString().slice(-6)}</p>
                                    </div>
                                </div>
                                <div className={`text-lg font-bold ${isCredit ? 'text-success' : 'text-danger'}`} style={{ color: isCredit ? 'var(--primary)' : 'var(--danger)' }}>
                                    {isCredit ? '+' : '-'}{amountStr}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
