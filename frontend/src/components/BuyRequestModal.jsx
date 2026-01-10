import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axiosClient from '../api/auth';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const BuyRequestModal = ({ product, activeVariant, quantity, isOpen, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { width, height } = useWindowSize();

    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Location, 2: Review, 3: Success

    const [location, setLocation] = useState({
        type: 'home',
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        contactPerson: user?.name || '',
        contactPhone: user?.phone || '',
        instructions: ''
    });

    const [saveAddress, setSaveAddress] = useState(true);

    // Calculate pricing based on variant or base product
    const currentPrice = activeVariant ? activeVariant.price : product.price;
    const subtotal = currentPrice * quantity;
    const taxAmount = (subtotal * (product.taxRate || 18)) / 100;
    const shippingCost = product.shipping?.isFree ? 0 : (product.shipping?.cost || 50);
    const totalPrice = subtotal + taxAmount + shippingCost;

    // Load user addresses if available
    useEffect(() => {

        if (isOpen) {
            setStep(1);
            setShowConfetti(false);


            if (user?.addresses?.length > 0) {
                const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
                if (defaultAddress) {
                    setLocation(prev => ({
                        ...prev,
                        ...defaultAddress
                    }));
                }
            } else if (user?.address) {
                setLocation(prev => ({
                    ...prev,
                    ...user.address
                }));
            }
        }
    }, [isOpen, user]);

    const handleLocationSubmit = () => {
        if (!location.street?.trim() || !location.city?.trim() || !location.pincode?.trim()) {
            toast.error('Please fill in all required address fields');
            return;
        }

        if (!location.contactPerson?.trim() || !location.contactPhone?.trim()) {
            toast.error('Please provide contact person and phone number');
            return;
        }

        setStep(2);
    };

    const handleBuyNow = async () => {
        try {
            setLoading(true);
            console.log('🛒 Placing order...', { productId: product._id, quantity });

            const response = await axiosClient.post('/buy-requests', {
                productId: product._id,
                variantId: activeVariant?._id, // Add variant ID
                quantity: quantity,
                shippingAddress: location,
                message: `Purchase request for ${quantity} ${activeVariant ? activeVariant.unit : product.unit} of ${product.name} ${activeVariant ? `(${activeVariant.size})` : ''}`,
                paymentMethod: 'cash_on_delivery',
                saveAddress: saveAddress
            });

            console.log('✅ Order placed successfully:', response.data);

            // Show confetti
            setShowConfetti(true);
            setStep(3);

            // Call success callback
            if (onSuccess) {
                onSuccess(response.data.buyRequest);
            }

            // Auto close after success (reduced from 11s to 5s)
            setTimeout(() => {
                setShowConfetti(false);
                onClose();
                setStep(1);
            }, 11000);

        } catch (error) {
            console.error('❌ Buy request error:', error);

            // More detailed error message
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to place order. Please try again.';

            toast.error(errorMessage);

            // Log detailed error for debugging
            if (error.response?.data?.error) {
                console.error('Server error details:', error.response.data.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setLocation(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClose = () => {
        setStep(1);
        setShowConfetti(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            {showConfetti && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={200}
                    onConfettiComplete={() => setShowConfetti(false)}
                />
            )}

            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">
                            {step === 1 && 'Delivery Address'}
                            {step === 2 && 'Order Summary'}
                            {step === 3 && 'Order Placed!'}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Step 1: Location Form */}
                {step === 1 && (
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleInputChange('type', 'home')}
                                className={`p-3 border-2 rounded-lg text-center ${location.type === 'home'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200'
                                    }`}
                            >
                                🏠 Home
                            </button>
                            <button
                                type="button"
                                onClick={() => handleInputChange('type', 'work')}
                                className={`p-3 border-2 rounded-lg text-center ${location.type === 'work'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200'
                                    }`}
                            >
                                🏢 Work
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Person *
                            </label>
                            <input
                                type="text"
                                value={location.contactPerson}
                                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Name of person receiving delivery"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Phone *
                            </label>
                            <input
                                type="tel"
                                value={location.contactPhone}
                                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="10-digit mobile number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Street Address *
                            </label>
                            <textarea
                                value={location.street}
                                onChange={(e) => handleInputChange('street', e.target.value)}
                                rows="2"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="House no., Building, Street, Area"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    value={location.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pincode *
                                </label>
                                <input
                                    type="text"
                                    value={location.pincode}
                                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Pincode"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Landmark
                            </label>
                            <input
                                type="text"
                                value={location.landmark}
                                onChange={(e) => handleInputChange('landmark', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nearby landmark"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Delivery Instructions
                            </label>
                            <textarea
                                value={location.instructions}
                                onChange={(e) => handleInputChange('instructions', e.target.value)}
                                rows="2"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Any special delivery instructions"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="saveAddress"
                                checked={saveAddress}
                                onChange={(e) => setSaveAddress(e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-700">
                                Save this address for future orders
                            </label>
                        </div>

                        <button
                            onClick={handleLocationSubmit}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                            Continue to Review
                        </button>
                    </div>
                )}

                {/* Step 2: Order Review */}
                {step === 2 && (
                    <div className="p-6 space-y-6">
                        {/* Product Summary */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={product.ProductImage || product.images?.[0]?.url}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {activeVariant ? `${activeVariant.size} ${activeVariant.unit}` : ''} | Qty: {quantity}
                                    </p>
                                    <p className="text-lg font-bold text-green-600">₹{Number(currentPrice).toFixed(2)}/unit</p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Delivery Address</h4>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm">
                                <p className="font-medium">{location.contactPerson}</p>
                                <p className="text-gray-600">{location.street}</p>
                                <p className="text-gray-600">
                                    {location.city}, {location.state} - {location.pincode}
                                </p>
                                {location.landmark && (
                                    <p className="text-gray-600">Landmark: {location.landmark}</p>
                                )}
                                <p className="text-gray-600">Phone: {location.contactPhone}</p>
                            </div>
                            <button
                                onClick={() => setStep(1)}
                                className="text-blue-600 text-sm mt-2 hover:text-blue-700"
                            >
                                Change Address
                            </button>
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Price Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Price ({quantity} {product.unit})</span>
                                    <span>₹{Number(subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax ({product.taxRate || 18}%)</span>
                                    <span>₹{taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>
                                        <span className="text-green-600">{shippingCost === 0 ? 'Free' : `₹${Number(shippingCost).toFixed(2)}`}</span>
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 pt-2">
                                    <div className="flex justify-between font-bold text-lg text-gray-900 mt-2">
                                        <span>Total Amount</span>
                                        <span className="text-green-600">₹{Number(totalPrice).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleBuyNow}
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            {loading ? 'Placing Order...' : 'Confirm & Place Order'}
                        </button>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="p-6 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h3>
                        <p className="text-gray-600 mb-6">
                            Your purchase request has been sent to the seller.
                            They will contact you shortly to confirm the order.
                        </p>
                        <button
                            onClick={handleClose}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyRequestModal;