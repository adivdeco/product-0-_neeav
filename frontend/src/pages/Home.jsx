
import { useDispatch, useSelector } from "react-redux";
// import { FaLocationDot, FaStore, FaRobot, FaRightFromBracket } from "react-icons/fa6";
import { FaLocationDot, FaStore, FaRobot, FaHammer, FaArrowRight, FaLock } from "react-icons/fa6";
import { MdDesignServices, MdEmail, MdVerified } from "react-icons/md";
// import { MdDesignServices } from "react-icons/md";
import { IoSearchSharp } from "react-icons/io5";
import Navbar from "../components/home/navbar";
import { useNavigate } from "react-router";
import NotificationSubscribeButton from '../components/NotificationSubscribeButton';
import { Phone } from "lucide-react";
import AnimatedSearchBar from "../components/home/AnimatedSearchBar";


const heroBgImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3";
const imgLocalStore = "https://res.cloudinary.com/djupaqjuz/image/upload/v1765559027/Gemini_Generated_Image_o1jfko1jfko1jfko_xbcaxx.png";
const imgContractor = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.0.3";
const imgAiTools = "https://res.cloudinary.com/djupaqjuz/image/upload/v1765559014/Gemini_Generated_Image_7tsbw07tsbw07tsb_swi7g7.png";
const imgMaterials = "https://res.cloudinary.com/djupaqjuz/image/upload/v1765559039/Gemini_Generated_Image_y1lz7dy1lz7dy1lz_qjdt8n.png";
const businessPromoBg = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3";

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


    const completionPercentage = calculateCompletion();
    const isProfileIncomplete = completionPercentage < 100;


    const handleFeatureClick = (link) => {
        // const completion = calculateCompletion();

        if (isProfileIncomplete) {
            navigate("/setting/user");
            return;
        }

        navigate(link);
    };

    const features = [
        {
            id: 1,
            title: "Local Stores",
            description: "Find trusted shops nearby.",
            icon: <FaStore />,
            image: imgLocalStore,
            link: "/localShop",
            cta: "Browse Shops"
        },
        {
            id: 2,
            title: "Contractor Services",
            description: "Hire verified professionals.",
            icon: <FaHammer />,
            image: imgContractor,
            link: "/Services",
            cta: "Find Experts"

        },
        {
            id: 3,
            title: "AI Planning Tools",
            description: "Visualize your dream space.",
            icon: <FaRobot />,
            image: imgAiTools,
            link: "/Planning_tools",
            cta: "Start Designing"

        },
        {
            id: 4,
            title: "Material Marketplace",
            description: "Best prices on quality materials.",
            icon: <MdDesignServices />,
            image: imgMaterials,
            link: "/Material_market",
            cta: "Shop Materials"

        }
    ];
    // console.log(user);


    return (

        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar className="z-50 relative bg-white/90 backdrop-blur-md shadow-sm" />

            {/* Profile Completion Banner - Sleeker Design */}
            {isProfileIncomplete && (
                <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-3">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-400 p-1.5 rounded-full text-white">
                                <FaLock size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-yellow-800">
                                    Unlock all features! Your profile is {completionPercentage}% complete.
                                </p>
                                {/* Mini Progress Bar */}
                                <div className="w-48 bg-yellow-200 rounded-full h-1.5 mt-2">
                                    <div
                                        className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${completionPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/setting/user")}
                            className="text-sm bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 font-semibold transition-colors whitespace-nowrap"
                        >
                            Complete Profile
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section with Background Image */}
            <section className="relative pt-20 pb-32 flex items-center min-h-[600px]">
                {/* Background Image Overlay */}
                <div className="absolute inset-0 z-0">
                    <img src={heroBgImage} alt="Dream Home" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/40"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                        Build Your <br className="md:hidden" />
                        <span className="text-blue-400">Dream Reality</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                        Your all-in-one platform for local pros, materials, and AI-powered design tools.
                    </p>

                    {/* Modern Search Bar */}
                    <div className="max-w-4xl mx-auto bg-white  rounded-2xl shadow-2xl ring-1 ring-gray-200/50 backdrop-blur-sm">
                        {/* <div className="flex flex-col md:flex-row gap-2 items-center">
                           
                           <div className="flex-1 w-full md:w-auto flex items-center px-4 py-4 bg-gray-50 rounded-xl border-b md:border-b-0 md:border-r border-gray-200">
                                <FaLocationDot className="text-blue-500 text-xl mr-3" />
                                <input
                                    type="text"
                                    placeholder={user.address?.street ? `${user.address.street},${user.address.city}, ${user.address.state}` : "Enter your location"}
                                    className="bg-transparent w-full focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
                                />
                            </div>

                            <div className="flex-[1.5] w-full md:w-auto flex items-center px-4 py-4 bg-gray-50 rounded-xl">
                                <IoSearchSharp className="text-gray-400 text-xl mr-3" />
                                <input
                                    type="text"
                                    placeholder="What do you need help with?"
                                    className="bg-transparent w-full focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
                                />
                            </div>

                            <button
                                onClick={() => {
                                    if (isProfileIncomplete) {
                                        navigate("/setting/user");
                                    } else {
                                        // Handle search
                                    }
                                }}
                                className="w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-xl hover:bg-blue-700 transition duration-200 font-bold text-lg shadow-md flex items-center justify-center"
                            >
                                Search
                            </button>

                           
                        </div> */}
                        <AnimatedSearchBar
                            user={user}
                            isProfileIncomplete={isProfileIncomplete}
                            navigate={navigate}
                        />
                    </div>
                </div>
            </section>

            {/* Main Categories Section (Overlapping the Hero slightly for depth) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-16 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            onClick={() => handleFeatureClick(feature.link)}
                            className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative h-full flex flex-col"
                        >
                            {/* Image Container */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70"></div>
                                <div className="absolute top-4 left-4 bg-white/90 p-2 rounded-lg text-blue-600 shadow-sm">
                                    {feature.icon}
                                </div>
                            </div>

                            {/* Content Container */}
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-between">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                                    {feature.description}
                                </p>
                                <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:underline">
                                    {feature.cta} <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>

                            {/* Lock Overlay if incomplete */}
                            {isProfileIncomplete && (
                                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-white transition-opacity duration-300">
                                    <div className="bg-white/20 p-4 rounded-full mb-4">
                                        <FaLock size={24} />
                                    </div>
                                    <p className="font-bold text-lg mb-2">Access Locked</p>
                                    <p className="text-sm text-center text-gray-200 mb-4">Complete your profile to unlock this feature.</p>
                                    <span className="text-xs bg-blue-500/80 px-3 py-1 rounded-full">
                                        {completionPercentage}% Complete
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Trust/Verification Banner (E-commerce style) */}
            <section className="bg-white py-8 border-y border-gray-100 mb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center md:justify-between items-center gap-6 text-gray-600 text-sm font-medium">
                    <div className="flex items-center gap-2"><MdVerified className="text-blue-500 text-xl" /> Verified Local Pros</div>
                    <div className="flex items-center gap-2"><MdVerified className="text-green-500 text-xl" /> Secure Material Transactions</div>
                    <div className="flex items-center gap-2"><MdVerified className="text-purple-500 text-xl" /> AI-Powered Cost Estimates</div>
                    <div className="flex items-center gap-2"><MdVerified className="text-orange-500 text-xl" /> 24/7 Customer Support</div>
                </div>
            </section>


            {/* Promotional Section with Image Background */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <img src={businessPromoBg} alt="Business Growth" className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]" />
                    <div className="relative z-10 p-12 md:p-20 text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Business Journey Today</h2>
                        <p className="text-gray-200 mb-10 text-lg max-w-2xl mx-auto">
                            Are you a contractor or material supplier? Join thousands of local businesses growing exponentially with Neerman's platform.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition duration-200 shadow-lg">
                                Register as a Partner
                            </button>
                            <button className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-gray-900 transition duration-200">
                                See Success Stories
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Sleeker */}
            <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 py-12 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                        {/* Brand Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center space-x-3 group cursor-pointer">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                                        <span className="text-white font-bold text-xl">N</span>
                                    </div>
                                    <div className="absolute inset-0 border-2 border-blue-400/30 rounded-lg animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Neerman
                                </h3>
                            </div>
                            <p className="text-gray-400 leading-relaxed max-w-md">
                                Empowering local businesses and homeowners with cutting-edge AI technology
                                for a seamless build experience. Building tomorrow, today.
                            </p>

                            {/* Newsletter Subscription */}
                            <div className="space-y-4 mt-8">
                                <h4 className="text-white font-semibold">Stay Updated</h4>
                                <div className="flex max-w-md">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="flex-grow px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                                    />
                                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-r-lg hover:opacity-90 transition-all duration-300 hover:scale-105 transform">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links with Animation */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-700/50 inline-block">
                                Quick Links
                                <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 w-full mt-2 transform origin-left transition-transform duration-300 hover:scale-x-100 scale-x-0 group-hover:scale-x-100"></div>
                            </h4>
                            <ul className="space-y-4">
                                {['About Us', 'Careers', 'Contact', 'Blog', 'FAQs'].map((item, index) => (
                                    <li key={item} className="group">
                                        <a
                                            href="#"
                                            className="flex items-center text-gray-400 hover:text-white transition-all duration-300 transform hover:translate-x-2"
                                            style={{ transitionDelay: `${index * 50}ms` }}
                                        >
                                            <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                            {item}
                                            <span className="ml-auto text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-700/50 inline-block">
                                Legal
                            </h4>
                            <ul className="space-y-4">
                                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Refund Policy', 'Accessibility'].map((item, index) => (
                                    <li key={item} className="group">
                                        <a
                                            href="#"
                                            className="flex items-center text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-2"
                                            style={{ transitionDelay: `${index * 50}ms` }}
                                        >
                                            <span className="w-1 h-1 bg-gray-600 rounded-full mr-3 group-hover:bg-blue-400 transition-colors"></span>
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Social & Contact */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-6 pb-2 border-b border-gray-700/50 inline-block">
                                Connect
                            </h4>
                            <div className="space-y-4">
                                {/* Social Media Icons */}
                                <div className="flex space-x-4">
                                    {['twitter', 'facebook', 'instagram', 'linkedin'].map((platform) => (
                                        <a
                                            key={platform}
                                            // href="#"
                                            className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 transition-all duration-300 transform hover:-translate-y-1"
                                        >
                                            <i className={`fab fa-${platform} text-lg`}></i>
                                        </a>
                                    ))}
                                </div>

                                {/* Contact Info */}
                                <div className="pt-4 space-y-3">
                                    <div className="flex items-center text-sm gap-3 text-gray-400 hover:text-white transition-colors">
                                        <span className=""><MdEmail className=" w-4 h-4 " /></span>
                                        sadiv120@gmail.com
                                    </div>
                                    <div className="flex items-center text-sm gap-3 text-gray-400 hover:text-white transition-colors">
                                        <span className="w-8"><Phone className=" w-4 h-4 " /></span>
                                        +91 8409* *****
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-gray-800/50 mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <div className="flex items-center space-x-6 text-sm">
                                <span className="flex items-center">
                                    <span className="flex h-2 w-2">
                                        <span className="animate-ping absolute h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative h-2 w-2 rounded-full bg-green-500"></span>
                                    </span>
                                    <span className="ml-2">24/7 Support Available</span>
                                </span>

                                <span className="hidden md:inline">|</span>

                                <span className="flex items-center">
                                    <i className="fas fa-shield-alt text-blue-400 mr-2"></i>
                                    <span>Secure Payment</span>
                                </span>
                            </div>

                            <div className="flex items-center space-x-6 text-sm">
                                <a href="#" className="hover:text-white transition-colors hover:underline">
                                    <i className="fas fa-credit-card mr-2"></i>
                                    Payment Methods
                                </a>
                                <a href="#" className="hover:text-white transition-colors hover:underline">
                                    <i className="fas fa-truck mr-2"></i>
                                    Shipping Info
                                </a>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="text-center mt-8 pt-6 border-t border-gray-800/30">
                            <p className="text-sm text-gray-500">
                                © 2025 Neerman. All rights reserved. |
                                <span className="ml-2 text-gray-600">
                                    Designed with <i className="fas fa-heart text-red-400 mx-1"></i> for builders
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}