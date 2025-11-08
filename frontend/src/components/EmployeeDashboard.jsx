// components/EmployeeDashboard.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../api/auth';
import Loading from './Loader';
import SocketService from '../utils/socket';

const EmployeeDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactType, setContactType] = useState('');
    const [contactMessage, setContactMessage] = useState('');

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'co-admin')) {
            fetchPendingRequests();
        }
    }, [user, currentPage]);

    // In EmployeeDashboard.jsx - add this useEffect
    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'co-admin')) {
            fetchPendingRequests();

            // Single handler for all update types
            const handleDataUpdate = (data) => {
                fetchPendingRequests(); // Refresh the list
            };

            if (SocketService.socket) {
                SocketService.socket.on('new_work_request', handleDataUpdate);
                SocketService.socket.on('request_status_updated', handleDataUpdate);
                SocketService.socket.on('employee_contact', handleDataUpdate);
                SocketService.socket.on('request_accepted', handleDataUpdate);
                SocketService.socket.on('request_rejected', handleDataUpdate);
            }

            return () => {
                if (SocketService.socket) {
                    SocketService.socket.off('new_work_request', handleDataUpdate);
                    SocketService.socket.off('request_status_updated', handleDataUpdate);
                    SocketService.socket.off('employee_contact', handleDataUpdate);
                    SocketService.socket.off('request_accepted', handleDataUpdate);
                    SocketService.socket.off('request_rejected', handleDataUpdate);
                }
            };
        }
    }, [user, currentPage]);

    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get(`/api/employee/pending-requests?page=${currentPage}`);
            setRequests(data.requests || []);
            setTotalPages(data.totalPages || 1);
            console.log(data);

        } catch (error) {
            console.error('Error fetching pending requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContact = (request, type) => {
        setSelectedRequest(request);
        setContactType(type);
        setShowContactModal(true);
    };

    const sendContactMessage = async () => {
        if (!selectedRequest || !contactMessage.trim()) return;

        try {
            const endpoint = contactType === 'contractor'
                ? `/api/employee/${selectedRequest._id}/contact-contractor`
                : `/api/employee/${selectedRequest._id}/contact-user`;

            await axiosClient.post(endpoint, {
                message: contactMessage,
                contactMethod: 'in_app'
            });

            setShowContactModal(false);
            setSelectedRequest(null);
            setContactMessage('');
            fetchPendingRequests(); // Refresh the list

            alert(`Message sent to ${contactType} successfully!`);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const getEscalationBadge = (level) => {
        const levels = {
            0: { color: 'bg-gray-100 text-gray-800', text: 'Normal' },
            1: { color: 'bg-yellow-100 text-yellow-800', text: 'Level 1' },
            2: { color: 'bg-orange-100 text-orange-800', text: 'Level 2' },
            3: { color: 'bg-red-100 text-red-800', text: 'Urgent' }
        };

        const config = levels[level] || levels[0];
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const getTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diffMs = expires - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHrs < 0) return { text: 'EXPIRED', color: 'text-red-600' };
        if (diffHrs < 2) return { text: `${diffHrs} HOUR`, color: 'text-red-600' };
        if (diffHrs < 12) return { text: `${diffHrs} HOURS`, color: 'text-orange-600' };
        return { text: `${Math.floor(diffHrs / 24)} DAYS`, color: 'text-green-600' };
    };

    if (!user || (user.role !== 'admin' && user.role !== 'co-admin')) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">This page is only accessible to administrators.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
                    <p className="text-gray-600 mt-2">Monitor and manage pending work requests</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <span className="text-2xl">📋</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {requests.filter(req => {
                                        const expires = new Date(req.expiresAt);
                                        const now = new Date();
                                        return (expires - now) < 2 * 60 * 60 * 1000; // Less than 2 hours
                                    }).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <span className="text-2xl">🚨</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">High Priority</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {requests.filter(req => req.escalationLevel >= 2).length}
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
                                <p className="text-sm font-medium text-gray-600">Assigned to Me</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {requests.filter(req => req.assignedEmployee).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Requests List */}
                {loading ? (
                    <Loading text="Loading pending requests..." />
                ) : (
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200">
                                <div className="text-6xl mb-4">🎉</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
                                <p className="text-gray-600">No pending requests need attention at the moment.</p>
                            </div>
                        ) : (
                            requests.map((request) => {
                                const timeRemaining = getTimeRemaining(request.expiresAt);

                                return (
                                    <div key={request._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            {/* Request Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                            {request.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {getEscalationBadge(request.escalationLevel)}
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${timeRemaining.color} bg-gray-100`}>
                                                                ⏰ {timeRemaining.text}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-gray-600 mb-4">{request.description}</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-700">Customer:</span>
                                                        <span className="ml-2 text-gray-600">
                                                            {request.user?.name} ({request.user?.phone})
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Contractor:</span>
                                                        <span className="ml-2 text-gray-600">
                                                            {request.assignedContractor?.name}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Category:</span>
                                                        <span className="ml-2 text-gray-600">{request.category}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Location:</span>
                                                        <span className="ml-2 text-gray-600">
                                                            {request.location?.city}, {request.location?.state}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Employee Actions History */}
                                                {request.employeeActions && request.employeeActions.length > 0 && (
                                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Actions:</h4>
                                                        <div className="space-y-2">
                                                            {request.employeeActions.slice(0, 3).map((action, index) => (
                                                                <div key={index} className="text-xs text-gray-600">
                                                                    <span className="font-medium">{action.action.replace('_', ' ')}:</span> {action.message}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 lg:w-48">
                                                <button
                                                    onClick={() => handleContact(request, 'contractor')}
                                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                                >
                                                    Contact Contractor
                                                </button>
                                                <button
                                                    onClick={() => handleContact(request, 'user')}
                                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                                >
                                                    Contact Customer
                                                </button>
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
                    <div className="flex justify-center items-center space-x-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>

                        {[...Array(totalPages)].map((_, index) => {
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
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            {showContactModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Contact {contactType === 'contractor' ? 'Contractor' : 'Customer'}
                        </h3>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Request:</span> {selectedRequest.title}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">{contactType === 'contractor' ? 'Contractor' : 'Customer'}:</span>{' '}
                                {contactType === 'contractor'
                                    ? selectedRequest.assignedContractor?.name
                                    : selectedRequest.user?.name
                                }
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message *
                            </label>
                            <textarea
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                placeholder={`Enter your message for the ${contactType}...`}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowContactModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendContactMessage}
                                disabled={!contactMessage.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                            >
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;