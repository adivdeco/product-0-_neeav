// AddBillPage.jsx

import React, { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// Import the schema from the separate file
import { AddBillSchema } from './billValidationSchema';
// import Navbar from './Navbar'; 

// --- Utility Function (Kept here as it's tightly coupled with UI calculations) ---
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
        productId: '',
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
        resolver: zodResolver(AddBillSchema), // Use the imported schema
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
            creditPeriod: null, // Use null for optional numbers
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
        const totalDiscountAmount = totalDiscount + watchedDiscount; // Sum of item discounts + bill discount

        // Apply bill-level discount from the calculated subTotal
        let totalAfterDiscount = subTotal - watchedDiscount;
        if (totalAfterDiscount < 0) totalAfterDiscount = 0;

        const grandTotal = totalAfterDiscount + watchedDeliveryCharge + watchedPackagingCharge;

        // IMPORTANT: Update the taxAmount field in the form state (required for backend)
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
        // Inject calculated fields into the data object before sending
        const finalData = {
            ...data,
            // Ensure only the properties expected by the backend are sent
            totalAmount: totalAmount, // raw total before taxes/discounts
            // taxAmount is already in data via setValue in useMemo
            grandTotal: grandTotal,
            paymentStatus: data.amountPaid >= grandTotal ? 'paid' : data.amountPaid > 0 ? 'partial' : 'pending',

            // Clean up optional fields if they are empty strings
            phone: data.phone || undefined,
            email: data.email || undefined,
            address: data.address || undefined,
            creditPeriod: data.isCredit ? data.creditPeriod : undefined,
            creditInterestRate: data.isCredit ? data.creditInterestRate : undefined,
        };

        console.log('Sending Bill Data:', finalData);

        try {
            // --- Replace with your actual API call ---
            // const response = await fetch('/api/bills/add', { ... });
            // if (!response.ok) { throw new Error(...) }
            // await response.json();

            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Bill added successfully! Grand Total: ₹' + grandTotal.toFixed(2));
        } catch (error) {
            console.error('Submission Error:', error);
            toast.error(`Error: ${error.message || 'Could not add bill'}`);
        }
    };


    // Tailwind Utility Classes (Same as before)
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";
    const errorClass = "text-red-500 text-xs mt-1";
    const sectionHeaderClass = "text-xl font-semibold text-gray-800 dark:text-white border-b pb-2 mb-4";
    const cardClass = "bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6";

    // Helper for item field array
    const getItemError = (index, field) => errors.items?.[index]?.[field]?.message;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* <Navbar /> */}
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create New Bill 🧾</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* 1. Customer Details */}
                    <div className={cardClass}>
                        <h2 className={sectionHeaderClass}>Customer Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label htmlFor="customerName" className={labelClass}>Customer Name <span className="text-red-500">*</span></label>
                                <input id="customerName" type="text" {...register('customerName')} className={inputClass} placeholder="John Doe" />
                                {errors.customerName && <p className={errorClass}>{errors.customerName.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="phone" className={labelClass}>Phone</label>
                                <input id="phone" type="tel" {...register('phone')} className={inputClass} placeholder="9876543210" />
                                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="email" className={labelClass}>Email</label>
                                <input id="email" type="email" {...register('email')} className={inputClass} placeholder="john@example.com" />
                                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                            </div>
                            <div className="lg:col-span-1">
                                <label htmlFor="address" className={labelClass}>Address</label>
                                <input id="address" type="text" {...register('address')} className={inputClass} placeholder="City or Full Address" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Bill Items Section (Rest of the component remains the same) */}
                    {/* ... (Item table JSX from the previous response) ... */}

                    <div className={cardClass}>
                        <h2 className={sectionHeaderClass}>Bill Items</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">Qty</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">Disc (%)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">Tax (%)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Total</th>
                                        <th className="px-6 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <input
                                                    type="text"
                                                    {...register(`items.${index}.productName`)}
                                                    className={`${inputClass} !p-2`}
                                                    placeholder="Product Name"
                                                />
                                                {getItemError(index, 'productName') && <p className={errorClass}>{getItemError(index, 'productName')}</p>}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                    className={`${inputClass} !p-2`}
                                                    min="1"
                                                />
                                                {getItemError(index, 'quantity') && <p className={errorClass}>{getItemError(index, 'quantity')}</p>}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <select
                                                    {...register(`items.${index}.unit`)}
                                                    className={`${inputClass} !p-2`}
                                                >
                                                    {['kg', 'g', 'l', 'ml', 'pcs', 'pack'].map(unit => (
                                                        <option key={unit} value={unit}>{unit}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                                                    className={`${inputClass} !p-2`}
                                                    min="0.01"
                                                />
                                                {getItemError(index, 'price') && <p className={errorClass}>{getItemError(index, 'price')}</p>}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.discount`, { valueAsNumber: true })}
                                                    className={`${inputClass} !p-2`}
                                                    min="0"
                                                    max="100"
                                                />
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap">
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                                                    className={`${inputClass} !p-2`}
                                                    min="0"
                                                />
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap font-semibold text-gray-900 dark:text-white">
                                                ₹{calculateItemTotal(watchedItems[index]).itemTotal.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    ❌
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
                            className="mt-4 p-2 w-full border border-dashed border-indigo-300 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
                        >
                            + Add Item
                        </button>
                        {errors.items && <p className={errorClass + " text-center"}>{errors.items.message}</p>}
                    </div>

                    {/* 3. Summary and Payment Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Payment & Credit Options (Col 1) */}
                        <div className={cardClass + " lg:col-span-2"}>
                            <h2 className={sectionHeaderClass}>Payment & Other Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Payment Method */}
                                <div>
                                    <label htmlFor="paymentMethod" className={labelClass}>Payment Method</label>
                                    <select id="paymentMethod" {...register('paymentMethod')} className={inputClass}>
                                        {['cash', 'card', 'upi', 'bank_transfer', 'credit'].map(method => (
                                            <option key={method} value={method}>{method.replace('_', ' ').toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bill-level Discount */}
                                <div>
                                    <label htmlFor="discount" className={labelClass}>Bill Discount (₹)</label>
                                    <input id="discount" type="number" {...register('discount', { valueAsNumber: true })} className={inputClass} min="0" placeholder="0" />
                                    {errors.discount && <p className={errorClass}>{errors.discount.message}</p>}
                                </div>

                                {/* Delivery Charge */}
                                <div>
                                    <label htmlFor="deliveryCharge" className={labelClass}>Delivery Charge (₹)</label>
                                    <input id="deliveryCharge" type="number" {...register('deliveryCharge', { valueAsNumber: true })} className={inputClass} min="0" placeholder="0" />
                                </div>

                                {/* Packaging Charge */}
                                <div>
                                    <label htmlFor="packagingCharge" className={labelClass}>Packaging Charge (₹)</label>
                                    <input id="packagingCharge" type="number" {...register('packagingCharge', { valueAsNumber: true })} className={inputClass} min="0" placeholder="0" />
                                </div>
                            </div>

                            {/* Credit Toggle */}
                            <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                <label htmlFor="isCredit" className="font-semibold text-gray-800 dark:text-gray-200">Is this a Credit Bill?</label>
                                <input
                                    id="isCredit"
                                    type="checkbox"
                                    {...register('isCredit')}
                                    className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                            </div>

                            {/* Credit Details */}
                            {watchedIsCredit && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="creditPeriod" className={labelClass}>Credit Period (Days) <span className="text-red-500">*</span></label>
                                        <input id="creditPeriod" type="number" {...register('creditPeriod', { valueAsNumber: true })} className={inputClass} min="1" placeholder="30" />
                                        {errors.creditPeriod && <p className={errorClass}>{errors.creditPeriod.message}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="creditInterestRate" className={labelClass}>Credit Interest Rate (%)</label>
                                        <input id="creditInterestRate" type="number" {...register('creditInterestRate', { valueAsNumber: true })} className={inputClass} min="0" placeholder="0" />
                                    </div>
                                </div>
                            )}

                            {/* Notes and Reference */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="notes" className={labelClass}>Notes</label>
                                    <textarea id="notes" {...register('notes')} rows="2" className={inputClass} placeholder="Any specific notes for the customer or bill..."></textarea>
                                </div>
                                <div>
                                    <label htmlFor="referenceNumber" className={labelClass}>Reference Number</label>
                                    <input id="referenceNumber" type="text" {...register('referenceNumber')} className={inputClass} placeholder="e.g., Cheque No., Txn ID" />
                                </div>
                            </div>
                        </div>

                        {/* Bill Summary (Col 2) */}
                        <div className={cardClass + " lg:col-span-1 space-y-4"}>
                            <h2 className={sectionHeaderClass}>Bill Summary</h2>

                            <BillSummaryLine label="Sub Total (Raw)" value={totalAmount} />
                            <BillSummaryLine label="Item Discounts" value={totalDiscount * -1} isNegative />
                            <BillSummaryLine label="Item Taxes" value={totalTaxAmount} />
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                                <BillSummaryLine label="Total After Items" value={(totalAmount - totalDiscount) + totalTaxAmount} isTotal />
                            </div>

                            <BillSummaryLine label="Bill Discount" value={watchedDiscount * -1} isNegative />
                            <BillSummaryLine label="Delivery Charge" value={watchedDeliveryCharge} />
                            <BillSummaryLine label="Packaging Charge" value={watchedPackagingCharge} />

                            <div className="border-t-2 border-indigo-500 pt-4">
                                <BillSummaryLine label="GRAND TOTAL" value={grandTotal} isGrandTotal />
                            </div>

                            {/* Amount Paid Input */}
                            <div className="pt-2">
                                <label htmlFor="amountPaid" className={labelClass + " text-lg font-bold"}>Amount Paid (₹) <span className="text-red-500">*</span></label>
                                <input id="amountPaid" type="number" {...register('amountPaid', { valueAsNumber: true })} className={`${inputClass} text-2xl font-bold`} min="0" placeholder={grandTotal.toFixed(2)} />
                                {errors.amountPaid && <p className={errorClass}>{errors.amountPaid.message}</p>}
                            </div>

                            {/* Remaining Amount */}
                            <div className="mt-4 p-3 rounded-lg text-center font-bold" style={{ backgroundColor: remainingAmount > 0 ? '#fef2f2' : '#f0fdf4', color: remainingAmount > 0 ? '#dc2626' : '#16a34a' }}>
                                <p className="text-sm">Remaining Amount / Due</p>
                                <p className="text-3xl">₹{remainingAmount.toFixed(2)}</p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                            >
                                {isSubmitting ? 'Processing...' : 'Save Bill'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Helper Component for Summary Lines (Can also be in a separate file)
const BillSummaryLine = ({ label, value, isNegative = false, isTotal = false, isGrandTotal = false }) => (
    <div className={`flex justify-between ${isGrandTotal ? 'font-extrabold text-xl' : isTotal ? 'font-bold text-lg' : 'text-md text-gray-600 dark:text-gray-300'}`}>
        <span>{label}</span>
        <span className={isNegative ? 'text-red-500' : 'text-gray-900 dark:text-white'}>
            {isNegative ? '-' : ''}₹{Math.abs(value).toFixed(2)}
        </span>
    </div>
);

export default AddBillPage;