import { useCallback, useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axiosClient from '../api/auth';
// import FullScreenLoader from '../components/FullScreenLoader';
// import InlineLoader from '../components/InlineLoader';
import Loading from "../components/Loader";


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
    const [filters, setFilters] = useState({
        service: '',
        city: '',
        search: ''
    });

    // Available services from your schema
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
        const primaryImage = images?.find(img => img.isPrimary);
        return primaryImage?.url || images?.[0]?.url || getDefaultImage();
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

    // Show full-screen loader only on initial load
    if (loading && contractorData.contractors.length === 0) {
        return <Loading text="Loading Contractors..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Inline loading for pagination */}
            {/* {loading && contractorData.contractors.length > 0 && (
                <div className="py-8">
                    <Loading text="Loading more contractors..." />
                </div>
            )} */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Professional Contractors
                    </h1>
                    <p className="text-gray-600">
                        Find trusted contractors for your construction needs
                    </p>
                    {contractorData.total > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                            Showing {contractorData.contractors.length} of {contractorData.total} contractors
                        </p>
                    )}
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Contractors
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name or description..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Service Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Type
                            </label>
                            <select
                                value={filters.service}
                                onChange={(e) => handleFilterChange('service', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Services</option>
                                {availableServices.map((service) => (
                                    <option key={service} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* City Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                City
                            </label>
                            <input
                                type="text"
                                placeholder="Enter city..."
                                value={filters.city}
                                onChange={(e) => handleFilterChange('city', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(filters.service || filters.city || filters.search) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {filters.service && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Service: {filters.service}
                                    <button
                                        onClick={() => handleFilterChange('service', '')}
                                        className="ml-2 hover:text-blue-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filters.city && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    City: {filters.city}
                                    <button
                                        onClick={() => handleFilterChange('city', '')}
                                        className="ml-2 hover:text-green-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filters.search && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Search: {filters.search}
                                    <button
                                        onClick={() => handleFilterChange('search', '')}
                                        className="ml-2 hover:text-purple-600"
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
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
                                >
                                    {/* Contractor Image */}
                                    <div className="relative h-48 bg-gray-200">
                                        <img
                                            src={getPrimaryImage(contractor.images)}
                                            alt={contractor.contractorName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = getDefaultImage();
                                            }}
                                        />
                                        <div className="absolute top-4 right-4 flex flex-col space-y-2">
                                            {getAvailabilityBadge(contractor.availability)}
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${contractor.isVerified
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {contractor.isVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contractor Content */}
                                    <div className="p-6">
                                        {/* Name and Rating */}
                                        <div className="flex justify-between items-start mb-1">
                                            <h2 className="text-xl font-bold text-gray-900 truncate">
                                                {contractor.contractorName}
                                            </h2>
                                            <div className="flex items-center space-x-1">
                                                {renderStars(contractor.rating)}
                                                <span className="text-sm text-gray-600 ml-1">
                                                    ({contractor.rating?.count || 0})
                                                </span>
                                            </div>
                                        </div>

                                        {/* Experience */}


                                        {/* Description */}
                                        <p className="text-gray-700 text-sm mb-1 line-clamp-2">
                                            {contractor.description || "Professional contractor with expertise in various construction services."}
                                        </p>

                                        {/* Services */}
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                Services:
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {contractor.services?.slice(0, 3).map((service, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                                                    >
                                                        {service}
                                                    </span>
                                                ))}
                                                {contractor.services?.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                        +{contractor.services.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pricing */}
                                        {/* <div className="mb-4">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-semibold">Pricing:</span>{' '}
                                                {formatPricing(contractor.pricing)}
                                            </p>
                                        </div> */}

                                        {/* Location */}
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between items-center text-sm text-gray-600">
                                                {/* <span>📞 {contractor.contact?.phone}</span> */}
                                                <span>📍 {contractor.address?.city}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-2 mt-4">
                                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-semibold text-sm">
                                                View Profile
                                            </button>
                                            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-semibold text-sm">
                                                Contact
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
        </div>
    );
}

export default ContractorPage;