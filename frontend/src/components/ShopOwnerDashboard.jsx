import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getShopOwnerRequests,
    acceptBuyRequest,
    rejectBuyRequest,
    shipBuyRequest,
    completeBuyRequest,
    clearError
} from '../redux/slice/buyRequestSlice';
import Loading from './Loader';
import SocketService from '../utils/socket';
import { toast } from 'react-toastify';
import {
    FaBox, FaRupeeSign, FaMapMarkerAlt, FaCalendarAlt, FaStore,
    FaPhone, FaEnvelope, FaTimes, FaCheck, FaTruck, FaShippingFast,
    FaUser, FaExclamationTriangle, FaMoneyBillWave,
    FaCheckCircle
} from 'react-icons/fa';
import Navbar from './home/navbar';

const ShopOwnerDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { shopOwnerRequests, loading, error, pagination } = useSelector((state) => state.buyRequests);

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [expectedDelivery, setExpectedDelivery] = useState('');

    useEffect(() => {
        if (user && user.role === 'store_owner') {
            dispatch(getShopOwnerRequests({ page: currentPage, status: statusFilter }));

            // Set up real-time listeners for new buy requests
            const handleNewBuyRequest = (data) => {
                console.log('🛒 Real-time: New buy request received');
                toast.info('New purchase request received!');
                dispatch(getShopOwnerRequests({ page: currentPage, status: statusFilter }));
            };

            if (SocketService.socket) {
                SocketService.socket.on('new_buy_request', handleNewBuyRequest);
                SocketService.socket.on('new_notification', handleNewBuyRequest);
            }

            return () => {
                if (SocketService.socket) {
                    SocketService.socket.off('new_buy_request', handleNewBuyRequest);
                    SocketService.socket.off('new_notification', handleNewBuyRequest);
                }
            };
        }
    }, [dispatch, user, currentPage, statusFilter]);

    // Clear errors when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Show error toast if there's an error
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleAccept = (request) => {
        setSelectedRequest(request);
        setShowAcceptModal(true);
        // Set default delivery date to 3 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 3);
        setExpectedDelivery(defaultDate.toISOString().split('T')[0]);
    };

    const confirmAccept = async () => {
        if (selectedRequest && expectedDelivery) {
            await dispatch(acceptBuyRequest({
                requestId: selectedRequest._id,
                expectedDelivery: new Date(expectedDelivery).toISOString()
            }));
            setShowAcceptModal(false);
            setSelectedRequest(null);
            setExpectedDelivery('');
            toast.success('Order accepted successfully!');
            // Refresh the list
            dispatch(getShopOwnerRequests({ page: currentPage, status: statusFilter }));
        }
    };

    const handleReject = (request) => {
        setSelectedRequest(request);
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        if (selectedRequest && rejectionReason.trim()) {
            await dispatch(rejectBuyRequest({
                requestId: selectedRequest._id,
                reason: rejectionReason
            }));
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectionReason('');
            toast.success('Order rejected successfully!');
            // Refresh the list
            dispatch(getShopOwnerRequests({ page: currentPage, status: statusFilter }));
        }
    };

    const handleShipOrder = async (requestId) => {
        if (window.confirm('Mark this order as shipped? This will notify the customer.')) {
            await dispatch(shipBuyRequest(requestId));
            toast.success('Order marked as shipped!');
            // Refresh the list
            dispatch(getShopOwnerRequests({ page: currentPage, status: statusFilter }));
        }
    };

    const handleCompleteOrder = async (requestId) => {
        if (window.confirm('Mark this order as completed/delivered?')) {
            await dispatch(completeBuyRequest(requestId));
            toast.success('Order marked as completed!');
            // Refresh the list
            dispatch(getShopOwnerRequests({ page: currentPage, status: statusFilter }));
        }
    };

    // Helper function for status badges
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                color: 'bg-yellow-400 text-yellow-800 border-yellow-200',
                text: 'Pending Review',
                icon: '⏰'
            },
            accepted: {
                color: 'bg-green-400 text-green-800 border-green-200',
                text: 'Accepted',
                icon: '✅'
            },
            shipped: {
                color: 'bg-blue-400 text-blue-800 border-blue-200',
                text: 'Shipped',
                icon: '🚚'
            },
            completed: {
                color: 'bg-purple-400 text-purple-800 border-purple-200',
                text: 'Delivered',
                icon: '🎉'
            },
            rejected: {
                color: 'bg-red-400 text-red-800 border-red-200',
                text: 'Rejected',
                icon: '❌'
            },
            cancelled: {
                color: 'bg-gray-400 text-gray-800 border-gray-200',
                text: 'Cancelled',
                icon: '🚫'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (

            <span className={`${config.color} px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center`}>
                <span className="mr-1">{config.icon}</span>
                {config.text}
            </span>
        )

    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return `${diffDays}d ago`;
    };

    const calculateTotalRevenue = () => {
        return shopOwnerRequests
            .filter(req => req.status === 'completed')
            .reduce((total, req) => total + req.totalPrice, 0);
    };

    const getOrdersCountByStatus = (status) => {
        return shopOwnerRequests.filter(req => req.status === status).length;
    };

    // Order Timeline Component
    const OrderTimeline = ({ request }) => {
        const steps = [
            { status: 'pending', label: 'Order Received', icon: '📥', color: 'yellow' },
            { status: 'accepted', label: 'Order Accepted', icon: '✅', color: 'green' },
            { status: 'shipped', label: 'Shipped', icon: '🚚', color: 'blue' },
            { status: 'completed', label: 'Delivered', icon: '🎉', color: 'purple' }
        ];

        const currentStepIndex = steps.findIndex(step => step.status === request.status);

        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FaShippingFast className="w-4 h-4 mr-2 text-blue-500" />
                    Order Progress
                </h4>
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.status} className="flex flex-col items-center flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm border-2 ${index <= currentStepIndex
                                ? `bg-${step.color}-500 text-white border-${step.color}-500`
                                : 'bg-gray-200 text-gray-500 border-gray-300'
                                }`}>
                                {step.icon}
                            </div>
                            <span className={`text-xs mt-2 text-center font-medium ${index <= currentStepIndex ? `text-${step.color}-600` : 'text-gray-500'
                                }`}>
                                {step.label}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`h-1 flex-1 mt-2 ${index < currentStepIndex ? `bg-${step.color}-500` : 'bg-gray-200'
                                    }`}></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Status Details */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {request.expectedDelivery && (
                        <div className="flex items-center text-green-600">
                            <FaCalendarAlt className="w-4 h-4 mr-2" />
                            <span>Expected: {formatDate(request.expectedDelivery)}</span>
                        </div>
                    )}
                    {request.actualDelivery && (
                        <div className="flex items-center text-purple-600">
                            <FaCalendarAlt className="w-4 h-4 mr-2" />
                            <span>Delivered: {formatDateTime(request.actualDelivery)}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (user?.role !== 'store_owner') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">This page is only accessible to shop owners.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 ">
            <Navbar />
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-600 mt-2">Manage customer orders and track delivery progress</p>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaBox className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-yellow-600">{getOrdersCountByStatus('pending')}</p>
                            </div>
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">⏰</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {getOrdersCountByStatus('accepted') + getOrdersCountByStatus('shipped')}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaTruck className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Revenue</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(calculateTotalRevenue())}
                                </p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaMoneyBillWave className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Orders</option>
                                <option value="pending">Pending Review</option>
                                <option value="accepted">Accepted</option>
                                <option value="shipped">Shipped</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500">
                            Showing {shopOwnerRequests.length} of {pagination.total} orders
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {loading && shopOwnerRequests.length === 0 ? (
                    <Loading text="Loading orders..." />
                ) : (
                    <div className="space-y-6">
                        {shopOwnerRequests.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200">
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-600">
                                    {statusFilter ? `No ${statusFilter} orders` : 'You have no orders yet'}
                                </p>
                            </div>
                        ) : (
                            shopOwnerRequests.map((request) => {
                                const statusConfig = {
                                    pending: {
                                        bg: 'bg-yellow-50 border-yellow-200',
                                        accent: 'border-l-4 border-l-yellow-500',
                                        headerBg: 'bg-yellow-100'
                                    },
                                    accepted: {
                                        bg: 'bg-green-50 border-green-200',
                                        accent: 'border-l-4 border-l-green-500',
                                        headerBg: 'bg-green-100'
                                    },
                                    shipped: {
                                        bg: 'bg-blue-50 border-blue-200',
                                        accent: 'border-l-4 border-l-blue-500',
                                        headerBg: 'bg-blue-100'
                                    },
                                    completed: {
                                        bg: 'bg-purple-50 border-purple-200',
                                        accent: 'border-l-4 border-l-purple-500',
                                        headerBg: 'bg-purple-100'
                                    },
                                    rejected: {
                                        bg: 'bg-red-50 border-red-200',
                                        accent: 'border-l-4 border-l-red-500',
                                        headerBg: 'bg-red-100'
                                    },
                                    cancelled: {
                                        bg: 'bg-gray-50 border-gray-200',
                                        accent: 'border-l-4 border-l-gray-500',
                                        headerBg: 'bg-gray-100'
                                    }
                                };

                                const config = statusConfig[request.status] || statusConfig.pending;

                                return (
                                    <div
                                        key={request._id}
                                        className={`${config.bg} ${config.accent} rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all duration-300`}
                                    >
                                        {/* Order Header with status-colored background */}
                                        <div className={`${config.headerBg} -m-6 mb-6 p-6 rounded-t-2xl`}>
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="relative">
                                                        <img
                                                            src={request.product?.images?.[0]?.url || request.product?.ProductImage || '/placeholder-product.jpg'}
                                                            alt={request.product?.name}
                                                            className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="text-lg font-bold text-gray-900">
                                                                    {request.product?.name}
                                                                </h3>
                                                                <p className="text-sm text-gray-700 mt-1">
                                                                    {request.product?.category} • {request.product?.brand || 'Generic Brand'}
                                                                </p>

                                                                {/* Variant Display */}
                                                                {request.variantDetails && (
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        <span className="text-xs bg-white px-2 py-0.5 rounded border border-blue-100 text-blue-700 font-medium">
                                                                            {request.variantDetails.size} {request.variantDetails.unit}
                                                                        </span>
                                                                        {request.variantDetails.color && (
                                                                            <span className="text-xs bg-white px-2 py-0.5 rounded border border-blue-100 text-gray-600">
                                                                                {request.variantDetails.color}
                                                                            </span>
                                                                        )}
                                                                        <span className="text-xs bg-white px-2 py-0.5 rounded border border-blue-100 text-purple-700 font-medium whitespace-nowrap">
                                                                            Cost Price: {formatCurrency(request.variantDetails.costPrice)}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="mt-2">
                                                                    {getStatusBadge(request.status)}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-2xl font-bold text-gray-900">
                                                                    {formatCurrency(request.totalPrice)}
                                                                </p>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {formatDateTime(request.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Timeline - with matching accent color */}
                                        <div className="mb-6">
                                            <OrderTimeline request={request} />
                                        </div>

                                        {/* Order Details */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                                            {/* Product & Quantity */}
                                            <div className="space-y-3 p-4 bg-white/70 rounded-xl border border-gray-100">
                                                <h4 className="font-semibold text-gray-900 flex items-center">
                                                    <FaBox className="w-4 h-4 mr-2 text-gray-600" />
                                                    Order Details
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Quantity:</span>
                                                        <span className="font-medium bg-gray-100 px-2 py-1 rounded">
                                                            {request.quantity} {request.variantDetails?.unit || request.product?.unit}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Unit Price:</span>
                                                        <span className="font-medium">{formatCurrency(request.variantDetails?.price || request.product?.price)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Total Items:</span>
                                                        <span className="font-medium">{request.quantity}</span>
                                                    </div>
                                                    {request.message && (
                                                        <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                                            <span className="font-medium text-blue-700">Customer Note:</span>
                                                            <p className="text-blue-600 text-sm mt-1">{request.message}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Customer Info */}
                                            <div className="space-y-3 p-4 bg-white/70 rounded-xl border border-gray-100">
                                                <h4 className="font-semibold text-gray-900 flex items-center">
                                                    <FaUser className="w-4 h-4 mr-2 text-gray-600" />
                                                    Customer Info
                                                </h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-base shadow-sm">
                                                            {request.user?.name?.charAt(0)?.toUpperCase() || 'C'}
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="font-bold text-gray-900">{request.user?.name}</p>
                                                            <p className="text-sm text-gray-600">{request.user?.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-gray-600">
                                                            <FaEnvelope className="w-3 h-3 mr-2" />
                                                            <span className="text-sm truncate">{request.user?.email}</span>
                                                        </div>
                                                        {request.contactInfo?.phone && (
                                                            <div className="flex items-center text-gray-600">
                                                                <FaPhone className="w-3 h-3 mr-2" />
                                                                <span className="text-sm">{request.contactInfo.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delivery Info */}
                                            <div className="space-y-3 p-4 bg-white/70 rounded-xl border border-gray-100">
                                                <h4 className="font-semibold text-gray-900 flex items-center">
                                                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-600" />
                                                    Delivery Address
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="text-gray-700">
                                                        <p className="font-bold text-gray-900">{request.shippingAddress?.contactPerson}</p>
                                                        <p className="mt-1">{request.shippingAddress?.street}</p>
                                                        <p>{request.shippingAddress?.city}, {request.shippingAddress?.state}</p>
                                                        <p className="font-medium">{request.shippingAddress?.pincode}</p>
                                                        {request.shippingAddress?.landmark && (
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                <span className="font-medium">Landmark:</span> {request.shippingAddress.landmark}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <div className="flex items-center text-gray-600">
                                                            <FaPhone className="w-3 h-3 mr-2" />
                                                            <span>{request.shippingAddress?.contactPhone}</span>
                                                        </div>
                                                        {request.paymentMethod && (
                                                            <div className="flex items-center text-gray-600 mt-1">
                                                                <FaMoneyBillWave className="w-3 h-3 mr-2" />
                                                                <span>Payment: {request.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions - with matching status colors */}
                                        <div className={`mt-8 pt-6 border-t ${config.headerBg.replace('100', '200')}`}>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAccept(request)}
                                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow flex items-center justify-center"
                                                        >
                                                            <FaCheck className="w-4 h-4 mr-2" />
                                                            Accept Order
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request)}
                                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow flex items-center justify-center"
                                                        >
                                                            <FaTimes className="w-4 h-4 mr-2" />
                                                            Reject Order
                                                        </button>
                                                    </>
                                                )}

                                                {request.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleShipOrder(request._id)}
                                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow flex items-center justify-center"
                                                    >
                                                        <FaTruck className="w-4 h-4 mr-2" />
                                                        Mark as Shipped
                                                    </button>
                                                )}

                                                {request.status === 'shipped' && (
                                                    <button
                                                        onClick={() => handleCompleteOrder(request._id)}
                                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow flex items-center justify-center"
                                                    >
                                                        <FaCheckCircle className="w-4 h-4 mr-2" />
                                                        Mark as Delivered
                                                    </button>
                                                )}

                                                {request.status === 'rejected' && request.rejectionReason && (
                                                    <div className="flex-1 p-4 bg-red-100/50 rounded-xl border border-red-200">
                                                        <p className="text-red-800 font-medium flex items-center">
                                                            <FaExclamationTriangle className="w-4 h-4 mr-2" />
                                                            Order Rejected
                                                        </p>
                                                        <p className="text-sm text-red-700 mt-1">
                                                            <span className="font-medium">Reason:</span> {request.rejectionReason}
                                                        </p>
                                                    </div>
                                                )}

                                                {request.status === 'cancelled' && request.cancellationReason && (
                                                    <div className="flex-1 p-4 bg-gray-100/50 rounded-xl border border-gray-200">
                                                        <p className="text-gray-800 font-medium flex items-center">
                                                            <FaTimes className="w-4 h-4 mr-2" />
                                                            Order Cancelled
                                                        </p>
                                                        <p className="text-sm text-gray-700 mt-1">
                                                            <span className="font-medium">Reason:</span> {request.cancellationReason}
                                                        </p>
                                                    </div>
                                                )}

                                                {request.status === 'completed' && (
                                                    <div className="flex-1 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
                                                        <p className="text-green-800 font-bold flex items-center">
                                                            <FaCheckCircle className="w-5 h-5 mr-2" />
                                                            Order Completed Successfully!
                                                        </p>
                                                        {request.actualDelivery && (
                                                            <p className="text-sm text-green-700 mt-1">
                                                                Delivered on {formatDateTime(request.actualDelivery)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Optional: Show expected delivery for accepted orders */}
                                            {request.status === 'accepted' && request.expectedDelivery && (
                                                <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                                    <p className="text-sm text-blue-700 font-medium">
                                                        📅 Expected Delivery: {formatDate(request.expectedDelivery)}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Optional: Show tracking info for shipped orders */}
                                            {request.status === 'shipped' && request.trackingNumber && (
                                                <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                                    <p className="text-sm text-blue-700 font-medium">
                                                        📦 Tracking Number: <span className="font-mono">{request.trackingNumber}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>

                        {[...Array(pagination.totalPages)].map((_, index) => {
                            const page = index + 1;
                            if (page === 1 || page === pagination.totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentPage === page
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            }
                            return null;
                        })}

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === pagination.totalPages}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Accept Modal */}
            {showAcceptModal && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accept Order</h3>
                        <p className="text-gray-600 mb-4">
                            Please provide the expected delivery date for this order:
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Delivery Date *
                            </label>
                            <input
                                type="date"
                                value={expectedDelivery}
                                onChange={(e) => setExpectedDelivery(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {selectedRequest && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-gray-600">
                                    <strong>Order:</strong> {selectedRequest.quantity} x {selectedRequest.product?.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Total:</strong> {formatCurrency(selectedRequest.totalPrice)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Customer:</strong> {selectedRequest.user?.name}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowAcceptModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAccept}
                                disabled={!expectedDelivery}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                Confirm Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Order</h3>
                        <p className="text-gray-600 mb-4">
                            Please provide a reason for rejecting this order:
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection (e.g., out of stock, delivery not possible, etc.)..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopOwnerDashboard;