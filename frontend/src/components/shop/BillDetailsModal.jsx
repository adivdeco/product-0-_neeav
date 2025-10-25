// src/components/shop/BillDetailsModal.jsx
import React from 'react';
import {
    FiX,
    FiUser,
    FiPhone,
    FiMail,
    FiCalendar,
    FiDollarSign,
    FiPackage,
    FiShoppingCart,
    FiPercent,
    FiCreditCard,
    FiFileText,
    FiHome,
    FiMapPin
} from 'react-icons/fi';
import { format, parseISO } from 'date-fns';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
    } catch (e) {
        return 'Invalid Date';
    }
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

const BillDetailsModal = ({ bill, isOpen, onClose }) => {
    if (!isOpen || !bill) return null;

    // Calculate totals
    const subtotal = bill.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const totalDiscount = bill.items?.reduce((sum, item) => sum + (item.discount || 0), 0) || 0;
    const totalTax = bill.items?.reduce((sum, item) => {
        const itemTotal = (item.price * item.quantity) - (item.discount || 0);
        return sum + (itemTotal * (item.taxRate || 0) / 100);
    }, 0) || 0;

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'partial': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'cash': return '💵';
            case 'card': return '💳';
            case 'upi': return '📱';
            case 'bank_transfer': return '🏦';
            case 'credit': return '📝';
            default: return '💰';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">Bill Details</h2>
                                <p className="text-indigo-100">Invoice # {bill.billNumber}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-indigo-200 transition p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                        <div className="p-6 space-y-6">
                            {/* Bill Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <FiCalendar className="text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Bill Date</p>
                                            <p className="font-semibold">{formatDate(bill.billDate)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <FiCreditCard className="text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Payment Status</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(bill.paymentStatus)}`}>
                                                {bill.paymentStatus?.charAt(0).toUpperCase() + bill.paymentStatus?.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <FiDollarSign className="text-indigo-600" />
                                        <div>
                                            <p className="text-sm text-gray-600">Grand Total</p>
                                            <p className="font-semibold text-lg">{formatCurrency(bill.grandTotal)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer and Shop Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Customer Information */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiUser className="mr-2 text-indigo-600" />
                                        Customer Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600">Name</p>
                                            <p className="font-semibold">{bill.customerName}</p>
                                        </div>
                                        {bill.customerPhone && (
                                            <div className="flex items-center space-x-2">
                                                <FiPhone className="text-gray-400" />
                                                <span className="text-sm">{bill.customerPhone}</span>
                                            </div>
                                        )}
                                        {bill.customerEmail && (
                                            <div className="flex items-center space-x-2">
                                                <FiMail className="text-gray-400" />
                                                <span className="text-sm">{bill.customerEmail}</span>
                                            </div>
                                        )}
                                        {bill.customerId?.address && (
                                            <div className="flex items-start space-x-2">
                                                <FiMapPin className="text-gray-400 mt-1" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Address</p>
                                                    <p className="text-sm">{bill.customerId.address}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Shop Information */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiHome className="mr-2 text-indigo-600" />
                                        Shop Information
                                    </h3>
                                    {bill.shopId ? (
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-600">Shop Name</p>
                                                <p className="font-semibold">{bill.shopId.shopName || 'N/A'}</p>
                                            </div>
                                            {bill.shopId.address && (
                                                <div className="flex items-start space-x-2">
                                                    <FiMapPin className="text-gray-400 mt-1" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Address</p>
                                                        <p className="text-sm">{bill.shopId.address}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {bill.shopId.phone && (
                                                <div className="flex items-center space-x-2">
                                                    <FiPhone className="text-gray-400" />
                                                    <span className="text-sm">{bill.shopId.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No shop information available</p>
                                    )}
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <h3 className="text-lg font-semibold text-gray-800 p-4 bg-gray-50 flex items-center">
                                    <FiShoppingCart className="mr-2 text-indigo-600" />
                                    Items ({bill.items?.length || 0})
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Unit
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Discount
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Tax Rate
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {bill.items?.map((item, index) => {
                                                const itemTotal = (item.price * item.quantity) - (item.discount || 0);
                                                const itemTax = itemTotal * (item.taxRate || 0) / 100;
                                                const itemGrandTotal = itemTotal + itemTax;

                                                return (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                                    <FiPackage className="h-5 w-5 text-indigo-600" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {item.productName}
                                                                    </div>
                                                                    {item.productId && (
                                                                        <div className="text-xs text-gray-500">
                                                                            SKU: {item.productId}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 uppercase">
                                                            {item.unit || 'pcs'}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                                            {formatCurrency(item.price)}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-green-600">
                                                            {item.discount ? formatCurrency(item.discount) : '-'}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                                            {item.taxRate ? `${item.taxRate}%` : '-'}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                                            {formatCurrency(itemGrandTotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Amount Breakdown */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiDollarSign className="mr-2 text-indigo-600" />
                                        Amount Breakdown
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Discount:</span>
                                            <span className="font-medium text-green-600">-{formatCurrency(totalDiscount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax Amount:</span>
                                            <span className="font-medium">{formatCurrency(totalTax)}</span>
                                        </div>
                                        {bill.deliveryCharge > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Delivery Charge:</span>
                                                <span className="font-medium">+{formatCurrency(bill.deliveryCharge)}</span>
                                            </div>
                                        )}
                                        {bill.packagingCharge > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Packaging Charge:</span>
                                                <span className="font-medium">+{formatCurrency(bill.packagingCharge)}</span>
                                            </div>
                                        )}
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Grand Total:</span>
                                                <span className="text-indigo-600">{formatCurrency(bill.grandTotal)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiCreditCard className="mr-2 text-indigo-600" />
                                        Payment Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Payment Method:</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-2xl">{getPaymentMethodIcon(bill.paymentMethod)}</span>
                                                <span className="font-medium capitalize">
                                                    {bill.paymentMethod?.replace('_', ' ') || 'Cash'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Amount Paid:</span>
                                            <span className="font-medium text-green-600">{formatCurrency(bill.amountPaid || 0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Remaining Amount:</span>
                                            <span className="font-medium text-orange-600">
                                                {formatCurrency(bill.grandTotal - (bill.amountPaid || 0))}
                                            </span>
                                        </div>
                                        {bill.dueDate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Due Date:</span>
                                                <span className="font-medium">{formatDate(bill.dueDate)}</span>
                                            </div>
                                        )}
                                        {bill.referenceNumber && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Reference No:</span>
                                                <span className="font-medium">{bill.referenceNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            {(bill.notes || bill.isCredit) && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <FiFileText className="mr-2 text-indigo-600" />
                                        Additional Information
                                    </h3>
                                    <div className="space-y-3">
                                        {bill.notes && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Notes:</p>
                                                <p className="text-sm bg-gray-50 p-3 rounded-lg">{bill.notes}</p>
                                            </div>
                                        )}
                                        {bill.isCredit && (
                                            <div className="flex items-center space-x-4 text-sm">
                                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                                                    Credit Bill
                                                </span>
                                                {bill.creditPeriod && (
                                                    <span className="text-gray-600">
                                                        Credit Period: {bill.creditPeriod} days
                                                    </span>
                                                )}
                                                {bill.creditInterestRate && (
                                                    <span className="text-gray-600">
                                                        Interest Rate: {bill.creditInterestRate}%
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                // Print functionality
                                window.print();
                            }}
                            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                        >
                            Print Bill
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillDetailsModal;