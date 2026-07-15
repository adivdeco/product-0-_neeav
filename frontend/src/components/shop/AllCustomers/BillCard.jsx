import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown, ChevronUp, Hash, Calendar, Package
} from 'lucide-react';
import {
    formatCurrency, formatDate, statusConfig, paymentMethodIcons
} from './utils';

// ─── Bill Item Row ──────────────────────────────────────────
export const BillItemRow = ({ item, index }) => {
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
export const BillCard = ({ bill }) => {
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

export default BillCard;
