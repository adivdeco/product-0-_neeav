import { useState } from "react";
import {
    Home,
    ClipboardList,
    ShoppingBag,
    User,
    ShoppingCart
} from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from "react-router";

const BottomPart = () => {
    const [activeTab, setActiveTab] = useState('home');
        const { totalItems: cartCount } = useSelector((state) => state.cart);


    const navigate = useNavigate();
        const dispatch = useDispatch();
    

    const navItems = [
        {
            id: 'home',
            label: 'Home',
            icon: Home,
            path: '/',
            activeColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            glowColor: 'shadow-blue-200'
        },
        {
            id: 'services',
            label: 'Services',
            icon: ClipboardList,
            path: '/Services',
            activeColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            glowColor: 'shadow-purple-200'
        },
        {
            id: 'buy',
            label: 'Buy',
            icon: ShoppingBag,
            path: '/Material_market',
            activeColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            glowColor: 'shadow-emerald-200'
        },
        {
            id: 'account',
            label: 'Account',
            icon: User,
            path: '/setting/user',
            activeColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
            glowColor: 'shadow-amber-200'
        },
        {
            id: 'cart',
            label: 'Cart',
            icon: ShoppingCart,
            path: '/cart',
            activeColor: 'text-rose-600',
            bgColor: 'bg-rose-50',
            glowColor: 'shadow-rose-200',
            badge: cartCount > 0 ? cartCount : null
        }
    ];

    const handleNavigation = (id, path) => {
        setActiveTab(id);
        navigate(path);
        console.log(`Navigating to: ${path}`);
    };

    return (
        // Container: Fixed at bottom, but floating slightly above it (bottom-4)
        <div className="fixed -bottom-2 left-0 right-0 z-50 ">
            <nav className="max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                <div className="flex items-center justify-between px-2 ">

                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item.id, item.path)}
                                className="relative flex-1 flex flex-col items-center justify-center py-2 group transition-all duration-300 ease-in-out"
                            >
                                {/* Icon Container */}
                                <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive
                                    ? `${item.bgColor} ${item.activeColor} -translate-y-1 shadow-md ${item.glowColor}`
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                    }`}>
                                    <item.icon
                                        size={24}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}
                                    />

                                    {/* Notification Badge */}
                                    {item.badge && (
                                        <span className="absolute top-1 -right-1 flex h-4 w-6 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold text-white shadow-sm ">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>


                                <span className={`text-[12px] font-medium -mt-0.5 transition-all duration-300 ${isActive
                                    ? `${item.activeColor} opacity-100 font-bold`
                                    : 'text-gray-400 opacity-80 group-hover:text-gray-600'
                                    }`}>
                                    {item.label}
                                </span>


                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default BottomPart;