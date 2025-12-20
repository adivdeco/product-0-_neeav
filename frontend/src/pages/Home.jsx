import { useDispatch, useSelector } from "react-redux";
import { FaStore, FaRobot, FaHammer, FaArrowRight, FaLock, } from "react-icons/fa6";
import { MdDesignServices, MdVerified } from "react-icons/md";
import Navbar from "../components/home/navbar";
import { useNavigate } from "react-router";
import AnimatedSearchBar from "../components/home/AnimatedSearchBar";
import BottomPart from "../components/home/BottomPart";
import { Swiper, SwiperSlide } from 'swiper/react';
import { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import Footer from "./../components/home/footer";


// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import "./swiper.css";

import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import FeaturedProducts from "../components/home/FeaturedProducts";
import FeaturedService from "../components/home/FeaturedService";


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
    const [isMobile, setIsMobile] = useState(false);

    // Check if device is mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

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


    return (
        <div>
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
                        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200/50 backdrop-blur-sm">
                            <AnimatedSearchBar
                                user={user}
                                isProfileIncomplete={isProfileIncomplete}
                                navigate={navigate}
                            />
                        </div>
                    </div>
                </section>

                {/* Main Categories Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8   relative z-20 -mt-10 mb-20">
                    {/* <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Services</h2> */}

                    {isMobile ? (
                        // Mobile: Swiper Slider - Show only ONE slide at a time
                        <div className="features-swiper-container  ">
                            <Swiper
                                spaceBetween={20}
                                slidesPerView={1} // Show only one slide
                                // Remove centeredSlides if you want strict one-at-a-time
                                centeredSlides={false}
                                loop={true} // Optional: makes it infinite
                                autoplay={{
                                    delay: 3500,
                                    disableOnInteraction: false,
                                }}
                                pagination={{
                                    clickable: true,
                                    dynamicBullets: true,
                                }}
                                modules={[Autoplay, Pagination, Navigation]}
                                className="mySwiper"
                            >
                                {features.map((feature) => (
                                    <SwiperSlide key={feature.id}>
                                        <div
                                            onClick={() => handleFeatureClick(feature.link)}
                                            className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-2xl transition-all duration-300 relative h-full flex flex-col"
                                            style={{ margin: '0 10px 30px', }} // Add margin on sides
                                        >
                                            {/* Image Container */}
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src={feature.image}
                                                    alt={feature.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70"></div>
                                                <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg text-blue-600 shadow-sm">
                                                    {feature.icon}
                                                </div>
                                            </div>

                                            {/* Content Container */}
                                            <div className="p-6 flex flex-col flex-grow">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-gray-600 text-base leading-relaxed mb-6 flex-grow">
                                                    {feature.description}
                                                </p>
                                                <div className="flex items-center text-blue-600 font-semibold text-base group-hover:underline">
                                                    {feature.cta} <FaArrowRight className="ml-2 text-sm group-hover:translate-x-1 transition-transform" />
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
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    ) : (
                        // Desktop: Grid Layout
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
                    )}
                </section>

                {/* buy items */}

                {/* <section>
                    <div className="max-w-7xl  mx-auto px-3 sm:px-6 lg:px-8 mb-30">

                        <div className="relative py-4 bg-violet-100 px-4 rounded-3xl overflow-hidden ">

                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-10 ">Top Rated</h2>
                                <h2 className=" bg-black relative  py-0.5 px-2 sm:px-2.5 border border-black rounded-2xl -mt-10"
                                    onClick={() => navigate('/Material_market')}>
                                    <FaArrowRightLong className="text-lg text-white " /></h2>
                            </div>


                            <div className="grid grid-cols-2  md:grid-cols-2 lg:grid-cols-4 gap-2">

                                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
                                    <FaLocationDot className="text-blue-500 text-4xl mb-4 mx-auto" />
                                    <h3 className="text-xl font-semibold mb-2">Local Expertise</h3>
                                    <p className="text-gray-600 text-sm">Connect with trusted local professionals and suppliers in your area.</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
                                    <FaRobot className="text-green-500 text-4xl mb-4 mx-auto" />
                                    <h3 className="text-xl font-semibold mb-2">AI-Powered Tools</h3>
                                    <p className="text-gray-600 text-sm">Leverage cutting-edge AI technology for design and project planning.</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
                                    <FaHammer className="text-purple-500 text-4xl mb-4 mx-auto" />
                                    <h3 className="text-xl font-semibold mb-2">Verified Professionals</h3>
                                    <p className="text-gray-600 text-sm">Hire from a pool of vetted contractors and service providers.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </section> */}

                <section className="pb-4">
                    <FeaturedProducts />
                </section>

                {/* marquee tag */}
                <section className="bg-white py-4 mb-16">

                    <Marquee
                        pauseOnHover={true}
                        speed={50}
                        gradient={true}
                        autoFill={true}
                        gradientColor="white"
                        gradientWidth={100}


                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-nowrap items-center gap-8 text-gray-600 text-sm font-medium">
                            <div className="flex items-center gap-2 whitespace-nowrap"><MdVerified className="text-blue-500 text-xl" /> Verified Local Pros</div>
                            <div className="flex items-center gap-2 whitespace-nowrap"><MdVerified className="text-green-500 text-xl" /> Secure Material Transactions</div>
                            <div className="flex items-center gap-2 whitespace-nowrap"><MdVerified className="text-purple-500 text-xl" /> AI-Powered Cost Estimates</div>
                            <div className="flex items-center gap-2 whitespace-nowrap"><MdVerified className="text-orange-500 text-xl" /> 24/7 Customer Support</div>

                        </div>

                    </Marquee>

                </section>

                <section className="pb-4">
                    <FeaturedService />
                </section>



                {/* Business Promotion Section */}
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

                {/* Footer */}
                <Footer />
            </div>

            <div className="fixed bottom-0 w-full z-50">
                <BottomPart />
            </div>
        </div>
    );
}