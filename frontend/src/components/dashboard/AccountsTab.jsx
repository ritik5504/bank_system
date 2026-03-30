import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../Toast';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../Loader';
import { Plus, CreditCard, RefreshCw, Wallet, Copy, CheckCircle, Trash2 } from 'lucide-react';
import './Tabs.css';

export const AccountsTab = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [initialAmount, setInitialAmount] = useState('');
    const [creating, setCreating] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const { addToast } = useToast();
    const { user } = useAuth();

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const data = await api.get('/accounts');
            const rawAccounts = data.accounts || data || [];

            // Fetch balance for each account individually
            const accountsWithBalances = await Promise.all(
                rawAccounts.map(async (account) => {
                    try {
                        const balanceData = await api.get(`/accounts/balance/${account._id || account.id}`);
                        return { ...account, balance: balanceData.balance || 0 };
                    } catch (error) {
                        console.warn(`Could not fetch balance for account ${account._id}:`, error);
                        return { ...account, balance: 0 };
                    }
                })
            );

            setAccounts(accountsWithBalances);
        } catch (error) {
            addToast(error.message || 'Failed to load accounts', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        const amount = parseFloat(initialAmount) || 0;

        if (amount < 0) {
            addToast('Amount cannot be negative', 'error');
            return;
        }

        setCreating(true);
        try {
            const data = await api.post('/accounts', { initialAmount: amount });
            const newAccountId = data.account?._id || data.account?.id;
            addToast(`Account created! ID: #${newAccountId?.toString().slice(-8) || 'N/A'} ${amount > 0 ? `with $${amount.toFixed(2)}` : ''}`, 'success', 8000);
            setShowModal(false);
            setInitialAmount('');
            fetchAccounts();
        } catch (error) {
            addToast(error.message || 'Failed to create account', 'error');
        } finally {
            setCreating(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDeleteAccount = async (accountId) => {
        setDeleting(true);
        try {
            await api.delete(`/accounts/${accountId}`);
            addToast('Account closed successfully', 'success');
            setDeleteConfirm(null);
            fetchAccounts();
        } catch (error) {
            addToast(error.message || 'Failed to delete account', 'error');
        } finally {
            setDeleting(false);
        }
    };

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    return (
        <div className="tab-section">
            {/* User Info Banner */}
            {user && (
                <div className="user-banner glass-panel">
                    <div className="user-banner-left">
                        <div className="user-avatar">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{user.name}</h3>
                            <p className="text-muted text-sm">{user.email}</p>
                            {user.customerId && (
                                <div className="customer-id-badge" onClick={() => copyToClipboard(user.customerId)}>
                                    <span className="text-xs font-mono">Customer ID: {user.customerId}</span>
                                    {copiedId === user.customerId ? <CheckCircle size={14} className="text-success" /> : <Copy size={14} />}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="total-balance-box">
                        <p className="text-muted text-xs uppercase tracking-wider font-semibold">Total Balance</p>
                        <p className="total-balance-value">${totalBalance.toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Section Header */}
            <div className="section-title">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <CreditCard className="text-primary" /> Your Accounts
                    </h3>
                    <p className="text-muted text-sm mt-1">Manage all your active bank accounts</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchAccounts} className="btn btn-secondary" title="Refresh" disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                        <Plus size={18} /> New Account
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-12"><Loader text="Loading accounts..." /></div>
            ) : accounts.length === 0 ? (
                <div className="empty-state glass-panel">
                    <Wallet size={48} className="text-muted mb-4 opacity-50" />
                    <h4 className="text-lg font-semibold mb-2">No accounts yet</h4>
                    <p className="text-muted mb-6">Create your first account to start managing your funds.</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary">
                        <Plus size={18} /> Create Account
                    </button>
                </div>
            ) : (
                <div className="grid-cards">
                    {accounts.map((account, index) => {
                        const accountId = (account._id || account.id || '').toString();
                        const balance = account.balance || 0;
                        const createdDate = account.createdAt
                            ? new Date(account.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                            : 'N/A';

                        return (
                            <div key={accountId} className="account-card glass-panel hover-glow" style={{ animationDelay: `${index * 0.1}s` }}>
                                {/* Card Header */}
                                <div className="account-card-header">
                                    <div className="card-icon">
                                        <CreditCard size={22} />
                                    </div>
                                    <span className={`status-badge ${(account.status || 'active').toLowerCase()}`}>
                                        {account.status || 'Active'}
                                    </span>
                                </div>

                                {/* Balance */}
                                <div className="account-balance-section">
                                    <p className="text-muted text-xs uppercase tracking-wider font-semibold">Available Balance</p>
                                    <p className="account-balance-value">
                                        <span className="currency-symbol">$</span>
                                        {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {/* Account Details */}
                                <div className="account-details-row">
                                    <div className="account-detail">
                                        <p className="text-muted text-xs">Account ID</p>
                                        <div className="account-id-chip" onClick={() => copyToClipboard(accountId)}>
                                            <span className="font-mono text-sm">#{accountId.slice(-8)}</span>
                                            {copiedId === accountId ? <CheckCircle size={12} className="text-success" /> : <Copy size={12} />}
                                        </div>
                                    </div>
                                    <div className="account-detail" style={{ textAlign: 'right' }}>
                                        <p className="text-muted text-xs">Created</p>
                                        <p className="text-sm font-semibold">{createdDate}</p>
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                    className="btn-delete-account"
                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(accountId); }}
                                    title="Close this account"
                                >
                                    <Trash2 size={14} /> Close Account
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Account Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal glass-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-xl font-bold">💰 Create New Account</h3>
                            <p className="text-muted text-sm">Your new account will be created instantly</p>
                        </div>
                        <form onSubmit={handleCreateAccount} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Initial Deposit (Optional)</label>
                                <div className="input-with-prefix">
                                    <span className="input-prefix">$</span>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        value={initialAmount}
                                        onChange={(e) => setInitialAmount(e.target.value)}
                                        disabled={creating}
                                        style={{ paddingLeft: '2rem' }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? <Loader size={18} /> : <><Plus size={18} /> Create Account</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal glass-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                            <h3 className="text-xl font-bold" style={{ color: 'var(--danger)' }}>⚠️ Close Account</h3>
                            <p className="text-muted text-sm">This action cannot be undone</p>
                        </div>
                        <div className="modal-body">
                            <p className="text-sm mb-4" style={{ lineHeight: '1.6' }}>
                                Are you sure you want to close account <strong>#{deleteConfirm.slice(-8)}</strong>?
                                The account must have a $0.00 balance before it can be closed.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                                    Cancel
                                </button>
                                <button className="btn btn-danger" onClick={() => handleDeleteAccount(deleteConfirm)} disabled={deleting}>
                                    {deleting ? <Loader size={18} /> : <><Trash2 size={16} /> Yes, Close Account</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
