import { FaChevronDown, FaUser, FaStore, FaTools, FaUsers, FaChartBar, FaCog } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../authSlice";
import { useState, useRef, useEffect } from "react";
import { LogOut, LogOutIcon } from "lucide-react";

function Navbar() {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const userId = user?._id; // from redux state
    const handleLogout = () => {
        dispatch(logoutUser());
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close desktop dropdown
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }

            // Close mobile menu
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside); // For mobile touch
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const adminMenuItems = [
        { icon: FaUsers, label: "Users_Data", href: "/admin/user/allusers", color: "text-blue-600" },
        { icon: FaStore, label: "Shops_Data", href: "/admin/shop", color: "text-emerald-600" },
        { icon: FaTools, label: "All Services", href: "/admin/services", color: "text-amber-600" },
        { icon: FaChartBar, label: "Analytics", href: "/admin/analytics", color: "text-purple-600" },
        { icon: FaCog, label: "Settings", href: "/admin/settings", color: "text-gray-600" },
    ];
    const storeMenuItems = [
        { icon: FaStore, label: "My Shop", href: "/shop", color: "text-emerald-600" },
        { icon: FaTools, label: "Manage Services", href: "/setting/Contractor", color: "text-amber-600" },
        { icon: FaChartBar, label: "Shop Analytics", href: "/store/analytics", color: "text-purple-600" },
        { icon: FaCog, label: "Store Settings", href: "/setting/shop", color: "text-gray-600" },
    ];

    const getAvatarUrl = () => {
        if (user?.avatar) return user.avatar;
        return user?.role === 'admin'
            ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
            : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face";
    };

    return (
        <header className="bg-white  z-50 border-gray-200 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-blue-800 leading-none">Neerman</h1>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Beta</span>
                    </div>

                    {/* Desktop navigation */}
                    <nav className="hidden md:flex items-center space-x-8" aria-label="Primary">
                        <a href="/business" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">For Businesses</a>
                        <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Partner with us</a>
                        <a href="#" className="text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:text-blue-600 hover:border-blue-300 font-medium transition-all duration-200">Get the App</a>
                    </nav>

                    {/* Auth (desktop) */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                {/* Admin Badge */}
                                {(user?.role === 'admin' || user?.role === 'co-admin') && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {user.role === 'admin' ? 'Administrator' : 'Co-Admin'}
                                    </span>
                                )}

                                {/* Profile Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200 border border-gray-200"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <img
                                                src={getAvatarUrl()}
                                                alt={user?.name || 'User'}
                                                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
                                            </div>
                                        </div>
                                        <FaChevronDown
                                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                                                }`}
                                        />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                                                <p className="text-sm text-gray-500">{user?.email}</p>
                                            </div>

                                            {/* Admin Section */}
                                            {(user?.role === 'admin' || user?.role === 'co-admin') && (
                                                <>
                                                    <div className="px-4 py-2">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                            Admin Panel
                                                        </p>
                                                        {adminMenuItems.map((item, index) => (
                                                            <a
                                                                key={index}
                                                                href={item.href}
                                                                className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
                                                            >
                                                                <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform duration-200`} />
                                                                <span>{item.label}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                </>
                                            )}

                                            {(user?.role === 'admin' || user?.role == 'store_owner') && (
                                                <>
                                                    <div className="px-4 py-2">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                            Store Panel
                                                        </p>
                                                        {storeMenuItems.map((item, index) => (
                                                            <a
                                                                key={index}
                                                                href={item.href}
                                                                className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
                                                            >
                                                                <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform duration-200`} />
                                                                <span>{item.label}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                    <div className="border-t border-gray-100 my-1"></div>
                                                </>
                                            )}


                                            {/* Regular User Menu */}
                                            < div className="px-4 py-2">
                                                <a
                                                    href="/setting/user"
                                                    className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
                                                >
                                                    <FaUser className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                                                    <span>My Profile</span>
                                                </a>
                                                <a
                                                    href="/settings"
                                                    className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
                                                >
                                                    <FaCog className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                                                    <span>Settings</span>
                                                </a>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-gray-100 mt-1 pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                                                >
                                                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <a
                                href="/signin"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                Sign In
                            </a>
                        )}

                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden" ref={mobileMenuRef}>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                        >
                            {!isMobileMenuOpen ? <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg> :
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>}
                        </button>

                        {/* Mobile menu dropdown */}
                        {isMobileMenuOpen && (
                            <div className="absolute top-16 right-2 bg-white border-b border-gray-200 shadow-lg z-50">
                                <div className="px-4 py-2 space-y-4">
                                    <a
                                        href="/business"
                                        className="block text-gray-700  rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        For Businesses
                                    </a>
                                    <a
                                        href="#"
                                        className="block text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Partner with us
                                    </a>
                                    <a
                                        href="#"
                                        className="block text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Get the App
                                    </a>

                                    <div className="border-t border-gray-200 pt-4">
                                        {isAuthenticated ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={getAvatarUrl()}
                                                        alt={user?.name || 'User'}
                                                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
                                                    </div>
                                                </div>

                                                {/* Mobile Admin Links */}
                                                {(user?.role === 'admin' || user?.role === 'co-admin') && (
                                                    <div className="space-y-2">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin</p>
                                                        {adminMenuItems.map((item, index) => (
                                                            <a
                                                                key={index}
                                                                href={item.href}
                                                                className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                            >
                                                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                                                <span>{item.label}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                                {/* Mobile Store Links */}
                                                {(user?.role === 'admin' || user?.role == 'store_owner') && (
                                                    <>
                                                        <div className="px-4 py-2">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                                Store Panel
                                                            </p>
                                                            {storeMenuItems.map((item, index) => (
                                                                <a
                                                                    key={index}
                                                                    href={item.href}
                                                                    className="flex items-center space-x-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
                                                                >
                                                                    <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform duration-200`} />
                                                                    <span>{item.label}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                        <div className="border-t border-gray-100 my-1"></div>
                                                    </>
                                                )}

                                                <div className="space-y-2">
                                                    <a
                                                        href="/profile"
                                                        className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <FaUser className="w-4 h-4 text-gray-600" />
                                                        <span>My Profile</span>
                                                    </a>
                                                    <button
                                                        onClick={() => {
                                                            handleLogout();
                                                            setIsMobileMenuOpen(false);
                                                        }}
                                                        className="flex items-center space-x-2 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                    >
                                                        <LogOutIcon className="w-4 h-4" />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <a
                                                href="/signin"
                                                className="block text-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Sign In
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header >
    );
}

export default Navbar;