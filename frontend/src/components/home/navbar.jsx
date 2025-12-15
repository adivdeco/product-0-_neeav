import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../authSlice";
import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, Bell, User, Briefcase, Building, Wrench, BarChart3, Shield, Users, ClipboardList, ShoppingBag, ShoppingCart, ChevronDown, HandHelping, Smartphone, Coins } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useNavigate } from "react-router";
import { FaLocationArrow } from "react-icons/fa6";
import { PiCoinVerticalDuotone, } from "react-icons/pi";

function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const mobileMenuButtonRef = useRef(null);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    // Enhanced navigation handler
    const handleNavigation = (href) => {
        navigate(href);
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    // Close dropdowns when clicking outside - FIXED VERSION
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check for dropdown
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }

            // Check for mobile menu - exclude the mobile menu button itself
            if (mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target) &&
                mobileMenuButtonRef.current &&
                !mobileMenuButtonRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    // Enhanced menu items with better organization and consistent icons
    const adminMenuItems = [
        { icon: Users, label: "Users Management", href: "/admin/user/allusers", color: "text-blue-600", description: "Manage all users" },
        { icon: Wrench, label: "Services Dashboard", href: "/employee/dashboard", color: "text-amber-600", description: "Manage services" },
        { icon: BarChart3, label: "Buy Requests Dashboard", href: "/employee/buy/dashboard", color: "text-purple-600", description: "Manage buy requests" },
        { icon: Shield, label: "Admin Settings", href: "/admin/settings", color: "text-gray-600", description: "System configuration" },
    ];

    const storeMenuItems = [
        { icon: Building, label: "My Shop", href: "/shop", color: "text-emerald-600", description: "View your shop" },
        { icon: BarChart3, label: "Shop Products", href: "/allProduct", color: "text-purple-600", description: "Manage Products" },
        { icon: Settings, label: "Store Settings", href: "/setting/shop", color: "text-gray-600", description: "Configure shop" },
        { icon: ShoppingCart, label: "Delivery Requests", href: "/shop-owner/dashboard", color: "text-gray-600", description: "Manage delivery requests" },
    ];

    const contractorMenuItems = [
        { icon: Briefcase, label: "Services Dashboard", href: "/contractor/dashboard", color: "text-blue-600", description: "Manage services" },
        { icon: Wrench, label: "Update Profile", href: "/setting/Contractor", color: "text-amber-600", description: "Edit contractor info" },
    ];

    const userMenuItems = [
        { icon: User, label: "My Profile", href: "/setting/user", color: "text-blue-600", description: "Personal information" },
        { icon: ClipboardList, label: "Service Requests", href: "/my-requests", color: "text-green-600", description: "Your requests" },
        { icon: ShoppingBag, label: "Buy Requests", href: "/my-Orders", color: "text-green-600", description: "Your buy requests" },
    ];

    const getAvatarUrl = () => {
        if (user?.avatar) return user.avatar;
        return user?.role === 'admin'
            ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
            : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face";
    };

    const getRoleBadgeColor = () => {
        switch (user?.role) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'co-admin': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'contractor': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'store_owner': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRoleDisplayName = () => {
        switch (user?.role) {
            case 'admin': return 'Administrator';
            case 'co-admin': return 'Co-Admin';
            case 'contractor': return 'Contractor';
            case 'store_owner': return 'Store Owner';
            default: return 'User';
        }
    };

    return (
        <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-center justify-between md:h-14 h-12">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-11 h-11  rounded-lg flex items-center justify-center">
                                {/* <span className="text-white font-bold text-sm">N</span> */}
                                <img src="/Logo.svg" alt="" />
                            </div>
                            <h1 className="text-2xl -ml-2 mt-2 font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent leading-none">
                                eerman
                            </h1>
                        </div>
                        {/* <span className="text-xs bg-blue-100 text-blue-800 px-1 mb-3 -ml-3  rounded-full border border-blue-200 font-medium">
                            Beta
                        </span> */}
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6" aria-label="Primary">
                        <a
                            href="/business"
                            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg group"
                        >
                            <Building className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            <span>For Businesses</span>
                        </a>
                        <a
                            href="/partner"
                            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg group"
                        >
                            <HandHelping className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            <span>Partner with us</span>
                        </a>
                        <a
                            href="/app"
                            className="flex items-center space-x-2 text-gray-500 border border-gray-300 px-4 py-2 rounded-lg hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 font-medium transition-all duration-200 group"
                        >
                            <Smartphone className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
                            <span>Get the App</span>
                        </a>
                    </nav>

                    {/* Desktop Auth Section */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                {/* Role Badge */}
                                {(user?.role === 'admin' || user?.role === 'co-admin' || user?.role === 'contractor' || user?.role === 'store_owner') && (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor()}`}>
                                        <Shield className="w-3 h-3 mr-1" />
                                        {getRoleDisplayName()}
                                    </span>
                                )}

                                <NotificationBell />

                                {/* Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-3 bg-white hover:bg-gray-50 rounded-xl px-3 py-2 transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                                        aria-haspopup="true"
                                        aria-expanded={isDropdownOpen}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <img
                                                    src={getAvatarUrl()}
                                                    alt={user?.name || 'User'}
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                            </div>
                                            <div className="text-left hidden xl:block">
                                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                                                    {user?.name || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 capitalize">
                                                    {user?.role || 'user'}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronDown
                                            className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Enhanced Dropdown Menu with Transitions */}
                                    <div
                                        className={`absolute right-0 mt-2 w-80 origin-top-right transform transition-all duration-300 ease-out bg-white rounded-2xl shadow-xl border border-gray-200/80 py-3 z-50 backdrop-blur-sm ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                                            }`}
                                    >
                                        {/* User Header */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={getAvatarUrl()}
                                                    alt={user?.name || 'User'}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {user?.name || 'User'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {user?.email}
                                                    </p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor()}`}>
                                                            {getRoleDisplayName()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                            {/* Admin Section */}
                                            {(user?.role === 'admin' || user?.role === 'co-admin') && (
                                                <div className="px-3 py-2">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                                                        Administration
                                                    </p>
                                                    {adminMenuItems.map((item, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleNavigation(item.href)}
                                                            className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm w-full text-left"
                                                        >
                                                            <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors ${item.color.replace('text-', 'bg-')} bg-opacity-10`}>
                                                                <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={1.75} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{item.label}</p>
                                                                <p className="text-xs text-gray-500">{item.description}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Store Section */}
                                            {(user?.role === 'admin' || user?.role === 'store_owner') && (
                                                <div className="px-3 py-2 border-t border-gray-100">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                                                        Store Management
                                                    </p>
                                                    {storeMenuItems.map((item, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleNavigation(item.href)}
                                                            className="flex items-center overflow-hidden space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm w-full text-left"
                                                        >
                                                            <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors ${item.color.replace('text-', 'bg-')} bg-opacity-10`}>
                                                                <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={1.75} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{item.label}</p>
                                                                <p className="text-xs text-gray-500">{item.description}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Contractor Section */}
                                            {(user?.role === 'admin' || user?.role === 'contractor') && (
                                                <div className="px-3 py-2 border-t border-gray-100">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                                                        Contractor Services
                                                    </p>
                                                    {contractorMenuItems.map((item, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleNavigation(item.href)}
                                                            className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm w-full text-left"
                                                        >
                                                            <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors ${item.color.replace('text-', 'bg-')} bg-opacity-10`}>
                                                                <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={1.75} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{item.label}</p>
                                                                <p className="text-xs text-gray-500">{item.description}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* User Section */}
                                            <div className="px-3 py-2 border-t border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                                                    Account
                                                </p>
                                                {userMenuItems.map((item, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleNavigation(item.href)}
                                                        className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm w-full text-left"
                                                    >
                                                        <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors ${item.color.replace('text-', 'bg-')} bg-opacity-10`}>
                                                            <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={1.75} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{item.label}</p>
                                                            <p className="text-xs text-gray-500">{item.description}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Logout Section */}
                                        <div className="border-t border-gray-100 pt-2 px-3">
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-red-200 hover:shadow-sm"
                                            >
                                                <div className="p-2 rounded-lg bg-red-100 group-hover:bg-white transition-colors">
                                                    <LogOut className="w-4 h-4 text-red-600" strokeWidth={1.75} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium">Sign Out</p>
                                                    <p className="text-xs text-red-500">Log out from your account</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate("/signin")}
                                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold"
                            >
                                <User className="w-4 h-4" strokeWidth={1.75} />
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center space-x-3">
                        <NotificationBell />
                        <button
                            ref={mobileMenuButtonRef}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-300"
                            aria-haspopup="true"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {!isMobileMenuOpen ? (
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Enhanced Mobile Menu with Transitions - FIXED */}
                    <div
                        ref={mobileMenuRef}
                        className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-2xl z-50 
                            overflow-y-auto max-h-[calc(100vh-4rem)] transition-all duration-300 ease-out
                            ${isMobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto'
                                : 'opacity-0 -translate-y-4 pointer-events-none'}
                        `}
                    >
                        <div className="p-4 space-y-4">
                            {/* Navigation Links */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleNavigation("/business")}
                                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm w-full text-left"
                                >
                                    <Building className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
                                    <span className="font-medium">For Businesses</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation("/partner")}
                                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm w-full text-left"
                                >
                                    <HandHelping className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
                                    <span className="font-medium">Partner with us</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation("/app")}
                                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm w-full text-left"
                                >
                                    <Smartphone className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
                                    <span className="font-medium">Get the App</span>
                                </button>
                            </div>

                            {/* Auth Section */}
                            <div className="border-t border-gray-200 pt-4">
                                {isAuthenticated ? (
                                    <div className="space-y-4">
                                        {/* User Info */}
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                                            <img
                                                src={getAvatarUrl()}
                                                alt={user?.name || 'User'}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                                                <p className="text-sm text-gray-500">{user?.email}</p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${getRoleBadgeColor()}`}>
                                                    {getRoleDisplayName()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Combined Menu Items */}
                                        <div className="space-y-2">
                                            {[
                                                ...(user?.role === 'admin' || user?.role === 'co-admin' ? adminMenuItems : []),
                                                ...(user?.role === 'admin' || user?.role === 'store_owner' ? storeMenuItems : []),
                                                ...(user?.role === 'admin' || user?.role === 'contractor' ? contractorMenuItems : []),
                                                ...userMenuItems
                                            ].map((item, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleNavigation(item.href)}
                                                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm w-full text-left"
                                                >
                                                    <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={1.75} />
                                                    <div>
                                                        <p className="font-medium">{item.label}</p>
                                                        <p className="text-xs text-gray-500">{item.description}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Logout */}
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center space-x-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-red-200 hover:shadow-sm"
                                        >
                                            <LogOut className="w-5 h-5" strokeWidth={1.75} />
                                            <span className="font-medium">Sign Out</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleNavigation("/signin")}
                                        className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md w-full"
                                    >
                                        Sign In to Your Account
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Bar */}
                <div className=" flex gap-4  py-1.5 ">
                    <div className="flex-1 w-full md:w-auto flex items-center px-3  md:py-1.5 bg-gradient-to-r from-blue-50 to-white rounded-xl border-2 border-blue-100 transition-all duration-300 hover:border-blue-300 hover:shadow-md group">
                        <div className="relative">
                            <FaLocationArrow className="text-blue-600 text-lg mr-2 group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute -top-1 right-0 w-2 h-2 bg-yellow-400/60 rounded-full animate-ping opacity-75"></div>
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

                    <div className="flex items-center justify-center px-1   bg-gradient-to-br from-yellow-300 to-yellow-50 rounded-xl border-2 border-yellow-200 transition-all duration-300 hover:border-yellow-300 hover:shadow-md group cursor-pointer">
                        <PiCoinVerticalDuotone className="text-yellow-700 text-xl group-hover:scale-110 transition-transform duration-300" />
                    </div>
                </div>

            </div>
        </header>
    );
}

export default Navbar;