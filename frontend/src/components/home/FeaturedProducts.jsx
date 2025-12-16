// import React, { useEffect, useState } from 'react';
// import { FaArrowRightLong } from 'react-icons/fa6';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchTopRatedProducts, selectTopRatedProducts } from './../../redux/slice/productSlice';
// import { useNavigate } from 'react-router';

// const FeaturedProducts = () => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();

//     // 1. Get data from Redux
//     const { products: featuredProducts, shouldFetch } = useSelector(selectTopRatedProducts);
//     const [displayProducts, setDisplayProducts] = useState([]);

//     // 2. Fetch if needed
//     useEffect(() => {
//         if (shouldFetch) {
//             dispatch(fetchTopRatedProducts());
//         }
//     }, [dispatch, shouldFetch]);

//     // 3. Handle Session-Based Randomization (Redux Data Only)
//     useEffect(() => {
//         // Wait for Redux data to be available
//         if (!featuredProducts || featuredProducts.length === 0) return;

//         const SESSION_KEY = 'neerman_featured_ids';

//         try {
//             // Check session storage
//             const storedIds = JSON.parse(sessionStorage.getItem(SESSION_KEY));

//             if (storedIds && Array.isArray(storedIds) && storedIds.length > 0) {
//                 // Try to find the stored products in the current Redux data
//                 const matchedProducts = featuredProducts.filter(p => storedIds.includes(p._id));

//                 // If we found them, display them
//                 if (matchedProducts.length > 0) {
//                     setDisplayProducts(matchedProducts);
//                     return;
//                 }
//             }

//             // If no session data or data mismatch: Shuffle Redux data and save new IDs
//             const shuffled = [...featuredProducts].sort(() => 0.5 - Math.random());
//             const selected = shuffled.slice(0, 4);

//             sessionStorage.setItem(SESSION_KEY, JSON.stringify(selected.map(p => p._id)));
//             setDisplayProducts(selected);

//         } catch (error) {
//             console.error("Session storage error", error);
//             setDisplayProducts(featuredProducts.slice(0, 4));
//         }

//     }, [featuredProducts]);

//     const handleProductClick = (productId) => {
//         navigate(`/product/${productId}`);
//     };

//     const renderProductCard = (product) => (
//         <div
//             key={product._id}
//             onClick={() => handleProductClick(product._id)}
//             className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
//         >
//             {/* Product Image */}
//             <div className="relative h-32 overflow-hidden bg-gray-100">
//                 <img
//                     src={product.ProductImage}
//                     alt={product.name}
//                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                 />
//             </div>

//             {/* Product Info */}
//             <div className="px-4 py-2">
//                 <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                         <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>
//                     </div>
//                 </div>

//                 {/* Brand and Rating */}
//                 <div className="flex items-center justify-between mb-4 mt-1">
//                     <span className="text-sm text-gray-600">
//                         {product.brand || 'No Brand'}
//                     </span>
//                     {product.rating?.average && (
//                         <div className="flex items-center">
//                             <span className="text-yellow-500 mr-1">★</span>
//                             <span className="text-sm font-medium">{product.rating.average}</span>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );

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
//                             onClick={() => navigate('/Material_market')}
//                             className="bg-black hover:bg-gray-800 text-white text-xs px-4 py-2 rounded-2xl transition-all duration-300 flex items-center gap-2 group"
//                         >
//                             View All
//                             <FaArrowRightLong className="group-hover:translate-x-1 transition-transform text-sm" />
//                         </button>
//                     </div>

//                     {/* Products Grid */}
//                     <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4  sm:gap-4">
//                         {displayProducts.map((product) => renderProductCard(product))}
//                     </div>

//                 </div>
//             </div>
//         </section>
//     );
// };

// export default FeaturedProducts;


import React, { useEffect, useState } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTopRatedProducts, 
  selectTopRated, 
  selectLoading,
  selectShouldFetchTopRated
} from './../../redux/slice/productSlice';
import { useNavigate } from 'react-router';

const FeaturedProducts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Use separate selectors instead of one object
    const featuredProducts = useSelector(selectTopRated);
    const loading = useSelector(selectLoading);
    const shouldFetch = useSelector(selectShouldFetchTopRated);
    
    const [displayProducts, setDisplayProducts] = useState([]);

    // Fetch if needed
    useEffect(() => {
        if (shouldFetch) {
            dispatch(fetchTopRatedProducts());
        }
    }, [dispatch, shouldFetch]);

    // Handle Session-Based Randomization
    useEffect(() => {
        if (!featuredProducts || featuredProducts.length === 0) return;

        const SESSION_KEY = 'neerman_featured_ids';

        try {
            const storedIds = JSON.parse(sessionStorage.getItem(SESSION_KEY));

            if (storedIds && Array.isArray(storedIds) && storedIds.length > 0) {
                const matchedProducts = featuredProducts.filter(p => storedIds.includes(p._id));
                if (matchedProducts.length > 0) {
                    setDisplayProducts(matchedProducts);
                    return;
                }
            }

            const shuffled = [...featuredProducts].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 4);

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(selected.map(p => p._id)));
            setDisplayProducts(selected);

        } catch (error) {
            console.error("Session storage error", error);
            setDisplayProducts(featuredProducts.slice(0, 4));
        }

    }, [featuredProducts]);

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const renderProductCard = (product) => (
        <div
            key={product._id}
            onClick={() => handleProductClick(product._id)}
            className="group cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
            {/* Product Image */}
            <div className="relative h-32 overflow-hidden bg-gray-100">
                <img
                    src={product.ProductImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            {/* Product Info */}
            <div className="px-4 py-2">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                    </div>
                </div>

                {/* Brand and Rating */}
                <div className="flex items-center justify-between mb-4 mt-1">
                    <span className="text-sm text-gray-600">
                        {product.brand || 'No Brand'}
                    </span>
                    {product.rating?.average && (
                        <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span className="text-sm font-medium">{product.rating.average}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Show loading state
    if (loading && displayProducts.length === 0) {
        return (
            <section className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <div className="py-6 bg-gradient-to-r from-purple-100 to-indigo-50 px-3 rounded-3xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Best Products</h2>
                            <div className="bg-gray-300 animate-pulse h-8 w-20 rounded-2xl"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-md p-4 animate-pulse">
                                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // Don't render if no products to show yet
    if (displayProducts.length === 0) return null;

    return (
        <section className="py-8">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative py-6 bg-gradient-to-r from-purple-100 to-indigo-50 px-3 rounded-3xl overflow-hidden mb-8">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Best Products</h2>
                        <button
                            onClick={() => navigate('/Material_market')}
                            className="bg-black hover:bg-gray-800 text-white text-xs px-4 py-2 rounded-2xl transition-all duration-300 flex items-center gap-2 group"
                        >
                            View All
                            <FaArrowRightLong className="group-hover:translate-x-1 transition-transform text-sm" />
                        </button>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
                        {displayProducts.map((product) => renderProductCard(product))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;