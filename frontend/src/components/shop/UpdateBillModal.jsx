import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axiosClient from '../../api/auth';
import {
    FiX,
    FiDollarSign,
    FiCreditCard,
    FiCalendar,
    FiFileText,
    FiSave,
    FiAlertCircle
} from 'react-icons/fi';
import { format, parseISO } from 'date-fns';

const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        return format(parseISO(dateString), 'yyyy-MM-dd');
    } catch (e) {
        return '';
    }
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

const UpdateBillModal = ({ bill, isOpen, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset
    } = useForm();

    const watchedAmountPaid = watch('amountPaid', bill?.amountPaid || 0);
    const remainingAmount = bill ? (bill.grandTotal - (watchedAmountPaid || 0)) : 0;

    // Reset form when bill changes
    useEffect(() => {
        if (bill) {
            reset({
                amountPaid: bill.amountPaid || 0,
                paymentMethod: bill.paymentMethod || 'cash',
                paymentStatus: bill.paymentStatus || 'pending',
                notes: bill.notes || '',
                referenceNumber: bill.referenceNumber || '',
                dueDate: bill.dueDate ? formatDate(bill.dueDate) : '',
                status: bill.status || 'active'
            });
        }
    }, [bill, reset]);

    const onSubmit = async (data) => {
        if (!bill) return;

        setLoading(true);
        try {
            const updateData = {
                ...data,
                amountPaid: parseFloat(data.amountPaid) || 0,
            };

            // Auto-update payment status based on amount paid
            if (updateData.amountPaid >= bill.grandTotal) {
                updateData.paymentStatus = 'paid';
            } else if (updateData.amountPaid > 0) {
                updateData.paymentStatus = 'partial';
            } else {
                updateData.paymentStatus = 'pending';
            }

            const response = await axiosClient.put(`/khata/update_bill/${bill._id}`, updateData);

            toast.success(`Bill #${bill.billNumber} updated successfully!`);
            onUpdate(response.data.bill);
            onClose();
        } catch (error) {
            console.error('Error updating bill:', error);
            toast.error(`Error: ${error.response?.data?.message || 'Failed to update bill'}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !bill) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">Update Bill</h2>
                                <p className="text-blue-100">Bill # {bill.billNumber}</p>
                                <p className="text-blue-100 text-sm">
                                    Customer: {bill.customerName} | Total: {formatCurrency(bill.grandTotal)}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-blue-200 transition p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                            {/* Payment Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiDollarSign className="inline mr-2" />
                                        Amount Paid
                                    </label>
                                    <input
                                        type="number"
                                        {...register('amountPaid', {
                                            valueAsNumber: true,
                                            min: { value: 0, message: 'Amount cannot be negative' },
                                            max: { value: bill.grandTotal, message: 'Amount cannot exceed grand total' }
                                        })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        step="0.01"
                                        min="0"
                                        max={bill.grandTotal}
                                    />
                                    {errors.amountPaid && (
                                        <p className="text-red-500 text-xs mt-1">{errors.amountPaid.message}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Grand Total: {formatCurrency(bill.grandTotal)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiCreditCard className="inline mr-2" />
                                        Payment Method
                                    </label>
                                    <select
                                        {...register('paymentMethod')}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="upi">UPI</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="credit">Credit</option>
                                    </select>
                                </div>
                            </div>

                            {/* Payment Status Display */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Grand Total</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {formatCurrency(bill.grandTotal)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Amount Paid</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {formatCurrency(watchedAmountPaid || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Remaining</p>
                                        <p className={`text-lg font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(remainingAmount)}
                                        </p>
                                    </div>
                                </div>

                                {/* Auto Payment Status */}
                                <div className="mt-3 text-center">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${remainingAmount === 0 ? 'bg-green-100 text-green-800' :
                                            remainingAmount === bill.grandTotal ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        {remainingAmount === 0 ? 'PAID' :
                                            remainingAmount === bill.grandTotal ? 'PENDING' :
                                                'PARTIAL PAYMENT'}
                                    </span>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <FiCalendar className="inline mr-2" />
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        {...register('dueDate')}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bill Status
                                    </label>
                                    <select
                                        {...register('status')}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>

                            {/* Reference & Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiFileText className="inline mr-2" />
                                    Reference Number
                                </label>
                                <input
                                    type="text"
                                    {...register('referenceNumber')}
                                    placeholder="Transaction ID, Cheque No., etc."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiFileText className="inline mr-2" />
                                    Notes
                                </label>
                                <textarea
                                    {...register('notes')}
                                    rows="3"
                                    placeholder="Additional notes or comments..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                            </div>

                            {/* Warning for Credit Bills */}
                            {bill.isCredit && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-center">
                                        <FiAlertCircle className="text-yellow-600 mr-2" />
                                        <span className="text-yellow-800 font-medium">Credit Bill</span>
                                    </div>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        This is a credit bill. Updating payment information will affect customer's balance.
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-4 h-4" />
                                    Update Bill
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateBillModal;