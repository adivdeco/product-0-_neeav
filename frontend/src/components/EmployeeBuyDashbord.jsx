import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../api/auth';
import Loading from './Loader';
import SocketService from '../utils/socket';
import {
    FaShoppingCart,
    FaUser,
    FaStore,
    FaMoneyBillWave,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaEnvelope,
    FaPhone,
    FaCheck,
    FaTimes,
    FaClock,
    FaExclamationTriangle,
    FaTruck,
    FaBox,
    FaCommentDots,
    FaEye,
    FaSearch,
    FaFilter,
    FaEdit,
    FaShippingFast,
    FaCheckCircle,
    FaUndo
} from 'react-icons/fa';
import Navbar from './home/navbar';

// ===============================================
// --- UI HELPER COMPONENTS ---
// ===============================================

const StatusBadge = ({ status }) => {
    const config = {
        pending: { text: 'Pending', color: 'text-yellow-700', background: 'bg-yellow-100', icon: FaClock },
        accepted: { text: 'Accepted', color: 'text-green-700', background: 'bg-green-100', icon: FaCheck },
        rejected: { text: 'Rejected', color: 'text-red-700', background: 'bg-red-100', icon: FaTimes },
        cancelled: { text: 'Cancelled', color: 'text-gray-700', background: 'bg-gray-100', icon: FaTimes },
        completed: { text: 'Completed', color: 'text-blue-700', background: 'bg-blue-100', icon: FaCheckCircle },
        shipped: { text: 'Shipped', color: 'text-purple-700', background: 'bg-purple-100', icon: FaShippingFast }
    };

    const style = config[status] || { text: status, color: 'text-gray-600', background: 'bg-gray-100', icon: FaClock };
    const IconComponent = style.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.color} ${style.background}`}>
            <IconComponent className="w-3 h-3 mr-1" /> {style.text}
        </span>
    );
};

const PriorityBadge = ({ level }) => {
    const levels = {
        0: { text: 'Normal', color: 'bg-gray-100 text-gray-800', icon: '📊' },
        1: { text: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
        2: { text: 'High', color: 'bg-orange-100 text-orange-800', icon: '🚨' },
        3: { text: 'Urgent', color: 'bg-red-100 text-red-800', icon: '🔥' }
    };

    const config = levels[level] || levels[0];
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
            {config.icon} {config.text}
        </span>
    );
};

// const StatCard = ({ emoji, title, count, color, onClick, description }) => (
//     <div
//         className={`bg-white rounded-2xl p-6 shadow-md border border-gray-200 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${onClick ? 'hover:border-blue-300' : ''}`}
//         onClick={onClick}
//     >
//         <div className="flex items-center justify-between">
//             <div className="flex items-center">
//                 <div className={`p-3 bg-${color}-100 rounded-xl`}>
//                     <span className="text-2xl">{emoji}</span>
//                 </div>
//                 <div className="ml-4">
//                     <p className="text-sm font-medium text-gray-600">{title}</p>
//                     <p className="text-2xl font-bold text-gray-900">{count}</p>
//                     {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
//                 </div>
//             </div>
//         </div>
//     </div>
// );

const ContactCard = ({ entity, role, type = 'user' }) => {
    const defaultAvatar = type === 'shop'
        ? 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=S'
        : 'https://via.placeholder.com/150/50C878/FFFFFF?text=U';

    const avatarUrl = entity?.avatar || defaultAvatar;
    const name = type === 'shop' ? entity?.shopName || entity?.name : entity?.name;
    const email = entity?.email || 'N/A';
    const phone = entity?.phone || 'N/A';
    const shopName = type === 'shop' ? entity?.shopName : null;

    return (
        <div className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
            <img
                className={`h-12 w-12 rounded-full object-cover mr-4 flex-shrink-0 ${type === 'shop' ? 'ring-2 ring-blue-500' : 'ring-2 ring-green-500'}`}
                src={avatarUrl}
                alt={`${role} Avatar`}
            />
            <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-gray-900 truncate">{name}</h5>
                {shopName && <p className="text-xs text-gray-500 truncate">{shopName}</p>}
                <p className="text-xs text-gray-600 capitalize mb-1">{role}</p>

                <div className="space-y-1">
                    <p className="text-xs text-gray-600 flex items-center">
                        <FaEnvelope className="w-3 h-3 mr-1 text-gray-400" />
                        {email}
                    </p>
                    <p className="text-xs text-gray-600 flex items-center">
                        <FaPhone className="w-3 h-3 mr-1 text-gray-400" />
                        {phone}
                    </p>
                </div>
            </div>
        </div>
    );
};

const ProductCard = ({ product, variantDetails }) => (
    <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
        {product?.ProductImage ? (
            <img
                src={product.ProductImage}
                alt={product.name}
                className="h-12 w-12 rounded-lg object-cover mr-3"
            />
        ) : (
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <FaBox className="w-6 h-6 text-blue-600" />
            </div>
        )}
        <div className="flex-1 min-w-0">
            <h6 className="text-sm font-semibold text-gray-900 truncate">{product?.name}</h6>
            {variantDetails ? (
                <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs bg-white px-2 py-0.5 rounded border border-blue-100 text-blue-700 font-medium">
                        {variantDetails.size} {variantDetails.unit}
                    </span>

                    {variantDetails.color && (
                        <span className="text-xs bg-white px-2 py-0.5 rounded border border-blue-100 text-gray-600">
                            {variantDetails.color}
                            
                        </span>
                    )}
                                        <span className="text-xs bg-white px-2 py-0.5 rounded border border-blue-100 text-blue-700 font-medium">
                       CP : ₹{variantDetails.costPrice}
                    </span>
                </div>
            ) : (
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{product?.category}</span>
                </div>
            )}
            <div className="flex justify-between text-xs mt-1 text-gray-700">
                <span>Unit Price:</span>
                <span className="font-bold">₹{Number(variantDetails?.price || product?.price || 0).toFixed(2)}</span>
            </div>
        </div>
    </div>
);

const ContactModal = ({ selectedRequest, contactType, contactMessage, setContactMessage, sendContactMessage, setShowContactModal }) => {
    const target = contactType === 'buyer' ? selectedRequest.user : selectedRequest.shopOwner;
    const targetName = contactType === 'buyer'
        ? selectedRequest.user?.name
        : selectedRequest.shopOwner?.shopName || selectedRequest.shopOwner?.name;
    const targetRole = contactType === 'buyer' ? 'Buyer' : 'Shop Owner';

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                    <FaEnvelope className="w-5 h-5 mr-2 text-blue-600" />
                    Contact {targetRole}
                </h3>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 font-semibold mb-1">
                        Order: {selectedRequest.product?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                        To: <span className="font-medium">{targetName}</span>
                    </p>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                    </label>
                    <textarea
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder={`Enter your message for ${targetName}...`}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => { setShowContactModal(false); setContactMessage(''); }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={sendContactMessage}
                        disabled={!contactMessage.trim()}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                    >
                        Send Message
                    </button>
                </div>
            </div>
        </div>
    );
};

const RequestDetailsModal = ({ request, onClose, onContact }) => {
    if (!request) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{request.product?.name}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <StatusBadge status={request.status} />
                                <PriorityBadge level={request.escalationLevel} />
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FaTimes className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <ProductCard product={request.product} variantDetails={request.variantDetails} />

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Quantity:</span>
                                    <span className="font-semibold">{request.quantity} {request.variantDetails?.unit || request.product?.unit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Price:</span>
                                    <span className="font-semibold">₹{Number(request.totalPrice).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Method:</span>
                                    <span className="font-semibold capitalize">{request.paymentMethod?.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-semibold">{new Date(request.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {request.shippingAddress && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-blue-600" />
                                    Shipping Address
                                </h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p>{request.shippingAddress.street}</p>
                                    <p>{request.shippingAddress.city}, {request.shippingAddress.state} - {request.shippingAddress.pincode}</p>
                                    <p>{request.shippingAddress.country}</p>
                                    {request.shippingAddress.contactPerson && (
                                        <p className="mt-2">
                                            <span className="font-semibold">Contact:</span> {request.shippingAddress.contactPerson} ({request.shippingAddress.contactPhone})
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <ContactCard entity={request.user} role="Buyer" type="user" />
                        <ContactCard entity={request.shopOwner} role="Shop Owner" type="shop" />

                        {request.employeeActions && request.employeeActions.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Action History</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {request.employeeActions.map((action, index) => (
                                        <div key={index} className="text-sm border-l-2 border-blue-500 pl-3">
                                            <div className="flex justify-between">
                                                <span className="font-semibold capitalize">{action.action.replace('_', ' ')}</span>
                                                <span className="text-gray-500 text-xs">
                                                    {new Date(action.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mt-1">{action.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => onContact(request, 'buyer')}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Contact Buyer
                            </button>
                            <button
                                onClick={() => onContact(request, 'shop')}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Contact Shop
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ emoji, title, count, color, onClick, description, loading = false }) => (
    <div
        className={`bg-white rounded-2xl p-6 shadow-md border border-gray-200 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${onClick ? 'hover:border-blue-300' : ''} ${loading ? 'opacity-50' : ''}`}
        onClick={loading ? undefined : onClick}
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <div className={`p-3 bg-${color}-100 rounded-xl`}>
                    <span className="text-2xl">{emoji}</span>
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {loading ? '...' : (count !== undefined ? count : 0)}
                    </p>
                    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
                </div>
            </div>
            {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            )}
        </div>
    </div>
);

// ===============================================
// --- MAIN COMPONENT ---
// ===============================================

const EmployeeBuyRequestDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true); // ADD SEPARATE LOADING FOR STATS
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRequests, setTotalRequests] = useState(0);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [contactType, setContactType] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [statusUpdate, setStatusUpdate] = useState({ status: '', reason: '' });
    const [actionLoading, setActionLoading] = useState(false);

    // Enhanced filters
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        escalationLevel: '',
        assignedToMe: false,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });

    const [stats, setStats] = useState({
        total: 0,
        byStatus: {},
        byEscalation: {},
        assignedToMe: 0,
        expiringSoon: 0
    });

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'co-admin')) {
            fetchBuyRequests();
            fetchStats();
        }
    }, [user, currentPage, filters]);

    // Socket Listener for Real-Time Updates
    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'co-admin')) {
            const handleDataUpdate = () => {
                fetchBuyRequests();
                fetchStats();
            };

            if (SocketService.socket) {
                SocketService.socket.on('new_buy_request', handleDataUpdate);
                SocketService.socket.on('buy_request_status_updated', handleDataUpdate);
                SocketService.socket.on('employee_contact', handleDataUpdate);
            }

            return () => {
                if (SocketService.socket) {
                    SocketService.socket.off('new_buy_request', handleDataUpdate);
                    SocketService.socket.off('buy_request_status_updated', handleDataUpdate);
                    SocketService.socket.off('employee_contact', handleDataUpdate);
                }
            };
        }
    }, [user, currentPage, filters]);

    const fetchBuyRequests = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: currentPage,
                ...filters,
                assignedToMe: filters.assignedToMe.toString()
            }).toString();

            console.log('🔄 Fetching buy requests...');
            const { data } = await axiosClient.get(`/api/employee/buy-requests?${queryParams}`);

            console.log('✅ Buy requests data:', data);

            setRequests(data.requests || []);
            setTotalPages(data.totalPages || 1);
            setTotalRequests(data.total || 0);

            // Update stats from response if available
            if (data.stats) {
                console.log('📊 Stats from main request:', data.stats);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('❌ Error fetching buy requests:', error);
            alert('Failed to fetch buy requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            console.log('🔄 Fetching stats...');
            const { data } = await axiosClient.get('/api/employee/buy-requests/stats');
            console.log('✅ Stats data:', data);
            setStats(prev => ({
                ...prev,
                ...data,
                total: data.total !== undefined ? data.total : prev.total
            }));
        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            // Don't show alert for stats failure, just log it
        } finally {
            setStatsLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    // OPTIMIZED: Better error handling for actions
    const handleStatusUpdate = async (requestId, newStatus, reason = '') => {
        try {
            setActionLoading(true);
            await axiosClient.put(`/api/employee/buy-request/${requestId}/status`, {
                status: newStatus,
                reason
            });

            // Refresh both data and stats
            await Promise.all([fetchBuyRequests(), fetchStats()]);
            setShowStatusModal(false);
            setStatusUpdate({ status: '', reason: '' });
            alert(`Status updated to ${newStatus} successfully!`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeliveryUpdate = async (requestId, deliveryStatus) => {
        try {
            setActionLoading(true);
            await axiosClient.put(`/api/employee/buy-request/${requestId}/delivery`, {
                status: deliveryStatus
            });

            await Promise.all([fetchBuyRequests(), fetchStats()]);
            alert(`Delivery status updated to ${deliveryStatus} successfully!`);
        } catch (error) {
            console.error('Error updating delivery status:', error);
            alert(`Failed to update delivery status: ${error.response?.data?.message || error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleContact = (request, type) => {
        setSelectedRequest(request);
        setContactType(type);
        setShowContactModal(true);
    };

    const sendContactMessage = async () => {
        if (!selectedRequest || !contactMessage.trim()) {
            alert('Please enter a message');
            return;
        }

        try {
            setActionLoading(true);

            const endpoint = contactType === 'buyer'
                ? `/api/employee/buy-request/${selectedRequest._id}/contact-buyer`
                : `/api/employee/buy-request/${selectedRequest._id}/contact-shop`;

            console.log('📤 Sending message to:', endpoint);

            await axiosClient.post(endpoint, {
                message: contactMessage,
                contactMethod: 'in_app'
            });

            setShowContactModal(false);
            setSelectedRequest(null);
            setContactMessage('');
            await Promise.all([fetchBuyRequests(), fetchStats()]);

            alert(`Message sent to ${contactType} successfully!`);
        } catch (error) {
            console.error('❌ Error sending message:', error);
            console.error('Error response:', error.response?.data);
            alert(`Failed to send message: ${error.response?.data?.message || error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusChange = (request, newStatus) => {
        setSelectedRequest(request);
        setStatusUpdate({ status: newStatus, reason: '' });

        if (['rejected', 'cancelled'].includes(newStatus)) {
            setShowStatusModal(true);
        } else {
            handleStatusUpdate(request._id, newStatus);
        }
    };

    const confirmStatusUpdate = () => {
        if (selectedRequest && statusUpdate.status) {
            handleStatusUpdate(selectedRequest._id, statusUpdate.status, statusUpdate.reason);
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setShowDetailsModal(true);
    };

    const getTimeRemaining = (expiresAt) => {
        if (!expiresAt) return { text: 'No expiry', color: 'text-gray-600', bg: 'bg-gray-100' };

        const now = new Date();
        const expires = new Date(expiresAt);
        const diffMs = expires - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHrs < 0) return { text: 'EXPIRED', color: 'text-red-600', bg: 'bg-red-100' };
        if (diffHrs < 2) return { text: `Expires in ${diffHrs} Hr`, color: 'text-red-600', bg: 'bg-red-100' };
        if (diffHrs < 12) return { text: `Expires in ${diffHrs} Hrs`, color: 'text-orange-600', bg: 'bg-orange-100' };
        return { text: `Expires in ${Math.floor(diffHrs)} Hrs`, color: 'text-green-600', bg: 'bg-green-100' };
    };

    // Status-based actions
    const getStatusActions = (request) => {
        const baseActions = [
            {
                label: 'Contact Buyer',
                action: () => handleContact(request, 'buyer'),
                color: 'bg-blue-600 hover:bg-blue-700',
                icon: FaEnvelope
            },
            {
                label: 'Contact Shop',
                action: () => handleContact(request, 'shop'),
                color: 'bg-green-600 hover:bg-green-700',
                icon: FaStore
            }
        ];

        const statusSpecificActions = {
            pending: [
                {
                    label: 'Accept Order',
                    action: () => handleStatusChange(request, 'accepted'),
                    color: 'bg-green-600 hover:bg-green-700',
                    icon: FaCheck
                },
                {
                    label: 'Reject Order',
                    action: () => handleStatusChange(request, 'rejected'),
                    color: 'bg-red-600 hover:bg-red-700',
                    icon: FaTimes
                }
            ],
            accepted: [
                {
                    label: 'Mark as Shipped',
                    action: () => handleDeliveryUpdate(request._id, 'shipped'),
                    color: 'bg-purple-600 hover:bg-purple-700',
                    icon: FaShippingFast
                }
            ],
            shipped: [
                {
                    label: 'Mark as Completed',
                    action: () => handleDeliveryUpdate(request._id, 'completed'),
                    color: 'bg-blue-600 hover:bg-blue-700',
                    icon: FaCheckCircle
                }
            ],
            completed: [
                {
                    label: 'Reopen Order',
                    action: () => handleStatusChange(request, 'accepted'),
                    color: 'bg-yellow-600 hover:bg-yellow-700',
                    icon: FaUndo
                }
            ],
            rejected: [
                {
                    label: 'Reopen Order',
                    action: () => handleStatusChange(request, 'pending'),
                    color: 'bg-yellow-600 hover:bg-yellow-700',
                    icon: FaUndo
                }
            ],
            cancelled: [
                {
                    label: 'Reopen Order',
                    action: () => handleStatusChange(request, 'pending'),
                    color: 'bg-yellow-600 hover:bg-yellow-700',
                    icon: FaUndo
                }
            ]
        };

        return [...baseActions, ...(statusSpecificActions[request.status] || [])];
    };

    // Access Guard
    if (!user || (user.role !== 'admin' && user.role !== 'co-admin')) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">This page is only accessible to administrators.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:px-8">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Buy Request Management 🛒</h1>
                    <p className="text-gray-600 mt-2 text-lg">Complete overview and management of all purchase requests</p>
                </div>

                {/* Stats - FIXED WITH LOADING STATES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        emoji="📦"
                        title="Total Requests"
                        count={stats.total}
                        color="blue"
                        onClick={() => handleFilterChange('status', 'all')}
                        description="All buy requests"
                        loading={statsLoading}
                    />
                    <StatCard
                        emoji="⏰"
                        title="Expiring Soon"
                        count={stats.expiringSoon}
                        color="red"
                        onClick={() => handleFilterChange('status', 'pending')}
                        description="Pending requests expiring in 12h"
                        loading={statsLoading}
                    />
                    <StatCard
                        emoji="👤"
                        title="Assigned to Me"
                        count={stats.assignedToMe}
                        color="green"
                        onClick={() => handleFilterChange('assignedToMe', true)}
                        description="Your assigned requests"
                        loading={statsLoading}
                    />
                    <StatCard
                        emoji="🚨"
                        title="High Priority"
                        count={(stats.byEscalation && (stats.byEscalation[2] || 0) + (stats.byEscalation[3] || 0)) || 0}
                        color="orange"
                        onClick={() => handleFilterChange('escalationLevel', '2')}
                        description="Level 2+ escalation"
                        loading={statsLoading}
                    />
                </div>

                {/* Status Quick Stats */}
                {!statsLoading && stats.byStatus && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                        {Object.entries(stats.byStatus).map(([status, count]) => (
                            <div
                                key={status}
                                onClick={() => handleFilterChange('status', status)}
                                className={`bg-white p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${filters.status === status ? 'border-blue-500' : 'border-gray-200'
                                    }`}
                            >
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                                    <p className="text-xs text-gray-600 capitalize mt-1">{status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaSearch className="inline w-4 h-4 mr-1" /> Search
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Search products, users, shops..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FaFilter className="inline w-4 h-4 mr-1" /> Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="shipped">Shipped</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select
                                value={filters.escalationLevel}
                                onChange={(e) => handleFilterChange('escalationLevel', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Priorities</option>
                                <option value="0">Normal</option>
                                <option value="1">Medium</option>
                                <option value="2">High</option>
                                <option value="3">Urgent</option>
                            </select>
                        </div>

                        {/* Assigned to Me */}
                        <div className="flex items-end">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.assignedToMe}
                                    onChange={(e) => handleFilterChange('assignedToMe', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Assigned to Me</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                {loading ? (
                    <Loading text="Loading buy requests..." />
                ) : (
                    <div className="space-y-6">
                        {requests.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
                                <div className="text-7xl mb-6">🔍</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Requests Found</h3>
                                <p className="text-gray-600 text-lg">
                                    {filters.status !== 'all'
                                        ? `No ${filters.status} requests found with current filters.`
                                        : "No buy requests in the system."}
                                </p>
                                <button
                                    onClick={() => setFilters({
                                        status: 'all',
                                        search: '',
                                        escalationLevel: '',
                                        assignedToMe: false,
                                        sortBy: 'createdAt',
                                        sortOrder: 'desc'
                                    })}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            requests.map((request) => {
                                const timeRemaining = getTimeRemaining(request.expiresAt);
                                const statusActions = getStatusActions(request);

                                return (
                                    <div key={request._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                        {/* Header */}
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 pb-4 border-b">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {request.product?.name || 'Unknown Product'}
                                                    {request.variantDetails && (
                                                        <span className="ml-2 text-sm font-normal text-gray-500">
                                                            ({request.variantDetails.size} {request.variantDetails.unit})
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    <StatusBadge status={request.status} />
                                                    <PriorityBadge level={request.escalationLevel} />
                                                    {request.status === 'pending' && (
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${timeRemaining.color} ${timeRemaining.bg}`}>
                                                            <FaClock className="w-3 h-3 mr-1" /> {timeRemaining.text}
                                                        </span>
                                                    )}
                                                    {request.assignedEmployee && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                                                            👤 Assigned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-2 lg:mt-0">
                                                <button
                                                    onClick={() => handleViewDetails(request)}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center"
                                                >
                                                    <FaEye className="w-4 h-4 mr-2" /> Details
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Product & Order Info */}
                                            <div className="space-y-4">
                                                <ProductCard product={request.product} variantDetails={request.variantDetails} />

                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
                                                    <div className="space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span>Quantity:</span>
                                                            <span className="font-semibold">{request.quantity} {request.variantDetails?.unit || request.product?.unit}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Unit Price:</span>
                                                            <span className="font-semibold">₹{Number(request.variantDetails?.price).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between border-t pt-1">
                                                            <span>Total:</span>
                                                            <span className="font-semibold text-lg">₹{Number(request.totalPrice).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Payment:</span>
                                                            <span className="font-semibold capitalize">{request.paymentMethod?.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Delivery Info */}
                                                {(request.status === 'shipped' || request.status === 'completed') && (
                                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                                            <FaTruck className="w-4 h-4 mr-2 text-blue-600" />
                                                            Delivery Information
                                                        </h4>
                                                        {request.expectedDelivery && (
                                                            <p className="text-sm text-gray-600">
                                                                Expected: {new Date(request.expectedDelivery).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                        {request.actualDelivery && (
                                                            <p className="text-sm text-gray-600">
                                                                Delivered: {new Date(request.actualDelivery).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-4">
                                                <ContactCard entity={request.user} role="Buyer" type="user" />
                                                <ContactCard entity={request.shopOwner} role="Shop Owner" type="shop" />
                                            </div>

                                            {/* Actions */}
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-gray-900">Actions</h4>
                                                {statusActions.map((action, index) => {
                                                    const IconComponent = action.icon;
                                                    return (
                                                        <button
                                                            key={index}
                                                            onClick={action.action}
                                                            className={`w-full px-4 py-2 ${action.color} text-white rounded-lg font-semibold transition-colors flex items-center justify-center`}
                                                        >
                                                            <IconComponent className="w-4 h-4 mr-2" /> {action.label}
                                                        </button>
                                                    );
                                                })}

                                                {request.employeeActions && request.employeeActions.length > 0 && (
                                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                        <h5 className="text-sm font-semibold text-gray-800 mb-2">Recent Actions</h5>
                                                        {request.employeeActions.slice(0, 2).map((action, index) => (
                                                            <p key={index} className="text-xs text-gray-600">
                                                                <span className="font-semibold">{action.action.replace('_', ' ')}:</span> {action.message}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-10">
                        <p className="text-sm text-gray-600">
                            Showing {requests.length} of {totalRequests} requests
                        </p>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                &larr; Previous
                            </button>

                            {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                const page = index + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-full ${currentPage === page
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Next &rarr;
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            {showContactModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                            <FaEnvelope className="w-5 h-5 mr-2 text-blue-600" />
                            Contact {contactType === 'buyer' ? 'Buyer' : 'Shop Owner'}
                        </h3>

                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-gray-700 font-semibold mb-1">
                                Order: {selectedRequest.product?.name}
                            </p>
                            <p className="text-sm text-gray-600">
                                To: <span className="font-medium">
                                    {contactType === 'buyer'
                                        ? selectedRequest.user?.name
                                        : selectedRequest.shopOwner?.shopName || selectedRequest.shopOwner?.name
                                    }
                                </span>
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message *
                            </label>
                            <textarea
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder={`Enter your message...`}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowContactModal(false);
                                    setContactMessage('');
                                    setSelectedRequest(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendContactMessage}
                                disabled={!contactMessage.trim() || actionLoading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                            Update Order Status
                        </h3>

                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-yellow-800 font-semibold mb-1">
                                Order: {selectedRequest.product?.name}
                            </p>
                            <p className="text-sm text-yellow-800">
                                Changing status from <span className="font-medium">{selectedRequest.status}</span> to <span className="font-medium">{statusUpdate.status}</span>
                            </p>
                        </div>

                        {(statusUpdate.status === 'rejected' || statusUpdate.status === 'cancelled') && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason *
                                </label>
                                <textarea
                                    value={statusUpdate.reason}
                                    onChange={(e) => setStatusUpdate(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder={`Please provide a reason for ${statusUpdate.status}...`}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setStatusUpdate({ status: '', reason: '' });
                                    setSelectedRequest(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusUpdate}
                                disabled={actionLoading || ((statusUpdate.status === 'rejected' || statusUpdate.status === 'cancelled') && !statusUpdate.reason.trim())}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Updating...
                                    </>
                                ) : (
                                    'Confirm Update'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedRequest && (
                <RequestDetailsModal
                    request={selectedRequest}
                    onClose={() => setShowDetailsModal(false)}
                    onContact={handleContact}
                />
            )}
        </div>
    );
};

export default EmployeeBuyRequestDashboard;