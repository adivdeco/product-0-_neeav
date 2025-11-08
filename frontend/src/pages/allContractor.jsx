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