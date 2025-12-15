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
    checkout
} from '../redux/slice/cartSlice';
import {
    ShoppingCart, Trash2, Plus, Minus, ArrowRight,
    X, Package, Truck, Shield, CreditCard, Wallet,
    IndianRupee, Check, MapPin, AlertCircle
} from 'lucide-react';
import BuyRequestModal from '../components/BuyRequestModal';
import BottomPart from '../components/home/BottomPart';

const Cart = () => {
    // ================= LOGIC STARTS HERE (UNCHANGED) =================
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { items, total, totalItems, loading } = useSelector((state) => state.cart);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [shippingAddress, setShippingAddress] = useState(user.address);
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        if (user) {
            dispatch(fetchCart());
            // fetchUserAddress();
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (items.length > 0) {
            setSelectedItems(items.map(item => item.productId));
        }
    }, [items]);

    // const fetchUserAddress = async () => {
    //     try {
    //         const response = await axiosClient.get('/auth/me');
    //         const defaultAddress = response.data.addresses?.find(addr => addr.isDefault);
    //         if (defaultAddress) {
    //             setShippingAddress(defaultAddress);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching address:', error);
    //     }
    // };

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await dispatch(updateCartItemQuantity({ productId, quantity: newQuantity })).unwrap();
            toast.success('Quantity updated');
        } catch (error) {
            toast.error(error.message || 'Failed to update quantity');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await dispatch(removeFromCart(productId)).unwrap();
            toast.success('Item removed from cart');
            setSelectedItems(prev => prev.filter(id => id !== productId));
        } catch (error) {
            toast.error(error.message || 'Failed to remove item');
        }
    };

    const handleSelectItem = (productId) => {
        setSelectedItems(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(item => item.productId));
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) return;
        try {
            await dispatch(clearCart()).unwrap();
            toast.success('Cart cleared successfully');
            setSelectedItems([]);
        } catch (error) {
            toast.error(error.message || 'Failed to clear cart');
        }
    };

    const getSelectedItemsTotal = () => {
        return items
            .filter(item => selectedItems.includes(item.productId))
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const getSelectedItemsCount = () => {
        return items.filter(item => selectedItems.includes(item.productId)).length;
    };

    const handleBuyNow = (product) => {
        if (!user) {
            toast.error('Please login to make a purchase');
            navigate('/login');
            return;
        }
        setSelectedProduct(product);
        setQuantity(product.quantity || 1);
        setShowBuyModal(true);
    };

    const handleBuySelected = () => {
        if (selectedItems.length === 0) {
            toast.error('Please select items to purchase');
            return;
        }
        if (!shippingAddress) {
            toast.error('Please add a shipping address');
            navigate('/profile?tab=addresses');
            return;
        }
        setShowBuyModal(true);
    };

    const handleCheckout = async () => {
        if (!user) {
            toast.error('Please login to checkout');
            navigate('/login');
            return;
        }
        if (selectedItems.length === 0) {
            toast.error('Please select items to checkout');
            return;
        }
        if (!shippingAddress) {
            toast.error('Please add a shipping address');
            navigate('/profile?tab=addresses');
            return;
        }
        setIsCheckingOut(true);
        try {
            const selectedProducts = items.filter(item => selectedItems.includes(item.productId));
            if (selectedProducts.length === 1) {
                setSelectedProduct(selectedProducts[0]);
                setQuantity(selectedProducts[0].quantity);
                setShowBuyModal(true);
            } else {
                const response = await axiosClient.post('/orders/bulk', {
                    items: selectedProducts.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    shippingAddress,
                    paymentMethod,
                    totalAmount: getSelectedItemsTotal()
                });
                toast.success('Order created successfully!');
                dispatch(fetchCart());
                navigate('/orders');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Checkout failed');
        } finally {
            setIsCheckingOut(false);
        }
    };

    const handleBuySuccess = (buyRequest) => {
        console.log('Buy request successful:', buyRequest);
        toast.success('Purchase request sent successfully!');
        dispatch(fetchCart());
        setShowBuyModal(false);
        setSelectedProduct(null);
    };
    // ================= LOGIC ENDS HERE =================

    // Shared styling classes for Glassmorphism
    const glassCard = "bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl";
    const glassInput = "bg-white/50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200/50 backdrop-blur-sm rounded-xl transition-all";

    if (!user) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className={`${glassCard} max-w-md w-full p-8 text-center transform transition-all hover:scale-105 duration-300`}>
                    <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <ShoppingCart className="w-10 h-10 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">Please login to view your cart and continue shopping for amazing products.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-semibold tracking-wide"
                    >
                        Login to Continue
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="mt-4 text-blue-600 font-medium">Loading Cart...</div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-purple-50 py-12">
                <Toaster position="bottom-center" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`${glassCard} p-12 text-center max-w-2xl mx-auto`}>
                        <div className="bg-gray-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Package className="w-14 h-14 text-gray-300" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
                        <p className="text-gray-500 mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
                        <Link
                            to="/Material_market"
                            className="inline-flex items-center bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all font-medium"
                        >
                            Start Shopping
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>

            < div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-100 via-indigo-50 to-pink-50 py-8 font-sans" >
                <Toaster position="bottom-center" toastOptions={{
                    className: '!bg-white/90 !backdrop-blur-md !shadow-lg !rounded-xl !text-gray-800',
                }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-200/50">
                        <div>
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
                                My Cart
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium flex items-center">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-sm mr-2">{totalItems} Items</span>
                                ready for checkout
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Cart Items */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Control Bar */}
                            <div className={`${glassCard} p-4 flex flex-wrap items-center justify-between gap-4 sticky top-4 z-10`}>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === items.length}
                                            onChange={handleSelectAll}
                                            className="peer appearance-none h-6 w-6 border-2 border-gray-300 rounded-lg bg-white checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                                        />
                                        <Check className="absolute left-1 top-1 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                                    </div>
                                    <span className="ml-3 font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                                        Select All ({items.length})
                                    </span>
                                </label>

                                <button
                                    onClick={handleClearCart}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear Cart
                                </button>
                            </div>

                            {/* Items List */}
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.productId}
                                        className={`${glassCard} group p-5 transition-all duration-300 hover:shadow-2xl hover:border-blue-200/60 relative overflow-hidden`}
                                    >
                                        {/* Selection Highlight Background */}
                                        {selectedItems.includes(item.productId) && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-6">
                                            {/* Checkbox & Image */}
                                            <div className="flex items-start gap-4">
                                                <div className="relative flex items-center mt-8">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.includes(item.productId)}
                                                        onChange={() => handleSelectItem(item.productId)}
                                                        className="peer appearance-none h-5 w-5 border-2 border-gray-300 rounded-md bg-white checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                                                    />
                                                    <Check className="absolute left-0.5 top-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                                </div>

                                                <div className="relative group-hover:scale-105 transition-transform duration-300">
                                                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                                        <img
                                                            src={item.image || item.ProductImage}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    {!item.inStock && (
                                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <Link
                                                            to={`/product/${item.productId}`}
                                                            className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                        <button
                                                            onClick={() => handleRemoveItem(item.productId)}
                                                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-all"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-2">{item.category}</p>

                                                    {/* Price Mobile/Desktop */}
                                                    <div className="flex items-baseline gap-2 mb-3">
                                                        <span className="text-xl font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                        <span className="text-sm text-gray-500">
                                                            (₹{item.price}/{item.unit})
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions Footer */}
                                                <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                                                    {/* Quantity Control */}
                                                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-inner">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="p-2 rounded-md hover:bg-white hover:shadow-sm text-gray-600 disabled:opacity-30 transition-all"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-10 text-center font-semibold text-gray-800 tabular-nums">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                            disabled={!item.inStock || item.quantity >= item.stock}
                                                            className="p-2 rounded-md hover:bg-white hover:shadow-sm text-gray-600 disabled:opacity-30 transition-all"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => handleBuyNow(item)}
                                                        className="flex-1 sm:flex-none bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300"
                                                    >
                                                        Buy Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <Link to="/Material_market" className="inline-flex items-center text-gray-600 hover:text-blue-600 font-medium transition-colors group">
                                    <span className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:-translate-x-1 transition-transform">
                                        <ArrowRight className="w-4 h-4 rotate-180" />
                                    </span>
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className={`sticky top-6 space-y-6`}>
                                {/* Summary Card */}
                                <div className={`${glassCard} p-6 border-t-4 border-t-blue-500`}>
                                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                        Order Summary
                                        <span className="ml-auto text-xs font-normal bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                            {getSelectedItemsCount()} selected
                                        </span>
                                    </h2>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal</span>
                                            <span className="font-medium">₹{getSelectedItemsTotal().toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span className="flex items-center"><Truck className="w-3 h-3 mr-1" /> Shipping</span>
                                            <span className="text-green-600 font-medium">Free</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Tax (18%)</span>
                                            <span className="font-medium">₹{(getSelectedItemsTotal() * 0.18).toFixed(2)}</span>
                                        </div>

                                        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

                                        <div className="flex justify-between items-end">
                                            <span className="text-lg font-bold text-gray-800">Total</span>
                                            <div className="text-right">
                                                <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
                                                    ₹{(getSelectedItemsTotal() * 1.18).toFixed(2)}
                                                </span>
                                                <p className="text-xs text-gray-400 mt-1">Including GST</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Section */}
                                    <div className="mb-6 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-700 flex items-center text-sm">
                                                <MapPin className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                                Deliver to
                                            </h3>
                                            <button
                                                onClick={() => navigate('/profile?tab=addresses')}
                                                className="text-blue-600 text-xs font-semibold hover:underline"
                                            >
                                                CHANGE
                                            </button>
                                        </div>
                                        {shippingAddress ? (
                                            <div className="text-xs text-gray-600 leading-relaxed pl-5 border-l-2 border-blue-200">
                                                <p className="font-bold text-gray-800">{shippingAddress.contactPerson}</p>
                                                <p>{shippingAddress.street}, {shippingAddress.city}</p>
                                                <p>{shippingAddress.state} - {shippingAddress.pincode}</p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-red-500 text-xs mt-2 bg-red-50 p-2 rounded">
                                                <AlertCircle className="w-4 h-4 mr-2" />
                                                Please add shipping address
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment Method */}
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-700 mb-3 text-sm flex items-center">
                                            <Wallet className="w-4 h-4 mr-2 text-purple-500" />
                                            Payment Method
                                        </h3>
                                        <div className="space-y-2">
                                            {['cash_on_delivery', 'online_payment'].map((method) => (
                                                <label
                                                    key={method}
                                                    className={`relative flex items-center p-3 rounded-xl cursor-pointer border transition-all ${paymentMethod === method
                                                        ? 'bg-blue-50/50 border-blue-500 shadow-sm'
                                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="paymentMethod"
                                                        value={method}
                                                        checked={paymentMethod === method}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <div className="ml-3">
                                                        <span className="block text-sm font-medium text-gray-900 capitalize">
                                                            {method.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Main Actions */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleCheckout}
                                            disabled={selectedItems.length === 0 || isCheckingOut || !shippingAddress}
                                            className="w-full relative group overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <span className="relative z-10 flex items-center justify-center">
                                                {isCheckingOut ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                ) : (
                                                    <>
                                                        Checkout
                                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </span>
                                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                        </button>

                                        <button
                                            onClick={handleBuySelected}
                                            disabled={selectedItems.length === 0}
                                            className="w-full bg-white text-gray-800 border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all text-sm"
                                        >
                                            Buy Selected Separately
                                        </button>
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center gap-4 text-gray-400">
                                        <div className="flex items-center text-xs">
                                            <Shield className="w-3 h-3 mr-1" /> Secure
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <CreditCard className="w-3 h-3 mr-1" /> Encrypted
                                        </div>
                                    </div>
                                </div>

                                {/* Offers Card */}
                                <div className={`${glassCard} p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 border-indigo-100`}>
                                    <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
                                        <Package className="w-4 h-4 mr-2" />
                                        Available Offers
                                    </h3>
                                    <ul className="space-y-2 text-xs text-indigo-700">
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            Free delivery on orders above ₹5000
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            5% Cashback on UPI payments
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buy Request Modal */}
                {
                    selectedProduct && (
                        <BuyRequestModal
                            product={selectedProduct}
                            quantity={quantity}
                            isOpen={showBuyModal}
                            onClose={() => {
                                setShowBuyModal(false);
                                setSelectedProduct(null);
                            }}
                            onSuccess={handleBuySuccess}
                            shippingAddress={shippingAddress}
                            paymentMethod={paymentMethod}
                        />
                    )
                }

            </div >

            <div className="fixed   bottom-0 w-full z-50">
                <BottomPart />
            </div>

        </div>
    );
};

export default Cart;