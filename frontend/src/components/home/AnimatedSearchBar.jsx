import { useState, useEffect, useRef } from 'react';
import { FaHardHat, FaHammer, FaTruck, FaTools } from 'react-icons/fa';
import { IoSearchSharp, IoConstruct } from 'react-icons/io5';
import { GiBrickWall, GiMetalBar, GiNails, GiConcreteBag } from 'react-icons/gi';
import { MdCarpenter, MdPlumbing, MdElectricalServices } from 'react-icons/md';
import { FaLocationArrow } from 'react-icons/fa6';

const AnimatedSearchBar = ({ user, isProfileIncomplete, navigate }) => {
    const [placeholder, setPlaceholder] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    // Removed unused 'isTyping' state to clean up code
    const typingTimeoutRef = useRef(null);
    const placeholderRef = useRef(null);

    // Search service categories with icons
    const serviceCategories = [
        { text: "Cement & Concrete", icon: <GiConcreteBag className="text-orange-500" /> },
        { text: "Steel Rods & Bars", icon: <GiMetalBar className="text-gray-600" /> },
        { text: "Nails & Fasteners", icon: <GiNails className="text-yellow-600" /> },
        { text: "Bricks & Blocks", icon: <GiBrickWall className="text-red-500" /> },
        { text: "Contractor Services", icon: <IoConstruct className="text-blue-500" /> },
        { text: "Carpentry Work", icon: <MdCarpenter className="text-amber-700" /> },
        { text: "Plumbing Services", icon: <MdPlumbing className="text-cyan-600" /> },
        { text: "Electrical Work", icon: <MdElectricalServices className="text-yellow-500" /> },
        { text: "Construction Tools", icon: <FaTools className="text-gray-700" /> },
        { text: "Material Delivery", icon: <FaTruck className="text-green-500" /> },
    ];

    useEffect(() => {
        const currentText = serviceCategories[placeholderIndex].text;

        // --- TIMING CONFIGURATION ---
        const typeSpeed = 100;      // Speed of typing (Lower is faster)
        const deleteSpeed = 50;     // Speed of deleting (Lower is faster)
        const pauseDuration = 2000; // How long to wait before deleting
        // ----------------------------

        const animateText = () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            if (!isDeleting) {
                // TYPING PHASE
                if (placeholder.length < currentText.length) {
                    setPlaceholder(currentText.substring(0, placeholder.length + 1));
                    typingTimeoutRef.current = setTimeout(animateText, typeSpeed);
                } else {
                    // TEXT COMPLETE - PAUSE
                    typingTimeoutRef.current = setTimeout(() => {
                        setIsDeleting(true);
                    }, pauseDuration);
                }
            } else {
                // DELETING PHASE
                if (placeholder.length > 0) {
                    setPlaceholder(currentText.substring(0, placeholder.length - 1));
                    typingTimeoutRef.current = setTimeout(animateText, deleteSpeed);
                } else {
                    // FULLY DELETED - NEXT WORD
                    setIsDeleting(false);
                    setPlaceholderIndex((prev) => (prev + 1) % serviceCategories.length);
                }
            }
        };

        // Trigger animation
        typingTimeoutRef.current = setTimeout(animateText, isDeleting ? deleteSpeed : typeSpeed);

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [placeholder, isDeleting, placeholderIndex]); // Dependencies

    // Manual category change
    const handleNextCategory = () => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setPlaceholder('');
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % serviceCategories.length);
    };

    const handleSearch = () => {
        if (isProfileIncomplete) {
            navigate("/setting/user");
        } else {
            console.log("Searching for:", serviceCategories[placeholderIndex].text);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-white to-gray-50 p-2 rounded-2xl shadow-2xl ring-1 ring-gray-200/50 backdrop-blur-sm transform transition-all duration-300 hover:shadow-3xl">
            <div className="flex flex-col md:flex-row gap-3 items-center">
                {/* Location */}
                <div className="flex-1 w-full md:w-auto flex items-center px-4 py-3 bg-gradient-to-r from-blue-50 to-white rounded-xl border-2 border-blue-100 transition-all duration-300 hover:border-blue-300 hover:shadow-md group">
                    <div className="relative">
                        <FaLocationArrow className="text-blue-600 text-xl mr-2 group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -top-1 right-1 w-2 h-2 bg-yellow-400/60 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <input
                        type="text"
                        placeholder={
                            user?.address?.street
                                ? `${user.address.street}, ${user.address.city}, ${user.address.state}`
                                : "📍 Enter your location"
                        }
                        className="bg-transparent w-full focus:outline-none text-gray-800 placeholder-gray-500 font-medium text-sm md:text-base"
                    />
                </div>

                {/* Search Service */}
                <div className="flex-[1.5] w-full md:w-auto flex items-center px-4 py-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 transition-all duration-300 hover:border-gray-300 hover:shadow-md group">
                    <div className="relative mr-3">
                        {serviceCategories[placeholderIndex].icon}
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            onKeyPress={handleKeyPress}
                            ref={placeholderRef}
                            className="bg-transparent w-full focus:outline-none text-gray-800 font-medium text-sm md:text-base pr-8"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                            <span className="text-gray-400">
                                {placeholder}
                                <span className="ml-1 inline-block w-[2px] h-5 bg-blue-500 animate-pulse"></span>
                            </span>
                        </div>
                    </div>

                    {/* Quick Category Selector */}
                    <div className="relative group">
                        <button
                            className="ml-2 p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                            onClick={handleNextCategory}
                            title="Next category"
                        >
                            <IoSearchSharp className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Search Button */}
                <button
                    onClick={handleSearch}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transform flex items-center justify-center space-x-2 group"
                >
                    <span>Search</span>
                    <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default AnimatedSearchBar;