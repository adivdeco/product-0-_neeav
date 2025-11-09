// components/UserDashboard.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserRequests, cancelWorkRequest, completeWorkByUser } from '../redux/slice/workRequestSlice';
import Loading from './Loader';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaUserTie, FaPhone, FaEnvelope, FaTimes, FaCheck } from 'react-icons/fa';

const UserDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { userRequests, loading, userPagination } = useSelector((state) => state.workRequests);

    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showContractorModal, setShowContractorModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        if (user) {
            dispatch(getUserRequests({ page: currentPage, status: statusFilter }));
        }
    }, [dispatch, user, currentPage, statusFilter]);

    // Handlers
    const handleCancel = (request) => {
        setSelectedRequest(request);
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        if (selectedRequest && cancelReason.trim()) {
            await dispatch(cancelWorkRequest({
                requestId: selectedRequest._id,
                reason: cancelReason
            }));
            setShowCancelModal(false);
            setSelectedRequest(null);
            setCancelReason('');
            // Re-fetch to update the list immediately
            dispatch(getUserRequests({ page: currentPage, status: statusFilter }));
        }
    };

    const handleComplete = async (requestId) => {
        if (window.confirm('Are you sure you want to mark this work as completed? This action cannot be undone.')) {
            await dispatch(completeWorkByUser(requestId));
            // Re-fetch to update the list immediately
            dispatch(getUserRequests({ page: currentPage, status: statusFilter }));
        }
    };

    const handleViewContractor = (contractor) => {
        setSelectedRequest({ assignedContractor: contractor }); // Re-using selectedRequest state structure
        setShowContractorModal(true);
    };

    // UI Helpers
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-700 ring-yellow-300', text: 'Pending' },
            accepted: { color: 'bg-indigo-100 text-indigo-700 ring-indigo-300', text: 'Accepted' },
            rejected: { color: 'bg-red-100 text-red-700 ring-red-300', text: 'Rejected' },
            completed: { color: 'bg-green-100 text-green-700 ring-green-300', text: 'Completed' },
            cancelled: { color: 'bg-gray-100 text-gray-700 ring-gray-300', text: 'Cancelled' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${config.color} ring-1 ring-inset`}>{config.text}</span>;
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            low: { color: 'text-green-600', text: 'Low' },
            medium: { color: 'text-yellow-600', text: 'Medium' },
            high: { color: 'text-red-600', text: 'High' }
        };
        const config = priorityConfig[priority] || priorityConfig.low;
        return <span className={`font-semibold ${config.color} capitalize`}>{config.text}</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const ContractorCard = ({ contractor }) => {
        if (!contractor) return (
            <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-gray-500 font-medium">Contractor not yet assigned.</p>
            </div>
        );

        return (
            <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-xl shadow-md transition duration-300 hover:shadow-lg">
                <img
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-500"
                    src={contractor.avatar || 'https://via.placeholder.com/150/0000FF/FFFFFF?text=C'}
                    alt={`Avatar of ${contractor.name}`}
                />
                <h4 className="mt-3 text-lg font-semibold text-gray-900">{contractor.name}</h4>
                <p className="text-sm text-gray-500">{contractor.contractorDetails?.specialization?.[0] || 'Service Professional'}</p>
                <button
                    onClick={() => handleViewContractor(contractor)}
                    className="mt-3 w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    View Contact Info
                </button>
            </div>
        );
    };

    const ContractorDetailsModal = ({ contractor, onClose }) => {
        const contractorData = contractor?.assignedContractor;
        if (!contractorData) return null;

        return (
            <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl transform scale-100 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Contractor Profile</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <FaTimes className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center text-center border-b pb-5 mb-5">
                        <img
                            className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-500"
                            src={contractorData.avatar || 'https://via.placeholder.com/150/0000FF/FFFFFF?text=C'}
                            alt={`Avatar of ${contractorData.name}`}
                        />
                        <h4 className="mt-4 text-xl font-extrabold text-gray-900">{contractorData.name}</h4>
                        <p className="text-md text-gray-600 font-medium">{contractorData.contractorDetails?.specialization?.join(', ') || 'N/A'}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center">
                            <FaPhone className="w-5 h-5 text-indigo-500 mr-3" />
                            <span className="text-gray-700 font-medium">Phone:</span>
                            <span className="ml-2 text-gray-600">{contractorData.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <FaEnvelope className="w-5 h-5 text-indigo-500 mr-3" />
                            <span className="text-gray-700 font-medium">Email:</span>
                            <span className="ml-2 text-gray-600">{contractorData.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <FaMoneyBillWave className="w-5 h-5 text-indigo-500 mr-3" />
                            <span className="text-gray-700 font-medium">Rate:</span>
                            <span className="ml-2 text-gray-600">{contractorData.contractorDetails?.hourlyRate ? `₹${contractorData.contractorDetails.hourlyRate}/hr` : 'N/A'}</span>
                        </div>
                        <div className="flex items-start">
                            <FaUserTie className="w-5 h-5 text-indigo-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <span className="text-gray-700 font-medium block">Experience:</span>
                                <p className="text-gray-600 mt-1">{contractorData.contractorDetails?.yearsOfExperience} Years</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Work Requests 📋</h1>
                        <p className="text-gray-600 mt-2 text-lg">Track and manage your service requests with ease.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 mb-8">
                    <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <hr className="mb-8" />

                {/* Requests List */}
                {loading && userRequests?.length === 0 ? (
                    <Loading text="Fetching your service requests..." />
                ) : (
                    <div className="space-y-6">
                        {userRequests?.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
                                <div className="text-7xl mb-6">✨</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">All Clear!</h3>
                                <p className="text-gray-600 text-lg">You haven't created any work requests in the selected status.</p>
                            </div>
                        ) : (
                            userRequests?.map((request) => (
                                <div key={request._id} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition duration-300">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                                        {/* Main Content (Cols 1-3) */}
                                        <div className="lg:col-span-3">

                                            {/* Header/Title */}
                                            <div className="flex items-center justify-between mb-4 border-b pb-3">
                                                <h3 className="text-2xl font-bold text-gray-900">
                                                    {request.title || 'Untitled Request'}
                                                </h3>
                                                {getStatusBadge(request.status)}
                                            </div>

                                            <p className="text-gray-700 mb-4">{request.description || 'No description provided.'}</p>

                                            {/* Key Details Grid */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mt-4">
                                                <div className="flex items-start">
                                                    <FaMoneyBillWave className="w-4 h-4 text-indigo-500 mr-2 mt-0.5" />
                                                    <div>
                                                        <span className="font-medium text-gray-700 block">Budget:</span>
                                                        <span className="text-gray-600 font-semibold mt-0.5">{request.budget > 0 ? `₹${request.budget}` : 'To be quoted'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <FaMapMarkerAlt className="w-4 h-4 text-indigo-500 mr-2 mt-0.5" />
                                                    <div>
                                                        <span className="font-medium text-gray-700 block">Location:</span>
                                                        <span className="text-gray-600 mt-0.5">{request.location?.city || 'N/A'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <FaCalendarAlt className="w-4 h-4 text-indigo-500 mr-2 mt-0.5" />
                                                    <div>
                                                        <span className="font-medium text-gray-700 block">Timeline:</span>
                                                        <span className="text-gray-600 mt-0.5">{formatDate(request.timeline?.expectedStart)} - {formatDate(request.timeline?.expectedEnd)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 mr-2 mt-0.5 flex-shrink-0">
                                                        {request.category || 'General'}
                                                    </span>
                                                    <div>
                                                        <span className="font-medium text-gray-700 block">Priority:</span>
                                                        {getPriorityBadge(request.priority)}
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700">Created:</span>
                                                    <span className="ml-2 text-gray-600">{formatDate(request.createdAt)}</span>
                                                </div>

                                                <div className="flex items-start">
                                                    <span className="font-medium text-gray-700">Last Update:</span>
                                                    <span className="ml-2 text-gray-600">{formatDate(request.updatedAt)}</span>
                                                </div>
                                            </div>

                                            {request.cancellationReason && (
                                                <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-lg">
                                                    <p className="text-sm text-red-700">
                                                        <span className="font-bold">Cancellation Reason:</span> {request.cancellationReason}
                                                    </p>
                                                </div>
                                            )}

                                        </div>

                                        {/* Contractor and Actions (Col 4) */}
                                        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 space-y-4">
                                            <h4 className="text-md font-bold text-gray-800 border-b pb-2">Assigned Contractor</h4>

                                            <ContractorCard contractor={request.assignedContractor} />

                                            {/* User Actions */}
                                            <div className="flex flex-col gap-3 pt-3 border-t">
                                                {request.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCancel(request)}
                                                        className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
                                                    >
                                                        <FaTimes className="mr-2" /> Cancel Request
                                                    </button>
                                                )}

                                                {request.status === 'accepted' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleComplete(request._id)}
                                                            className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                                                        >
                                                            <FaCheck className="mr-2" /> Mark Complete
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(request)}
                                                            className="flex items-center justify-center w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                                        >
                                                            <FaTimes className="mr-2" /> Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Pagination */}
                {userPagination?.totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-3 mt-10">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            &larr; Previous
                        </button>

                        {[...Array(userPagination.totalPages)].map((_, index) => {
                            const page = index + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-full ${currentPage === page
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-300'
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === userPagination.totalPages}
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Next &rarr;
                        </button>
                    </div>
                )}
            </div>

            {/* Cancel Modal (Unchanged functionality, improved look) */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Cancel Request: **{selectedRequest?.title}**</h3>
                        <p className="text-gray-700 mb-4">Please provide a **detailed reason** for cancelling this request:</p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter reason for cancellation..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => { setShowCancelModal(false); setCancelReason(''); }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Keep Request
                            </button>
                            <button
                                onClick={confirmCancel}
                                disabled={!cancelReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-md"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contractor Details Modal */}
            {showContractorModal && (
                <ContractorDetailsModal
                    contractor={selectedRequest}
                    onClose={() => setShowContractorModal(false)}
                />
            )}
        </div>
    );
};

export default UserDashboard;