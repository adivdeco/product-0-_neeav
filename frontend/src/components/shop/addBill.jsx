// AddBillPage.jsx — Premium Mobile-First Bill Creator
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import axiosClient from '../../api/auth';
import { AddBillSchema } from '../../api/billValidationSchema';
import Navbar from '../home/navbar';
import {
    Search, User, Phone, MapPin, Plus, Trash2, ChevronDown, ChevronUp,
    Receipt, CreditCard, Truck, Package, IndianRupee, CheckCircle2,
    AlertCircle, X, Calendar, Hash, Wallet, ArrowRight, ShoppingBag
} from 'lucide-react';
import { generateCustomerEmail, shouldGenerateEmail } from '../../utils/emailGenerator';

// ─── Utilities ──────────────────────────────────────────────
const formatINR = (v) => new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
}).format(Math.abs(v || 0));

const calculateItemTotal = (item) => {
    const base = (item.quantity || 0) * (item.price || 0);
    const disc = base * ((item.discount || 0) / 100);
    const afterDisc = base - disc;
    const tax = afterDisc * ((item.taxRate || 0) / 100);
    return { itemTotal: afterDisc + tax, discountAmount: disc, taxAmount: tax };
};

// ─── Customer Search Dropdown ───────────────────────────────
const CustomerDropdown = ({ customers, searchTerm, onSelect, isVisible }) => {
    if (!isVisible || !searchTerm || searchTerm.length < 2) return null;

    const filtered = customers.filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) return null;

    return (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
            <div className="px-3 py-2 border-b border-gray-100 text-[11px] font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Search size={12} /> {filtered.length} found
            </div>
            {filtered.map((c) => (
                <button
                    key={c._id}
                    type="button"
                    onClick={() => onSelect(c)}
                    className="w-full text-left px-3 py-3 hover:bg-indigo-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">
                            {c.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            {c.phone && <span className="flex items-center gap-0.5"><Phone size={10} />{c.phone}</span>}
                            {c.currentBalance > 0 && (
                                <span className="text-rose-600 font-medium">₹{c.currentBalance}</span>
                            )}
                        </div>
                    </div>
                    <ArrowRight size={14} className="text-gray-300" />
                </button>
            ))}
        </div>
    );
};

// ─── Collapsible Item Card (Mobile) ─────────────────────────
const ItemCard = ({ index, register, watch, remove, errors, fieldsCount }) => {
    const [expanded, setExpanded] = useState(index === 0);
    const item = watch(`items.${index}`);
    const total = calculateItemTotal(item || {});
    const err = (f) => errors.items?.[index]?.[f]?.message;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
            {/* Collapsed header */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-3 p-3.5 text-left"
            >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 text-xs font-bold">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {item?.productName || 'New Item'}
                    </p>
                    <p className="text-xs text-gray-500">
                        {item?.quantity || 0} × ₹{item?.price || 0} = <span className="font-medium text-gray-800">₹{formatINR(total.itemTotal)}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {fieldsCount > 1 && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); remove(index); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition"
                        >
                            <Trash2 size={15} />
                        </button>
                    )}
                    {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </button>

            {/* Expanded form */}
            {expanded && (
                <div className="px-3.5 pb-3.5 space-y-3 border-t border-gray-50 pt-3">
                    {/* Product name */}
                    <div>
                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Product Name</label>
                        <input
                            type="text"
                            {...register(`items.${index}.productName`)}
                            placeholder="e.g. Cement, Steel Rod..."
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition placeholder:text-gray-400"
                        />
                        {err('productName') && <p className="text-rose-500 text-xs mt-1">{err('productName')}</p>}
                    </div>

                    {/* Qty + Unit + Price row */}
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Qty</label>
                            <input
                                type="number"
                                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                min="1"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition"
                            />
                            {err('quantity') && <p className="text-rose-500 text-[10px] mt-0.5">{err('quantity')}</p>}
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Unit</label>
                            <select
                                {...register(`items.${index}.unit`)}
                                className="w-full px-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition appearance-none"
                            >
                                {['pcs', 'kg', 'g', 'l', 'ml', 'pack'].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Price ₹</label>
                            <input
                                type="number"
                                {...register(`items.${index}.price`, { valueAsNumber: true })}
                                min="0"
                                step="1"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-right focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition"
                            />
                            {err('price') && <p className="text-rose-500 text-[10px] mt-0.5">{err('price')}</p>}
                        </div>
                    </div>

                    {/* Discount + Tax row */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Discount %</label>
                            <input
                                type="number"
                                {...register(`items.${index}.discount`, { valueAsNumber: true })}
                                min="0" max="100"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block">Tax %</label>
                            <input
                                type="number"
                                {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                                min="0"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition"
                            />
                        </div>
                    </div>

                    {/* Item total */}
                    <div className="bg-indigo-50 rounded-xl px-3.5 py-2.5 flex justify-between items-center">
                        <span className="text-xs font-medium text-indigo-600">Item Total</span>
                        <span className="text-sm font-bold text-indigo-700">₹{formatINR(total.itemTotal)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════
const AddBillPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCustomerResults, setShowCustomerResults] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEmailManuallyEdited, setIsEmailManuallyEdited] = useState(false);
    const [showExtraCharges, setShowExtraCharges] = useState(false);
    const [showCreditSection, setShowCreditSection] = useState(false);
    const formEndRef = useRef(null);

    const defaultItem = { productName: '', quantity: 1, unit: 'pcs', price: 0, discount: 0, taxRate: 0 };

    const {
        register, control, handleSubmit, watch, formState: { errors, isSubmitting },
        setValue, getValues
    } = useForm({
        resolver: zodResolver(AddBillSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            customerName: '', phone: '', email: '', address: '',
            items: [defaultItem],
            discount: 0, deliveryCharge: 0, packagingCharge: 0,
            amountPaid: 0, paymentMethod: 'cash',
            isCredit: true, creditPeriod: null, creditInterestRate: null, taxAmount: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const watchedItems = watch('items');
    const watchedDiscount = watch('discount');
    const watchedDeliveryCharge = watch('deliveryCharge');
    const watchedPackagingCharge = watch('packagingCharge');
    const watchedAmountPaid = watch('amountPaid');
    const watchedIsCredit = watch('isCredit');
    const watchedDate = watch('date');
    const watchCustomerName = watch('customerName');
    const watchPhone = watch('phone');
    const watchEmail = watch('email');

    // Auto-generate email
    useEffect(() => {
        if (!isEmailManuallyEdited && shouldGenerateEmail(watchEmail, selectedCustomer) && watchCustomerName) {
            const generated = generateCustomerEmail(watchCustomerName, watchPhone);
            setValue('email', generated);
        }
    }, [watchCustomerName, watchPhone, watchEmail, selectedCustomer, setValue, isEmailManuallyEdited]);

    // Calculations
    const { totalAmount, totalDiscount, totalTaxAmount, grandTotal, remainingAmount } = useMemo(() => {
        let totalAmount = 0, totalDiscount = 0, totalTaxAmount = 0;
        (watchedItems || []).forEach((item) => {
            const { itemTotal, discountAmount, taxAmount } = calculateItemTotal(item);
            totalAmount += (item.quantity || 0) * (item.price || 0);
            totalDiscount += discountAmount;
            totalTaxAmount += taxAmount;
        });
        const subTotal = (totalAmount - totalDiscount) + totalTaxAmount;
        let totalAfterDiscount = subTotal - (watchedDiscount || 0);
        if (totalAfterDiscount < 0) totalAfterDiscount = 0;
        const grandTotal = totalAfterDiscount + (watchedDeliveryCharge || 0) + (watchedPackagingCharge || 0);
        setValue('taxAmount', totalTaxAmount, { shouldValidate: true });
        const remainingAmount = grandTotal - (watchedAmountPaid || 0);
        return { totalAmount, totalDiscount: totalDiscount + (watchedDiscount || 0), totalTaxAmount, grandTotal, remainingAmount };
    }, [watchedItems, watchedDiscount, watchedDeliveryCharge, watchedPackagingCharge, watchedAmountPaid, setValue]);

    // Fetch customers
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get('/khata/customer');
                setCustomers(res.data.customers || res.data || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, []);

    // Customer search
    const handleCustomerSearch = (e) => {
        const v = e.target.value;
        setSearchTerm(v);
        setValue('customerName', v);
        setShowCustomerResults(v.length >= 2);
    };

    const handleSelectCustomer = (c) => {
        setSelectedCustomer(c);
        setSearchTerm(c.name);
        setShowCustomerResults(false);
        setValue('customerName', c.name);
        setValue('phone', c.phone || '');
        setValue('email', c.email || '');
        if (typeof c.address === 'string') {
            setValue('address', c.address);
        } else {
            setValue('address', [c.address?.street, c.address?.city, c.address?.state, c.address?.pincode].filter(Boolean).join(', '));
        }
        if (c.creditAllowed) setValue('isCredit', true);
        toast.success(`${c.name} selected`, { icon: '👤', style: { background: '#1e1b4b', color: '#fff', borderRadius: '12px' } });
    };

    const handleClearCustomer = () => {
        setSelectedCustomer(null);
        setSearchTerm('');
        setValue('customerName', '');
        setValue('phone', '');
        setValue('email', '');
        setValue('address', '');
        setShowCustomerResults(false);
    };

    // Submit
    const onSubmit = async (data) => {
        const finalData = {
            ...data,
            totalAmount, grandTotal,
            paymentStatus: data.amountPaid >= grandTotal ? 'paid' : data.amountPaid > 0 ? 'partial' : 'pending',
            phone: data.phone || undefined,
            email: data.email || undefined,
            address: data.address || undefined,
            creditPeriod: data.isCredit ? data.creditPeriod : undefined,
            creditInterestRate: data.isCredit ? data.creditInterestRate : undefined,
            date: data.date || getValues('date') || watchedDate,
        };
        try {
            const res = await axiosClient.post('/khata/add_bill', finalData);
            toast.success(`Bill saved! Total: ₹${formatINR(grandTotal)}`, {
                style: { background: '#1e1b4b', color: '#fff', borderRadius: '12px' }
            });
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error('Submission Error:', error);
            const msg = error.response?.data?.message || error.response?.data?.errors?.join(', ') || 'Could not add bill';
            toast.error(msg);
        }
    };

    // ─── Input classes ──────
    const inputBase = "w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition placeholder:text-gray-400";
    const labelBase = "text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1 block";

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Toaster position="top-center" />

            <div className="max-w-3xl mx-auto px-4 py-5 pb-32">
                {/* ─── Header ─── */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Receipt size={20} className="text-white" />
                        </div>
                        New Bill
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 ml-12">Create invoice with item details</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                    {/* ═══ DATE ═══ */}
                    <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
                        <Calendar size={18} className="text-indigo-500" />
                        <div className="flex-1">
                            <label className={labelBase}>Bill Date</label>
                            <input
                                type="date"
                                {...register('date', { required: 'Date is required' })}
                                className="w-full bg-transparent text-sm font-medium text-gray-900 focus:outline-none"
                            />
                        </div>
                        {errors.date && <p className="text-rose-500 text-xs">{errors.date.message}</p>}
                    </div>

                    {/* ═══ CUSTOMER SECTION ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <User size={16} className="text-indigo-500" />
                            Customer
                        </h2>

                        {/* Selected customer badge */}
                        {selectedCustomer && (
                            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <User size={16} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedCustomer.name}</p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {selectedCustomer.phone} {selectedCustomer.currentBalance > 0 && `• Due: ₹${selectedCustomer.currentBalance}`}
                                    </p>
                                </div>
                                <button type="button" onClick={handleClearCustomer} className="p-1.5 rounded-lg hover:bg-indigo-100 transition">
                                    <X size={16} className="text-indigo-600" />
                                </button>
                            </div>
                        )}

                        {/* Search bar */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleCustomerSearch}
                                placeholder="Search customer by name, phone..."
                                disabled={!!selectedCustomer}
                                className={`${inputBase} pl-9`}
                            />
                            <CustomerDropdown
                                customers={customers}
                                searchTerm={searchTerm}
                                isVisible={showCustomerResults && !selectedCustomer}
                                onSelect={handleSelectCustomer}
                            />
                        </div>

                        {/* Manual fields - 2 cols on larger screens */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelBase}>Name <span className="text-rose-500">*</span></label>
                                <input
                                    type="text"
                                    {...register('customerName')}
                                    placeholder="Customer name"
                                    disabled={!!selectedCustomer}
                                    className={inputBase}
                                />
                                {errors.customerName && <p className="text-rose-500 text-xs mt-0.5">{errors.customerName.message}</p>}
                            </div>
                            <div>
                                <label className={labelBase}>Phone</label>
                                <input
                                    type="tel"
                                    {...register('phone')}
                                    placeholder="9876543210"
                                    disabled={!!selectedCustomer}
                                    className={inputBase}
                                />
                                {errors.phone && <p className="text-rose-500 text-xs mt-0.5">{errors.phone.message}</p>}
                            </div>
                            <div>
                                <label className={labelBase}>Email <span className="text-[10px] text-indigo-500 normal-case">(auto)</span></label>
                                <input
                                    type="email"
                                    {...register('email')}
                                    placeholder="Auto-generated"
                                    disabled={!!selectedCustomer}
                                    onFocus={() => setIsEmailManuallyEdited(true)}
                                    className={inputBase}
                                />
                            </div>
                            <div>
                                <label className={labelBase}>Address</label>
                                <input
                                    type="text"
                                    {...register('address')}
                                    placeholder="City or address"
                                    disabled={!!selectedCustomer}
                                    className={inputBase}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ═══ ITEMS SECTION ═══ */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingBag size={16} className="text-indigo-500" />
                                Items <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{fields.length}</span>
                            </h2>
                        </div>

                        {/* Item cards */}
                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <ItemCard
                                    key={field.id}
                                    index={index}
                                    register={register}
                                    watch={watch}
                                    remove={remove}
                                    errors={errors}
                                    fieldsCount={fields.length}
                                />
                            ))}
                        </div>

                        {errors.items && <p className="text-rose-500 text-xs text-center">{errors.items.message}</p>}

                        {/* Add item button */}
                        <button
                            type="button"
                            onClick={() => { append(defaultItem); }}
                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                        >
                            <Plus size={18} /> Add Item
                        </button>
                    </div>

                    {/* ═══ PAYMENT & CHARGES ═══ */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Wallet size={16} className="text-indigo-500" />
                            Payment
                        </h2>

                        {/* Payment method - quick select pills */}
                        <div>
                            <label className={labelBase}>Method</label>
                            <div className="grid grid-cols-5 gap-1.5">
                                {[
                                    { val: 'cash', icon: '💵', label: 'Cash' },
                                    { val: 'upi', icon: '📱', label: 'UPI' },
                                    { val: 'card', icon: '💳', label: 'Card' },
                                    { val: 'bank_transfer', icon: '🏦', label: 'Bank' },
                                    { val: 'credit', icon: '📝', label: 'Credit' },
                                ].map(m => (
                                    <label
                                        key={m.val}
                                        className={`flex flex-col items-center py-2 px-1 rounded-xl border cursor-pointer transition-all text-center ${
                                            watch('paymentMethod') === m.val
                                                ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input type="radio" {...register('paymentMethod')} value={m.val} className="sr-only" />
                                        <span className="text-lg">{m.icon}</span>
                                        <span className="text-[10px] font-medium text-gray-700 mt-0.5">{m.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Bill discount */}
                        <div>
                            <label className={labelBase}>Bill Discount ₹</label>
                            <input
                                type="number"
                                {...register('discount', { valueAsNumber: true })}
                                min="0"
                                placeholder="0"
                                className={inputBase}
                            />
                            {errors.discount && <p className="text-rose-500 text-xs mt-0.5">{errors.discount.message}</p>}
                        </div>

                        {/* Extra charges toggle */}
                        <button
                            type="button"
                            onClick={() => setShowExtraCharges(!showExtraCharges)}
                            className="w-full flex items-center justify-between py-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition"
                        >
                            <span className="flex items-center gap-1.5">
                                <Truck size={14} /> Delivery & Packaging Charges
                            </span>
                            {showExtraCharges ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showExtraCharges && (
                            <div className="grid grid-cols-2 gap-3 pb-1">
                                <div>
                                    <label className={labelBase}>Delivery ₹</label>
                                    <input
                                        type="number"
                                        {...register('deliveryCharge', { valueAsNumber: true })}
                                        min="0" placeholder="0"
                                        className={inputBase}
                                    />
                                </div>
                                <div>
                                    <label className={labelBase}>Packaging ₹</label>
                                    <input
                                        type="number"
                                        {...register('packagingCharge', { valueAsNumber: true })}
                                        min="0" placeholder="0"
                                        className={inputBase}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Credit toggle */}
                        <div className="flex items-center justify-between py-2 border-t border-gray-100">
                            <div>
                                <p className="text-sm font-medium text-gray-800">Credit Bill</p>
                                <p className="text-[11px] text-gray-500">Enable for deferred payments</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" {...register('isCredit')} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        {watchedIsCredit && (
                            <div className="grid grid-cols-2 gap-3 pb-1">
                                <div>
                                    <label className={labelBase}>Credit Period (Days) *</label>
                                    <input
                                        type="number"
                                        {...register('creditPeriod', { valueAsNumber: true })}
                                        min="1" placeholder="30"
                                        className={inputBase}
                                    />
                                    {errors.creditPeriod && <p className="text-rose-500 text-xs mt-0.5">{errors.creditPeriod.message}</p>}
                                </div>
                                <div>
                                    <label className={labelBase}>Interest %</label>
                                    <input
                                        type="number"
                                        {...register('creditInterestRate', { valueAsNumber: true })}
                                        min="0" placeholder="0"
                                        className={inputBase}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ═══ BILL SUMMARY (Sticky-like card) ═══ */}
                    <div className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl shadow-xl p-5 text-white space-y-3">
                        <h2 className="text-sm font-bold flex items-center gap-2 text-white/80">
                            <Receipt size={16} /> Bill Summary
                        </h2>

                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-white/70">
                                <span>Sub Total</span>
                                <span>₹{formatINR(totalAmount)}</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                    <span>Discounts</span>
                                    <span>-₹{formatINR(totalDiscount)}</span>
                                </div>
                            )}
                            {totalTaxAmount > 0 && (
                                <div className="flex justify-between text-white/70">
                                    <span>Tax</span>
                                    <span>₹{formatINR(totalTaxAmount)}</span>
                                </div>
                            )}
                            {(watchedDeliveryCharge > 0 || watchedPackagingCharge > 0) && (
                                <div className="flex justify-between text-white/70">
                                    <span>Charges</span>
                                    <span>₹{formatINR((watchedDeliveryCharge || 0) + (watchedPackagingCharge || 0))}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-white/20 pt-3 flex justify-between items-center">
                            <span className="text-lg font-bold">Grand Total</span>
                            <span className="text-2xl font-bold">₹{formatINR(grandTotal)}</span>
                        </div>

                        {/* Amount paid */}
                        <div className="pt-2">
                            <label className="text-[11px] font-medium text-white/60 uppercase tracking-wider mb-1.5 block">Amount Paid ₹</label>
                            <input
                                type="number"
                                {...register('amountPaid', { valueAsNumber: true })}
                                min="0" step="1"
                                placeholder={formatINR(grandTotal)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xl font-bold text-white placeholder:text-white/30 focus:ring-2 focus:ring-indigo-400/50 focus:border-white/40 focus:bg-white/15 transition"
                            />
                            {errors.amountPaid && <p className="text-rose-400 text-xs mt-1">{errors.amountPaid.message}</p>}
                        </div>

                        {/* Remaining */}
                        <div className={`rounded-xl p-3 text-center ${remainingAmount > 0 ? 'bg-rose-500/20 border border-rose-500/30' : 'bg-emerald-500/20 border border-emerald-500/30'}`}>
                            <p className="text-xs font-medium text-white/70">
                                {remainingAmount > 0 ? 'Remaining' : remainingAmount === 0 ? 'Fully Paid' : 'Overpaid'}
                            </p>
                            <p className={`text-xl font-bold mt-0.5 ${remainingAmount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                ₹{formatINR(remainingAmount)}
                            </p>
                        </div>
                    </div>

                </form>
            </div>

            {/* ═══ FIXED BOTTOM SUBMIT BAR ═══ */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 px-4 py-3 z-50 safe-area-bottom">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Grand Total</p>
                        <p className="text-lg font-bold text-gray-900">₹{formatINR(grandTotal)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                Save Bill
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddBillPage;