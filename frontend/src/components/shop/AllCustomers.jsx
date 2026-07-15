import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Search, Users, Eye } from 'lucide-react';
import axiosClient from '../../api/auth';
import CustomerListItem from './AllCustomers/CustomerListItem';
import CustomerDetailPanel from './AllCustomers/CustomerDetailPanel';
import { formatCurrency } from './AllCustomers/utils';

// ═══════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showDetail, setShowDetail] = useState(false); // mobile panel toggle
    const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'clear', 'due'

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/khata/customer');
            setCustomers(response.data.customers || response.data || []);
        } catch (err) {
            console.error('Error fetching customers:', err);
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const dueCount = useMemo(() => customers.filter(c => (c.currentBalance || 0) > 0).length, [customers]);
    const clearCount = useMemo(() => customers.filter(c => (c.currentBalance || 0) <= 0).length, [customers]);

    const filteredCustomers = useMemo(() => {
        let list = customers;

        if (paymentFilter === 'clear') {
            list = list.filter(c => (c.currentBalance || 0) <= 0);
        } else if (paymentFilter === 'due') {
            list = list.filter(c => (c.currentBalance || 0) > 0);
        }

        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.phone?.includes(q) ||
            c.email?.toLowerCase().includes(q)
        );
    }, [customers, searchTerm, paymentFilter]);

    const totalOutstanding = useMemo(() =>
        customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0),
        [customers]
    );

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setShowDetail(true); // for mobile
    };

    const handleBack = () => {
        setShowDetail(false);
    };

    // ─── Loading State ─────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3 animate-pulse">
                        <Users size={24} className="text-indigo-500" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Loading customers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
            <Toaster position="top-center" />

            {/* ═══ LEFT PANEL — Customer List ═══ */}
            <div className={`
                w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col bg-white border-r border-gray-100
                h-full
                ${showDetail ? 'hidden lg:flex' : 'flex'}
            `}>
                {/* Header */}
                <div className="px-4 pt-5 pb-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Khata</h1>
                        </div>
                        {totalOutstanding > 0 && (
                            <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-1.5 text-right">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Outstanding</p>
                                <p className="text-sm font-bold text-rose-600">{formatCurrency(totalOutstanding)}</p>
                            </div>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition placeholder:text-gray-400"
                            id="customer-search"
                        />
                    </div>

                    {/* Payment Status Filter */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                        {[
                            { key: 'all', label: 'All', count: customers.length },
                            { key: 'due', label: 'Pending Due', count: dueCount },
                            { key: 'clear', label: 'Clear', count: clearCount },
                        ].map(f => {
                            const isActive = paymentFilter === f.key;
                            let activeClass = '';
                            if (isActive) {
                                if (f.key === 'due') {
                                    activeClass = 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-100';
                                } else if (f.key === 'clear') {
                                    activeClass = 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-100';
                                } else {
                                    activeClass = 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100';
                                }
                            } else {
                                activeClass = 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50';
                            }
                            return (
                                <button
                                    key={f.key}
                                    onClick={() => setPaymentFilter(f.key)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 ${activeClass}`}
                                    id={`customer-filter-${f.key}`}
                                >
                                    <span>{f.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {f.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Customer list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                            <CustomerListItem
                                key={customer._id}
                                customer={customer}
                                isActive={selectedCustomer?._id === customer._id}
                                onClick={() => handleSelectCustomer(customer)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                <Users size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">
                                {searchTerm ? 'No customers found' : 'No customers yet'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {searchTerm ? 'Try a different search' : 'Create a bill to add customers'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ RIGHT PANEL — Customer Detail ═══ */}
            <div className={`
                flex-1 h-full overflow-hidden
                ${!showDetail ? 'hidden lg:block' : 'block'}
            `}>
                {selectedCustomer ? (
                    <CustomerDetailPanel
                        customer={selectedCustomer}
                        onBack={handleBack}
                        onCustomerUpdated={fetchCustomers}
                    />
                ) : (
                    /* Empty state — desktop only */
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center max-w-xs">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-5">
                                <Eye size={32} className="text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Select a Customer</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Choose a customer from the list to view their complete bill history, payment details, and financial summary.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomersPage;