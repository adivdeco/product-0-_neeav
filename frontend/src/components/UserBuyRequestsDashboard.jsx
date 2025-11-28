import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getUserBuyRequests,
    cancelBuyRequest,
    markBuyRequestReceived,
    clearError,
    updateBuyRequestStatus
} from '../redux/slice/userBuyRequestSlice';
import Loading from './Loader';
import { toast } from 'react-toastify';
import SocketService from '../utils/socket';
import {
    FaBox, FaRupeeSign, FaMapMarkerAlt, FaCalendarAlt, FaStore,
    FaPhone, FaEnvelope, FaTimes, FaCheck, FaTruck, FaClock,
    FaExclamationTriangle, FaShippingFast, FaHome
} from 'react-icons/fa';
import Navbar from './home/navbar';

const UserBuyRequestsDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { userBuyRequests, loading, error, pagination } = useSelector((state) => state.userBuyRequests);
    console.log(userBuyRequests);


    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showShopModal, setShowShopModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        if (user) {
            dispatch(getUserBuyRequests({ page: currentPage, status: statusFilter }));
        }
    }, [dispatch, user, currentPage, statusFilter]);

    useEffect(() => {
        const handleOrderShipped = (data) => {
            console.log('🚚 Order shipped update:', data);
            dispatch(updateBuyRequestStatus({
                requestId: data.buyRequest._id,
                status: 'shipped'
            }));
            toast.info('Your order has been shipped! 🚚');
        };

        const handleOrderDelivered = (data) => {
            console.log('🎉 Order delivered update:', data);
            dispatch(updateBuyRequestStatus({
                requestId: data.buyRequest._id,
                status: 'completed',
                actualDelivery: data.buyRequest.actualDelivery
            }));
            toast.success('Your order has been delivered! 🎉');
        };

        if (SocketService.socket) {
            SocketService.socket.on('order_shipped', handleOrderShipped);
            SocketService.socket.on('order_delivered', handleOrderDelivered);
        }

        return () => {
            if (SocketService.socket) {
                SocketService.socket.off('order_shipped', handleOrderShipped);
                SocketService.socket.off('order_delivered', handleOrderDelivered);
            }
        };
    }, [dispatch]);

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

    const handleCancel = (request) => {
        setSelectedRequest(request);
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        if (selectedRequest) {
            await dispatch(cancelBuyRequest({
                requestId: selectedRequest._id,
                reason: 'Cancelled by user'
            }));

            setShowCancelModal(false);
            setSelectedRequest(null);
            toast.success('Purchase request cancelled successfully!');
            dispatch(getUserBuyRequests({ page: currentPage, status: statusFilter }));
        }
    };

    const handleMarkReceived = async (requestId) => {
        if (window.confirm('Have you received this order? This will mark the order as completed.')) {
            await dispatch(markBuyRequestReceived(requestId));
            toast.success('Order marked as received!');
            dispatch(getUserBuyRequests({ page: currentPage, status: statusFilter }));
        }
    };

    const handleViewShop = (shop) => {
        setSelectedRequest({ shopOwner: shop });
        setShowShopModal(true);
    };

    // UI Helpers
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 ring-yellow-300',
                text: 'Pending Review',
                icon: '⏰'
            },
            accepted: {
                color: 'bg-green-100 text-green-800 ring-green-300',
                text: 'Order Accepted',
                icon: '✅'
            },
            rejected: {
                color: 'bg-red-100 text-red-800 ring-red-300',
                text: 'Rejected',
                icon: '❌'
            },
            completed: {
                color: 'bg-blue-100 text-blue-800 ring-blue-300',
                text: 'Delivered',
                icon: '🎉'
            },
            cancelled: {
                color: 'bg-gray-100 text-gray-800 ring-gray-300',
                text: 'Cancelled',
                icon: '🚫'
            },
            shipped: {
                color: 'bg-purple-100 text-purple-800 ring-purple-300',
                text: 'Shipped',
                icon: '🚚'
            }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.color} ring-1 ring-inset`}>
                <span className="mr-1">{config.icon}</span>
                {config.text}
            </span>
        );
    };

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

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHrs < 1) return 'Just now';
        if (diffHrs < 24) return `${diffHrs} hours ago`;
        return `${Math.floor(diffHrs / 24)} days ago`;
    };

    const calculateOrderSummary = (request) => {
        const subtotal = request.product?.price * request.quantity;
        const taxAmount = (subtotal * (request.product?.taxRate || 18)) / 100;
        const shippingCost = request.product?.shipping?.isFree ? 0 : (request.product?.shipping?.cost || 50);
        const totalPrice = subtotal + taxAmount + shippingCost;

        return { subtotal, taxAmount, shippingCost, totalPrice };
    };

    const ShopCard = ({ shop }) => {
        if (!shop) return (
            <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-gray-500 font-medium">Shop information not available.</p>
            </div>
        );

        return (
            <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-xl shadow-md transition duration-300 hover:shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {shop.name?.charAt(0) || 'S'}
                </div>
                <h4 className="mt-3 text-lg font-semibold text-gray-900">{shop.name || 'Shop'}</h4>
                <p className="text-sm text-gray-500">{shop.shopName || 'Building Materials Store'}</p>
                <button
                    onClick={() => handleViewShop(shop)}
                    className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    View Shop Details
                </button>
            </div>
        );
    };

    const ShopDetailsModal = ({ shop, onClose }) => {
        const shopData = shop?.shopOwner;
        if (!shopData) return null;

        return (
            <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Shop Details</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center text-center border-b pb-5 mb-5">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4">
                            {shopData.name?.charAt(0) || 'S'}
                        </div>
                        <h4 className="text-xl font-extrabold text-gray-900">{shopData.name}</h4>
                        <p className="text-md text-gray-600 font-medium">{shopData.storeDetails?.storeName || 'Building Materials Store'}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <FaStore className="w-5 h-5 text-blue-500 mr-3" />
                            <div>
                                <span className="text-gray-700 font-medium">Shop Name:</span>
                                <span className="ml-2 text-gray-600">{shopData.storeDetails?.storeName || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <FaPhone className="w-5 h-5 text-blue-500 mr-3" />
                            <div>
                                <span className="text-gray-700 font-medium">Phone:</span>
                                <span className="ml-2 text-gray-600">{shopData.phone || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <FaEnvelope className="w-5 h-5 text-blue-500 mr-3" />
                            <div>
                                <span className="text-gray-700 font-medium">Email:</span>
                                <span className="ml-2 text-gray-600">{shopData.email || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <FaMapMarkerAlt className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <span className="text-gray-700 font-medium block">Address:</span>
                                <p className="text-gray-600 mt-1">
                                    {shopData.address?.street && `${shopData.address.street}, `}
                                    {shopData.address?.city && `${shopData.address.city}, `}
                                    {shopData.address?.state && `${shopData.address.state} - `}
                                    {shopData.address?.pincode || ''}
                                </p>
                            </div>
                        </div>
                        {shopData.storeDetails?.gstNumber && (
                            <div className="flex items-center">
                                <span className="text-gray-700 font-medium">GST:</span>
                                <span className="ml-2 text-gray-600">{shopData.storeDetails.gstNumber}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const OrderTimeline = ({ request }) => {
        const steps = [
            { status: 'pending', label: 'Order Placed', icon: '📝' },
            { status: 'accepted', label: 'Order Accepted', icon: '✅' },
            { status: 'shipped', label: 'Shipped', icon: '🚚' },
            { status: 'completed', label: 'Delivered', icon: '🎉' }
        ];

        const currentStepIndex = steps.findIndex(step => step.status === request.status);

        return (
            <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Status</h4>
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.status} className="flex flex-col items-center flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${index <= currentStepIndex
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-500'
                                }`}>
                                {step.icon}
                            </div>
                            <span className={`text-xs mt-1 text-center ${index <= currentStepIndex ? 'text-green-600 font-medium' : 'text-gray-500'
                                }`}>
                                {step.label}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`h-1 flex-1 mt-4 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                                    }`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 ">
            <Navbar />
            <div className="max-w-7xl py-8 mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Purchase Requests 🛒</h1>
                    <p className="text-gray-600 mt-2">Track and manage your product orders</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FaBox className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <FaClock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {userBuyRequests.filter(req => req.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FaCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Accepted</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {userBuyRequests.filter(req => req.status === 'accepted').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FaTruck className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {userBuyRequests.filter(req => req.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
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
                                <option value="completed">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>



                {/* Requests List */}
                {loading && userBuyRequests.length === 0 ? (
                    <Loading text="Loading your purchase requests..." />
                ) : (
                    <div className="space-y-6">
                        {userBuyRequests.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200">
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchase requests</h3>
                                <p className="text-gray-600">You haven't placed any orders yet.</p>
                            </div>
                        ) : (
                            userBuyRequests.map((request) => {
                                const orderSummary = calculateOrderSummary(request);

                                return (
                                    <div key={request._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                                            {/* Order Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusBadge(request.status)}
                                                        <span className="text-sm text-gray-500">
                                                            {formatTimeAgo(request.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-green-600">
                                                            {formatCurrency(request.totalPrice)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Qty: {request.quantity} • {formatDate(request.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex items-start gap-4 mb-4">
                                                    <img
                                                        src={request.product?.images?.[0]?.url || request.product?.ProductImage}
                                                        alt={request.product?.name}
                                                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                            {request.product?.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {request.product?.category} • {request.product?.brand || 'No Brand'}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 text-sm">
                                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                                Unit: {request.product?.unit}
                                                            </span>
                                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                                Price: {formatCurrency(request.product?.price)}/unit
                                                            </span>
                                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                                Quantity: {request.quantity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Timeline */}
                                                <OrderTimeline request={request} />

                                                {/* Delivery & Payment Info */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    {/* Delivery Address */}
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                            <FaMapMarkerAlt className="w-4 h-4 text-blue-500 mr-2" />
                                                            Delivery Address
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {request.shippingAddress?.street}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {request.shippingAddress?.city}, {request.shippingAddress?.state} - {request.shippingAddress?.pincode}
                                                        </p>
                                                        {request.shippingAddress?.landmark && (
                                                            <p className="text-sm text-gray-600">
                                                                Landmark: {request.shippingAddress.landmark}
                                                            </p>
                                                        )}
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            📞 {request.contactInfo?.phone}
                                                        </p>
                                                        {request.expectedDelivery && (
                                                            <p className="text-sm text-green-600 mt-1">
                                                                <FaCalendarAlt className="inline w-3 h-3 mr-1" />
                                                                Expected: {formatDate(request.expectedDelivery)}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Order Summary */}
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                                                        <div className="space-y-1 text-sm">
                                                            <div className="flex justify-between">
                                                                <span>Subtotal:</span>
                                                                <span>{formatCurrency(orderSummary.subtotal)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Tax ({request.product?.taxRate || 18}%):</span>
                                                                <span>{formatCurrency(orderSummary.taxAmount)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Shipping:</span>
                                                                <span>
                                                                    {orderSummary.shippingCost === 0
                                                                        ? 'FREE'
                                                                        : formatCurrency(orderSummary.shippingCost)
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="border-t border-gray-200 pt-1">
                                                                <div className="flex justify-between font-semibold">
                                                                    <span>Total:</span>
                                                                    <span className="text-green-600">{formatCurrency(orderSummary.totalPrice)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Payment Method: {request.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : request.paymentMethod}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Customer Message */}
                                                {request.message && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-sm text-blue-800">
                                                            <span className="font-medium">Your Note:</span> {request.message}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Rejection Reason */}
                                                {request.status === 'rejected' && request.rejectionReason && (
                                                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                                        <p className="text-sm text-red-700">
                                                            <span className="font-medium">Rejection Reason:</span> {request.rejectionReason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Shop and Actions */}
                                            <div className="flex flex-col gap-4 lg:w-64">
                                                {/* <div>
                                                    <h4 className="text-md font-bold text-gray-800 mb-3">Seller</h4>
                                                    <ShopCard shop={request.shopOwner} />
                                                </div> */}

                                                {/* User Actions */}
                                                <div className="flex flex-col gap-2">
                                                    {request.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancel(request)}
                                                            className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                                        >
                                                            <FaTimes className="mr-2" /> Cancel Order
                                                        </button>
                                                    )}

                                                    {request.status === 'accepted' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleMarkReceived(request._id)}
                                                                className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                                            >
                                                                <FaCheck className="mr-2" /> Mark Received
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancel(request)}
                                                                className="flex items-center justify-center w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                                            >
                                                                <FaTimes className="mr-2" /> Cancel Order
                                                            </button>
                                                        </>
                                                    )}

                                                    {request.status === 'shipped' && (
                                                        <button
                                                            onClick={() => handleMarkReceived(request._id)}
                                                            className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                                        >
                                                            <FaCheck className="mr-2" /> Confirm Delivery
                                                        </button>
                                                    )}

                                                    {request.status === 'completed' && (
                                                        <div className="p-3 bg-green-50 rounded-lg text-center">
                                                            <p className="text-sm text-green-700 font-medium">
                                                                ✅ Order Completed
                                                            </p>
                                                            <p className="text-xs text-green-600">
                                                                {formatDate(request.updatedAt)}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
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
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
                                        className={`px-4 py-2 text-sm font-medium rounded-lg ${currentPage === page
                                            ? 'bg-blue-600 text-white'
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
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Order</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>

                        {selectedRequest && (
                            <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                                <p className="text-sm text-yellow-800">
                                    <FaExclamationTriangle className="inline w-4 h-4 mr-1" />
                                    <strong>Order:</strong> {selectedRequest.quantity} x {selectedRequest.product?.name}
                                </p>
                                <p className="text-sm text-yellow-800">
                                    <strong>Amount:</strong> {formatCurrency(selectedRequest.totalPrice)}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Shop Details Modal */}
            {showShopModal && (
                <ShopDetailsModal
                    shop={selectedRequest}
                    onClose={() => setShowShopModal(false)}
                />
            )}
        </div>
    );
};

export default UserBuyRequestsDashboard;