
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import { FaLocationDot, FaStore, FaRobot, FaRightFromBracket } from "react-icons/fa6";
import { FaTools } from "react-icons/fa";
import { MdDesignServices } from "react-icons/md";
import { IoSearchSharp } from "react-icons/io5";
import Navbar from "../components/home/navbar";


export default function Homepg() {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);




    // Sample featured categories data
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
                            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition duration-200 font-semibold">
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {features.map((feature) => (
                        <a key={feature.id} href={feature.link} className="group">
                            <div
                                className={`${feature.bgColor} ${feature.borderColor} border-2 rounded-2xl p-6 hover:shadow-lg transition duration-300 cursor-pointer`}
                            >
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
                                </div>
                            </div>
                        </a>
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