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

// ... (StatusBadge, PriorityBadge, ContactCard, ProductCard, ContactModal, RequestDetailsModal remain the same)

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
// --- MAIN COMPONENT - OPTIMIZED ---
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

                {/* Rest of your component remains the same... */}
                {/* Filters, Requests List, Pagination, Modals */}
            </div>
        </div>
    );
};

export default EmployeeBuyRequestDashboard;