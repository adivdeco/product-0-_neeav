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
import ReviewForm from "./ReviewForm";

function ContractorProfilePage() {
    const { id } = useParams();
    const { user } = useSelector((state) => state.auth);
    const [contractor, setContractor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showContactModal, setShowContactModal] = useState(false);



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

    const renderStars = (rating) => {
        const stars = [];
        const averageRating = rating?.average || 0;

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i}>
                    {i <= Math.floor(averageRating) ? (
                        <MdStar className="text-yellow-400 text-xl" />
                    ) : i <= averageRating ? (
                        <MdStar className="text-yellow-300 text-xl" />
                    ) : (
                        <MdStarBorder className="text-gray-300 text-xl" />
                    )}
                </span>
            );
        }
        return stars;
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
            <div className="fixed w-100 inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                                            {renderStars(contractor.rating)}
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
                                <button className="flex-1 border-2 border-blue-600 text-blue-600 py-4 px-6 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200">
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
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h3>

                                {/* Add Review Form */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Your Review</h4>
                                    <ReviewForm
                                        contractorId={contractor._id}
                                        onReviewAdded={fetchContractor}
                                    />
                                </div>

                                {contractor.rating?.reviews && contractor.rating.reviews.length > 0 ? (
                                    <div className="space-y-6">
                                        {contractor.rating.reviews.map((review, index) => (
                                            <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>

                                                        {review.userId ? (
                                                            <div>
                                                                <p>{review.userId?.name}</p>
                                                                <p>{review.userId?.email}</p>
                                                                <p>{review.userId?.phone}</p>
                                                                <p>{review.userId?.avatar}</p>
                                                            </div>
                                                        ) : 'Anonymous'}


                                                    </div>

                                                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>


                                                    <span className="text-sm text-gray-500">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>

                                                </div>

                                                <div className="flex items-center">
                                                    {renderStars({ average: review.rating })}
                                                    <span className="ml-2 text-gray-600 font-medium">
                                                        {review.rating}/5
                                                    </span>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">⭐</div>
                                        <h4 className="text-lg font-semibold text-gray-600 mb-2">
                                            No reviews yet
                                        </h4>
                                        <p className="text-gray-500">
                                            Be the first to review this contractor
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Documents & Certifications</h3>
                                {contractor.documents && contractor.documents.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {contractor.documents.map((doc, index) => (
                                            <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 capitalize">
                                                            {doc.type}
                                                        </h4>
                                                        {doc.documentNumber && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Number: {doc.documentNumber}
                                                            </p>
                                                        )}
                                                        {doc.expiryDate && (
                                                            <p className="text-sm text-gray-600">
                                                                Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {doc.verified && (
                                                        <FiCheckCircle className="h-6 w-6 text-green-500" />
                                                    )}
                                                </div>
                                                {doc.fileUrl && (
                                                    <a
                                                        href={doc.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                                                    >
                                                        View Document →
                                                    </a>
                                                )}
                                            </div>
                                        ))}
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

            {/* Contact Modal */}
            <ContactModal />
        </div>
    );
}

export default ContractorProfilePage;