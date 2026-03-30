import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../Toast';
import { Loader } from '../Loader';
import { Send, ArrowDownUp } from 'lucide-react';

export const TransferTab = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transferring, setTransferring] = useState(false);
    const { addToast } = useToast();

    const [fromAccount, setFromAccount] = useState('');
    const [toAccount, setToAccount] = useState('');
    const [amount, setAmount] = useState('');

    const fetchAccounts = async () => {
        try {
            const data = await api.get('/accounts');
            const rawAccounts = data.accounts || data || [];

            // Fetch balance for each account
            const accountsWithBalances = await Promise.all(
                rawAccounts.map(async (account) => {
                    try {
                        const balanceData = await api.get(`/accounts/balance/${account._id || account.id}`);
                        return { ...account, balance: balanceData.balance || 0 };
                    } catch (error) {
                        return { ...account, balance: 0 };
                    }
                })
            );

            setAccounts(accountsWithBalances);
        } catch (error) {
            addToast('Failed to load accounts for transfer', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();

        if (!fromAccount || !toAccount || !amount) {
            addToast('Please fill in all fields', 'error');
            return;
        }

        if (fromAccount === toAccount) {
            addToast('Cannot transfer to the same account', 'error');
            return;
        }

        const transferAmount = parseFloat(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            addToast('Amount must be greater than 0', 'error');
            return;
        }

        setTransferring(true);
        try {
            const idempotencyKey = `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            await api.post('/transactions', {
                fromAccount,
                toAccount,
                amount: transferAmount,
                idempotencyKey
            });

            addToast('Transfer completed successfully!', 'success');
            setFromAccount('');
            setToAccount('');
            setAmount('');
            fetchAccounts(); // refresh balances
        } catch (error) {
            addToast(error.message || 'Transfer failed', 'error');
        } finally {
            setTransferring(false);
        }
    };

    if (loading) return <div className="py-12"><Loader text="Loading transfer options..." /></div>;

    if (accounts.length === 0) {
        return (
            <div className="empty-state glass-panel">
                <Send size={48} className="text-muted mb-4 opacity-50" />
                <h4 className="text-lg font-semibold mb-2">No accounts available</h4>
                <p className="text-muted">You need at least one account to perform transfers.</p>
            </div>
        );
    }

    return (
        <div className="tab-section">
            <div className="section-title mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Send className="text-secondary" /> Transfer Funds
                    </h3>
                    <p className="text-muted text-sm mt-1">Move money securely between generic accounts</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="glass-panel p-6 flex-1" style={{ maxWidth: '600px' }}>
                    <form onSubmit={handleTransfer}>

                        <div className="form-group">
                            <label className="form-label">Transfer From</label>
                            <select
                                className="form-input"
                                value={fromAccount}
                                onChange={(e) => setFromAccount(e.target.value)}
                                required
                                disabled={transferring}
                            >
                                <option value="">Select source account</option>
                                {accounts.map(acc => (
                                    <option key={acc._id || acc.id} value={acc._id || acc.id}>
                                        Account #${(acc._id || acc.id).toString().slice(-8)} - Available: ${(acc.balance || 0).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-center my-2">
                            <div className="bg-white/10 p-2 rounded-full border border-white/5">
                                <ArrowDownUp size={20} className="text-muted" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Transfer To</label>
                            <select
                                className="form-input"
                                value={toAccount}
                                onChange={(e) => setToAccount(e.target.value)}
                                required
                                disabled={transferring}
                            >
                                <option value="">Select destination account ID</option>
                                {/* Normally allowing any valid account ID, but for simplicity showing owned accounts here */}
                                {accounts.map(acc => (
                                    <option key={acc._id || acc.id} value={acc._id || acc.id}>
                                        Account #${(acc._id || acc.id).toString().slice(-8)}
                                    </option>
                                ))}
                            </select>
                            <p className="text-muted mt-1 text-xs">Note: Using your own accounts for demo</p>
                        </div>

                        <div className="form-group mb-6">
                            <label className="form-label">Amount</label>
                            <div className="input-with-prefix">
                                <span className="input-prefix">$</span>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    disabled={transferring}
                                    style={{ paddingLeft: '2rem' }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full p-3 text-lg"
                            disabled={transferring}
                            style={{ width: '100%', padding: '0.75rem', fontSize: '1.125rem' }}
                        >
                            {transferring ? <Loader size={20} /> : 'Complete Transfer'}
                        </button>
                    </form>
                </div>

                {/* Info panel */}
                <div className="hidden md:flex flex-col gap-4 flex-1">
                    <div className="glass-panel p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20" style={{ background: 'linear-gradient(to bottom right, rgba(74, 222, 128, 0.1), transparent)', borderColor: 'rgba(74, 222, 128, 0.2)' }}>
                        <h4 className="font-bold text-lg mb-2 text-primary">Secure Transfers</h4>
                        <p className="text-sm text-muted leading-relaxed">
                            All transfers are processed securely using modern cryptography and idempotent requests to prevent duplicate transactions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
