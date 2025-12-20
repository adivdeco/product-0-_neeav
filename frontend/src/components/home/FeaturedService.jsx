


// import React, { useEffect, useState } from 'react';
// import { FaArrowRightLong } from 'react-icons/fa6';
// import { useDispatch, useSelector } from 'react-redux';

// import { useNavigate } from 'react-router';
// import axiosClient from '../../api/auth';

// const FeaturedService = () => {
//     const { user } = useSelector((state) => state.auth);

//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     const [contractorData, setContractorData] = useState({
//         contractors: [],
//         totalPages: 0,
//         total: 0
//     });
//     // Use separate selectors instead of one object
//     const [loading, setLoading] = useState(false)
//     // const shouldFetch = useSelector(selectShouldFetchTopRated);

//     const [displayProducts, setDisplayProducts] = useState([]);

//     // Fetch if needed


//     // Handle Session-Based Randomization
//     // useEffect(() => {
//     //     if (!featuredProducts || featuredProducts.length === 0) return;

//     //     const SESSION_KEY = 'neerman_featured_ids';

//     //     try {
//     //         const storedIds = JSON.parse(sessionStorage.getItem(SESSION_KEY));

//     //         if (storedIds && Array.isArray(storedIds) && storedIds.length > 0) {
//     //             const matchedProducts = featuredProducts.filter(p => storedIds.includes(p._id));
//     //             if (matchedProducts.length > 0) {
//     //                 setDisplayProducts(matchedProducts);
//     //                 return;
//     //             }
//     //         }

//     //         const shuffled = [...featuredProducts].sort(() => 0.5 - Math.random());
//     //         const selected = shuffled.slice(0, 4);

//     //         sessionStorage.setItem(SESSION_KEY, JSON.stringify(selected.map(p => p._id)));
//     //         setDisplayProducts(selected);

//     //     } catch (error) {
//     //         console.error("Session storage error", error);
//     //         setDisplayProducts(featuredProducts.slice(0, 4));
//     //     }

//     // }, );

//     const fetchContractors = async () => {
//         try {
//             setLoading(true);
//             const { data } = await axiosClient.get(`/useas/contractors?${params}`);
//             setContractorData({
//                 contractors: data.contractors || [],
//                 totalPages: data.totalPages || 1,
//                 total: data.total || 0
//             });
//         } catch (error) {
//             console.error('Fetch error:', error);
//         } finally {
//             setLoading(false);
//         }
//     }

//     useEffect(() => {
//         if (user) fetchContractors();
//     }, [user, fetchContractors]);

//     const handleProductClick = (contractor) => {
//         navigate(`/contractor/${contractor._id}`);
//     };

//     const renderProductCard = (contractor) => (
//         <div
//             key={contractor._id}
//             onClick={() => handleProductClick(contractor._id)}
//             className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
//         >
//             {/* Product Image */}
//             <div className="relative h-32 sm:h-48 overflow-hidden bg-gray-100">
//                 <img
//                     src={contractor.avatar}
//                     alt={contractor.name}
//                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                 />
//             </div>

//             {/* Product Info */}
//             <div className="px-4 py-2">
//                 <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                         <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{contractor.name}</h3>
//                     </div>
//                 </div>

//                 {/* Brand and Rating */}
//                 <div className="flex items-center justify-between mb-4 mt-1">
//                     <span className="text-sm text-gray-600">
//                         {contractor.brand || 'No Brand'}
//                     </span>
//                     {contractor.rating?.average && (
//                         <div className="flex items-center">
//                             <span className="text-yellow-500 mr-1">★</span>
//                             <span className="text-sm font-medium">{contractor.rating.average}</span>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );

//     // Show loading state
//     if (loading && displayProducts.length === 0) {
//         return (
//             <section className="py-8">
//                 <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
//                     <div className="py-6 bg-gradient-to-r from-purple-100 to-indigo-50 px-3 rounded-3xl">
//                         <div className="flex justify-between items-center mb-8">
//                             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Best Products</h2>
//                             <div className="bg-gray-300 animate-pulse h-8 w-20 rounded-2xl"></div>
//                         </div>
//                         <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
//                             {[...Array(4)].map((_, i) => (
//                                 <div key={i} className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
//                                     <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
//                                     <div className="h-4 bg-gray-200 rounded mb-2"></div>
//                                     <div className="h-3 bg-gray-200 rounded w-3/4"></div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </section>
//         );
//     }

//     // Don't render if no products to show yet
//     if (displayProducts.length === 0) return null;

//     return (
//         <section className="py-8">
//             <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
//                 <div className="relative py-6 bg-gradient-to-r from-purple-100 to-indigo-50 px-3 rounded-3xl overflow-hidden mb-8">

//                     {/* Header */}
//                     <div className="flex justify-between items-center mb-8">
//                         <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Best Products</h2>
//                         <button
//                             onClick={() => navigate('/Services')}
//                             className="bg-black hover:bg-gray-800 text-white text-xs px-4 py-2 rounded-2xl transition-all duration-300 flex items-center gap-2 group"
//                         >
//                             View All
//                             <FaArrowRightLong className="group-hover:translate-x-1 transition-transform text-sm" />
//                         </button>
//                     </div>

//                     {/* Products Grid */}
//                     <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
//                         {displayProducts.map((contractor) => renderProductCard(contractor))}
//                     </div>

//                 </div>
//             </div>
//         </section>
//     );
// };

// export default FeaturedService;



import React, { useEffect, useState } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { useNavigate } from 'react-router';
import { MdVerified, MdStar } from "react-icons/md"; // Added icons for better UI match
import axiosClient from '../../api/auth';

const FeaturedService = () => {
    const navigate = useNavigate();

    // Local state for contractors
    const [allContractors, setAllContractors] = useState([]);
    const [displayContractors, setDisplayContractors] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Data from API
    useEffect(() => {
        const fetchContractors = async () => {
            try {
                setLoading(true);
                // Fetch a pool of contractors (e.g., limit 20 to shuffle from)
                const { data } = await axiosClient.get(`/useas/contractors?limit=20`);
                const contractors = data.contractors || [];
                setAllContractors(contractors);
            } catch (error) {
                console.error('Fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContractors();
    }, []);

    // 2. Handle Session-Based Randomization
    useEffect(() => {
        if (!allContractors || allContractors.length === 0) return;

        const SESSION_KEY = 'neerman_featured_contractor_ids';

        try {
            // Check if we already have selected IDs for this session
            const storedIds = JSON.parse(sessionStorage.getItem(SESSION_KEY));
            let selected = [];

            if (storedIds && Array.isArray(storedIds) && storedIds.length > 0) {
                // Try to find the stored contractors in the fetched data
                selected = allContractors.filter(c => storedIds.includes(c._id));
            }

            // If we didn't find stored ones (new session) or data mismatch, pick new random ones
            if (selected.length === 0) {
                const shuffled = [...allContractors].sort(() => 0.5 - Math.random());
                selected = shuffled.slice(0, 4); // Pick 4

                // Save these IDs to session storage (persists on reload, clears on close)
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(selected.map(c => c._id)));
            }

            setDisplayContractors(selected);

        } catch (error) {
            console.error("Session storage logic error", error);
            // Fallback
            setDisplayContractors(allContractors.slice(0, 4));
        }

    }, [allContractors]);

    const handleCardClick = (id) => {
        navigate(`/contractor/${id}`);
    };

    // Helper to render stars safely based on your schema
    const renderRating = (ratingObj) => {
        const avg = ratingObj?.average || 0;
        if (!avg) return null;
        return (
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                <MdStar className="text-yellow-500 mr-1" />
                <span className="text-sm font-bold text-gray-700">{avg.toFixed(1)}</span>
            </div>
        );
    };

    const renderContractorCard = (contractor) => (
        <div
            key={contractor._id}
            onClick={() => handleCardClick(contractor._id)}
            className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
        >
            {/* Image Section */}
            <div className="relative h-32 sm:h-48 overflow-hidden bg-gray-100">
                <img
                    src={contractor.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80'}
                    alt={contractor.contractorName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80';
                    }}
                />
                {contractor.isVerified && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1 rounded-full text-blue-600 shadow-sm">
                        <MdVerified size={16} />
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="px-4 py-3 flex flex-col flex-grow justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {contractor.contractorName}
                    </h3>

                    {/* Services (Mapped from Schema) */}
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {contractor.services && contractor.services.length > 0
                            ? contractor.services.join(', ')
                            : 'General Contractor'}
                    </p>
                </div>

                {/* City and Rating */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide truncate max-w-[60%]">
                        {contractor.address?.city || 'Local'}
                    </span>
                    {renderRating(contractor.rating)}
                </div>
            </div>
        </div>
    );

    // Show loading state (Skeleton)
    if (loading) {
        return (
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <div className="py-6 bg-gradient-to-r from-purple-100 to-indigo-50 px-3 rounded-3xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Experts</h2>
                            <div className="bg-gray-300 animate-pulse h-8 w-20 rounded-2xl"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-md p-4 animate-pulse h-64">
                                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Don't render if no contractors found
    if (displayContractors.length === 0) return null;

    return (
        <section className="py-8">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative py-6 bg-gradient-to-r from-blue-100 to-indigo-50 px-3 rounded-3xl overflow-hidden mb-8">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Experts</h2>
                            <p className="text-sm text-gray-500 mt-1 hidden sm:block">Top rated professionals for your needs</p>
                        </div>
                        <button
                            onClick={() => navigate('/Services')} // Updated route
                            className="bg-black hover:bg-gray-800 text-white text-xs px-4 py-2.5 rounded-2xl transition-all duration-300 flex items-center gap-2 group shadow-lg"
                        >
                            View All
                            <FaArrowRightLong className="group-hover:translate-x-1 transition-transform text-sm" />
                        </button>
                    </div>

                    {/* Contractors Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
                        {displayContractors.map((contractor) => renderContractorCard(contractor))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FeaturedService;