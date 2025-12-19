import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import axiosClient from '../api/auth';
import toast, { Toaster } from 'react-hot-toast';
import {
    fetchCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
} from '../redux/slice/cartSlice';
import {
    ShoppingCart, Trash2, Plus, Minus, ArrowRight,
    X, Package, Truck, Shield, CreditCard, Wallet,
    Check, MapPin, AlertCircle, ShoppingBag, ChevronRight,
    Zap
} from 'lucide-react';
import BuyRequestModal from '../components/BuyRequestModal';

const Cart = () => {
    // ================= LOGIC (UNCHANGED) =================
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { items, total, loading } = useSelector((state) => state.cart);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [shippingAddress, setShippingAddress] = useState(user?.address || null);
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        if (user) dispatch(fetchCart());
    }, [dispatch, user]);

    useEffect(() => {
        if (items.length > 0) setSelectedItems(items.map(item => item.productId));
    }, [items]);

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await dispatch(updateCartItemQuantity({ productId, quantity: newQuantity })).unwrap();
        } catch (error) {
            toast.error('Stock limit reached');
        }
    };
    // console.log(user);


    const handleRemoveItem = async (productId) => {
        try {
            await dispatch(removeFromCart(productId)).unwrap();
            toast.success('Item removed');
        } catch (error) {
            toast.error('Failed to remove');
        }
    };

    const getSelectedItemsTotal = () => {
        return items
            .filter(item => selectedItems.includes(item.productId))
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    // const buyNow = () => {
    //     if (!user) { navigate('/login'); return; }
    //     setShowBuyModal(true);
    // };
    const buyNow = () => {
        if (!user) { navigate('/login'); return; }

        if (items.length > 0) {
            setSelectedProduct(items[0]);
            setShowBuyModal(true);
        } else {
            toast.error("No items to checkout");
        }
    };

    // ================= DESIGN CONSTANTS =================
    const glassCard = "bg-white/80 backdrop-blur-md border border-white shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl";

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-medium animate-pulse">Securing your cart...</p>
        </div>
    );

    if (!items || items.length === 0) return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="bg-white p-8 rounded-full shadow-sm inline-block mb-6">
                    <ShoppingBag className="w-16 h-16 text-blue-200" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is feeling light</h2>
                <p className="text-gray-500 mb-8">Add some quality materials to get started on your project.</p>
                <Link to="/Material_market" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    Start Shopping <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f4f7fa] pb-32">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-gray-900">My Cart</h1>
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                            {items.length}
                        </span>
                    </div>
                    <button onClick={() => dispatch(clearCart())} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Items List */}
                <div className="lg:col-span-8 space-y-4">
                    {items.map((item) => (
                        <div key={item.productId} className={`${glassCard} p-4 sm:p-5 flex gap-4 sm:gap-6 relative group transition-all duration-300 hover:shadow-md`}>

                            {/* Product Image - Added a subtle hover zoom */}
                            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 relative">
                                <img
                                    src={item.image || item.ProductImage}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    alt={item.name}
                                />
                            </div>

                            {/* Info Container */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
                                            {item.name}
                                        </h3>
                                        {/* Remove Button - More accessible on mobile */}
                                        <button
                                            onClick={() => handleRemoveItem(item.productId)}
                                            className="p-1.5 -mr-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            title="Remove from cart"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                        {item.category}
                                    </p>

                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-lg font-black text-gray-900">₹{item.price.toLocaleString()}</span>
                                        <span className="text-[10px] text-gray-400 font-bold border-l pl-2 border-gray-200">
                                            PER {item.unit?.toUpperCase() || 'UNIT'}
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Action Row */}
                                <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-50 gap-4">

                                    {/* Quantity & Buy Item Container */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm h-9">
                                            <button
                                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                className="px-3 hover:bg-gray-50 text-gray-400 disabled:opacity-20 transition-colors"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="px-2 font-bold text-gray-800 text-xs tabular-nums">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                className="px-3 hover:bg-gray-50 text-gray-400 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Professional Individual Buy Button */}
                                        <button
                                            onClick={() => {
                                                setSelectedProduct(item);
                                                setShowBuyModal(true);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm"
                                        >
                                            <Zap className="w-3 h-3 fill-current" />
                                            BUY NOW
                                        </button>
                                    </div>

                                    {/* Item Subtotal Display */}
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Subtotal</p>
                                        <p className="text-sm font-black text-gray-900">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-4">
                    <div className={`${glassCard} p-6 sticky top-24 border-t-4 border-t-blue-600`}>
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-600" /> Bill Summary
                        </h2>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Item Total ({items.length})</span>
                                <span className="font-semibold text-gray-900">₹{getSelectedItemsTotal().toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span className="flex items-center gap-1">Shipping <Truck className="w-3 h-3" /></span>
                                <span className="text-green-600 font-bold uppercase text-[10px]">Free</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Platform Fee</span>
                                <span className="font-semibold text-gray-900">₹0</span>
                            </div>

                            <div className="h-px bg-gray-100 my-4" />

                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-gray-900">Grand Total</span>
                                <span className="text-2xl font-black text-gray-900">₹{getSelectedItemsTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Address Quick View */}
                        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Delivery Address</span>
                                <button className="text-[10px] font-bold text-blue-700 underline">CHANGE</button>
                            </div>
                            <div className="flex gap-2">
                                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {shippingAddress ? `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.pincode}` : 'No address selected'}
                                </p>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button
                            onClick={buyNow}
                            disabled={!shippingAddress}
                            className="w-full mt-6 bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:bg-gray-400"
                        >
                            Checkout Now <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="mt-6 flex items-center justify-center overflow-hidden gap-4 ">
                            <Shield className="w-4 h-4 text-blue-700" />
                            <Wallet className="w-4 h-4  text-green-500" />
                            <Check className="w-4 h-4 text-blue-700" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Mobile Action Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] border-t border-gray-100 flex items-center justify-between z-40">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total Amount</p>
                    <p className="text-xl font-black text-gray-900">₹{getSelectedItemsTotal().toLocaleString()}</p>
                </div>
                <button
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform"
                    onClick={() => setShowBuyModal(true)}
                >
                    Proceed <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {selectedProduct && (
                <BuyRequestModal
                    product={selectedProduct}
                    quantity={selectedProduct.quantity}
                    isOpen={showBuyModal}
                    onClose={() => setShowBuyModal(false)}
                    shippingAddress={shippingAddress}
                // paymentMethod={paymentMethod}
                />
            )}
        </div>
    );
};

export default Cart;