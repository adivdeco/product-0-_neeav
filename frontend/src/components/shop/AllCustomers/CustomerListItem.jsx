import React from 'react';
import { motion } from 'framer-motion';
import { Phone, ChevronRight } from 'lucide-react';
import { getAvatarColor, getInitials } from './utils';

// ─── Customer List Item ─────────────────────────────────────
export const CustomerListItem = ({ customer, isActive, onClick }) => {
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
                ) : balance < 0 ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                        ₹{Math.abs(balance).toLocaleString('en-IN')} Adv
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

export default CustomerListItem;
