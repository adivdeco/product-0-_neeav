import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { IndianRupee, X } from 'lucide-react';
import axiosClient from '../../../api/auth';
import { formatCurrency } from './utils';

const RecordPaymentModal = ({ isOpen, onClose, customer, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const currentBalance = customer?.currentBalance || 0;
    const numAmount = parseFloat(amount) || 0;
    const projectedBalance = currentBalance - numAmount;

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setPaymentMethod('cash');
            setNotes('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (numAmount <= 0) return toast.error('Enter a valid amount');
        setSubmitting(true);
        try {
            const res = await axiosClient.post(`/khata/record-payment/${customer._id}`, {
                paymentAmount: numAmount,
                paymentMethod,
                notes: notes.trim() || undefined
            });
            toast.success(res.data.message || 'Payment recorded!');
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record payment');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !customer) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', duration: 0.35 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white relative">
                        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/20 transition" id="close-payment-modal">
                            <X size={18} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                                <IndianRupee size={22} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Record Payment</h3>
                                <p className="text-emerald-100 text-xs mt-0.5">{customer.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Balance Summary */}
                    <div className="px-6 pt-5 pb-3">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className={`rounded-xl p-3 text-center ${currentBalance > 0 ? 'bg-rose-50' : currentBalance < 0 ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Current Balance</p>
                                <p className={`text-sm font-bold mt-0.5 ${currentBalance > 0 ? 'text-rose-700' : currentBalance < 0 ? 'text-emerald-700' : 'text-gray-700'}`}>
                                    {currentBalance > 0 ? `${formatCurrency(currentBalance)} Due` : currentBalance < 0 ? `${formatCurrency(Math.abs(currentBalance))} Advance` : 'Clear'}
                                </p>
                            </div>
                            <div className={`rounded-xl p-3 text-center ${projectedBalance > 0 ? 'bg-amber-50' : 'bg-blue-50'}`}>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">After Payment</p>
                                <p className={`text-sm font-bold mt-0.5 ${projectedBalance > 0 ? 'text-amber-700' : 'text-blue-700'}`}>
                                    {numAmount > 0
                                        ? (projectedBalance > 0 ? `${formatCurrency(projectedBalance)} Due` : projectedBalance < 0 ? `${formatCurrency(Math.abs(projectedBalance))} Advance` : 'Clear')
                                        : '—'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                        {/* Amount */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">Payment Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full pl-8 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
                                    min="1"
                                    step="any"
                                    autoFocus
                                    id="payment-amount-input"
                                />
                                {currentBalance > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setAmount(String(currentBalance))}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                                        id="pay-due-btn"
                                    >
                                        Clear Due
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">Payment Method</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { key: 'cash', label: 'Cash', icon: '💵' },
                                    { key: 'upi', label: 'UPI', icon: '📱' },
                                    { key: 'card', label: 'Card', icon: '💳' },
                                    { key: 'bank_transfer', label: 'Bank', icon: '🏦' },
                                ].map(m => (
                                    <button
                                        key={m.key}
                                        type="button"
                                        onClick={() => setPaymentMethod(m.key)}
                                        className={`py-2.5 rounded-xl text-xs font-medium transition-all border ${
                                            paymentMethod === m.key
                                                ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-300'
                                        }`}
                                        id={`payment-method-${m.key}`}
                                    >
                                        <span className="text-base block mb-0.5">{m.icon}</span>
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 block">Notes (optional)</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. Received via GPay"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition"
                                id="payment-notes-input"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || numAmount <= 0}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            id="submit-payment-btn"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Recording...
                                </span>
                            ) : (
                                `Record ₹${numAmount > 0 ? numAmount.toLocaleString('en-IN') : '0'} Payment`
                            )}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RecordPaymentModal;
