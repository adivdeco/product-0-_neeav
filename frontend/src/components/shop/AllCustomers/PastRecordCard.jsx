import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, BookOpen, Calendar, ChevronUp, ChevronDown, ShieldCheck, FileDown
} from 'lucide-react';
import {
    formatCurrency, formatDate, formatDateTime
} from './utils';

// ─── Past Record Card (Expandable Ledger) ───────────────────
export const PastRecordCard = ({ record, onViewPDF }) => {
    const [expanded, setExpanded] = useState(false);
    const ledger = record.ledger || [];
    const summary = record.summary || {};

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative"
        >
            {/* Cleared overlay badge */}
            <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                    <CheckCircle2 size={12} /> Cleared
                </span>
            </div>

            {/* Header — always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-left p-4 pr-24 focus:outline-none"
                id={`past-record-toggle-${record._id}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={18} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">
                                Cycle #{record.cycleNumber}
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                {record.statementNumber}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar size={11} /> {formatDate(record.startDate)} — {formatDate(record.endDate)}
                            </span>
                            <span>{summary.billCount || 0} bills · {summary.paymentCount || 0} payments</span>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(summary.totalBilled)}</p>
                        {expanded ? <ChevronUp size={16} className="text-gray-400 mt-1 ml-auto" /> : <ChevronDown size={16} className="text-gray-400 mt-1 ml-auto" />}
                    </div>
                </div>
            </button>

            {/* Expanded — Ledger table */}
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
                            {/* Summary strip */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-blue-600 font-medium">Total Billed</p>
                                    <p className="text-sm font-bold text-blue-700 mt-0.5">{formatCurrency(summary.totalBilled)}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-medium">Total Paid</p>
                                    <p className="text-sm font-bold text-emerald-700 mt-0.5">{formatCurrency(summary.totalPaid)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Balance</p>
                                    <p className="text-sm font-bold text-emerald-600 mt-0.5">Clear</p>
                                </div>
                            </div>

                            {/* Ledger table */}
                            {ledger.length > 0 && (
                                <div className="rounded-xl border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-800 text-white">
                                                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider">Date</th>
                                                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider">Transaction</th>
                                                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider">Particulars</th>
                                                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-right">Debit (+)</th>
                                                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-right">Credit (-)</th>
                                                    <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-right">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {ledger.map((entry, idx) => (
                                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                        <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                                                            {formatDate(entry.date)}
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            {entry.type === 'bill' ? (
                                                                <span className="text-xs font-semibold text-gray-900">
                                                                    Bill #{entry.billNumber?.slice(-8) || 'N/A'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs font-semibold text-emerald-700">
                                                                    Payment ({(entry.paymentMethod || 'cash').toUpperCase()})
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-xs text-gray-600 max-w-[200px]">
                                                            {(entry.particulars || '').split('\n').map((line, i) => (
                                                                <span key={i} className={i === 0 ? 'font-medium block' : 'text-gray-400 text-[11px] block'}>
                                                                    {line}
                                                                </span>
                                                            ))}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-xs text-right font-medium text-gray-900 whitespace-nowrap">
                                                            {entry.debit > 0 ? formatCurrency(entry.debit) : '—'}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-xs text-right font-medium text-emerald-700 whitespace-nowrap">
                                                            {entry.credit > 0 ? formatCurrency(entry.credit) : '—'}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-xs text-right font-bold whitespace-nowrap">
                                                            <span className={entry.balance > 0 ? 'text-rose-600' : entry.balance === 0 ? 'text-emerald-600' : 'text-gray-700'}>
                                                                {entry.balance === 0 ? 'Clear' : `${formatCurrency(Math.abs(entry.balance))} ${entry.balance > 0 ? 'Dr' : 'Cr'}`}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Footer summary */}
                                    <div className="bg-gray-50 border-t border-gray-200 px-3 py-2.5 flex items-center justify-between flex-wrap gap-2">
                                        <span className="text-[11px] text-gray-500">
                                            {summary.transactionCount || ledger.length} transaction(s) recorded
                                        </span>
                                        <div className="flex items-center gap-4 text-xs flex-wrap">
                                            <span className="text-gray-600">Total Billed: <strong>{formatCurrency(summary.totalBilled)}</strong></span>
                                            <span className="text-gray-600">Total Paid: <strong>{formatCurrency(summary.totalPaid)}</strong></span>
                                            <button
                                                onClick={() => onViewPDF?.(record)}
                                                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition active:scale-95 shadow-sm text-[11px] font-medium"
                                                title="View or Download Statement PDF"
                                            >
                                                <FileDown size={12} />
                                                Statement PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Cleared At info */}
                            <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                                <span>Archived on {formatDateTime(record.clearedAt)}</span>
                                <span className="flex items-center gap-1"><ShieldCheck size={12} /> All dues cleared</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PastRecordCard;
