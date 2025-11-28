
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import { FaLocationDot, FaStore, FaRobot, FaRightFromBracket } from "react-icons/fa6";
import { FaTools } from "react-icons/fa";
import { MdDesignServices } from "react-icons/md";
import { IoSearchSharp } from "react-icons/io5";
import Navbar from "../components/home/navbar";
import { useNavigate } from "react-router";
import NotificationSubscribeButton from '../components/NotificationSubscribeButton';


export default function Homepg() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);


    const calculateCompletion = () => {
        if (!user) return 0;

        let completed = 0;
        const total = 7;

        if (user.name) completed++;
        if (user.email) completed++;
        if (user.phone) completed++;
        if (user.address?.street) completed++;
        if (user.address?.city) completed++;
        if (user.address?.state) completed++;
        if (user.address?.pincode) completed++;

        return Math.round((completed / total) * 100);
    };

    const handleFeatureClick = (link) => {
        const completion = calculateCompletion();

        if (completion < 100) {
            navigate("/setting/user");
            return;
        }

        navigate(link);
    };

    const features = [
        {
            id: 1,
            title: "Local Stores",
            description: "Discover best shops in your locality & more..",
            icon: <FaStore className="text-3xl text-blue-600" />,
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            link: "/localShop"
        },
        {
            id: 2,
            title: "Contractor Services",
            description: "Every problem has a professional solution",
            icon: <FaTools className="text-3xl text-green-600" />,
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            link: "/Services"

        },
        {
            id: 3,
            title: "AI Planning Tools",
            description: "Design your space, estimate costs & more",
            icon: <FaRobot className="text-3xl text-purple-600" />,
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
            link: "/Planning_tools"

        },
        {
            id: 4,
            title: "Material Marketplace",
            description: "Best prices on construction materials",
            icon: <MdDesignServices className="text-3xl text-orange-600" />,
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
            link: "/Material_market"

        }
    ];

    return (

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <Navbar className="z-50" />
            {/* <NotificationSubscribeButton /> */}
            {calculateCompletion() < 100 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1 md:flex md:justify-between">
                            <p className="text-sm text-yellow-700">
                                Complete your profile ({calculateCompletion()}%) to access all features
                            </p>
                            <button
                                onClick={() => navigate("/setting/user")}
                                className="mt-3 md:mt-0 md:ml-6 text-sm text-yellow-700 hover:text-yellow-600 font-medium underline"
                            >
                                Complete Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        Your Dream ,<br />
                        <span className="text-blue-600">Our AI Promise</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Discover the best local stores, contractors, and business tools powered by artificial intelligence.
                        Everything you need for your dream home in one platform.
                    </p>

                    {/* Search Section */}
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-2 mb-12">
                        <div className="flex flex-col md:flex-row gap-2">
                            {/* Location Input */}
                            <div className="flex-1  border-1 border-e-4 border-gray-200 flex items-center bg-gray-50 rounded-xl px-4 py-3">
                                <FaLocationDot className="text-gray-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Enter your delivery location"
                                    className="bg-transparent w-full focus:outline-none text-gray-700 placeholder-gray-500"
                                />
                            </div>

                            {/* Search Input */}
                            <div className="flex-1 border-1 border-e-4 border-gray-200 flex items-center bg-gray-50 rounded-xl px-4 py-3">
                                <IoSearchSharp className="text-gray-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Search for shops, contractors, or services"
                                    className="bg-transparent w-full focus:outline-none text-gray-700 placeholder-gray-500"
                                />
                            </div>

                            {/* Search Button */}
                            <button
                                onClick={() => {
                                    if (calculateCompletion() < 100) {
                                        navigate("/setting/user");
                                    } else {
                                        // Handle search functionality here
                                    }
                                }}
                                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition duration-200 font-semibold"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            onClick={() => handleFeatureClick(feature.link)}
                            className="group cursor-pointer"
                        >
                            <div
                                className={`${feature.bgColor} ${feature.borderColor} border-2 rounded-2xl p-6 hover:shadow-lg transition duration-300 relative overflow-hidden`}
                            >
                                {/* Completion Lock Overlay */}
                                {calculateCompletion() < 100 && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                                        <div className="text-center">
                                            <div className="bg-yellow-100 p-3 rounded-full inline-block mb-2">
                                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-yellow-700">
                                                Complete Profile to Access
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4 p-3 bg-white rounded-xl group-hover:scale-110 transition duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>

                                    {/* Progress indicator on each card */}
                                    {calculateCompletion() < 100 && (
                                        <div className="mt-3 w-full">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Profile Complete</span>
                                                <span>{calculateCompletion()}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${calculateCompletion()}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Promotional Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-gray-700 rounded-3xl p-8 text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Start Your Business Journey Today</h2>
                    <p className="text-blue-100 mb-6 text-lg">
                        Join thousands of local businesses already growing with Neerman
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition duration-200">
                            Register Your Business
                        </button>
                        <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition duration-200">
                            Watch Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-400">
                        © 2025 Neerman. Empowering local businesses/Customers with AI technology.
                    </p>
                </div>
            </footer>
        </div>
    );
}