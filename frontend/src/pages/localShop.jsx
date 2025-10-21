import { useCallback, useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axiosClient from '../api/auth';
import Loading from '../components/Loader';

function LocalShop() {
    const { user } = useSelector((state) => state.auth);
    const [shopData, setShopData] = useState({
        shops: [],
        totalPages: 0,
        currentPage: 1,
        total: 0
    });
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchShops = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const { data } = await axiosClient.get(`/useas/shop-owners?page=${page}`);
            console.log('Shop data:', data);

            setShopData({
                shops: data.shop || [],
                totalPages: data.totalPages || 1,
                currentPage: data.currentPage || 1,
                total: data.total || 0
            });
        } catch (error) {
            console.error('Shop fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchShops(currentPage);
        }
    }, [user, currentPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= shopData.totalPages) {
            setCurrentPage(page);
        }
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

    const getDefaultImage = () => {
        return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80';
    };

    const formatTime = (time) => {
        return time ? time.replace(/:00$/, '') : '';
    };

    // if (loading && shopData.shops.length === 0) {
    //     return <Loading />;
    // }

    return (
        <div className="min-h-screen bg-gray-50 py-8">

            {loading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-300 bg-opacity-40">
                    <Loading />
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Local Construction Shops
                    </h1>
                    <p className="text-gray-600">
                        Discover quality construction materials from trusted local suppliers
                    </p>
                    {shopData.total > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                            Showing {shopData.shops.length} of {shopData.total} shops
                        </p>
                    )}
                </div>

                {/* Shops Grid */}
                {shopData.shops.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-9xl mb-4">🏗️</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            No shops found
                        </h3>
                        <p className="text-gray-500">
                            There are no construction shops available in your area at the moment.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {shopData.shops.map((shop) => (
                                <div
                                    key={shop._id}
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                                >
                                    {/* Shop Image */}
                                    <div className="relative h-48 bg-gray-200">
                                        <img
                                            src={
                                                shop.images?.[0]?.url || getDefaultImage()
                                            }
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = getDefaultImage();
                                            }}
                                        />
                                        <div className="absolute top-4 right-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${shop.isVerified
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {shop.isVerified ? 'Verified' : 'Pending Verification'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Shop Content */}
                                    <div className="p-6">
                                        {/* Shop Name and Rating */}
                                        <div className="flex justify-between items-start mb-1">
                                            <h2 className="text-xl font-bold text-gray-900 truncate">
                                                {shop.shopName}
                                            </h2>
                                            <div className="flex items-center space-x-1">
                                                {renderStars(shop.rating)}
                                                <span className="text-sm text-gray-600 ml-1">
                                                    ({shop.rating?.count || 0})
                                                </span>
                                            </div>
                                        </div>

                                        {/* Owner Name */}
                                        <p className="text-gray-500 mb-1">
                                            <span className="font-light">Owner:</span> {shop.ownerName}
                                        </p>

                                        {/* Categories */}
                                        <div className="mb-4">

                                            <div className="flex flex-wrap gap-1">
                                                {shop.categories?.slice(0, 3).map((category, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                    >
                                                        {category}
                                                    </span>
                                                ))}
                                                {shop.categories?.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                        +{shop.categories.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>



                                        {/* Contact Info */}
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between items-center text-sm text-gray-600">
                                                {/* <span>📞 {shop.contact?.phone}</span> */}
                                                <span>📍 {shop.address?.city}</span>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {shopData.totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {[...Array(shopData.totalPages)].map((_, index) => {
                                    const page = index + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-300'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === shopData.totalPages}
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

export default LocalShop;