// components/ContractorDashboard.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getContractorRequests, acceptWorkRequest, rejectWorkRequest } from '../redux/slice/workRequestSlice';
import Loading from './Loader';
import SocketService from '../utils/socket';

const ContractorDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { contractorRequests, loading, error, pagination } = useSelector((state) => state.workRequests);

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        if (user && user.role === 'contractor') {
            dispatch(getContractorRequests({ page: currentPage, status: statusFilter }));

            // Set up real-time listeners for new requests
            const handleNewRequest = (data) => {
                console.log('🆕 Real-time: New work request received');
                dispatch(getContractorRequests({ page: currentPage, status: statusFilter }));
            };

            if (SocketService.socket) {
                SocketService.socket.on('new_work_request', handleNewRequest);
                SocketService.socket.on('new_notification', handleNewRequest);
            }

            return () => {
                if (SocketService.socket) {
                    SocketService.socket.off('new_work_request', handleNewRequest);
                    SocketService.socket.off('new_notification', handleNewRequest);
                }
            };
        }
    }, [dispatch, user, currentPage, statusFilter]);

    const handleAccept = async (requestId) => {
        if (window.confirm('Are you sure you want to accept this work request?')) {
            await dispatch(acceptWorkRequest(requestId));
        }
    };

    const handleReject = (request) => {
        setSelectedRequest(request);
        setShowRejectModal(true);
    };

    const confirmReject = async () => {
        if (selectedRequest && rejectionReason.trim()) {
            await dispatch(rejectWorkRequest({
                requestId: selectedRequest._id,
                reason: rejectionReason
            }));
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectionReason('');
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
            accepted: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
            in_progress: { color: 'bg-blue-100 text-blue-800', text: 'In Progress' },
            completed: { color: 'bg-gray-100 text-gray-800', text: 'Completed' },
            cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            low: { color: 'bg-gray-100 text-gray-800', text: 'Low' },
            medium: { color: 'bg-blue-100 text-blue-800', text: 'Medium' },
            high: { color: 'bg-orange-100 text-orange-800', text: 'High' },
            urgent: { color: 'bg-red-100 text-red-800', text: 'Urgent' }
        };

        const config = priorityConfig[priority] || priorityConfig.medium;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const formatTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diffMs = expires - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHrs < 0) return 'Expired';
        if (diffHrs < 1) return 'Less than 1 hour';
        if (diffHrs < 24) return `${diffHrs} hours`;
        return `${Math.floor(diffHrs / 24)} days`;
    };

    if (user?.role !== 'contractor') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">This page is only accessible to contractors.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Work Requests</h1>
                    <p className="text-gray-600 mt-2">Manage your incoming work requests</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <span className="text-2xl">📋</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">⏰</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {contractorRequests.filter(req => req.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Accepted</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {contractorRequests.filter(req => req.status === 'accepted').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <span className="text-2xl">❌</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Rejected</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {contractorRequests.filter(req => req.status === 'rejected').length}
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
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                {loading && contractorRequests.length === 0 ? (
                    <Loading text="Loading work requests..." />
                ) : (
                    <div className="space-y-4">
                        {contractorRequests.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200">
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No work requests</h3>
                                <p className="text-gray-600">You don't have any work requests yet.</p>
                            </div>
                        ) : (
                            contractorRequests.map((request) => (
                                <div key={request._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        {/* Request Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {request.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getStatusBadge(request.status)}
                                                        {getPriorityBadge(request.priority)}
                                                        {request.status === 'pending' && (
                                                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                                                                ⏰ {formatTimeRemaining(request.expiresAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 mb-3">{request.description}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Category:</span>
                                                    <span className="ml-2 text-gray-600">{request.category}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Budget:</span>
                                                    <span className="ml-2 text-gray-600">
                                                        {request.budget ? `₹${request.budget}` : 'Not specified'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Location:</span>
                                                    <span className="ml-2 text-gray-600">
                                                        {request.location?.city}, {request.location?.state}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Customer Info */}
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                                        {request.user?.name?.charAt(0) || 'C'}
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {request.user?.name || 'Customer'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {request.user?.email} • {request.user?.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {request.status === 'pending' && (
                                            <div className="flex flex-col gap-2 lg:w-48">
                                                <button
                                                    onClick={() => handleAccept(request._id)}
                                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request)}
                                                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {request.status === 'rejected' && request.rejectionReason && (
                                            <div className="lg:w-64">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Reason:</span> {request.rejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
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

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Work Request</h3>
                        <p className="text-gray-600 mb-4">
                            Please provide a reason for rejecting this work request:
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter reason for rejection..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
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

export default ContractorDashboard;