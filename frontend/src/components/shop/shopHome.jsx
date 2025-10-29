


import toast, { Toaster } from 'react-hot-toast';
import Navbar from '../home/navbar';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router';

function ShopHome() {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

    const handleShopRegistration = () => {
        if (!isAuthenticated) {
            toast.error('Please login to register your shop', {
                duration: 4000,
                icon: '🔒',
                style: {
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                }
            });
            return;
        }

        if (user.role !== 'admin' && user.role !== 'co-admin') {
            // console.log(error, "error");

            toast.error('Access Denied. Shop registration requires admin privileges.', {
                duration: 5000,
                icon: '🚫',
                position: 'bottom-right',
                style: {
                    background: '#fff7ed',
                    color: '#ea580c',
                    border: '1px solid #fdba74',
                },
                // action: {
                //     label: 'Contact Support',
                //     onClick: () => navigate('/')
                // }
            });
            return;
        }

        // If authenticated and has proper role, navigate to business page
        toast.success('Redirecting to business registration...', {
            duration: 2000,
            icon: '🚀'
        });
        setTimeout(() => navigate('/addShop'), 100);
    };

    const handleServiceRegistration = () => {
        if (!isAuthenticated) {
            toast.error('Please login to register your service', {
                duration: 4000,
                icon: '🔒',
                style: {
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                }
            });
            return;
        }

        if (user.role !== 'admin' && user.role !== 'co-admin') {
            toast.error('Access Denied. Service registration requires admin privileges.', {
                duration: 2000,
                icon: '🚫',
                style: {
                    background: '#fff7ed',
                    color: '#ea580c',
                    border: '1px solid #fdba74',
                },
                action: {
                    label: 'Contact Support',
                    onClick: () => navigate('/contact')
                }
            });
            return;
        }

        // If authenticated and has proper role, navigate to services page
        toast.success('Redirecting to service registration...', {
            duration: 500,
            icon: '🎯'
        });
        setTimeout(() => navigate('/addServices'), 100);
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="py-20 px-4 sm:px-6 lg:px-8">
                <Toaster position="bottom-center" />

                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        All you need for your Shop
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Manage your shop bills efficiently with our comprehensive tools designed for shop owners.
                    </p>

                </div>
            </div>

            {/* Registration Section */}
            <div className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Add Bill Card */}
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-500 p-8 border border-gray-200 group cursor-pointer transform hover:-translate-y-2">
                            <button
                                className="w-full bg-transparent hover:bg-gray-50 text-gray-800 font-medium py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed  "
                                onClick={() => { navigate('/shop/addBill') }}
                                disabled={loading}
                            >
                                <div className="text-center">
                                    {/* Icon Container with enhanced animation */}
                                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center overflow-visible group-hover:bg-gray-200 transition-colors duration-300">
                                        <img
                                            src="https://www.swiggy.com/corporate/wp-content/uploads/2024/10/home-2.webp"
                                            alt="Physical Shop"
                                            className="w-20 h-20 object-cover rounded-full group-hover:scale-200 transition-transform duration-600 ease-out"
                                        />
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">
                                        Add Bill
                                    </h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                                        Add your daily shop bills here.
                                    </p>
                                </div>
                            </button>
                        </div>

                        {/* All Bills Card */}
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-500 p-8 border border-gray-200 group cursor-pointer transform hover:-translate-y-2">
                            <button
                                className="w-full bg-transparent hover:bg-gray-50 text-gray-800 font-medium py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed  "
                                onClick={() => { navigate('/shop/allBills') }}
                                disabled={loading}
                            >
                                <div className="text-center">
                                    {/* Icon Container */}
                                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center overflow-visible group-hover:bg-gray-200 transition-colors duration-300">
                                        <img
                                            src="https://static.vecteezy.com/system/resources/previews/035/880/409/non_2x/monthly-budget-and-financial-planning-icon-in-simple-colored-outline-style-vector.jpg"
                                            alt="Service Provider"
                                            className="w-25 h-25 object-cover rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"
                                        />
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">
                                        All Bills
                                    </h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                                        Your all bills are here.
                                    </p>
                                </div>
                            </button>
                        </div>

                        {/* Update Bills Card */}
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-500 p-8 border border-gray-200 group cursor-pointer transform hover:-translate-y-2">
                            <button
                                className="w-full bg-transparent hover:bg-gray-50 text-gray-800 font-medium py-4 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed  "
                                onClick={() => { navigate('/shop/allCustomers') }}
                                disabled={loading}
                            >
                                <div className="text-center">
                                    {/* Icon Container */}
                                    <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center overflow-visible group-hover:bg-gray-200 transition-colors duration-300">
                                        <img
                                            src="https://img.freepik.com/premium-vector/buyer-with-seller-concept-man-near-cashier-buy-goods-customer-client-market-store-commerce_1002658-3318.jpg"
                                            alt="Service Provider"
                                            className="w-25 h-25 object-cover rounded-full group-hover:scale-127 transition-transform duration-500 ease-out"
                                        />
                                    </div>

                                    <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-300">
                                        All Customers
                                    </h3>
                                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                                        view all your customers here.
                                    </p>
                                </div>
                            </button>
                        </div>

                    </div>

                    {/* Additional Info */}
                    <div className="text-center mt-16">
                        <p className="text-gray-500 text-sm">
                            {isAuthenticated ? (
                                <>Need help? <a href="/contact" className="text-gray-700 hover:text-gray-900 font-medium underline transition-colors duration-300">Contact Support</a></>
                            ) : (
                                <>Already have an account? <a href="/login" className="text-gray-700 hover:text-gray-900 font-medium underline transition-colors duration-300">Sign in</a></>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default ShopHome;