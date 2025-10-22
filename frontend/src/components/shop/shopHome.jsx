


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
            <div className="py-15 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Add Bill Card */}
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group cursor-pointer">
                            <div className="text-center">
                                {/* Icon Container */}
                                <div className="w-30 h-30 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center overflow-visible">
                                    <img
                                        src="https://www.swiggy.com/corporate/wp-content/uploads/2024/10/home-2.webp"
                                        alt="Physical Shop"
                                        className="w-30 h-30 object-cover rounded-full group-hover:scale-150 transition-transform duration-500"
                                    />
                                </div>

                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Add Bill
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Add your daily shop bills here.
                                </p>

                                <button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    onClick={() => { navigate('/shop/addBill') }}
                                    disabled={loading}
                                >
                                    {loading ? 'Checking Access...' : 'Add Bill'}
                                </button>
                            </div>
                        </div>

                        {/* All_Bill / search Bill Card */}
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group cursor-pointer">
                            <div className="text-center">
                                {/* Icon Container */}
                                <div className="w-30 h-30 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center overflow-visible">
                                    <img
                                        src="https://cdn.prod.website-files.com/655041f226c56cfcfbc201b5/67cfea3d3602abad23288dd5_service-business-examples.jpg"
                                        alt="Service Provider"
                                        className="w-30 h-30 object-cover rounded-full group-hover:scale-120 transition-transform duration-500"
                                    />
                                </div>

                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    All Bills
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    your all bills are here.
                                </p>

                                <button
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors  disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    onClick={() => { navigate('/shop/allBills') }}
                                    disabled={loading}
                                >
                                    {loading ? 'Checking Access...' : 'View Bills'}
                                </button>
                            </div>
                        </div>

                        {/* update bills */}
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group cursor-pointer">
                            <div className="text-center">
                                {/* Icon Container */}
                                <div className="w-30 h-30 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center overflow-visible">
                                    <img
                                        src="https://cdn.prod.website-files.com/655041f226c56cfcfbc201b5/67cfea3d3602abad23288dd5_service-business-examples.jpg"
                                        alt="Service Provider"
                                        className="w-30 h-30 object-cover rounded-full group-hover:scale-120 transition-transform duration-500"
                                    />
                                </div>

                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Update Bills
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    need to update your bills?
                                </p>

                                <button
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors  disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    onClick={() => { navigate('/shop/updateBill') }}
                                    disabled={loading}
                                >
                                    {loading ? 'Checking Access...' : 'Update Bill'}
                                </button>
                            </div>
                        </div>

                        {/* find bills */}




                    </div>

                    {/* Additional Info */}
                    <div className="text-center mt-12">
                        <p className="text-gray-500 text-sm">
                            {isAuthenticated ? (
                                <>Need help? <a href="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium">Contact Support</a></>
                            ) : (
                                <>Already have an account? <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">Sign in</a></>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShopHome;