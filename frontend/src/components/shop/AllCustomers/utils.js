import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(amount || 0);

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch { return 'Invalid Date'; }
};

export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch { return 'Invalid Date'; }
};

export const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getAvatarColor = (name) => {
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

export const statusConfig = {
    paid: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Paid' },
    pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Pending' },
    partial: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle, label: 'Partial' },
};

export const paymentMethodIcons = {
    cash: '💵', card: '💳', upi: '📱', bank_transfer: '🏦', credit: '📝'
};
