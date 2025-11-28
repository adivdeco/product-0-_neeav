import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../api/auth';
import Loading from './Loader';
import SocketService from '../utils/socket';
import { useDispatch } from 'react-redux';
import { completeWorkRequest } from '../redux/slice/workRequestSlice';
import { FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaUserTie, FaEnvelope, FaPhone, FaTimes, FaCheck, FaClock, FaCommentDots } from 'react-icons/fa';
import Navbar from './home/navbar';

// ===============================================
// --- UI HELPER COMPONENTS (DEFINED GLOBALLY) ---
// ===============================================

const AvailabilityBadge = ({ data }) => {
    const availabilityStatus = data?.toLowerCase();
    const config = {
        busy: { text: 'Busy', color: 'text-yellow-700', background: 'bg-yellow-100' },
        available: { text: 'Available', color: 'text-green-700', background: 'bg-green-100' },
    };
    const style = config[availabilityStatus] || { text: 'Unknown', color: 'text-gray-600', background: 'bg-gray-100' };
    return (
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${style.color} ${style.background}`}>
            <FaClock className="w-3 h-3 mr-1" /> {style.text}
        </span>
    );
};

const StatusBadge = (data) => {
    const status = data?.toLowerCase();
    const config = {
        rejected: { text: 'Rejected', color: 'text-red-700', background: 'bg-red-100' },
        completed: { text: 'Completed', color: 'text-green-700', background: 'bg-green-100' },
        pending: { text: 'Pending', color: 'text-yellow-700', background: 'bg-yellow-100' },
        accepted: { text: 'Accepted', color: 'text-indigo-700', background: 'bg-indigo-100' },
        cancelled: { text: 'Cancelled', color: 'text-gray-700', background: 'bg-gray-100' },
    };
    const style = config[status] || { text: data || 'Unknown', color: 'text-gray-600', background: 'bg-gray-100' };
    return (
        <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${style.color} ${style.background}`}>
            {style.text}
        </span>
    );
};

const StatCard = ({ emoji, title, count, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
        <div className="flex items-center">
            <div className={`p-3 bg-${color}-100 rounded-xl`}>
                <span className="text-2xl">{emoji}</span>
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
        </div>
    </div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start">
        <Icon className="w-4 h-4 text-blue-500 mr-2 mt-1 flex-shrink-0" />
        <div>
            <span className="font-medium text-gray-700 block">{label}:</span>
            <span className="text-gray-600 capitalize">{value}</span>
        </div>
    </div>
);

const ContactCard = ({ entity, role, isContractor }) => {
    const defaultAvatar = isContractor
        ? 'https://via.placeholder.com/150/0000FF/FFFFFF?text=C'
        : 'https://via.placeholder.com/150/FF6347/FFFFFF?text=U';

    const avatarUrl = entity?.avatar || defaultAvatar;
    const name = entity?.name || `Unassigned ${role}`;
    const specialization = entity?.contractorDetails?.specialization?.[0] || 'N/A';
    const email = entity?.email || 'N/A';
    const phone = entity?.phone || 'N/A';
    const availabilityStatus = isContractor ? entity?.contractorDetails?.availability : null;

    return (
        <div className="flex overflow-scroll items-start p-3 bg-gray-50 rounded-xl border border-gray-200">
            <img
                className={`h-12 w-12 rounded-full object-cover mr-4 flex-shrink-0 ${isContractor ? 'ring-2 ring-blue-500' : 'ring-2 ring-indigo-500'}`}
                src={avatarUrl}
                alt={`${role} Avatar`}
            />
            <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-gray-900 truncate">{name} ({role})</h5>
                {isContractor && <p className="text-xs text-gray-500 truncate">{specialization}</p>}

                <div className="mt-1 space-y-0.5">
                    <p className="text-xs text-gray-600 flex items-center"><FaEnvelope className="w-3 h-3 mr-1 text-gray-400" /> {email}</p>
                    <p className="text-xs text-gray-600 flex items-center"><FaPhone className="w-3 h-3 mr-1 text-gray-400" /> {phone}</p>
                    {isContractor && availabilityStatus && <AvailabilityBadge data={availabilityStatus} />}
                </div>
            </div>
        </div>
    );
};

const ContactModal = ({ selectedRequest, contactType, contactMessage, setContactMessage, sendContactMessage, setShowContactModal }) => {
    const target = contactType === 'contractor' ? selectedRequest.assignedContractor : selectedRequest.user;
    const targetName = target?.name || 'Unknown';
    const targetRole = contactType === 'contractor' ? 'Contractor' : 'Customer';

    return (
        <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center">
                    <FaEnvelope className="w-5 h-5 mr-2 text-blue-600" /> Contact {targetRole}
                </h3>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 font-semibold mb-1">Request: {selectedRequest.title}</p>
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
    const dispatch = useDispatch();


    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'co-admin')) {
            fetchPendingRequests();
        }
    }, [user, currentPage]);

    // Socket Listener for Real-Time Updates
    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'co-admin')) {
            fetchPendingRequests();

            const handleDataUpdate = () => {
                fetchPendingRequests(); // Refresh the list on any relevant update
            };

            if (SocketService.socket) {
                // Listen for all relevant events
                SocketService.socket.on('new_work_request', handleDataUpdate);
                SocketService.socket.on('request_status_updated', handleDataUpdate);
                SocketService.socket.on('employee_contact', handleDataUpdate);
                SocketService.socket.on('request_accepted', handleDataUpdate);
                SocketService.socket.on('request_rejected', handleDataUpdate);
                SocketService.socket.on('request_completed_by_user', handleDataUpdate);
            }

            return () => {
                if (SocketService.socket) {
                    SocketService.socket.off('new_work_request', handleDataUpdate);
                    SocketService.socket.off('request_status_updated', handleDataUpdate);
                    SocketService.socket.off('employee_contact', handleDataUpdate);
                    SocketService.socket.off('request_accepted', handleDataUpdate);
                    SocketService.socket.off('request_rejected', handleDataUpdate);
                    SocketService.socket.off('request_completed_by_user', handleDataUpdate);
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

    const handleComplete = async (requestId) => {
        if (window.confirm('Are you sure you want to mark this work request as completed?')) {
            await dispatch(completeWorkRequest(requestId));
            fetchPendingRequests();
        }
    };



    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
                🚨 {config.text}
            </span>
        );
    };

    const getTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diffMs = expires - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHrs < 0) return { text: 'EXPIRED', color: 'text-red-600', bg: 'bg-red-100' };
        if (diffHrs < 2) return { text: `Expires in ${diffHrs} Hr`, color: 'text-red-600', bg: 'bg-red-100' };
        if (diffHrs < 12) return { text: `Expires in ${diffHrs} Hrs`, color: 'text-orange-600', bg: 'bg-orange-100' };
        return { text: `Expires in ${Math.floor(diffHrs)} Hrs`, color: 'text-green-600', bg: 'bg-green-100' };
    };

    // --- ACCESS GUARD ---
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
    // --- END ACCESS GUARD ---


    return (
        <div className="min-h-screen bg-gray-50 ">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:px-8">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Employee Work Queue 🛠️</h1>
                    <p className="text-gray-600 mt-2 text-lg">Active requests requiring administrative review or action.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatCard emoji="📋" title="Total Pending" count={requests.length} color="blue" />
                    <StatCard emoji="⏰" title="Expiring Soon ( < 12h)" count={requests.filter(req => {
                        const expires = new Date(req.expiresAt);
                        const now = new Date();
                        return (expires - now) > 0 && (expires - now) < 12 * 60 * 60 * 1000;
                    }).length} color="red" />
                    <StatCard emoji="🚨" title="High Escalation (Lvl 2+)" count={requests.filter(req => req.escalationLevel >= 2).length} color="orange" />
                    <StatCard emoji="👤" title="Assigned to Me" count={requests.filter(req => req.assignedEmployee).length} color="green" />
                </div>

                {/* Requests List */}
                {loading ? (
                    <Loading text="Loading active work queue..." />
                ) : (
                    <div className="space-y-6">
                        {requests.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
                                <div className="text-7xl mb-6">🥳</div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                                <p className="text-gray-600 text-lg">The pending queue is empty. Great job!</p>
                            </div>
                        ) : (
                            requests.map((request) => {
                                const timeRemaining = getTimeRemaining(request.expiresAt);
                                return (
                                    <div key={request._id} className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 transition duration-300 hover:shadow-2xl">

                                        {/* Row 1: Title, Status, Time, Escalation */}
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-3 border-b">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2 md:mb-0">
                                                {request.title || 'Untitled Request'}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {StatusBadge(request.status)}
                                                {getEscalationBadge(request.escalationLevel)}
                                                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${timeRemaining.color} ${timeRemaining.bg}`}>
                                                    <FaClock className="w-3 h-3 mr-1" /> {timeRemaining.text}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Row 2: Main Content (Grid) */}
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                                            {/* Left Panel: Request Details (Cols 1-2) */}
                                            <div className="lg:col-span-2 space-y-4 pr-4 border-r lg:border-r-0 xl:border-r">
                                                <p className="text-gray-700 italic">{request.description}</p>

                                                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                                    <DetailItem icon={FaMoneyBillWave} label="Budget" value={request.budget > 0 ? `$${request.budget}` : 'To be quoted'} />
                                                    <DetailItem icon={FaMapMarkerAlt} label="Location" value={`${request.location?.city}, ${request.location?.state}`} />
                                                    <DetailItem icon={FaCalendarAlt} label="Start Date" value={formatDate(request.timeline?.expectedStart)} />
                                                    <DetailItem icon={FaCalendarAlt} label="End Date" value={formatDate(request.timeline?.expectedEnd)} />
                                                    <DetailItem icon={FaUserTie} label="Category" value={request.category} />
                                                    <DetailItem icon={FaCheck} label="Priority" value={request.priority} />
                                                </div>

                                                {/* Employee Actions History */}
                                                {request.employeeActions && request.employeeActions.length > 0 && (
                                                    <div className="p-3 bg-gray-100 rounded-lg">
                                                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center"><FaCommentDots className="mr-2 w-4 h-4" /> Latest Action History:</h4>
                                                        {request.employeeActions.slice(0, 2).map((action, index) => (
                                                            <p key={index} className="text-xs text-gray-600 mt-1">
                                                                <span className="font-semibold text-indigo-600">{action.action.replace('_', ' ')}:</span> {action.message}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Center Panel: Contact Info (Col 3) */}
                                            <div className="lg:col-span-1 space-y-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-l xl:border-l-0 xl:border-r pr-4 lg:pl-6">
                                                <h4 className="text-md font-bold text-gray-800 border-b pb-2">Parties Involved</h4>

                                                {/* Contractor Card */}
                                                <ContactCard
                                                    entity={request.assignedContractor}
                                                    role="Contractor"
                                                    isContractor={true}
                                                />

                                                {/* Customer Card */}
                                                <ContactCard
                                                    entity={request.user}
                                                    role="Customer"
                                                    isContractor={false}
                                                />
                                            </div>

                                            {/* Right Panel: Actions (Col 4) */}
                                            <div className="lg:col-span-1 flex flex-col gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:pl-6">
                                                <h4 className="text-md font-bold text-gray-800 border-b pb-2">Quick Actions</h4>

                                                <button
                                                    onClick={() => handleContact(request, 'contractor')}
                                                    className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                                                >
                                                    <FaEnvelope className="mr-2" /> Contact Contractor
                                                </button>
                                                <button
                                                    onClick={() => handleContact(request, 'user')}
                                                    className="flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
                                                >
                                                    <FaCommentDots className="mr-2" /> Contact Customer
                                                </button>

                                                {request.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleComplete(request._id)}
                                                        className="flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                                                    >
                                                        <FaCheck className="mr-2" /> Mark Completed
                                                    </button>
                                                )}

                                                <button
                                                    // This action typically involves another modal/form to select a new employee
                                                    className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors shadow-sm"
                                                >
                                                    Reassign Employee
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
                    <div className="flex justify-center items-center space-x-3 mt-10">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            &larr; Previous
                        </button>

                        {[...Array(totalPages)].map((_, index) => {
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
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Next &rarr;
                        </button>
                    </div>
                )}
            </div>

            {/* Contact Modal */}
            {showContactModal && selectedRequest && (
                <ContactModal
                    selectedRequest={selectedRequest}
                    contactType={contactType}
                    contactMessage={contactMessage}
                    setContactMessage={setContactMessage}
                    sendContactMessage={sendContactMessage}
                    setShowContactModal={setShowContactModal}
                />
            )}
        </div>
    );
};

export default EmployeeDashboard;

