import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../authSlice";
import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, Bell, User, Briefcase, Building, Wrench, BarChart3, Shield, Users, ClipboardList, ShoppingBag, ShoppingCart, ChevronDown, HandHelping, Smartphone } from "lucide-react";
import NotificationBell from "./NotificationBell";

function Navbar() {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
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
        { icon: BarChart3, label: "Analytics", href: "/admin/analytics", color: "text-purple-600", description: "View insights" },
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">N</span>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent leading-none">
                                Neerman
                            </h1>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200 font-medium">
                            Beta
                        </span>
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
                            href="#"
                            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg group"
                        >
                            <HandHelping className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            <span>Partner with us</span>
                        </a>
                        <a
                            href="#"
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
                                                        <a
                                                            key={index}
                                                            href={item.href}
                                                            className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                        >
                                                            <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors ${item.color.replace('text-', 'bg-')} bg-opacity-10`}>
                                                                <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={1.75} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{item.label}</p>
                                                                <p className="text-xs text-gray-500">{item.description}</p>
                                                            </div>
                                                        </a>
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
                                                        <a
                                                            key={index}
                                                            href={item.href}
                                                            className="flex items-center overflow-hidden space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                        >
                                                            <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors ${item.color.replace('text-', 'bg-')} bg-opacity-10`}>
                                                                <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={1.75} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{item.label}</p>
                                                                <p className="text-xs text-gray-500">{item.description}</p>
                                                            </div>
                                                        </a>
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
                                                        <a
                                                            key={index}
                                                            href={item.href}
                                                            className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm"
                                                            onClick={() => setIsDropdownOpen(false)}
                                                        >
                                                            <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors ${item.color.replace('text-', 'bg-')} bg-opacity-10`}>
                                                                <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={1.75} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-gray-900">{item.label}</p>
                                                                <p className="text-xs text-gray-500">{item.description}</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {/* User Section */}
                                            <div className="px-3 py-2 border-t border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                                                    Account
                                                </p>
                                                {userMenuItems.map((item, index) => (
                                                    <a
                                                        key={index}
                                                        href={item.href}
                                                        className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                    >
                                                        <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors ${item.color.replace('text-', 'bg-')} bg-opacity-10`}>
                                                            <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={1.75} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{item.label}</p>
                                                            <p className="text-xs text-gray-500">{item.description}</p>
                                                        </div>
                                                    </a>
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
                            <a
                                href="/signin"
                                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold"
                            >
                                <User className="w-4 h-4" strokeWidth={1.75} />
                                <span>Sign In</span>
                            </a>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center space-x-3" ref={mobileMenuRef}>
                        <NotificationBell />
                        <button
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

                    {/* Enhanced Mobile Menu with Transitions */}
                    <div
                        className={`md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-2xl z-50 overflow-y-auto max-h-[calc(100vh-4rem)] transition-all duration-300 ease-out ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                            }`}
                    >
                        <div className="p-4 space-y-4">
                            {/* Navigation Links */}
                            <div className="space-y-2">
                                <a
                                    href="/business"
                                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Building className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
                                    <span className="font-medium">For Businesses</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <HandHelping className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
                                    <span className="font-medium">Partner with us</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Smartphone className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
                                    <span className="font-medium">Get the App</span>
                                </a>
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
                                                <a
                                                    key={index}
                                                    href={item.href}
                                                    className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={1.75} />
                                                    <div>
                                                        <p className="font-medium">{item.label}</p>
                                                        <p className="text-xs text-gray-500">{item.description}</p>
                                                    </div>
                                                </a>
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
                                    <a
                                        href="/signin"
                                        className="block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign In to Your Account
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Navbar;

// import { useDispatch, useSelector } from "react-redux";
// import { logoutUser } from "../../authSlice";
// import { useState, useRef, useEffect, useCallback } from "react";
// import { LogOut, Settings, Bell, User, Briefcase, Building, Wrench, BarChart3, Shield, Users, ClipboardList, ShoppingBag, ShoppingCart, ChevronDown, HandHelping, Smartphone, Menu, X } from "lucide-react";
// import NotificationBell from "./NotificationBell"; // Assuming this component exists

// // --- Utility Functions for Readability and Elegance ---

// const getAvatarUrl = (user) => {
//     if (user?.avatar) return user.avatar;
//     return user?.role === 'admin'
//         ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
//         : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face";
// };

// const getRoleBadgeConfig = (role) => {
//     switch (role) {
//         case 'admin': return { bg: 'bg-red-50 text-red-700 border-red-200', display: 'Administrator' };
//         case 'co-admin': return { bg: 'bg-amber-50 text-amber-700 border-amber-200', display: 'Co-Admin' };
//         case 'contractor': return { bg: 'bg-blue-50 text-blue-700 border-blue-200', display: 'Contractor' };
//         case 'store_owner': return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', display: 'Store Owner' };
//         default: return { bg: 'bg-gray-100 text-gray-700 border-gray-200', display: 'User' };
//     }
// };

// // --- Menu Item Data (Simplified & Centralized) ---

// const menuItems = {
//     admin: [
//         { icon: Users, label: "Users Management", href: "/admin/user/allusers", color: "text-blue-600", description: "Manage all users" },
//         { icon: Wrench, label: "Services Dashboard", href: "/employee/dashboard", color: "text-amber-600", description: "Manage services" },
//         { icon: BarChart3, label: "Analytics", href: "/admin/analytics", color: "text-purple-600", description: "View insights" },
//         { icon: Shield, label: "Admin Settings", href: "/admin/settings", color: "text-gray-600", description: "System configuration" },
//     ],
//     store: [
//         { icon: Building, label: "My Shop", href: "/shop", color: "text-emerald-600", description: "View your shop" },
//         { icon: ShoppingBag, label: "Shop Products", href: "/allProduct", color: "text-purple-600", description: "Manage Products" },
//         { icon: ShoppingCart, label: "Delivery Requests", href: "/shop-owner/dashboard", color: "text-gray-600", description: "Manage delivery requests" },
//         { icon: Settings, label: "Store Settings", href: "/setting/shop", color: "text-gray-600", description: "Configure shop" },
//     ],
//     contractor: [
//         { icon: Briefcase, label: "Services Dashboard", href: "/contractor/dashboard", color: "text-blue-600", description: "Manage services" },
//         { icon: Wrench, label: "Update Profile", href: "/setting/Contractor", color: "text-amber-600", description: "Edit contractor info" },
//     ],
//     user: [
//         { icon: User, label: "My Profile", href: "/setting/user", color: "text-blue-600", description: "Personal information" },
//         { icon: ClipboardList, label: "Service Requests", href: "/my-requests", color: "text-green-600", description: "Your service requests" },
//         { icon: ShoppingBag, label: "Buy Orders", href: "/my-Orders", color: "text-green-600", description: "Your purchase orders" },
//     ],
// };

// // --- Reusable Menu Link Component ---

// const MenuLink = ({ item, onClick }) => (
//     <a
//         href={item.href}
//         className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 hover:shadow-sm"
//         onClick={onClick}
//     >
//         <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors ${item.color.replace('text-', 'bg-')} bg-opacity-10`}>
//             <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={1.75} />
//         </div>
//         <div className="flex-1">
//             <p className="font-medium text-gray-900">{item.label}</p>
//             <p className="text-xs text-gray-500">{item.description}</p>
//         </div>
//     </a>
// );


// function Navbar() {
//     const dispatch = useDispatch();
//     const { user, isAuthenticated } = useSelector((state) => state.auth);
//     const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//     const dropdownRef = useRef(null);
//     const mobileMenuRef = useRef(null);

//     const handleLogout = useCallback(() => {
//         dispatch(logoutUser());
//     }, [dispatch]);

//     const roleConfig = getRoleBadgeConfig(user?.role);

//     // Combine and structure menu items for the dropdown
//     const getDropdownSections = () => {
//         const sections = [];
//         const role = user?.role;

//         // Administration
//         if (role === 'admin' || role === 'co-admin') {
//             sections.push({ title: 'Administration', items: menuItems.admin });
//         }

//         // Store Management
//         if (role === 'admin' || role === 'store_owner') {
//             sections.push({ title: 'Store Management', items: menuItems.store });
//         }

//         // Contractor Services
//         if (role === 'admin' || role === 'contractor') {
//             sections.push({ title: 'Contractor Services', items: menuItems.contractor });
//         }

//         // User Account (always last)
//         sections.push({ title: 'Account', items: menuItems.user });

//         return sections;
//     };


//     // Close dropdowns when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//                 setIsDropdownOpen(false);
//             }
//             // Use different state/ref to allow mobile menu to stay open if clicking dropdown button
//             if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !dropdownRef.current?.contains(event.target)) {
//                 setIsMobileMenuOpen(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         document.addEventListener('touchstart', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//             document.removeEventListener('touchstart', handleClickOutside);
//         };
//     }, []);

//     const dropdownSections = getDropdownSections();

//     return (
//         // * ELEGANCE: Use a subtle frosted glass effect for the header
//         <header className="bg-white/90 backdrop-blur-lg border-b border-gray-100/80 sticky top-0 z-50 shadow-lg">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <div className="flex items-center justify-between h-16">
//                     {/* Logo Section (Refined Gradient) */}
//                     <div className="flex items-center gap-3">
//                         <a href="/" className="flex items-center gap-2">
//                             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
//                                 <span className="text-white font-extrabold text-lg leading-none">N</span>
//                             </div>
//                             <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent leading-none tracking-tight">
//                                 Neerman
//                             </h1>
//                         </a>
//                         <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-200 font-medium">
//                             Pro
//                         </span>
//                     </div>

//                     {/* Desktop Navigation (More prominent call to actions) */}
//                     <nav className="hidden lg:flex items-center space-x-8" aria-label="Primary">
//                         <a
//                             href="/business"
//                             className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 group relative"
//                         >
//                             <Building className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
//                             <span>For Businesses</span>
//                             <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
//                         </a>
//                         <a
//                             href="#"
//                             className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 group relative"
//                         >
//                             <HandHelping className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
//                             <span>Partner with us</span>
//                             <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
//                         </a>
//                         <a
//                             href="#"
//                             className="flex items-center space-x-2 text-blue-600 border border-blue-400 px-4 py-2 rounded-xl hover:bg-blue-50 font-semibold transition-all duration-200 group shadow-sm hover:shadow-md"
//                         >
//                             <Smartphone className="w-4 h-4 text-blue-600 transition-colors" />
//                             <span>Get the App</span>
//                         </a>
//                     </nav>

//                     {/* Desktop Auth Section */}
//                     <div className="hidden md:flex items-center space-x-4">
//                         {isAuthenticated ? (
//                             <div className="flex items-center space-x-4">
//                                 {/* Role Badge (Only for elevated roles) */}
//                                 {(user?.role !== 'user') && (
//                                     <span className={`hidden lg:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${roleConfig.bg}`}>
//                                         <Shield className="w-3.5 h-3.5 mr-1.5" />
//                                         {roleConfig.display}
//                                     </span>
//                                 )}

//                                 <NotificationBell />

//                                 {/* Profile Dropdown */}
//                                 <div className="relative" ref={dropdownRef}>
//                                     <button
//                                         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                                         className="flex items-center space-x-3 bg-white hover:bg-gray-50 rounded-full pr-1.5 pl-3 py-1 transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                                         aria-haspopup="true"
//                                         aria-expanded={isDropdownOpen}
//                                     >
//                                         <div className="text-left hidden lg:block">
//                                             <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
//                                                 {user?.name || 'User'}
//                                             </p>
//                                         </div>
//                                         <div className="relative">
//                                             <img
//                                                 src={getAvatarUrl(user)}
//                                                 alt={user?.name || 'User'}
//                                                 className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
//                                             />
//                                             {/* Online status indicator */}
//                                             <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
//                                         </div>
//                                         <ChevronDown
//                                             className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
//                                         />
//                                     </button>

//                                     {/* Elevated Dropdown Menu */}
//                                     <div
//                                         className={`absolute right-0 mt-3 w-80 origin-top-right transform transition-all duration-300 ease-out bg-white rounded-2xl shadow-2xl border border-gray-100/80 py-3 z-50 ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
//                                             }`}
//                                     >
//                                         {/* User Header */}
//                                         <div className="px-4 py-3 border-b border-gray-100">
//                                             <div className="flex items-center space-x-3">
//                                                 <img
//                                                     src={getAvatarUrl(user)}
//                                                     alt={user?.name || 'User'}
//                                                     className="w-14 h-14 rounded-full object-cover border-3 border-gray-200"
//                                                 />
//                                                 <div className="flex-1 min-w-0">
//                                                     <p className="text-lg font-bold text-gray-900 truncate">
//                                                         {user?.name || 'User'}
//                                                     </p>
//                                                     <p className="text-sm text-gray-500 truncate">
//                                                         {user?.email}
//                                                     </p>
//                                                     <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium mt-1 ${roleConfig.bg}`}>
//                                                         {roleConfig.display}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="max-h-96 overflow-y-auto custom-scrollbar pt-2">
//                                             {dropdownSections.map((section, sectionIndex) => (
//                                                 <div key={sectionIndex} className={`px-3 py-2 ${sectionIndex > 0 ? 'border-t border-gray-100' : ''}`}>
//                                                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2 pt-2">
//                                                         {section.title}
//                                                     </p>
//                                                     {section.items.map((item, index) => (
//                                                         <MenuLink
//                                                             key={index}
//                                                             item={item}
//                                                             onClick={() => setIsDropdownOpen(false)}
//                                                         />
//                                                     ))}
//                                                 </div>
//                                             ))}
//                                         </div>

//                                         {/* Logout Section */}
//                                         <div className="border-t border-gray-100 pt-3 px-3">
//                                             <button
//                                                 onClick={() => {
//                                                     handleLogout();
//                                                     setIsDropdownOpen(false);
//                                                 }}
//                                                 className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-red-200 hover:shadow-sm"
//                                             >
//                                                 <div className="p-2 rounded-lg bg-red-100 group-hover:bg-white transition-colors">
//                                                     <LogOut className="w-4 h-4 text-red-600" strokeWidth={1.75} />
//                                                 </div>
//                                                 <div className="flex-1 text-left">
//                                                     <p className="font-medium">Sign Out</p>
//                                                     <p className="text-xs text-red-500">Securely log out from your account</p>
//                                                 </div>
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         ) : (
//                             <a
//                                 href="/signin"
//                                 className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold transform hover:scale-[1.02]"
//                             >
//                                 <User className="w-4 h-4" strokeWidth={1.75} />
//                                 <span>Sign In</span>
//                             </a>
//                         )}
//                     </div>

//                     {/* Mobile Menu Toggle */}
//                     <div className="md:hidden flex items-center space-x-3" ref={mobileMenuRef}>
//                         <NotificationBell />
//                         <button
//                             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                             className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             aria-haspopup="true"
//                             aria-expanded={isMobileMenuOpen}
//                         >
//                             {/* * ELEGANCE: Use Lucide icons for consistency */}
//                             {!isMobileMenuOpen ? (
//                                 <Menu className="w-6 h-6 text-gray-700" />
//                             ) : (
//                                 <X className="w-6 h-6 text-gray-700" />
//                             )}
//                         </button>
//                     </div>

//                     {/* Elevated Mobile Menu with Transitions */}
//                     <div
//                         className={`md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-2xl z-40 transition-all duration-300 ease-out overflow-y-auto ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
//                             }`}
//                         style={{ maxHeight: 'calc(100vh - 4rem)' }}
//                     >
//                         <div className="p-4 space-y-4">
//                             {/* Navigation Links (Mobile) */}
//                             <div className="space-y-2 border-b border-gray-100 pb-4">
//                                 <a
//                                     href="/business"
//                                     className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-sm"
//                                     onClick={() => setIsMobileMenuOpen(false)}
//                                 >
//                                     <Building className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
//                                     <span className="font-medium">For Businesses</span>
//                                 </a>
//                                 <a
//                                     href="#"
//                                     className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-sm"
//                                     onClick={() => setIsMobileMenuOpen(false)}
//                                 >
//                                     <HandHelping className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
//                                     <span className="font-medium">Partner with us</span>
//                                 </a>
//                                 <a
//                                     href="#"
//                                     className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-sm"
//                                     onClick={() => setIsMobileMenuOpen(false)}
//                                 >
//                                     <Smartphone className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
//                                     <span className="font-medium">Get the App</span>
//                                 </a>
//                             </div>

//                             {/* Auth Section (Mobile) */}
//                             <div className="pt-4">
//                                 {isAuthenticated ? (
//                                     <div className="space-y-4">
//                                         {/* User Info (Mobile) */}
//                                         <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
//                                             <img
//                                                 src={getAvatarUrl(user)}
//                                                 alt={user?.name || 'User'}
//                                                 className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
//                                             />
//                                             <div className="flex-1">
//                                                 <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
//                                                 <p className="text-sm text-gray-500 truncate">{user?.email}</p>
//                                                 <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${roleConfig.bg}`}>
//                                                     {roleConfig.display}
//                                                 </span>
//                                             </div>
//                                         </div>

//                                         {/* Combined Menu Items (Mobile) */}
//                                         <div className="space-y-2">
//                                             {dropdownSections.map((section, sectionIndex) => (
//                                                 <div key={sectionIndex} className={`space-y-2 ${sectionIndex > 0 ? 'pt-4 border-t border-gray-100' : ''}`}>
//                                                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
//                                                         {section.title}
//                                                     </p>
//                                                     {section.items.map((item, index) => (
//                                                         <a
//                                                             key={index}
//                                                             href={item.href}
//                                                             className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm"
//                                                             onClick={() => setIsMobileMenuOpen(false)}
//                                                         >
//                                                             <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={1.75} />
//                                                             <div>
//                                                                 <p className="font-medium">{item.label}</p>
//                                                                 <p className="text-xs text-gray-500">{item.description}</p>
//                                                             </div>
//                                                         </a>
//                                                     ))}
//                                                 </div>
//                                             ))}
//                                         </div>

//                                         {/* Logout (Mobile) */}
//                                         <div className="pt-4 border-t border-gray-100">
//                                             <button
//                                                 onClick={() => {
//                                                     handleLogout();
//                                                     setIsMobileMenuOpen(false);
//                                                 }}
//                                                 className="flex items-center space-x-3 w-full p-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:shadow-sm"
//                                             >
//                                                 <LogOut className="w-5 h-5 text-red-600" strokeWidth={1.75} />
//                                                 <span className="font-medium">Sign Out</span>
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <a
//                                         href="/signin"
//                                         className="w-full justify-center inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
//                                         onClick={() => setIsMobileMenuOpen(false)}
//                                     >
//                                         <User className="w-5 h-5" strokeWidth={1.75} />
//                                         <span>Sign In / Register</span>
//                                     </a>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </header>
//     );
// }

// export default Navbar;