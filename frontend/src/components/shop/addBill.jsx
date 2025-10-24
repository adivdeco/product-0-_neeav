// AddBillPage.jsx
import React, { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import axiosClient from '../../api/auth';
import { AddBillSchema } from '../../api/billValidationSchema';
import Navbar from '../home/navbar';

// --- Utility Function ---
const calculateItemTotal = (item) => {
    const basePrice = item.quantity * item.price;
    const discountAmount = basePrice * (item.discount / 100);
    const priceAfterDiscount = basePrice - discountAmount;
    const taxAmount = priceAfterDiscount * (item.taxRate / 100);
    return {
        itemTotal: priceAfterDiscount + taxAmount,
        discountAmount,
        taxAmount,
    };
};

// --- React Component ---
const AddBillPage = () => {
    const defaultItem = {
        // productId: '',
        productName: '',
        quantity: 1,
        unit: 'pcs',
        price: 0,
        discount: 0,
        taxRate: 0
    };

    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm({
        resolver: zodResolver(AddBillSchema),
        defaultValues: {
            customerName: '',
            phone: '',
            email: '',
            address: '',
            items: [defaultItem],
            discount: 0,
            deliveryCharge: 0,
            packagingCharge: 0,
            amountPaid: 0,
            paymentMethod: 'cash',
            isCredit: false,
            creditPeriod: null,
            creditInterestRate: null,
            taxAmount: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const watchedItems = watch('items');
    const watchedDiscount = watch('discount');
    const watchedDeliveryCharge = watch('deliveryCharge');
    const watchedPackagingCharge = watch('packagingCharge');
    const watchedAmountPaid = watch('amountPaid');
    const watchedIsCredit = watch('isCredit');

    // Main Bill Calculation Hook
    const { totalAmount, totalDiscount, totalTaxAmount, grandTotal, remainingAmount } = useMemo(() => {
        let totalAmount = 0;
        let totalDiscount = 0;
        let totalTaxAmount = 0;

        watchedItems.forEach((item) => {
            const { itemTotal, discountAmount, taxAmount } = calculateItemTotal(item);
            totalAmount += item.quantity * item.price;
            totalDiscount += discountAmount;
            totalTaxAmount += taxAmount;
        });

        const subTotal = (totalAmount - totalDiscount) + totalTaxAmount;
        const totalDiscountAmount = totalDiscount + watchedDiscount;

        let totalAfterDiscount = subTotal - watchedDiscount;
        if (totalAfterDiscount < 0) totalAfterDiscount = 0;

        const grandTotal = totalAfterDiscount + watchedDeliveryCharge + watchedPackagingCharge;

        setValue('taxAmount', totalTaxAmount, { shouldValidate: true });

        const remainingAmount = grandTotal - watchedAmountPaid;

        return {
            totalAmount,
            totalDiscount: totalDiscountAmount,
            totalTaxAmount,
            grandTotal,
            remainingAmount,
        };
    }, [watchedItems, watchedDiscount, watchedDeliveryCharge, watchedPackagingCharge, watchedAmountPaid, setValue]);

    const onSubmit = async (data) => {
        const finalData = {
            ...data,
            totalAmount: totalAmount,
            grandTotal: grandTotal,
            paymentStatus: data.amountPaid >= grandTotal ? 'paid' : data.amountPaid > 0 ? 'partial' : 'pending',
            phone: data.phone || undefined,
            email: data.email || undefined,
            address: data.address || undefined,
            creditPeriod: data.isCredit ? data.creditPeriod : undefined,
            creditInterestRate: data.isCredit ? data.creditInterestRate : undefined,
        };


        try {
            const { data } = await axiosClient.post('/khata/add_bill', finalData);

            toast.success(`Bill "${data.customerName}" added successfully! Grand Total: ₹${grandTotal.toFixed(2)}`, {
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                }
            });
            // Reset form after successful submission
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error('Submission Error:', error);
            toast.error(`Error: ${error.message || 'Could not add bill'}`);
        }
    };

    // Professional UI Classes
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-gray-400";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2";
    const errorClass = "text-red-500 text-xs mt-1 animate-pulse";
    const sectionHeaderClass = "text-xl font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-6";
    const cardClass = "bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300";

    const getItemError = (index, field) => errors.items?.[index]?.[field]?.message;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navbar />
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Toaster position="top-right" />

                {/* Header with Animation */}
                <div className="mb-8 transform transition-all duration-500 ease-in-out">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-fade-in">
                        Create New Bill
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create professional invoices with detailed item breakdown
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* 1. Customer Details */}
                    <div className={`${cardClass} animate-slide-up`}>
                        <h2 className={sectionHeaderClass}>Customer Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                                <label htmlFor="customerName" className={labelClass}>
                                    Customer Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="customerName"
                                    type="text"
                                    {...register('customerName')}
                                    className={inputClass}
                                    placeholder="John Doe"
                                />
                                {errors.customerName && <p className={errorClass}>{errors.customerName.message}</p>}
                            </div>
                            <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                                <label htmlFor="phone" className={labelClass}>Phone</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    {...register('phone')}
                                    className={inputClass}
                                    placeholder="9876543210"
                                />
                                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                            </div>
                            <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                                <label htmlFor="email" className={labelClass}>Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className={inputClass}
                                    placeholder="john@example.com"
                                />
                                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                            </div>
                            <div className="lg:col-span-1 transform transition-transform duration-300 hover:scale-[1.02]">
                                <label htmlFor="address" className={labelClass}>Address</label>
                                <input
                                    id="address"
                                    type="text"
                                    {...register('address')}
                                    className={inputClass}
                                    placeholder="City or Full Address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Bill Items Section */}
                    <div className={`${cardClass} animate-slide-up`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={sectionHeaderClass}>Bill Items</h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {fields.length} item{fields.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                            Item Details
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-24">
                                            Qty
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                                            Unit
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                                            Price (₹)
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                                            Disc (%)
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                                            Tax (%)
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                                            Total (₹)
                                        </th>
                                        <th className="px-4 py-4 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {fields.map((field, index) => (
                                        <tr
                                            key={field.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 animate-fade-in"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    {...register(`items.${index}.productName`)}
                                                    className={`${inputClass} !p-3 !text-sm`}
                                                    placeholder="Enter product name"
                                                />
                                                {getItemError(index, 'productName') && (
                                                    <p className={errorClass}>{getItemError(index, 'productName')}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    className={`${inputClass} !p-2 !text-center`}
                                                    min="1"
                                                />
                                                {getItemError(index, 'quantity') && (
                                                    <p className={errorClass}>{getItemError(index, 'quantity')}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <select
                                                    {...register(`items.${index}.unit`)}
                                                    className={`${inputClass} !p-2 !text-center`}
                                                >
                                                    {['kg', 'g', 'l', 'ml', 'pcs', 'pack'].map(unit => (
                                                        <option key={unit} value={unit}>
                                                            {unit}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                                                    className={`${inputClass} !p-2 !text-right`}
                                                    min="0"
                                                    step="0.01"
                                                />
                                                {getItemError(index, 'price') && (
                                                    <p className={errorClass}>{getItemError(index, 'price')}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.discount`, { valueAsNumber: true })}
                                                    className={`${inputClass} !p-2 !text-center`}
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                />
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                                                    className={`${inputClass} !p-2 !text-center`}
                                                    min="0"
                                                    step="0.1"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-white text-right">
                                                ₹{calculateItemTotal(watchedItems[index]).itemTotal.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Remove item"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            type="button"
                            onClick={() => append(defaultItem)}
                            className="mt-6 w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform duration-200">+</span>
                            Add New Item
                        </button>
                        {errors.items && <p className={`${errorClass} text-center mt-3`}>{errors.items.message}</p>}
                    </div>

                    {/* 3. Summary and Payment Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Payment & Credit Options */}
                        <div className={`${cardClass} lg:col-span-2 animate-slide-up`}>
                            <h2 className={sectionHeaderClass}>Payment & Additional Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                                    <label htmlFor="paymentMethod" className={labelClass}>
                                        Payment Method
                                    </label>
                                    <select
                                        id="paymentMethod"
                                        {...register('paymentMethod')}
                                        className={inputClass}
                                    >
                                        {['cash', 'card', 'upi', 'bank_transfer', 'credit'].map(method => (
                                            <option key={method} value={method}>
                                                {method.replace('_', ' ').toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                                    <label htmlFor="discount" className={labelClass}>
                                        Bill Discount (₹)
                                    </label>
                                    <input
                                        id="discount"
                                        type="number"
                                        {...register('discount', { valueAsNumber: true })}
                                        className={inputClass}
                                        min="0"
                                        placeholder="0"
                                    />
                                    {errors.discount && <p className={errorClass}>{errors.discount.message}</p>}
                                </div>

                                <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                                    <label htmlFor="deliveryCharge" className={labelClass}>
                                        Delivery Charge (₹)
                                    </label>
                                    <input
                                        id="deliveryCharge"
                                        type="number"
                                        {...register('deliveryCharge', { valueAsNumber: true })}
                                        className={inputClass}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                                    <label htmlFor="packagingCharge" className={labelClass}>
                                        Packaging Charge (₹)
                                    </label>
                                    <input
                                        id="packagingCharge"
                                        type="number"
                                        {...register('packagingCharge', { valueAsNumber: true })}
                                        className={inputClass}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Credit Section */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <label htmlFor="isCredit" className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                            Credit Bill
                                        </label>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Enable for deferred payments
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            id="isCredit"
                                            type="checkbox"
                                            {...register('isCredit')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-600 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-800"></div>
                                    </label>
                                </div>

                                {watchedIsCredit && (
                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                                        <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                                            <label htmlFor="creditPeriod" className={labelClass}>
                                                Credit Period (Days) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="creditPeriod"
                                                type="number"
                                                {...register('creditPeriod', { valueAsNumber: true })}
                                                className={inputClass}
                                                min="1"
                                                placeholder="30"
                                            />
                                            {errors.creditPeriod && <p className={errorClass}>{errors.creditPeriod.message}</p>}
                                        </div>
                                        <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                                            <label htmlFor="creditInterestRate" className={labelClass}>
                                                Interest Rate (%)
                                            </label>
                                            <input
                                                id="creditInterestRate"
                                                type="number"
                                                {...register('creditInterestRate', { valueAsNumber: true })}
                                                className={inputClass}
                                                min="0"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bill Summary */}
                        <div className={`${cardClass} lg:col-span-1 space-y-4 animate-slide-up`}>
                            <h2 className={sectionHeaderClass}>Bill Summary</h2>

                            <div className="space-y-3">
                                <BillSummaryLine label="Sub Total" value={totalAmount} />
                                <BillSummaryLine label="Item Discounts" value={-totalDiscount} isNegative />
                                <BillSummaryLine label="Item Taxes" value={totalTaxAmount} />
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <BillSummaryLine label="Total After Items" value={(totalAmount - totalDiscount) + totalTaxAmount} isTotal />
                                </div>

                                <BillSummaryLine label="Bill Discount" value={-watchedDiscount} isNegative />
                                <BillSummaryLine label="Delivery Charge" value={watchedDeliveryCharge} />
                                <BillSummaryLine label="Packaging Charge" value={watchedPackagingCharge} />

                                <div className="border-t-2 border-gray-800 dark:border-gray-200 pt-4 mt-4">
                                    <BillSummaryLine label="GRAND TOTAL" value={grandTotal} isGrandTotal />
                                </div>
                            </div>

                            {/* Amount Paid Input */}
                            <div className="pt-4 transform transition-transform duration-300 hover:scale-[1.02]">
                                <label htmlFor="amountPaid" className={`${labelClass} text-lg font-bold`}>
                                    Amount Paid (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="amountPaid"
                                    type="number"
                                    {...register('amountPaid', { valueAsNumber: true })}
                                    className={`${inputClass} text-2xl font-bold !p-4`}
                                    min="0"
                                    step="0.01"
                                    placeholder={grandTotal.toFixed(2)}
                                />
                                {errors.amountPaid && <p className={errorClass}>{errors.amountPaid.message}</p>}
                            </div>

                            {/* Remaining Amount */}
                            <div className={`mt-4 p-4 rounded-xl text-center transition-all duration-300 ${remainingAmount > 0
                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                }`}>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {remainingAmount > 0 ? 'Remaining Amount' : 'Payment Complete'}
                                </p>
                                <p className={`text-2xl font-bold mt-1 ${remainingAmount > 0
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-green-600 dark:text-green-400'
                                    }`}>
                                    ₹{remainingAmount.toFixed(2)}
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-6 py-4 px-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    'Save Bill'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Helper Component for Summary Lines
const BillSummaryLine = ({ label, value, isNegative = false, isTotal = false, isGrandTotal = false }) => (
    <div className={`flex justify-between items-center py-2 ${isGrandTotal ? 'font-bold text-lg' : isTotal ? 'font-semibold' : 'text-sm'
        } transition-colors duration-200`}>
        <span className={`${isGrandTotal ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
            {label}
        </span>
        <span className={`font-mono ${isNegative
            ? 'text-red-500'
            : isGrandTotal
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-900 dark:text-white'
            }`}>
            {isNegative ? '-' : ''}₹{Math.abs(value).toFixed(2)}
        </span>
    </div>
);

export default AddBillPage;