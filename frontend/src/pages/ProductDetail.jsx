import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import axiosClient from '../api/auth';
import { useSelector } from 'react-redux';
import { useSocket } from '../hooks/useSocket';
import toast, { Toaster } from 'react-hot-toast';
import BuyRequestModal from '../components/BuyRequestModal';


const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const socketService = useSocket();
    const [showBuyModal, setShowBuyModal] = useState(false);


    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/products/public/products/${productId}`);
            setProduct(response.data.product);
            setSimilarProducts(response.data.similarProducts || []);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = () => {
        // toast.success(`Added ${quantity} ${product.name} to cart!`);
        toast.success(`Added ${quantity} ${product.name} to cart!`, {
            duration: 5000,
            icon: '🛒',
            position: 'bottom-right',
            style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #a7f3d0',
            },
            // action: {
            //     label: 'Contact Support',
            //     onClick: () => navigate('/')
            // }
        });
    };

    useEffect(() => {
        const socket = socketService.socket;

        if (socket) {
            // Buy request specific listeners
            const handleBuyRequestAccepted = (data) => {
                toast.success(data.notification?.message || 'Purchase accepted!');
                // Update local state if needed
            };

            const handleBuyRequestRejected = (data) => {
                toast.error(data.notification?.message || 'Purchase declined');

                // Update local state if needed
            };

            socket.on('buy_request_accepted', handleBuyRequestAccepted);
            socket.on('buy_request_rejected', handleBuyRequestRejected);

            return () => {
                socket.off('buy_request_accepted', handleBuyRequestAccepted);
                socket.off('buy_request_rejected', handleBuyRequestRejected);
            };
        }
    }, [socketService.socket]);

    // const buyNow = async () => {
    //     try {
    //         // Get shipping address from user profile or form
    //         const shippingAddress = {
    //             address: "User's address", // Get from user profile or form
    //             city: "City",
    //             state: "State",
    //             pincode: "Pincode"
    //         };

    //         const response = await axiosClient.post('/buy-requests', {
    //             productId: product._id,
    //             quantity: quantity,
    //             message: `I want to buy ${quantity} ${product.name}`,
    //             shippingAddress: shippingAddress,
    //             paymentMethod: 'cash_on_delivery'
    //         });

    //         // toast.success('Buy request sent to seller!');
    //         toast.error('Buy request sent to seller!', {
    //             duration: 5000,
    //             icon: '📨',
    //             position: 'bottom-right',
    //             style: {
    //                 background: '#f0fdf4',
    //                 color: '#166534',
    //                 border: '1px solid #a7f3d0',
    //             },
    //             // action: {
    //             //     label: 'Contact Support',
    //             //     onClick: () => navigate('/')
    //             // }
    //         });

    //         // Optionally navigate to requests page
    //         // navigate('/my-purchase-requests');
    //     } catch (error) {
    //         // console.error('Error sending buy request:', error);
    //         // toast.error(error.response?.data?.message || 'Failed to send buy request');
    //         toast.error(error.response?.data?.message || 'Failed to send buy request', {
    //             duration: 5000,
    //             icon: '🚫',
    //             position: 'bottom-right',
    //             style: {
    //                 background: '#fff7ed',
    //                 color: '#ea580c',
    //                 border: '1px solid #fdba74',
    //             },
    //             // action: {
    //             //     label: 'Contact Support',
    //             //     onClick: () => navigate('/')
    //             // }
    //         });
    //     }
    // };

    const buyNow = () => {
        setShowBuyModal(true);
    };

    const handleBuySuccess = (buyRequest) => {
        console.log('Buy request successful:', buyRequest);
        // You can update local state or show additional messages
    };

    const incrementQuantity = () => {
        if (quantity < (product?.stock || 0)) {
            setQuantity(prev => prev + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const getPrimaryImage = () => {
        if (product?.images?.length > 0) {
            const primary = product.images.find(img => img.isPrimary);
            return primary ? primary.url : product.images[0].url;
        }
        return product?.ProductImage || '';
    };

    const getImages = () => {
        if (product?.images?.length > 0) {
            return product.images;
        }
        return [{ url: product?.ProductImage || '', alt: product?.name, isPrimary: true }];
    };

    const calculateDiscount = () => {
        if (product?.comparePrice && product.comparePrice > product.price) {
            return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
        }
        return 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                    <Link to="/products" className="text-blue-600 hover:text-blue-700">
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    const images = getImages();
    const discount = calculateDiscount();
    const finalPrice = product.price * quantity;
    const taxAmount = (finalPrice * (product.taxRate || 18)) / 100;
    const totalPrice = finalPrice + taxAmount;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Toaster position="bottom-center" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex mb-6" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-4">
                        <li>
                            <Link to="/" className="text-gray-400 hover:text-gray-500">Home</Link>
                        </li>
                        <li>
                            <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </li>
                        <li>
                            <Link to="/Material_market" className="text-gray-400 hover:text-gray-500">Products</Link>
                        </li>
                        <li>
                            <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </li>
                        <li>
                            <span className="text-gray-500">{product.category}</span>
                        </li>
                    </ol>
                </nav>

                {/* Product Main Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                        {/* Product Images */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={images[selectedImage]?.url || getPrimaryImage()}
                                    alt={images[selectedImage]?.alt || product.name}
                                    className="w-full h-96 object-cover"
                                />
                            </div>

                            {/* Thumbnail Images */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-blue-500' : 'border-transparent'
                                                }`}
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.alt}
                                                className="w-full h-20 object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Product Header */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <div className="flex items-center space-x-4 mb-3">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.floor(product.rating?.average || 0)
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">
                                            {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0} reviews)
                                        </span>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock === 0 ? 'bg-red-100 text-red-800' :
                                        product.stock <= product.minStockLevel ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {product.stockStatus}
                                    </span>
                                </div>
                                <p className="text-gray-600">{product.shortDescription || product.description}</p>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-3">
                                    <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                                    {discount > 0 && (
                                        <>
                                            <span className="text-xl text-gray-500 line-through">₹{product.comparePrice}</span>
                                            <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                                                {discount}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">₹15/bag added over 5 bags</p>
                            </div>

                            {/* Key Features */}
                            {product.features && product.features.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900">Key Features</h3>
                                    <ul className="space-y-1">
                                        {product.features.slice(0, 5).map((feature, index) => (
                                            <li key={index} className="flex items-center text-sm text-gray-600">
                                                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Quantity Selector */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={decrementQuantity}
                                            disabled={quantity <= 1}
                                            className="px-3 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 text-gray-900">{quantity}</span>
                                        <button
                                            onClick={incrementQuantity}
                                            disabled={quantity >= product.stock}
                                            className="px-3 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-500">{product.stock} available</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    onClick={addToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={buyNow}
                                    disabled={product.stock === 0}
                                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                <div className="text-sm">
                                    <span className="text-gray-500">Brand:</span>
                                    <span className="ml-2 text-gray-900 font-medium">{product.brand || 'Not specified'}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-500">Category:</span>
                                    <span className="ml-2 text-gray-900 font-medium">{product.category}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-500">SKU:</span>
                                    <span className="ml-2 text-gray-900 font-medium">{product.sku || 'N/A'}</span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-500">Unit:</span>
                                    <span className="ml-2 text-gray-900 font-medium">{product.unit}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Tabs */}
                    <div className="border-t border-gray-200">
                        <div className="px-6">
                            <nav className="flex space-x-8">
                                {['description', 'specifications', 'reviews', 'shipping'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="px-6 py-4">
                            {activeTab === 'description' && (
                                <div className="prose max-w-none">
                                    <p className="text-gray-700">{product.description}</p>
                                    {product.features && product.features.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                                            <ul className="list-disc list-inside space-y-1 text-gray-700">
                                                {product.features.map((feature, index) => (
                                                    <li key={index}>{feature}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'specifications' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                            <span className="text-gray-900 font-medium">{value}</span>
                                        </div>
                                    ))}
                                    {/* Fallback to basic specs */}
                                    {(!product.specifications || Object.keys(product.specifications).length === 0) && (
                                        <>
                                            {product.size && (
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Size:</span>
                                                    <span className="text-gray-900 font-medium">{product.size}</span>
                                                </div>
                                            )}
                                            {product.weight && (
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Weight:</span>
                                                    <span className="text-gray-900 font-medium">{product.weight} kg</span>
                                                </div>
                                            )}
                                            {product.color && (
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Color:</span>
                                                    <span className="text-gray-900 font-medium">{product.color}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div>
                                    {/* Reviews implementation */}
                                    <p className="text-gray-600">Reviews will be implemented here</p>
                                </div>
                            )}

                            {activeTab === 'shipping' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Shipping:</span>
                                        <span className="text-gray-900 font-medium">
                                            {product.shipping?.isFree ? 'Free Shipping' : `₹${product.shipping?.cost || 0}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Delivery:</span>
                                        <span className="text-gray-900 font-medium">
                                            {product.shipping?.estimatedDays || 'MAX 1 to 2h ,within business days'}
                                        </span>
                                    </div>
                                    {product.warranty && (
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-600">Warranty:</span>
                                            <span className="text-gray-900 font-medium">{product.warranty.period}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map((similarProduct) => (
                                <div key={similarProduct._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                                    <Link to={`/product/${similarProduct._id}`}>
                                        <img
                                            src={similarProduct.ProductImage || similarProduct.images?.[0]?.url}
                                            alt={similarProduct.name}
                                            className="w-full h-48 object-cover rounded-lg mb-3"
                                        />
                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{similarProduct.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-green-600">₹{similarProduct.price}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${similarProduct.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {similarProduct.stockStatus}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <BuyRequestModal
                product={product}
                quantity={quantity}
                isOpen={showBuyModal}
                onClose={() => setShowBuyModal(false)}
                onSuccess={handleBuySuccess}
            />
        </div>
    );
};

export default ProductDetail;