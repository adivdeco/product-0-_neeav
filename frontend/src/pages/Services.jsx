import { useCallback, useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axiosClient from '../api/auth';
import Loading from "../components/Loader";
import { MdVerified } from "react-icons/md";
import { FiMapPin } from "react-icons/fi";
import { Link, Navigate, NavLink } from "react-router";
import WorkRequestForm from "../components/WorkRequestForm"


function ContractorPage() {
    const { user } = useSelector((state) => state.auth);
    const [contractorData, setContractorData] = useState({
        contractors: [],
        totalPages: 0,
        currentPage: 1,
        total: 0
    });
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        service: '',
        city: '',
        search: ''
    });

    const [selectedContractor, setSelectedContractor] = useState(null);
    const [showWorkRequestForm, setShowWorkRequestForm] = useState(false);


    const availableServices = [
        'Masonry',
        'Plumbing',
        'Electrical',
        'Carpentry',
        'Painting',
        'Flooring',
        'Roofing',
        'Structural',
        'Labor Supply',
        'Construction',
        'Renovation',
        'Demolition',
        'Landscaping',
        'HVAC',
        'Welding'
    ];

    const fetchContractors = useCallback(async (page = 1, filterParams = {}) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page,
                limit: 9, // Show 9 contractors per page
                ...filterParams
            }).toString();

            const { data } = await axiosClient.get(`/useas/contractors?${params}`);
            setContractorData({
                contractors: data.contractors || [],
                totalPages: data.totalPages || 1,
                currentPage: data.currentPage || 1,
                total: data.total || 0
            });
        } catch (error) {
            console.error('Contractor fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchContractors(currentPage, filters);
        }
    }, [user, currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= contractorData.totalPages) {
            setCurrentPage(page);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = {
            ...filters,
            [key]: value
        };
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filters change
        fetchContractors(1, newFilters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            service: '',
            city: '',
            search: ''
        };
        setFilters(emptyFilters);
        setCurrentPage(1);
        fetchContractors(1, emptyFilters);
    };

    const renderStars = (rating) => {
        const stars = [];
        const averageRating = rating?.average || 0;

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`text-lg ${i <= Math.floor(averageRating)
                        ? 'text-yellow-400'
                        : i <= averageRating
                            ? 'text-yellow-300'
                            : 'text-gray-300'
                        }`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    const getAvailabilityBadge = (availability) => {
        const statusConfig = {
            'available': { color: 'bg-green-100 text-green-800', text: 'Available' },
            'busy': { color: 'bg-yellow-100 text-yellow-800', text: 'Busy' },
            'on-leave': { color: 'bg-red-100 text-red-800', text: 'On Leave' }
        };

        const config = statusConfig[availability] || statusConfig.available;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const getDefaultImage = () => {
        return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
    };

    const getPrimaryImage = (images) => {
        // const primaryImage = images?.find(img => img.isPrimary);
        // return primaryImage?.url || images?.[0]?.url || getDefaultImage();
        return images
    };

    const formatPricing = (pricing) => {
        if (pricing?.hourlyRate) {
            return `₹${pricing.hourlyRate}/hour`;
        } else if (pricing?.dailyRate) {
            return `₹${pricing.dailyRate}/day`;
        } else if (pricing?.projectRate) {
            return pricing.projectRate;
        }
        return 'Contact for pricing';
    };

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
    };

    // Show full-screen loader only on initial load
    if (loading && contractorData.contractors.length === 0) {
        return <Loading text="Loading Contractors..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* {loading && contractorData.contractors.length > 0 && (
                <div className="py-8">
                    <Loading text="Loading more contractors..." />
                </div>
            )} */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Professional Contractors
                    </h1>
                    <p className="text-gray-600">
                        Find trusted contractors for your construction needs
                    </p>
                    {/* {contractorData.total > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                            Showing {contractorData.contractors.length} of {contractorData.total} contractors
                        </p>
                    )} */}
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-6 transition-all">
                    {/*  (collapsible for mobile) */}
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                        <button
                            className="md:hidden text-sm text-blue-600 font-medium focus:outline-none"
                            onClick={() => setShowFilters((prev) => !prev)}
                        >
                            {showFilters ? 'Hide' : 'Show'}
                        </button>
                    </div>


                    <div
                        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300 ${showFilters ? 'block' : 'hidden md:grid'
                            }`}
                    >

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search by name or description..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                            <select
                                value={filters.service}
                                onChange={(e) => handleFilterChange('service', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                            >
                                <option value="">All Services</option>
                                {availableServices.map((service) => (
                                    <option key={service} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                placeholder="Enter city..."
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>


                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Chips */}
                    {(filters.service || filters.city || filters.search) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {filters.service && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    {filters.service}
                                    <button
                                        onClick={() => handleFilterChange('service', '')}
                                        className="ml-2 hover:text-blue-600 font-bold"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filters.city && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    {filters.city}
                                    <button
                                        onClick={() => handleFilterChange('city', '')}
                                        className="ml-2 hover:text-green-600 font-bold"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filters.search && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    {filters.search}
                                    <button
                                        onClick={() => handleFilterChange('search', '')}
                                        className="ml-2 hover:text-purple-600 font-bold"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>


                {/* Contractors Grid */}
                {contractorData.contractors.length === 0 && !loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-9xl mb-4">👷</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            No contractors found
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {filters.service || filters.city || filters.search
                                ? "Try adjusting your filters to see more results."
                                : "There are no contractors available in your area at the moment."
                            }
                        </p>
                        {(filters.service || filters.city || filters.search) && (
                            <button
                                onClick={clearFilters}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {contractorData.contractors.map((contractor) => (
                                <div
                                    key={contractor._id}
                                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-100"
                                >
                                    {/* Contractor Image */}
                                    <div className="relative h-48 md:h-52 bg-gray-100">
                                        {contractor.avatar && contractor.avatar ?
                                            <img
                                                src={getPrimaryImage(contractor.avatar)}
                                                alt={contractor.contractorName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = getDefaultImage();
                                                }}
                                            /> : <img
                                                src={getDefaultImage()}
                                                alt={contractor.contractorName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = getDefaultImage();
                                                }}
                                            />}

                                        <div className="absolute top-3 right-3 flex flex-col space-y-2 items-end">
                                            {getAvailabilityBadge(contractor.availability)}
                                            <span
                                                className={`${contractor.isVerified ? 'text-blue-500 bg-white' : ''} px-2 py-1 rounded-full text-[15px] font-medium shadow-sm`}
                                            >
                                                {contractor.isVerified ? <MdVerified /> : null}
                                            </span>
                                        </div>

                                    </div>


                                    <div className="px-3 py-1 md:p-3">

                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                                                {contractor.contractorName}
                                            </h2>
                                            <div className="flex items-center space-x-1">
                                                {renderStars(contractor.rating)}
                                                <span className="text-xs text-gray-500 ml-1">
                                                    ({contractor.rating?.count || 0})
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {contractor.description ||
                                                'Experienced contractor providing reliable construction and renovation services.'}
                                        </p>


                                        <div className="mb-3">
                                            <h4 className="text-xs font-semibold text-gray-800  tracking-wide mb-1">
                                                Services
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5">
                                                {contractor.services?.slice(0, 3).map((service, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full"
                                                    >
                                                        {service}
                                                    </span>
                                                ))}
                                                {contractor.services?.length > 3 && (
                                                    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                        +{contractor.services.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>


                                        <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-sm text-gray-600">
                                            <span className="flex items-center">
                                                < FiMapPin className="w-4 h-4 mr-1 text-blue-500" />
                                                {contractor.address?.city || 'Location'}
                                            </span>
                                        </div>


                                        <div className="mt-4 flex gap-2">
                                            <Link
                                                to={`/contractor/${contractor._id}`}
                                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2.5 px-4 rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm text-center"
                                            >
                                                View Profile
                                            </Link>

                                            <button
                                                onClick={() => handleBookContractor(contractor)}
                                                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white py-2.5 px-4 rounded-xl transition-all duration-200 font-semibold text-sm shadow-sm"
                                            >
                                                Book Contractor
                                            </button>

                                        </div>

                                    </div>
                                </div>

                            ))}
                        </div>

                        {/* Pagination */}
                        {contractorData.totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {[...Array(contractorData.totalPages)].map((_, index) => {
                                    const page = index + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            disabled={loading}
                                            className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-300'
                                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === contractorData.totalPages || loading}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            {showWorkRequestForm && selectedContractor && (
                <WorkRequestForm
                    contractorId={selectedContractor.contractorId || selectedContractor._id}
                    onSuccess={handleWorkRequestSuccess}
                    onCancel={handleWorkRequestCancel}
                />
            )}
        </div>
    );
}

export default ContractorPage;