import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
    Search, Phone, Mail, MapPin, User, ChevronRight,
    ChevronDown, ChevronUp, ArrowLeft, Calendar,
    IndianRupee, Receipt, CreditCard, Clock, CheckCircle2,
    AlertCircle, Filter, Package, Hash, TrendingUp, TrendingDown,
    Wallet, Users, Eye
} from 'lucide-react';
import axiosClient from '../../api/auth';

// ─── Utilities ──────────────────────────────────────────────
const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount || 0);

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch { return 'Invalid Date'; }
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch { return 'Invalid Date'; }
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
    const colors = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-indigo-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
        'from-cyan-500 to-blue-600',
        'from-fuchsia-500 to-purple-600',
        'from-lime-500 to-green-600',
    ];
    const idx = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[idx % colors.length];
};

const statusConfig = {
    paid: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Paid' },
    pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
    partial: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle, label: 'Partial' },
};

const paymentMethodIcons = {
    cash: '💵', card: '💳', upi: '📱', bank_transfer: '🏦', credit: '📝'
};

// ─── Bill Item Row ──────────────────────────────────────────
const BillItemRow = ({ item, index }) => {
    const base = item.price * item.quantity;
    const disc = base * ((item.discount || 0) / 100);
    const afterDisc = base - disc;
    const tax = afterDisc * ((item.taxRate || 0) / 100);
    const total = afterDisc + tax;

    return (
        <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
            <td className="px-3 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <Package size={13} className="text-indigo-500" />
                    </div>
                    <span className="font-medium text-gray-800 truncate">{item.productName}</span>
                </div>
            </td>
            <td className="px-3 py-2.5 text-sm text-center text-gray-600">
                {item.quantity} <span className="text-xs text-gray-400">{item.unit || 'pcs'}</span>
            </td>
            <td className="px-3 py-2.5 text-sm text-right text-gray-700">{formatCurrency(item.price)}</td>
            <td className="px-3 py-2.5 text-sm text-right font-semibold text-gray-900">{formatCurrency(total)}</td>
        </tr>
    );
};

// ─── Expandable Bill Card ───────────────────────────────────
const BillCard = ({ bill }) => {
    const [expanded, setExpanded] = useState(false);
    const status = statusConfig[bill.paymentStatus] || statusConfig.pending;
    const StatusIcon = status.icon;
    const remaining = (bill.grandTotal || 0) - (bill.amountPaid || 0);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        >
            {/* Bill Header — always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-left p-4 flex items-center gap-3 focus:outline-none"
                id={`bill-toggle-${bill._id}`}
            >
                {/* Status dot */}
                <div className={`w-10 h-10 rounded-xl ${status.color} border flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon size={18} />
                </div>

                {/* Bill info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(bill.grandTotal)}
                        </span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${status.color} border`}>
                            {status.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Hash size={11} /> {bill.billNumber?.slice(-10) || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar size={11} /> {formatDate(bill.billDate)}
                        </span>
                    </div>
                </div>

                {/* Remaining & chevron */}
                <div className="text-right flex-shrink-0">
                    {remaining > 0 && (
                        <p className="text-xs font-medium text-rose-600">
                            Due: {formatCurrency(remaining)}
                        </p>
                    )}
                    {expanded ? <ChevronUp size={18} className="text-gray-400 mt-1" /> : <ChevronDown size={18} className="text-gray-400 mt-1" />}
                </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            {/* Payment summary strip */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Total</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">{formatCurrency(bill.grandTotal)}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-medium">Paid</p>
                                    <p className="text-sm font-bold text-emerald-700 mt-0.5">{formatCurrency(bill.amountPaid)}</p>
                                </div>
                                <div className={`rounded-xl p-2.5 text-center ${remaining > 0 ? 'bg-rose-50' : 'bg-gray-50'}`}>
                                    <p className={`text-[10px] uppercase tracking-wider font-medium ${remaining > 0 ? 'text-rose-600' : 'text-gray-500'}`}>Due</p>
                                    <p className={`text-sm font-bold mt-0.5 ${remaining > 0 ? 'text-rose-700' : 'text-gray-700'}`}>{formatCurrency(remaining)}</p>
                                </div>
                            </div>

                            {/* Payment method + discount */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 px-1">
                                <span className="flex items-center gap-1">
                                    {paymentMethodIcons[bill.paymentMethod] || '💰'} {(bill.paymentMethod || 'cash').replace('_', ' ')}
                                </span>
                                {(bill.discount || 0) > 0 && (
                                    <span className="text-emerald-600">Discount: {formatCurrency(bill.discount)}</span>
                                )}
                                {(bill.deliveryCharge || 0) > 0 && (
                                    <span>Delivery: {formatCurrency(bill.deliveryCharge)}</span>
                                )}
                            </div>

                            {/* Items table */}
                            {bill.items && bill.items.length > 0 && (
                                <div className="rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                                                    <th className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                                    <th className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Price</th>
                                                    <th className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {bill.items.map((item, idx) => (
                                                    <BillItemRow key={idx} item={item} index={idx} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {bill.notes && (
                                <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800">
                                    <span className="font-medium">Note:</span> {bill.notes}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Customer List Item ─────────────────────────────────────
const CustomerListItem = ({ customer, isActive, onClick }) => {
    const balance = customer.currentBalance || 0;
    const avatarGrad = getAvatarColor(customer.name);

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center gap-3 group
                ${isActive
                    ? 'bg-indigo-50 border-2 border-indigo-400 shadow-md shadow-indigo-100'
                    : 'bg-white border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm'
                }`}
            id={`customer-${customer._id}`}
        >
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className="text-white text-sm font-bold">{getInitials(customer.name)}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>
                    {customer.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    {customer.phone && (
                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                            <Phone size={10} /> {customer.phone}
                        </span>
                    )}
                </div>
            </div>

            {/* Balance badge + arrow */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {balance > 0 ? (
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                        ₹{balance.toLocaleString('en-IN')}
                    </span>
                ) : (
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                        Clear
                    </span>
                )}
                <ChevronRight size={16} className={`transition-transform ${isActive ? 'text-indigo-500 translate-x-0.5' : 'text-gray-300 group-hover:text-indigo-400'}`} />
            </div>
        </motion.button>
    );
};

// ─── Customer Detail Panel ──────────────────────────────────
const CustomerDetailPanel = ({ customer, onBack }) => {
    const [bills, setBills] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!customer?._id) return;
        setLoading(true);
        setStatusFilter('all');
        axiosClient.get(`/khata/customer/${customer._id}/bills`)
            .then(res => {
                setBills(res.data.bills || []);
                setSummary(res.data.summary || null);
            })
            .catch(err => {
                console.error('Error fetching customer bills:', err);
                toast.error('Failed to load bills');
                setBills([]);
                setSummary(null);
            })
            .finally(() => setLoading(false));
    }, [customer?._id]);

    const filteredBills = useMemo(() => {
        if (statusFilter === 'all') return bills;
        return bills.filter(b => b.paymentStatus === statusFilter);
    }, [bills, statusFilter]);

    const avatarGrad = getAvatarColor(customer.name);
    const balance = customer.currentBalance || 0;

    return (
        <div className="h-full flex flex-col bg-gray-50/80">
            {/* ─ Mobile back header ─ */}
            <div className="lg:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition" id="back-to-customers">
                    <ArrowLeft size={20} className="text-gray-700" />
                </button>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarGrad} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold">{getInitials(customer.name)}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 truncate">{customer.name}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-5">
                {/* ─ Profile Card ─ */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                    <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center shadow-lg flex-shrink-0`}>
                            <span className="text-white text-xl font-bold">{getInitials(customer.name)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold text-gray-900 truncate">{customer.name}</h2>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                                {customer.type && customer.type !== 'Individual' && (
                                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                                        {customer.type}
                                    </span>
                                )}
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${customer.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {customer.isActive !== false ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="mt-3 space-y-1.5">
                                {customer.phone && (
                                    <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition">
                                        <Phone size={14} className="text-gray-400" /> {customer.phone}
                                    </a>
                                )}
                                {customer.email && (
                                    <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition truncate">
                                        <Mail size={14} className="text-gray-400" /> {customer.email}
                                    </a>
                                )}
                                {customer.address && (
                                    <p className="flex items-start gap-2 text-sm text-gray-600">
                                        <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span className="truncate">
                                            {typeof customer.address === 'string' ? customer.address : customer.address?.city || ''}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Balance badge */}
                        <div className={`px-3 py-2 rounded-xl text-right flex-shrink-0 ${balance > 0 ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Balance</p>
                            <p className={`text-lg font-bold ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {formatCurrency(balance)}
                            </p>
                        </div>
                    </div>
                    {customer.gstNumber && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                            <span className="font-medium">GST:</span> {customer.gstNumber}
                        </div>
                    )}
                </motion.div>

                {/* ─ Financial Summary Cards ─ */}
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                                <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
                                <div className="h-6 bg-gray-200 rounded w-20" />
                            </div>
                        ))}
                    </div>
                ) : summary && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                    >
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <Receipt size={16} className="text-indigo-500" />
                                </div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bills</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{summary.totalBills}</p>
                            <div className="flex gap-2 mt-1.5 text-[11px]">
                                <span className="text-emerald-600">{summary.paidCount} paid</span>
                                <span className="text-amber-600">{summary.pendingCount} pending</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <TrendingUp size={16} className="text-blue-500" />
                                </div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Billed</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalBilled)}</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <Wallet size={16} className="text-emerald-500" />
                                </div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Received</span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(summary.totalPaid)}</p>
                        </div>

                        <div className={`rounded-2xl border shadow-sm p-4 hover:shadow-md transition-shadow ${summary.totalOutstanding > 0 ? 'bg-rose-50/60 border-rose-100' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${summary.totalOutstanding > 0 ? 'bg-rose-100' : 'bg-gray-50'}`}>
                                    <TrendingDown size={16} className={summary.totalOutstanding > 0 ? 'text-rose-500' : 'text-gray-400'} />
                                </div>
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</span>
                            </div>
                            <p className={`text-2xl font-bold ${summary.totalOutstanding > 0 ? 'text-rose-600' : 'text-gray-700'}`}>
                                {formatCurrency(summary.totalOutstanding)}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* ─ Bills Section ─ */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Receipt size={18} className="text-indigo-500" />
                            Bill History
                        </h3>
                        <span className="text-xs text-gray-500">{filteredBills.length} bills</span>
                    </div>

                    {/* Filter pills */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                        {[
                            { key: 'all', label: 'All', count: bills.length },
                            { key: 'paid', label: 'Paid', count: summary?.paidCount || 0 },
                            { key: 'pending', label: 'Pending', count: summary?.pendingCount || 0 },
                            { key: 'partial', label: 'Partial', count: summary?.partialCount || 0 },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                                    statusFilter === f.key
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                                }`}
                                id={`filter-${f.key}`}
                            >
                                {f.label} ({f.count})
                            </button>
                        ))}
                    </div>

                    {/* Bills list */}
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-24" />
                                            <div className="h-3 bg-gray-200 rounded w-40" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredBills.length > 0 ? (
                        <div className="space-y-3">
                            {filteredBills.map(bill => (
                                <BillCard key={bill._id} bill={bill} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                            <Receipt size={40} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 text-sm font-medium">
                                {statusFilter !== 'all' ? `No ${statusFilter} bills found` : 'No bills yet'}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">Bills will appear here once created</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showDetail, setShowDetail] = useState(false); // mobile panel toggle

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

    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) return customers;
        const q = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.phone?.includes(q) ||
            c.email?.toLowerCase().includes(q)
        );
    }, [customers, searchTerm]);

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
                            {/* <p className="text-xs text-gray-500 mt-0.5">{customers.length} customers</p> */}
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