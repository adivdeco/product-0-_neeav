import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Phone, Mail, MapPin, ArrowLeft, IndianRupee, Receipt, CreditCard,
    Archive, TrendingUp, TrendingDown, Wallet, CheckCircle2, AlertCircle, FileDown
} from 'lucide-react';
import axiosClient from '../../../api/auth';
import CustomerStatementPDF from '../CustomerStatementPDF';
import PastRecordStatementPDF from '../PastRecordStatementPDF';
import RecordPaymentModal from './RecordPaymentModal';
import BillCard from './BillCard';
import PastRecordCard from './PastRecordCard';
import {
    formatCurrency, formatDate, formatDateTime, getAvatarColor, getInitials
} from './utils';

// ─── Customer Detail Panel ──────────────────────────────────
export const CustomerDetailPanel = ({ customer, onBack, onCustomerUpdated }) => {
    const [bills, setBills] = useState([]);
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showStatement, setShowStatement] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [pastRecords, setPastRecords] = useState([]);
    const [loadingPast, setLoadingPast] = useState(false);
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [selectedPastRecord, setSelectedPastRecord] = useState(null);

    const fetchBills = useCallback(() => {
        if (!customer?._id) return;
        setLoading(true);
        setStatusFilter('all');
        axiosClient.get(`/khata/customer/${customer._id}/bills`)
            .then(res => {
                setBills(res.data.bills || []);
                setPayments(res.data.payments || []);
                setSummary(res.data.summary || null);
                setShop(res.data.shop || null);
            })
            .catch(err => {
                console.error('Error fetching customer bills:', err);
                toast.error('Failed to load bills');
                setBills([]);
                setPayments([]);
                setSummary(null);
            })
            .finally(() => setLoading(false));
    }, [customer?._id]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills, refreshKey]);

    const handlePaymentSuccess = () => {
        setRefreshKey(k => k + 1); // refresh bills
        onCustomerUpdated?.(); // refresh customer list (balance changed)
    };

    // Fetch past records
    const fetchPastRecords = useCallback(() => {
        if (!customer?._id) return;
        setLoadingPast(true);
        axiosClient.get(`/khata/past-records/${customer._id}`)
            .then(res => {
                setPastRecords(res.data.pastRecords || []);
            })
            .catch(err => {
                console.error('Error fetching past records:', err);
                setPastRecords([]);
            })
            .finally(() => setLoadingPast(false));
    }, [customer?._id]);

    useEffect(() => {
        fetchPastRecords();
    }, [fetchPastRecords, refreshKey]);

    // Archive handler
    const handleArchive = async () => {
        setArchiving(true);
        try {
            const res = await axiosClient.post(`/khata/archive-customer/${customer._id}`);
            toast.success(res.data.message || 'Records archived successfully!');
            setShowArchiveConfirm(false);
            setRefreshKey(k => k + 1); // refresh everything
            onCustomerUpdated?.(); // refresh customer list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to archive records');
        } finally {
            setArchiving(false);
        }
    };

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
                        <div className={`px-3 py-2 rounded-xl text-right flex-shrink-0 ${balance > 0 ? 'bg-rose-50 border border-rose-100' : balance < 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50 border border-gray-100'}`}>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Balance</p>
                            <p className={`text-lg font-bold ${balance > 0 ? 'text-rose-600' : balance < 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                                {balance > 0 ? formatCurrency(balance) : balance < 0 ? `${formatCurrency(Math.abs(balance))} Adv` : 'Clear'}
                            </p>
                        </div>
                    </div>
                    {customer.gstNumber && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                            <span className="font-medium">GST:</span> {customer.gstNumber}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {/* Record Payment Button */}
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-medium rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-[0.97]"
                            id="record-payment-btn"
                        >
                            <IndianRupee size={16} />
                            Record Payment
                        </button>

                        {/* Export Statement Button */}
                        {!loading && bills.length > 0 && (
                            <button
                                onClick={() => setShowStatement(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-[0.97]"
                                id="export-statement-btn"
                            >
                                <FileDown size={16} />
                                Export Statement
                            </button>
                        )}

                        {/* Archive & Clear Button — only when balance ≤ 0 and has bills */}
                        {!loading && bills.length > 0 && balance <= 0 && (
                            <button
                                onClick={() => setShowArchiveConfirm(true)}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-[0.97]"
                                id="archive-clear-btn"
                            >
                                <Archive size={16} />
                                Archive & Clear
                            </button>
                        )}
                    </div>
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
                            <p className="text-2xl font-bold text-emerald-700">
                                {formatCurrency(summary.totalPaymentsReceived !== undefined ? summary.totalPaymentsReceived : summary.totalPaid)}
                            </p>
                        </div>

                        {/* Balance Card */}
                        {(() => {
                            if (balance < 0) {
                                return (
                                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100">
                                                <TrendingUp size={16} className="text-emerald-600" />
                                            </div>
                                            <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Advance</span>
                                        </div>
                                        <p className="text-2xl font-bold text-emerald-600">
                                            {formatCurrency(Math.abs(balance))}
                                        </p>
                                    </div>
                                );
                            } else if (balance > 0) {
                                return (
                                    <div className="bg-rose-50/60 border border-rose-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-100">
                                                <TrendingDown size={16} className="text-rose-500" />
                                            </div>
                                            <span className="text-xs font-medium text-rose-700 uppercase tracking-wider">Outstanding</span>
                                        </div>
                                        <p className="text-2xl font-bold text-rose-600">
                                            {formatCurrency(balance)}
                                        </p>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50">
                                                <CheckCircle2 size={16} className="text-gray-400" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-700">
                                            Clear
                                        </p>
                                    </div>
                                );
                            }
                        })()}
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

                {/* ─ Payment History Section ─ */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard size={18} className="text-emerald-500" />
                            Payment History
                        </h3>
                        <span className="text-xs text-gray-500">{payments.length} payments</span>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse h-16" />
                            ))}
                        </div>
                    ) : payments.length > 0 ? (
                        <div className="space-y-3">
                            {payments.map(payment => (
                                <div key={payment._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-lg">
                                            ₹
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(payment.amount)} Received
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                                <span>{formatDate(payment.date)}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className="capitalize">{payment.paymentMethod?.replace('_', ' ') || 'Cash'}</span>
                                            </p>
                                            {payment.notes && (
                                                <p className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
                                                    Note: {payment.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Balance After</p>
                                        <p className={`text-xs font-bold ${payment.balanceAfter > 0 ? 'text-rose-600' : payment.balanceAfter < 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                                            {payment.balanceAfter > 0 ? `${formatCurrency(payment.balanceAfter)} Due` : payment.balanceAfter < 0 ? `${formatCurrency(Math.abs(payment.balanceAfter))} Adv` : 'Clear'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
                            <CreditCard size={36} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 text-sm font-medium">No payments recorded yet</p>
                            <p className="text-gray-400 text-xs mt-0.5">Use the "Record Payment" button above to post one</p>
                        </div>
                    )}
                </div>

                {/* ─ Past Records Section ─ */}
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Archive size={18} className="text-amber-500" />
                            Past Records
                        </h3>
                        <span className="text-xs text-gray-500">{pastRecords.length} cycle(s)</span>
                    </div>

                    {loadingPast ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse h-20" />
                            ))}
                        </div>
                    ) : pastRecords.length > 0 ? (
                        <div className="space-y-3">
                            {pastRecords.map(record => (
                                <PastRecordCard key={record._id} record={record} onViewPDF={setSelectedPastRecord} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
                            <Archive size={36} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 text-sm font-medium">No archived records</p>
                            <p className="text-gray-400 text-xs mt-0.5">Cleared cycles will appear here after archiving</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Statement PDF Modal */}
            <CustomerStatementPDF
                isOpen={showStatement}
                onClose={() => setShowStatement(false)}
                customer={customer}
                bills={bills}
                payments={payments}
                summary={summary}
                shop={shop}
            />

            {/* Past Record Statement PDF Modal */}
            <PastRecordStatementPDF
                isOpen={!!selectedPastRecord}
                onClose={() => setSelectedPastRecord(null)}
                record={selectedPastRecord}
            />

            {/* Record Payment Modal */}
            <RecordPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                customer={customer}
                onSuccess={handlePaymentSuccess}
            />

            {/* Archive Confirmation Modal */}
            <AnimatePresence>
                {showArchiveConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setShowArchiveConfirm(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.35 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                                        <Archive size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">Archive & Clear</h3>
                                        <p className="text-amber-100 text-xs mt-0.5">{customer.name}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-5 space-y-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                                    <p className="font-medium flex items-center gap-1.5 mb-1">
                                        <AlertCircle size={14} /> This action will:
                                    </p>
                                    <ul className="text-xs space-y-1 ml-5 list-disc text-amber-700">
                                        <li>Archive all <strong>{bills.length}</strong> bills and <strong>{payments.length}</strong> payments into a compact record</li>
                                        <li>Permanently delete all individual bills & payment records</li>
                                        <li>Reset customer balance to ₹0</li>
                                    </ul>
                                </div>

                                <p className="text-xs text-gray-500">The archived record will be available in the "Past Records" section for PDF export.</p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowArchiveConfirm(false)}
                                        className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition text-sm"
                                        id="cancel-archive-btn"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleArchive}
                                        disabled={archiving}
                                        className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50 active:scale-[0.98] text-sm"
                                        id="confirm-archive-btn"
                                    >
                                        {archiving ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Archiving...
                                            </span>
                                        ) : (
                                            'Archive & Clear'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerDetailPanel;
