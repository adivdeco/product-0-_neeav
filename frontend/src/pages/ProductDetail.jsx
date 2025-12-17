import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import axiosClient from '../api/auth';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../hooks/useSocket';
import toast, { Toaster } from 'react-hot-toast';
import BuyRequestModal from '../components/BuyRequestModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Star, Truck, Shield, RefreshCw,
    Minus, Plus, Heart, Share2, ChevronRight,
    Tag, Zap, ThumbsUp, CheckCircle2,
    ArrowDownNarrowWide,
    ChevronDown,
    Trash2
} from 'lucide-react';
import { updateCartCount } from '../redux/slice/cartSlice';
import DOMPurify from 'dompurify';


const ProductDetail = () => {
    // ================= LOGIC SECTION (KEPT 100% SAME) =================
    const { productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const socketService = useSocket();
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '', images: [] });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const { totalItems: cartCount } = useSelector((state) => state.cart);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

    useEffect(() => { fetchProduct(); }, [productId]);

    useEffect(() => {
        if (product && user && product.rating?.reviews) {
            const existing = product.rating.reviews.find(r => r.userId?._id === user._id);
            setUserReview(existing || null);
        }
    }, [product, user]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/products/public/products/${productId}`);
            setProduct(response.data.product);
            console.log(response.data.product);

            setSimilarProducts(response.data.similarProducts || []);
        } catch (error) {
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };


    const checkUserReview = async () => {
        if (!product || !user) return;
        try {
            const existingReview = product.rating?.reviews?.find(
                review => review.userId?._id === user._id
            );
            setUserReview(existingReview || null);
        } catch (error) {
            console.error('Error checking user review:', error);
        }
    };

    const addToCart = async () => {
        if (!user) return navigate('/login');

        try {
            const response = await axiosClient.post('/auth/cart/add', {
                productId: product._id,
                quantity: quantity
            });
            toast.success(`Added to cart!`, { icon: '🛒' });
            dispatch(updateCartCount(response.data.cartCount));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    const handleReviewSubmit = async () => {
        if (!user) return navigate('/login')
        if (!reviewForm.rating || !reviewForm.comment.trim()) {
            toast.error('Please provide a rating and comment'); return;
        }
        setReviewLoading(true);
        try {
            const response = await axiosClient.post(`/products/${productId}/reviews`, {
                rating: reviewForm.rating,
                comment: reviewForm.comment,
                images: reviewForm.images
            });
            toast.success('Review submitted!');
            fetchProduct();
            setReviewForm({ rating: 0, comment: '', images: [] });
            setShowReviewForm(false);
            setUserReview(response.data.review);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit');
        } finally {
            setReviewLoading(false);
        }
    };

    const handleReviewDelete = async () => {
        if (!window.confirm("Delete your review?")) return;
        try {
            await axiosClient.delete(`/products/${productId}/reviews/${userReview._id}`);
            toast.success('Review deleted');
            fetchProduct();
            setUserReview(null);
        } catch (e) { toast.error('Failed to delete'); }
    };

    useEffect(() => {
        const socket = socketService.socket;
        if (socket) {
            const handleBuyRequestAccepted = (data) => toast.success(data.notification?.message || 'Accepted!');
            const handleBuyRequestRejected = (data) => toast.error(data.notification?.message || 'Declined');
            socket.on('buy_request_accepted', handleBuyRequestAccepted);
            socket.on('buy_request_rejected', handleBuyRequestRejected);
            return () => {
                socket.off('buy_request_accepted', handleBuyRequestAccepted);
                socket.off('buy_request_rejected', handleBuyRequestRejected);
            };
        }
    }, [socketService.socket]);

    const buyNow = () => {
        if (!user) { navigate('/login'); return; }
        setShowBuyModal(true);
    };

    const handleBuySuccess = (buyRequest) => {
        toast.success('Purchase request sent!');
    };

    const incrementQuantity = () => { if (quantity < (product?.stock || 0)) setQuantity(prev => prev + 1); };
    const decrementQuantity = () => { if (quantity > 1) setQuantity(prev => prev - 1); };

    const getPrimaryImage = () => {
        if (product?.images?.length > 0) {
            const primary = product.images.find(img => img.isPrimary);
            return primary ? primary.url : product.images[0].url;
        }
        return product?.ProductImage || '';
    };

    const getImages = () => {
        if (product?.images?.length > 0) return product.images;
        return [{ url: product?.ProductImage || '', alt: product?.name, isPrimary: true }];
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const images = getImages();
    const discount = product?.costPrice > product?.price
        ? Math.round(((product.costPrice - product.price) / product.costPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-[#f1f3f6] font-sans pb-24 md:pb-10">
            <Toaster position="bottom-center" />

            {/* Review Modal Overlay */}
            <AnimatePresence>
                {showReviewForm && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:px-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowReviewForm(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-6 z-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h3 className="text-lg font-bold text-gray-800">Write a Review</h3>
                                <button onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>

                            <div className="flex flex-col items-center gap-2 mb-6">
                                <p className="text-sm text-gray-500 mb-2">Tap stars to rate</p>
                                <div className="flex gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className="transform transition-transform active:scale-90"
                                        >
                                            <Star className={`w-10 h-10 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <textarea
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none mb-6 text-sm"
                                placeholder="Describe your experience with this product..."
                            />

                            <button
                                onClick={handleReviewSubmit}
                                disabled={reviewLoading}
                                className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                            >
                                {reviewLoading ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Navbar Placeholder (Assuming you have a main nav, simplified here) */}
            <div className="bg-white shadow-sm sticky top-0 z-40 px-4 py-3 flex items-center justify-between lg:hidden">
                <button onClick={() => navigate(-1)} className="p-1"><ChevronRight className="rotate-180 w-6 h-6 text-gray-600" /></button>
                <div className="font-semibold truncate max-w-[200px]">{product.name}</div>
                <div className="flex gap-3">
                    <Link to="/cart" className="relative">
                        <ShoppingCart className="w-6 h-6 text-gray-700" />
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 rounded-full">{cartCount}</span>}
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto md:pt-4">
                {/* Desktop Breadcrumbs */}
                <nav className="hidden md:flex items-center text-xs text-gray-500 mb-4 px-4">
                    <Link to="/" className="hover:text-blue-600">Home</Link>
                    <ChevronRight className="w-3 h-3 mx-2" />
                    <Link to="/Material_market" className="hover:text-blue-600">Materials</Link>
                    <ChevronRight className="w-3 h-3 mx-2" />
                    <span className="text-gray-400 truncate max-w-[300px]">{product.name}</span>
                </nav>

                <div className="bg-white md:rounded-lg shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 md:gap-0">

                    {/* LEFT COLUMN: Gallery (Sticky on Desktop) */}
                    <div className="lg:col-span-5 p-4 md:p-6 lg:border-r border-gray-100">
                        <div className="sticky top-20">
                            {/* Main Image */}
                            <div className="relative border border-gray-100 rounded-xl overflow-hidden bg-white aspect-[4/4] flex items-center justify-center group mb-4">
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0.8 }}
                                    animate={{ opacity: 1 }}
                                    src={images[selectedImage]?.url || getPrimaryImage()}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                />
                                <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors z-10 border border-gray-100">
                                    <Heart className="w-5 h-5" />
                                </button>
                                <button className="absolute top-4 left-4 p-2 bg-white/90 rounded-full shadow-md text-gray-400 hover:text-blue-500 transition-colors z-10 border border-gray-100 lg:hidden">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Thumbnails */}
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-start lg:justify-center">
                                {images.map((image, idx) => (
                                    <div
                                        key={idx}
                                        onMouseEnter={() => setSelectedImage(idx)}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-16 h-16 flex-shrink-0 border-2 rounded-lg p-1 cursor-pointer transition-all ${selectedImage === idx ? 'border-blue-600' : 'border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        <img src={image.url} alt="" className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Buttons (Hidden on Mobile) */}
                            <div className="hidden lg:flex gap-4 mt-8">
                                <button
                                    onClick={addToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1 py-4 bg-[#ff9f00] text-white font-bold text-lg rounded-sm shadow-sm hover:shadow-md transition-shadow uppercase tracking-wide flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5 fill-white" />
                                    {product.stock === 0 ? "OUT OF STOCK" : "ADD TO CART"}
                                </button>
                                <button
                                    onClick={buyNow}
                                    disabled={product.stock === 0}
                                    className="flex-1 py-4 bg-[#fb641b] text-white font-bold text-lg rounded-sm shadow-sm hover:shadow-md transition-shadow uppercase tracking-wide flex items-center justify-center gap-2"
                                >
                                    <Zap className="w-5 h-5 fill-white" />
                                    BUY NOW
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details (Scrollable) */}
                    <div className="lg:col-span-7 p-4 md:p-6 lg:pl-10">

                        {/* Title & Brand */}
                        <div className="mb-4">
                            <p className="text-gray-500 text-sm font-medium mb-1">{product.brand || 'Generic'}</p>
                            <h1 className="text-xl md:text-2xl font-normal text-gray-900 leading-tight mb-2">
                                {product.name}
                            </h1>

                            {/* Rating Badge (Indian E-com Style) */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-green-700 text-white px-2 py-0.5 rounded text-xs font-bold">
                                    {product.rating?.average?.toFixed(1) || '4.0'} <Star className="w-3 h-3 fill-white" />
                                </div>
                                <span className="text-gray-500 text-sm font-medium">{product.rating?.count || 0} Ratings & Reviews</span>
                                {product.stock > 0 && <span className="w-1 h-1 bg-gray-300 rounded-full"></span>}
                                {product.stock < 5 && product.stock > 0 && <span className="text-red-600 text-sm font-medium">Only {product.stock} left!</span>}
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="mb-6">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>

                                {discount > 0 && (
                                    <>
                                        <span className="text-gray-500 text-lg line-through">₹{product.costPrice?.toLocaleString()}</span>
                                        <span className="text-green-700 font-bold text-lg">{discount}% off</span>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">+ Delivery Charges</p>
                        </div>

                        {/* Offers / Trust Signals */}
                        <div className="space-y-3 mb-8 border-b border-gray-100 pb-6">
                            <h4 className="text-sm font-bold text-gray-900">Available offers</h4>
                            <div className="flex items-start gap-2 text-sm text-gray-700">
                                <Tag className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span><span className="font-bold">Bank Offer</span> 5% Unlimited Cashback on Axis Bank Credit Card</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-700">
                                <Tag className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span><span className="font-bold">Special Price</span> Get extra 10% off (price inclusive of discount)</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-700">
                                <Tag className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span><span className="font-bold">Partner Offer</span> Sign up for Pay Later and get ₹500 Gift Card*</span>
                            </div>
                        </div>

                        {/* Specifications & Delivery Table */}
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Specifications</h4>
                                <div className="space-y-3 text-sm">
                                    {product.specifications ? (
                                        Object.entries(product.specifications).slice(0, 5).map(([key, value]) => (
                                            <div key={key} className="flex">
                                                <span className="w-1/2 text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                <span className="w-1/2 text-gray-900 font-medium">{value}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">Standard specifications apply.</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Delivery & Services</h4>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <Truck className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Delivery by {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString().slice(0, 10)}</p>
                                            <p className="text-xs text-gray-500">{product.shipping?.cost > 0 ? `₹${product.shipping.cost}` : 'Free Delivery'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <RefreshCw className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">7 Day Replacement Policy</p>
                                            <p className="text-xs text-gray-500">Cash on Delivery available</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Warranty</p>
                                            <p className="text-xs text-gray-500">1 Year Manufacturing Warranty</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="mb-8 bg-gray-100 rounded-2xl p-6 relative">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Product Description</h3>

                            <div
                                className={`relative text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none transition-all duration-500 ease-in-out 
        ${isDescExpanded ? 'max-h-full opacity-100' : 'max-h-[180px] overflow-hidden opacity-90'}
        [&>h2]:font-bold [&>h2]:text-lg [&>h2]:mt-4 [&>h2]:mb-2 
        [&>h3]:font-bold [&>h3]:text-base 
        [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 
        [&>ol]:list-decimal [&>ol]:pl-5 
        [&>p]:mb-3`}
                            >
                                {/* The HTML Content */}
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || '') }} />
                            </div>

                            {/* Shadow Overlay (Only visible when collapsed) */}
                            {!isDescExpanded && (
                                <div className="absolute blur-[5px] bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-300 via-gray-100/90 to-transparent z-10 rounded-b-2xl pointer-events-none" />
                            )}

                            {/* Expand/Collapse Button */}
                            <div className={`flex  justify-center mt-4 ${!isDescExpanded ? 'absolute bottom-2 left-0 right-0 z-20' : ''}`}>
                                <button
                                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                                    className="flex items-center gap-2 px-6 py-2  border border-gray-200 shadow-sm rounded-full text-sm font-bold text-white hover:bg-gray-900/60 bg-black hover:shadow-md transition-all group"
                                >
                                    {isDescExpanded ? 'Show Less' : 'Show More'}
                                    <ChevronRight
                                        className={`w-4 h-4 transition-transform duration-300 ${isDescExpanded ? '-rotate-90' : 'rotate-90'}`}
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-8 mt-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Ratings & Reviews</h2>
                                {!userReview && (
                                    <button
                                        onClick={() => setShowReviewForm(true)}
                                        className="shadow-sm bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 text-gray-800 transition-colors"
                                    >
                                        Rate Product
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* 1. CURRENT USER REVIEW (Always Visible if exists) */}
                                {userReview && (
                                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 relative group animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar/Initial */}
                                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                                                    {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" /> : user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-gray-900">{user.name}</span>
                                                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">You</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <div className="bg-green-700 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                            {userReview.rating} <Star className="w-2.5 h-2.5 fill-white" />
                                                        </div>
                                                        <span className="text-xs text-gray-400">• {new Date(userReview.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Delete Button */}
                                            {user?._id?.toString() === userReview?.userId?._id?.toString()&& (
                                                <button
                                                    onClick={handleReviewDelete}
                                                    className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                                                    title="Delete Review"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed ml-11">{userReview.comment}</p>
                                    </div>
                                )}

                                {/* 2. OTHER REVIEWS (Collapsible List) */}
                                {(() => {
                                    // Filter out current user's review
                                    const otherReviews =
                                        product.rating?.reviews?.filter(
                                            r => r.userId?._id?.toString() !== user?._id?.toString()
                                        ) || [];

                                    // Determine what to show based on state
                                    const reviewsToShow = isReviewsExpanded ? otherReviews : otherReviews.slice(0, 3);
                                    const hasHiddenReviews = otherReviews.length > 3;

                                    return (
                                        <div className="relative">
                                            {otherReviews.length === 0 && !userReview && (
                                                <p className="text-gray-500 text-sm italic">No reviews yet. Be the first to review!</p>
                                            )}

                                            <div className="space-y-6">
                                                {reviewsToShow.map((review, i) => (
                                                    <div key={i} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            {/* User Avatar Placeholder */}
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                                                                {review.userId?.name?.charAt(0) || 'C'}
                                                            </div>

                                                            <div>
                                                                <div className="font-bold text-sm text-gray-900">{review.userId?.name || 'Customer'}</div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <div className="bg-green-700 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                                        {review.rating} <Star className="w-2.5 h-2.5 fill-white" />
                                                                    </div>

                                                                    {/* Verify Logic (Optional visual) */}
                                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        <span>Certified Buyer</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 text-sm ml-11 leading-relaxed">{review.comment}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Gradient Shadow Overlay (Only visible when collapsed and has more reviews) */}
                                            {!isReviewsExpanded && hasHiddenReviews && (
                                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f1f3f6] to-transparent pointer-events-none" />
                                            )}

                                            {/* Show More / Show Less Button */}
                                            {hasHiddenReviews && (
                                                <div className="flex justify-center mt-6 relative z-10">
                                                    <button
                                                        onClick={() => setIsReviewsExpanded(!isReviewsExpanded)}
                                                        className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-300 shadow-sm rounded-full text-sm font-bold text-blue-600 hover:bg-blue-50 hover:shadow-md transition-all group"
                                                    >
                                                        {isReviewsExpanded ? 'Show Less' : `See All ${otherReviews.length} Reviews`}
                                                        <ChevronRight
                                                            className={`w-4 h-4 transition-transform duration-300 ${isReviewsExpanded ? '-rotate-90' : 'rotate-90'}`}
                                                        />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Similar Products Carousel */}
                {similarProducts.length > 0 && (
                    <div className="mt-4 bg-white p-4 md:p-6 shadow-sm md:rounded-lg">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Similar Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {similarProducts.slice(0, 6).map((simProduct) => (
                                <Link to={`/product/${simProduct._id}`} key={simProduct._id} className="group">
                                    <div className="aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden mb-2 relative">
                                        <img
                                            src={simProduct.ProductImage || simProduct.images?.[0]?.url}
                                            alt={simProduct.name}
                                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <h3 className="text-sm text-gray-600 truncate">{simProduct.name}</h3>
                                    <div className="font-bold text-gray-900">₹{simProduct.price?.toLocaleString()}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* MOBILE FIXED BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex lg:hidden h-16">
                <button
                    onClick={addToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-white text-gray-900 font-bold text-sm border-t border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:bg-gray-100"
                >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
                <button
                    onClick={buyNow}
                    disabled={product.stock === 0}
                    className="flex-1 bg-[#fb641b] text-white font-bold text-sm flex items-center justify-center disabled:bg-gray-400"
                >
                    Buy Now
                </button>
            </div>

            {/* Modals */}
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