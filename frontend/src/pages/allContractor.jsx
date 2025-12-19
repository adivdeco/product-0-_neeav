import { useCallback, useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { useParams, Navigate } from "react-router";
import axiosClient from '../api/auth';
import Loading from "../components/Loader";
import {
    MdVerified,
    MdLocationOn,
    MdPhone,
    MdEmail,
    MdWork,
    MdStar,
    MdStarBorder,
    MdAccessTime,
    MdCalendarToday,
    MdReceipt
} from "react-icons/md";
import {
    FiMapPin,
    FiClock,
    FiDollarSign,
    FiCheckCircle
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import ReviewForm from "./ReviewForm";
import WorkRequestForm from "../components/WorkRequestForm";



function ContractorProfilePage() {
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);
    const [contractor, setContractor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const [showContactModal, setShowContactModal] = useState(false)
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [showWorkRequestForm, setShowWorkRequestForm] = useState(false);

    const fetchContractor = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get(`/useas/contractors/${id}`);
            setContractor(data.contractor || data);
        } catch (error) {
            console.error('Contractor fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (user && id) {
            fetchContractor();
        }
    }, [user, id, fetchContractor]);

    const getAvailabilityBadge = (availability) => {
        const statusConfig = {
            'available': { color: 'bg-green-100 text-green-800 border-green-200', text: 'Available' },
            'busy': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Busy' },
            'on-leave': { color: 'bg-red-100 text-red-800 border-red-200', text: 'On Leave' }
        };

        const config = statusConfig[availability] || statusConfig.available;
        return (
            <span className={`px-2 py-1.5 rounded-full text-xs border ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const renderStars = (count) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={18}
                    className={`${i <= count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        } transition-colors duration-200`}
                />
            );
        }
        return <div className="flex items-center space-x-1">{stars}</div>;
    };

    const getDefaultImage = () => {
        return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
    };

    const getPrimaryImage = (images) => {
        const primaryImage = images?.find(img => img.isPrimary);
        return primaryImage?.url || images?.[0]?.url || getDefaultImage();
    };

    const ContactModal = () => {
        if (!showContactModal || !contractor) return null;

        return (
            <div className="fixed  inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full py-6 px-3 transform transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                        <button
                            onClick={() => setShowContactModal(false)}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* <div className="space-y-4">
                        <div className="flex items-center p-3 bg-blue-50 rounded-xl">
                            <MdPhone className="h-6 w-6 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-semibold text-gray-900">{contractor.contact?.phone}</p>
                                {contractor.contact?.alternatePhone && (
                                    <p className="font-medium text-gray-700 text-sm mt-1">
                                        Alternate: {contractor.contact.alternatePhone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center p-3 bg-green-50 rounded-xl">
                            <MdEmail className="h-6 w-6 text-green-600 mr-3" />
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-semibold text-gray-900">{contractor.contact?.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start p-3 bg-purple-50 rounded-xl">
                            <MdLocationOn className="h-6 w-6 text-purple-600 mr-3 mt-1" />
                            <div>
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="font-semibold text-gray-900">
                                    {contractor.address?.street}, {contractor.address?.city}<br />
                                    {contractor.address?.state} - {contractor.address?.pincode}
                                    {contractor.address?.landmark && (
                                        <><br />Landmark: {contractor.address.landmark}</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div> */}

                    {/* <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => setShowContactModal(false)}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Close
                        </button>
                        <a
                            href={`tel:${contractor.contact?.phone}`}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
                        >
                            Call Now
                        </a>
                    </div> */}

                    <h1 className="text-2xl font-bold flex text-center rounded-2xl bg-yellow-50   mb-4">This service is under maintenance 🚧 ./. 🚧</h1>
                </div>
            </div>
        );
    };

    if (loading) {
        return <Loading text="Loading Contractor Profile..." />;
    }

    if (!contractor) {
        return <Navigate to="/contractors" replace />;
    }


    const handleBookContractor = (contractor) => {
        setSelectedContractor(contractor);
        setShowWorkRequestForm(true);
    };

    const handleWorkRequestSuccess = () => {
        setShowWorkRequestForm(false);
        setSelectedContractor(null);
        alert('Work request sent successfully! The contractor will respond soon.');
    };

    const handleWorkRequestCancel = () => {
        setShowWorkRequestForm(false);
        setSelectedContractor(null);
    };;


    // console.log(setSelectedContractor);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Image Section */}
                        <div className="lg:w-1/3">
                            <div className="bg-gray-200 rounded-2xl h-64 lg:h-80 overflow-hidden">
                                <img
                                    src={getPrimaryImage(contractor.images)}
                                    alt={contractor.contractorName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = getDefaultImage();
                                    }}
                                />
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="lg:w-2/3">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                            {contractor.contractorName}
                                        </h1>
                                        {contractor.isVerified && (
                                            <MdVerified className="h-7 w-7 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getAvailabilityBadge(contractor.availability)}
                                        <div className="flex items-center  display:flex mt-2">
                                            {renderStars(contractor.rating.average)}
                                            <span className="ml-2 text-gray-600 text-sm">
                                                ({contractor.rating?.count || 0} reviews)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                {contractor.description}
                            </p>

                            {/* Experience */}
                            <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-xl">
                                <MdWork className="h-6 w-6 text-blue-600 mr-3" />
                                <div>
                                    <span className="font-semibold text-gray-900">
                                        {contractor.experience?.years}+ years experience
                                    </span>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {contractor.experience?.description}
                                    </p>
                                </div>
                            </div>

                            {/* Services */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Services Offered</h3>
                                <div className="flex flex-wrap gap-1">
                                    {contractor.services?.map((service, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full  text-xs"
                                        >
                                            {service}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {contractor.pricing?.hourlyRate && (
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                        <div className="flex items-center mb-2">
                                            <FiClock className="h-5 w-5 text-blue-600 mr-2" />
                                            <span className="font-semibold text-gray-900">Hourly Rate</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">₹{contractor.pricing.hourlyRate}</p>
                                    </div>
                                )}
                                {contractor.pricing?.dailyRate && (
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                                        <div className="flex items-center mb-2">
                                            <MdCalendarToday className="h-5 w-5 text-green-600 mr-2" />
                                            <span className="font-semibold text-gray-900">Daily Rate</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">₹{contractor.pricing.dailyRate}</p>
                                    </div>
                                )}
                                {contractor.pricing?.projectRate && (
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                                        <div className="flex items-center mb-2">
                                            <MdReceipt className="h-5 w-5 text-purple-600 mr-2" />
                                            <span className="font-semibold text-gray-900">Project Rate</span>
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900">{contractor.pricing.projectRate}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setShowContactModal(true)}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg"
                                >
                                    Contact Contractor
                                </button>

                                <button
                                    onClick={() => handleBookContractor(contractor)}
                                    className="flex-1 border-2 border-blue-600 text-blue-600 py-4 px-6 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200"
                                >
                                    Request Quote
                                </button>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-2xl shadow-lg">
                    {/* Tab Headers */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px overflow-scroll">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'services', label: 'Services' },
                                { id: 'reviews', label: 'Reviews' },
                                { id: 'documents', label: 'Documents' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-6 font-semibold text-sm border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
                                    <p className="text-gray-600 leading-relaxed">{contractor.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-3">Contact Information</h4>
                                        <div className="space-y-3 text-gray-600">
                                            <div className="flex items-center">
                                                <MdPhone className="h-5 w-5 text-gray-400 mr-3" />
                                                <span>{contractor.contact?.phone}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MdEmail className="h-5 w-5 text-gray-400 mr-3" />
                                                <span>{contractor.contact?.email}</span>
                                            </div>
                                            {contractor.contact?.alternatePhone && (
                                                <div className="flex items-center">
                                                    <MdPhone className="h-5 w-5 text-gray-400 mr-3" />
                                                    <span>{contractor.contact.alternatePhone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-3">Location</h4>
                                        <div className="space-y-2 text-gray-600">
                                            <div className="flex items-start">
                                                <FiMapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                                                <div>
                                                    <p>{contractor.address?.street}</p>
                                                    <p>{contractor.address?.city}, {contractor.address?.state}</p>
                                                    <p>PIN: {contractor.address?.pincode}</p>
                                                    {contractor.address?.landmark && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Landmark: {contractor.address.landmark}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Services & Expertise</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {contractor.services?.map((service, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <div className="flex items-center mb-2">
                                                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                                <h4 className="font-semibold text-gray-900">{service}</h4>
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                Professional {service.toLowerCase()} services with {contractor.experience?.years} years of experience
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-10">
                                {/* Header */}
                                <div className="text-center md:text-left">
                                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                        Customer Reviews
                                    </h3>
                                    <div className="mt-1 h-1 w-16 bg-blue-500 rounded-full mx-auto md:mx-0"></div>
                                </div>

                                {/* Review Form */}
                                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Add Your Review
                                    </h4>
                                    <ReviewForm contractorId={contractor._id} onReviewAdded={fetchContractor} />
                                </div>

                                {/* Review List */}
                                {contractor.rating?.reviews?.length > 0 ? (
                                    <div className="space-y-6">
                                        {contractor.rating.reviews.map((review, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                                    {/* User Info */}
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                                                            {review.userId?.name?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {review.userId?.name || "Anonymous User"}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {review.userId?.email ? "Verified Customer" : "Registered User"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Rating & Date  */}
                                                    <div className="flex flex-col items-start sm:items-end text-gray-600">
                                                        {renderStars(review.rating)}
                                                        <span className="text-xs mt-1 text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4 border-t border-gray-100 pt-4">
                                                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                                        <div className="text-6xl mb-4 text-gray-300">⭐</div>
                                        <h4 className="text-lg font-semibold text-gray-700 mb-1">
                                            No reviews yet
                                        </h4>
                                        <p className="text-gray-500 text-sm">
                                            Be the first to share your experience with this contractor!
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Documents & Certifications</h3>

                                {contractor.images && contractor.images.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {contractor.images.map((doc, index) => {
                                            const url = typeof doc === "string" ? doc : (doc || doc || "");
                                            const rawName = (doc && (doc.name || doc.filename || doc.title)) || url.split("/").pop() || `Document-${index + 1}`;
                                            const extMatch = rawName.match(/\.(\w+)(?:$|\?)/);
                                            const ext = extMatch ? extMatch[1].toUpperCase() : "";
                                            const uploadedAt = (doc && doc.uploadedAt) ? new Date(doc.uploadedAt).toLocaleDateString() : (doc && doc.createdAt) ? new Date(doc.createdAt).toLocaleDateString() : "";

                                            return (
                                                <div
                                                    key={index}
                                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="relative aspect-w-16 aspect-h-10 bg-gray-100">
                                                        <img
                                                            src={url}
                                                            alt={rawName}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.src = getDefaultImage(); }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-3">
                                                            <div className="w-full flex justify-between items-center gap-2">
                                                                <a
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="bg-white/90 text-gray-800 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white"
                                                                >
                                                                    View
                                                                </a>
                                                                <a
                                                                    href={url}
                                                                    download={rawName}
                                                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                                                                >
                                                                    Download
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="min-w-0">
                                                                {/* <p className="text-sm font-semibold text-gray-900 truncate">{rawName}</p> */}
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {/* {uploadedAt ? `Uploaded: ${uploadedAt}` : "Uploaded date unavailable"} */}
                                                                </p>
                                                            </div>
                                                            <div className="ml-3 flex-shrink-0">
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                                    {/* {ext || "FILE"} */} glimps of some best work
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">📄</div>
                                        <h4 className="text-lg font-semibold text-gray-600 mb-2">
                                            No documents available
                                        </h4>
                                        <p className="text-gray-500">
                                            This contractor hasn't uploaded any documents yet
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Work Request Form Modal */}
            {showWorkRequestForm && selectedContractor && (
                <WorkRequestForm
                    contractorId={selectedContractor.contractorId || contractor._id}
                    onSuccess={handleWorkRequestSuccess}
                    onCancel={handleWorkRequestCancel}
                />

            )}

            {/* Contact Modal */}
            <ContactModal />
        </div>

    );
}

export default ContractorProfilePage;

// import { useCallback, useState, useEffect } from "react";
// import { useSelector } from 'react-redux';
// import { useParams, Navigate, Link } from "react-router";
// import axiosClient from '../api/auth';
// import {
//     MdVerified, MdLocationOn, MdPhone, MdEmail, MdWork, MdStar,
//     MdAccessTime, MdCheckCircle, MdOutlineDescription, MdArrowBack
// } from "react-icons/md";
// import { FiExternalLink, FiDownload, FiShare2, FiFlag } from "react-icons/fi";
// import WorkRequestForm from "../components/WorkRequestForm";
// import Loading from "../components/Loader";

// function ContractorProfilePage() {
//     const { id } = useParams();
//     const { user } = useSelector((state) => state.auth);
//     const [contractor, setContractor] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState('overview');
//     const [showContactModal, setShowContactModal] = useState(false);
//     const [showWorkRequestForm, setShowWorkRequestForm] = useState(false);

//     const fetchContractor = useCallback(async () => {
//         try {
//             setLoading(true);
//             const { data } = await axiosClient.get(`/useas/contractors/${id}`);
//             setContractor(data.contractor || data);
//         } catch (error) {
//             console.error('Fetch error:', error);
//         } finally {
//             setLoading(false);
//         }
//     }, [id]);

//     useEffect(() => {
//         if (user && id) fetchContractor();
//     }, [user, id, fetchContractor]);

//     if (loading) return <Loading text="Loading Professional Profile..." />;
//     if (!contractor) return <Navigate to="/contractors" replace />;

//     // --- Helper: Professional Badge ---
//     const StatusBadge = ({ status }) => {
//         const styles = {
//             available: "bg-green-50 text-green-700 ring-green-600/20",
//             busy: "bg-orange-50 text-orange-700 ring-orange-600/20",
//             'on-leave': "bg-gray-50 text-gray-600 ring-gray-500/10"
//         };
//         const activeStyle = styles[status] || styles.available;

//         return (
//             <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${activeStyle} capitalize`}>
//                 <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status === 'available' ? 'bg-green-600' : 'bg-orange-500'}`}></span>
//                 {status?.replace('-', ' ')}
//             </span>
//         );
//     };

//     // --- Sub-Component: Contact Modal (Clean Style) ---
//     const ContactModal = () => {
//         if (!showContactModal) return null;
//         return (
//             <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4 transition-opacity">
//                 <div className="bg-white rounded-lg shadow-xl max-w-sm w-full overflow-hidden">
//                     <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
//                         <h3 className="font-semibold text-gray-900">Contact Details</h3>
//                         <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
//                     </div>
//                     <div className="p-6 space-y-4">
//                         <div className="flex items-center gap-3">
//                             <div className="bg-blue-50 p-2 rounded text-blue-600"><MdPhone /></div>
//                             <div>
//                                 <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
//                                 <p className="text-sm font-medium text-gray-900">{contractor.contact?.phone || 'Hidden'}</p>
//                             </div>
//                         </div>
//                         <div className="flex items-center gap-3">
//                             <div className="bg-blue-50 p-2 rounded text-blue-600"><MdEmail /></div>
//                             <div>
//                                 <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
//                                 <p className="text-sm font-medium text-gray-900">{contractor.contact?.email || 'Hidden'}</p>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="bg-gray-50 px-4 py-3 text-right">
//                         <button onClick={() => setShowContactModal(false)} className="text-sm font-medium text-gray-600 hover:text-gray-900">Close</button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
//             {/* 1. Header Banner */}
//             <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-900 relative">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative">
//                     <Link to="/contractors" className="absolute top-6 left-6 text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
//                         <MdArrowBack /> Back to Directory
//                     </Link>
//                 </div>
//             </div>

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative">
//                 <div className="flex flex-col lg:flex-row gap-8">

//                     {/* 2. Main Profile Card */}
//                     <div className="flex-1">
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
//                             <div className="flex flex-col sm:flex-row gap-6 items-start">
//                                 {/* Avatar */}
//                                 <div className="relative">
//                                     <img
//                                         src={contractor.avatar || 'https://via.placeholder.com/150'}
//                                         alt={contractor.contractorName}
//                                         className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-md bg-gray-100"
//                                     />
//                                     {contractor.isVerified && (
//                                         <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verified Professional">
//                                             <MdVerified size={16} />
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Name & Info */}
//                                 <div className="flex-1 w-full">
//                                     <div className="flex justify-between items-start flex-wrap gap-4">
//                                         <div>
//                                             <h1 className="text-2xl font-bold text-gray-900 mb-1">{contractor.contractorName}</h1>
//                                             <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
//                                                 <MdLocationOn className="text-gray-400" />
//                                                 {contractor.address?.city}, {contractor.address?.state}
//                                                 <span className="text-gray-300">|</span>
//                                                 <StatusBadge status={contractor.availability} />
//                                             </div>
//                                         </div>
//                                         <div className="flex gap-3">
//                                             <button className="p-2 text-gray-400 hover:text-blue-600 border border-gray-200 rounded hover:bg-gray-50 transition-all">
//                                                 <FiShare2 size={18} />
//                                             </button>
//                                             <button className="p-2 text-gray-400 hover:text-red-600 border border-gray-200 rounded hover:bg-gray-50 transition-all">
//                                                 <FiFlag size={18} />
//                                             </button>
//                                         </div>
//                                     </div>

//                                     {/* Stats Grid */}
//                                     <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
//                                         <div>
//                                             <div className="flex items-center gap-1 text-yellow-500 font-bold text-lg">
//                                                 {contractor.rating?.average || 0} <MdStar size={18} />
//                                             </div>
//                                             <p className="text-xs text-gray-500">Rating ({contractor.rating?.count || 0})</p>
//                                         </div>
//                                         <div className="w-px bg-gray-200 h-10 self-center"></div>
//                                         <div>
//                                             <p className="font-bold text-lg text-gray-900">{contractor.experience?.years || 0}+</p>
//                                             <p className="text-xs text-gray-500">Years Exp.</p>
//                                         </div>
//                                         <div className="w-px bg-gray-200 h-10 self-center"></div>
//                                         <div>
//                                             <p className="font-bold text-lg text-gray-900">{contractor.pricing?.hourlyRate ? `₹${contractor.pricing.hourlyRate}` : 'Ask'}</p>
//                                             <p className="text-xs text-gray-500">{contractor.pricing?.hourlyRate ? 'Per Hour' : 'Pricing'}</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Navigation Tabs */}
//                             <div className="mt-8 border-b border-gray-200">
//                                 <nav className="-mb-px flex space-x-8">
//                                     {['overview', 'services', 'reviews'].map((tab) => (
//                                         <button
//                                             key={tab}
//                                             onClick={() => setActiveTab(tab)}
//                                             className={`
//                                                 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors
//                                                 ${activeTab === tab
//                                                     ? 'border-blue-600 text-blue-600'
//                                                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
//                                             `}
//                                         >
//                                             {tab}
//                                         </button>
//                                     ))}
//                                 </nav>
//                             </div>

//                             {/* Content Area */}
//                             <div className="mt-8">
//                                 {activeTab === 'overview' && (
//                                     <div className="space-y-8 animate-in fade-in duration-300">
//                                         <section>
//                                             <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                                                 <MdOutlineDescription className="text-gray-400" /> About
//                                             </h3>
//                                             <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
//                                                 {contractor.description || "No professional summary provided."}
//                                             </p>
//                                         </section>

//                                         <section>
//                                             <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Documents</h3>
//                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                                 {contractor.images?.slice(0, 2).map((doc, i) => (
//                                                     <div key={i} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-gray-50 cursor-pointer group">
//                                                         <div className="bg-white p-2 rounded border border-gray-200 text-blue-600 group-hover:text-blue-700">
//                                                             <FiExternalLink />
//                                                         </div>
//                                                         <div className="ml-3 overflow-hidden">
//                                                             <p className="text-sm font-medium text-gray-900 truncate">Portfolio Item {i + 1}</p>
//                                                             <p className="text-xs text-gray-500">View Document</p>
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                                 {(!contractor.images || contractor.images.length === 0) && (
//                                                     <p className="text-sm text-gray-500 italic">No public documents uploaded.</p>
//                                                 )}
//                                             </div>
//                                         </section>
//                                     </div>
//                                 )}

//                                 {activeTab === 'services' && (
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
//                                         {contractor.services?.map((service, index) => (
//                                             <div key={index} className="flex items-start p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
//                                                 <MdCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
//                                                 <div className="ml-3">
//                                                     <h4 className="text-sm font-semibold text-gray-900">{service}</h4>
//                                                     <p className="text-xs text-gray-500 mt-1">Available for contract work</p>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}

//                                 {activeTab === 'reviews' && (
//                                     <div className="space-y-6 animate-in fade-in duration-300">
//                                         <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex justify-between items-center">
//                                             <div>
//                                                 <h4 className="font-semibold text-blue-900">Customer Feedback</h4>
//                                                 <p className="text-xs text-blue-700">Verified client reviews</p>
//                                             </div>
//                                             <ReviewForm contractorId={contractor._id} onReviewAdded={fetchContractor} />
//                                         </div>

//                                         <div className="divide-y divide-gray-100">
//                                             {contractor.rating?.reviews?.map((review, i) => (
//                                                 <div key={i} className="py-4">
//                                                     <div className="flex justify-between items-start mb-2">
//                                                         <div className="flex items-center gap-2">
//                                                             <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
//                                                                 {review.userId?.name?.charAt(0) || 'U'}
//                                                             </div>
//                                                             <span className="text-sm font-semibold text-gray-900">{review.userId?.name}</span>
//                                                         </div>
//                                                         <div className="flex text-yellow-400 text-xs">
//                                                             {[...Array(5)].map((_, starI) => (
//                                                                 <MdStar key={starI} className={starI < review.rating ? "text-yellow-400" : "text-gray-200"} />
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                     <p className="text-sm text-gray-600 pl-10">"{review.comment}"</p>
//                                                     <p className="text-xs text-gray-400 pl-10 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
//                                                 </div>
//                                             ))}
//                                             {(!contractor.rating?.reviews?.length) && (
//                                                 <p className="text-gray-500 text-sm text-center py-4">No reviews yet.</p>
//                                             )}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* 3. Sidebar (Professional Actions) */}
//                     <div className="lg:w-80 space-y-6">
//                         {/* Action Card */}
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
//                             <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Actions</h3>
//                             <button
//                                 onClick={() => setShowWorkRequestForm(true)}
//                                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded transition-colors mb-3 flex justify-center items-center gap-2 shadow-sm"
//                             >
//                                 <MdWork /> Request Quote
//                             </button>
//                             <button
//                                 onClick={() => setShowContactModal(true)}
//                                 className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded transition-colors flex justify-center items-center gap-2"
//                             >
//                                 <MdPhone /> View Contact Info
//                             </button>

//                             <div className="mt-6 pt-6 border-t border-gray-100">
//                                 <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Service Details</h4>
//                                 <ul className="space-y-3 text-sm">
//                                     <li className="flex justify-between">
//                                         <span className="text-gray-500">Member Since</span>
//                                         <span className="font-medium text-gray-900">{new Date(contractor.createdAt).getFullYear()}</span>
//                                     </li>
//                                     <li className="flex justify-between">
//                                         <span className="text-gray-500">Response Time</span>
//                                         <span className="font-medium text-gray-900">~2 Hours</span>
//                                     </li>
//                                     <li className="flex justify-between">
//                                         <span className="text-gray-500">Projects Done</span>
//                                         <span className="font-medium text-gray-900">12+ Verified</span>
//                                     </li>
//                                 </ul>
//                             </div>
//                         </div>
//                     </div>

//                 </div>
//             </div>

//             {/* Modals */}
//             <ContactModal />
//             {showWorkRequestForm && (
//                 <WorkRequestForm
//                     contractorId={contractor.contractorId || contractor._id}
//                     onSuccess={() => { setShowWorkRequestForm(false); alert('Request submitted successfully.'); }}
//                     onCancel={() => setShowWorkRequestForm(false)}
//                 />
//             )}
//         </div>
//     );
// }

// export default ContractorProfilePage;

// import { useCallback, useState, useEffect } from "react";
// import { useSelector } from 'react-redux';
// import { useParams, Navigate, Link } from "react-router";
// import axiosClient from '../api/auth';
// import {
//     MdVerified, MdLocationOn, MdPhone, MdEmail, MdWork, MdStar,
//     MdAccessTime, MdCheckCircle, MdOutlineDescription, MdArrowBack,
//     MdAttachMoney, MdCalendarToday, MdFileDownload,
//     MdShield
// } from "react-icons/md";
// import { FiExternalLink, FiShare2, FiFlag, FiDownload, FiEye } from "react-icons/fi";
// import WorkRequestForm from "../components/WorkRequestForm";
// import ReviewForm from "./ReviewForm"; // Assuming you have this
// import { Shield } from "lucide-react";

// // --- Helper Components ---

// const LoadingSkeleton = () => (
//     <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
//         <div className="h-48 bg-gray-300 rounded-lg mb-8"></div>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             <div className="lg:col-span-2 space-y-4">
//                 <div className="h-12 bg-gray-200 rounded w-3/4"></div>
//                 <div className="h-4 bg-gray-200 rounded w-full"></div>
//                 <div className="h-4 bg-gray-200 rounded w-5/6"></div>
//             </div>
//             <div className="h-64 bg-gray-200 rounded"></div>
//         </div>
//     </div>
// );

// const StatusBadge = ({ status }) => {
//     const config = {
//         available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
//         busy: "bg-amber-50 text-amber-700 ring-amber-600/20",
//         'on-leave': "bg-rose-50 text-rose-700 ring-rose-600/20"
//     };
//     const activeClass = config[status] || config.available;

//     return (
//         <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${activeClass} capitalize`}>
//             <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${status === 'available' ? 'bg-emerald-600' : status === 'busy' ? 'bg-amber-600' : 'bg-rose-600'}`}></span>
//             {status?.replace('-', ' ')}
//         </span>
//     );
// };

// function ContractorProfilePage() {
//     const { id } = useParams();
//     const { user } = useSelector((state) => state.auth);

//     const [contractor, setContractor] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState('overview');
//     const [showContactModal, setShowContactModal] = useState(false);
//     const [showWorkRequestForm, setShowWorkRequestForm] = useState(false);

//     // Fetch Logic
//     const fetchContractor = useCallback(async () => {
//         try {
//             setLoading(true);
//             const { data } = await axiosClient.get(`/useas/contractors/${id}`);
//             setContractor(data.contractor || data);
//         } catch (error) {
//             console.error('Fetch error:', error);
//         } finally {
//             setLoading(false);
//         }
//     }, [id]);

//     useEffect(() => {
//         if (user && id) fetchContractor();
//     }, [user, id, fetchContractor]);

//     if (loading) return <LoadingSkeleton />;
//     if (!contractor) return <Navigate to="/contractors" replace />;

//     // --- Sub-Component: Contact Modal ---
//     const ContactModal = () => {
//         if (!showContactModal) return null;
//         return (
//             <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                 <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-100">
//                     <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
//                         <h3 className="font-bold text-slate-800">Contact Details</h3>
//                         <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-red-500 text-xl">×</button>
//                     </div>
//                     <div className="p-6 space-y-6">
//                         <div className="flex items-start gap-4">
//                             <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><MdPhone size={20} /></div>
//                             <div>
//                                 <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Phone</p>
//                                 <a href={`tel:${contractor.contact?.phone}`} className="text-base font-semibold text-gray-900 hover:text-blue-600">
//                                     {contractor.contact?.phone || 'Not Available'}
//                                 </a>
//                                 {contractor.contact?.alternatePhone && (
//                                     <p className="text-sm text-gray-500 mt-1">Alt: {contractor.contact.alternatePhone}</p>
//                                 )}
//                             </div>
//                         </div>
//                         <div className="flex items-start gap-4">
//                             <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><MdEmail size={20} /></div>
//                             <div>
//                                 <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Email</p>
//                                 <a href={`mailto:${contractor.contact?.email}`} className="text-base font-semibold text-gray-900 hover:text-blue-600">
//                                     {contractor.contact?.email || 'Not Available'}
//                                 </a>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="bg-gray-50 px-6 py-4">
//                         <button onClick={() => setShowContactModal(false)} className="w-full py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
//                             Close
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
//             {/* 1. Professional Banner */}
//             <div className="h-64 bg-slate-900 relative overflow-hidden">
//                 <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 opacity-90"></div>
//                 {/* Abstract Pattern */}
//                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>

//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10">
//                     <Link to="/contractors" className="absolute top-6 left-6 text-white/70 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
//                         <MdArrowBack /> Back to Directory
//                     </Link>
//                 </div>
//             </div>

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20">
//                 <div className="flex flex-col lg:flex-row gap-8">

//                     {/* 2. Main Content Column */}
//                     <div className="flex-1 min-w-0">

//                         {/* Header Card */}
//                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
//                             <div className="flex flex-col sm:flex-row gap-6 items-start">
//                                 <div className="relative group">
//                                     <img
//                                         src={contractor.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'}
//                                         alt={contractor.contractorName}
//                                         className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg bg-gray-100"
//                                     />
//                                     {contractor.isVerified && (
//                                         <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-md" title="Verified Professional">
//                                             <MdVerified size={18} />
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div className="flex-1 w-full">
//                                     <div className="flex justify-between items-start flex-wrap gap-4">
//                                         <div>
//                                             <h1 className="text-3xl font-bold text-gray-900 mb-2">{contractor.contractorName}</h1>
//                                             <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
//                                                 <StatusBadge status={contractor.availability} />
//                                                 <span className="flex items-center gap-1"><MdLocationOn className="text-gray-400" /> {contractor.address?.city}, {contractor.address?.state}</span>
//                                                 <span className="hidden sm:inline text-gray-300">|</span>
//                                                 <span className="flex items-center gap-1"><MdWork className="text-gray-400" /> {contractor.experience?.years}+ Years Exp.</span>
//                                             </div>
//                                         </div>
//                                         <div className="flex gap-2">
//                                             <button className="p-2.5 text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"><FiShare2 size={18} /></button>
//                                             <button className="p-2.5 text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"><FiFlag size={18} /></button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Navigation Tabs */}
//                             <div className="mt-8 border-b border-gray-200">
//                                 <nav className="-mb-px flex space-x-8 overflow-x-auto">
//                                     {['overview', 'services', 'portfolio', 'reviews', 'documents'].map((tab) => (
//                                         <button
//                                             key={tab}
//                                             onClick={() => setActiveTab(tab)}
//                                             className={`
//                                                 whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm capitalize transition-colors
//                                                 ${activeTab === tab
//                                                     ? 'border-blue-600 text-blue-600'
//                                                     : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}
//                                             `}
//                                         >
//                                             {tab}
//                                         </button>
//                                     ))}
//                                 </nav>
//                             </div>
//                         </div>

//                         {/* Tab Content Areas */}
//                         <div className="space-y-6">
//                             {activeTab === 'overview' && (
//                                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-in fade-in">
//                                     <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                                         <MdOutlineDescription className="text-gray-400" /> Professional Summary
//                                     </h3>
//                                     <p className="text-gray-600 leading-relaxed mb-8">
//                                         {contractor.description || "No description provided."}
//                                     </p>

//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
//                                         <div>
//                                             <h4 className="font-semibold text-gray-900 mb-4">Location Details</h4>
//                                             <div className="space-y-3 text-sm text-gray-600">
//                                                 <div className="flex gap-3">
//                                                     <MdLocationOn className="text-gray-400 shrink-0 mt-0.5" />
//                                                     <p>{contractor.address?.street}, {contractor.address?.landmark}<br />{contractor.address?.city} - {contractor.address?.pincode}</p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <h4 className="font-semibold text-gray-900 mb-4">Experience</h4>
//                                             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
//                                                 <p className="font-bold text-blue-800 text-lg">{contractor.experience?.years} Years</p>
//                                                 <p className="text-sm text-blue-600 mt-1">{contractor.experience?.description || "Providing quality service."}</p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {activeTab === 'services' && (
//                                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-in fade-in">
//                                     <h3 className="text-lg font-bold text-gray-900 mb-6">Services Offered</h3>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         {contractor.services?.map((service, index) => (
//                                             <div key={index} className="flex items-center p-4 bg-gray-50 border border-gray-100 rounded-lg hover:border-blue-300 transition-colors">
//                                                 <MdCheckCircle className="text-emerald-500 mr-3 text-xl" />
//                                                 <span className="font-medium text-gray-700">{service}</span>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {activeTab === 'portfolio' && (
//                                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-in fade-in">
//                                     <h3 className="text-lg font-bold text-gray-900 mb-6">Work Portfolio</h3>
//                                     {contractor.images && contractor.images.length > 0 ? (
//                                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                                             {contractor.images.map((imgUrl, i) => (
//                                                 <div key={i} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
//                                                     <img
//                                                         src={typeof imgUrl === 'string' ? imgUrl : (imgUrl.url || '')}
//                                                         alt={`Work ${i}`}
//                                                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                                                         onError={(e) => e.target.src = 'https://via.placeholder.com/300?text=Image+Error'}
//                                                     />
//                                                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
//                                                         <a href={typeof imgUrl === 'string' ? imgUrl : imgUrl.url} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-gray-900 hover:text-blue-600">
//                                                             <FiEye />
//                                                         </a>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     ) : (
//                                         <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
//                                             <FiEye size={48} className="mx-auto mb-2 opacity-50" />
//                                             <p>No portfolio images uploaded yet.</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {activeTab === 'documents' && (
//                                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-in fade-in">
//                                     <h3 className="text-lg font-bold text-gray-900 mb-6">Certifications & Licenses</h3>
//                                     {contractor.documents && contractor.documents.length > 0 ? (
//                                         <div className="space-y-4">
//                                             {contractor.documents.map((doc, i) => (
//                                                 <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                                                     <div className="flex items-center gap-4">
//                                                         <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><MdFileDownload size={24} /></div>
//                                                         <div>
//                                                             <p className="font-semibold text-gray-900 capitalize">{doc.type}</p>
//                                                             <p className="text-xs text-gray-500">ID: {doc.documentNumber || 'N/A'}</p>
//                                                         </div>
//                                                     </div>
//                                                     {doc.verified && (
//                                                         <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
//                                                             <MdVerified /> Verified
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     ) : (
//                                         <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
//                                             <p>No public documents available.</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {activeTab === 'reviews' && (
//                                 <div className="space-y-6 animate-in fade-in">
//                                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
//                                         <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
//                                             <div>
//                                                 <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//                                                     {contractor.rating?.average} <MdStar className="text-yellow-400" />
//                                                 </h3>
//                                                 <p className="text-gray-500">Based on {contractor.rating?.count} reviews</p>
//                                             </div>
//                                             <div className="w-full md:w-auto">
//                                                 <ReviewForm contractorId={contractor._id} onReviewAdded={fetchContractor} />
//                                             </div>
//                                         </div>

//                                         <div className="space-y-6">
//                                             {contractor.rating?.reviews?.map((review, i) => (
//                                                 <div key={i} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
//                                                     <div className="flex justify-between items-start mb-2">
//                                                         <div className="flex items-center gap-3">
//                                                             <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
//                                                                 {review.userId?.name?.charAt(0) || 'U'}
//                                                             </div>
//                                                             <div>
//                                                                 <p className="font-semibold text-gray-900 text-sm">{review.userId?.name}</p>
//                                                                 <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
//                                                             </div>
//                                                         </div>
//                                                         <div className="flex text-yellow-400 text-sm">
//                                                             {[...Array(5)].map((_, r) => (
//                                                                 <MdStar key={r} className={r < review.rating ? "text-yellow-400" : "text-gray-200"} />
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                     <p className="text-gray-600 text-sm leading-relaxed mt-2 pl-13 ml-12">
//                                                         "{review.comment}"
//                                                     </p>
//                                                 </div>
//                                             ))}
//                                             {(!contractor.rating?.reviews?.length) && (
//                                                 <p className="text-center text-gray-500 italic py-4">No reviews yet. Be the first!</p>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* 3. Sticky Right Sidebar (Actions & Pricing) */}
//                     <div className="lg:w-96 shrink-0">
//                         <div className="sticky top-24 space-y-6">

//                             {/* Pricing Card */}
//                             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                                 <div className="bg-slate-50 px-6 py-4 border-b border-gray-100">
//                                     <h3 className="font-semibold text-slate-800">Rate Card</h3>
//                                 </div>
//                                 <div className="p-6 space-y-4">
//                                     {contractor.pricing?.hourlyRate && (
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-gray-600 flex items-center gap-2 text-sm"><MdAccessTime /> Hourly</span>
//                                             <span className="font-bold text-gray-900 text-lg">₹{contractor.pricing.hourlyRate}</span>
//                                         </div>
//                                     )}
//                                     {contractor.pricing?.dailyRate && (
//                                         <div className="flex justify-between items-center pt-2">
//                                             <span className="text-gray-600 flex items-center gap-2 text-sm"><MdCalendarToday /> Daily</span>
//                                             <span className="font-bold text-gray-900 text-lg">₹{contractor.pricing.dailyRate}</span>
//                                         </div>
//                                     )}
//                                     {contractor.pricing?.projectRate && (
//                                         <div className="flex justify-between items-center pt-2">
//                                             <span className="text-gray-600 flex items-center gap-2 text-sm"><MdAttachMoney /> Project</span>
//                                             <span className="font-bold text-gray-900 text-lg">{contractor.pricing.projectRate}</span>
//                                         </div>
//                                     )}

//                                     {!contractor.pricing?.hourlyRate && !contractor.pricing?.dailyRate && !contractor.pricing?.projectRate && (
//                                         <p className="text-gray-500 italic text-center text-sm">Contact for pricing</p>
//                                     )}

//                                     <div className="pt-4 space-y-3">
//                                         <button
//                                             onClick={() => setShowWorkRequestForm(true)}
//                                             className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
//                                         >
//                                             <MdWork /> Request Quote
//                                         </button>
//                                         <button
//                                             onClick={() => setShowContactModal(true)}
//                                             className="w-full py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
//                                         >
//                                             <MdPhone /> Show Contact Info
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Trust Indicators */}
//                             <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
//                                 <div className="flex items-center gap-3 mb-2">
//                                     <Shield className="text-emerald-600 text-2xl" />
//                                     <h4 className="font-bold text-emerald-800">Verified Pro</h4>
//                                 </div>
//                                 <p className="text-xs text-emerald-700 leading-relaxed">
//                                     This contractor has verified credentials. Bookings made through our platform are protected by our satisfaction guarantee.
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                 </div>
//             </div>

//             {/* Modals */}
//             <ContactModal />
//             {showWorkRequestForm && (
//                 <WorkRequestForm
//                     contractorId={contractor.contractorId || contractor._id}
//                     onSuccess={() => {
//                         setShowWorkRequestForm(false);
//                         alert('Request submitted successfully.');
//                     }}
//                     onCancel={() => setShowWorkRequestForm(false)}
//                 />
//             )}
//         </div>
//     );
// }

// export default ContractorProfilePage;