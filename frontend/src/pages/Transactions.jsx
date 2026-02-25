import { useState, useEffect } from 'react';
import api from '@/services/api';
import { PageLoader, DataTable } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/utils';

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/features/transactions');
            setTransactions(response.data.transactions || []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'product_name',
            label: 'Vehicle',
            render: (_, row) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center flex-shrink-0">
                        {row.product_image ? (
                            <img
                                src={`${import.meta.env.VITE_API_URL || '/api'}/uploads/${row.product_image}`}
                                alt={row.product_name}
                                className="w-full h-full object-cover rounded-xl"
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <i className="fas fa-car text-sm text-slate-300"></i>
                        )}
                    </div>
                    <span className="font-semibold text-slate-900">{row.product_name}</span>
                </div>
            )
        },
        {
            key: 'amount',
            label: 'Winning Bid',
            render: (val) => <span className="font-bold font-display text-accent">{formatCurrency(val)}</span>
        },
        {
            key: 'transaction_date',
            label: 'Date',
            render: (val) => <span className="text-slate-500 text-sm font-medium">{formatDateTime(val)}</span>
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${val === 'won' ? 'bg-success/10 text-success' :
                        val === 'completed' ? 'bg-blue-100 text-blue-600' :
                            'bg-slate-100 text-slate-500'
                    }`}>
                    {val}
                </span>
            )
        }
    ];

    if (loading) return <PageLoader />;

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Transactions</h1>
                    <p className="page-subtitle">Vehicles you have won and corresponding payment status</p>
                </div>
            </div>

            <div className="card w-full max-w-5xl rounded-2xl shadow-sm border border-slate-200 overflow-hidden bg-white">
                <DataTable
                    columns={columns}
                    data={transactions}
                    emptyMessage="No transactions found."
                />
            </div>
        </div>
    );
}
