// import React, { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router';
// import axiosClient from '../api/auth';
// import { useSelector, useDispatch } from 'react-redux';
// import { useSocket } from '../hooks/useSocket';
// import toast, { Toaster } from 'react-hot-toast';
// import BuyRequestModal from '../components/BuyRequestModal';
// import { motion } from 'framer-motion';
// import { ShoppingCart } from 'lucide-react';
// import { updateCartCount } from '../redux/slice/cartSlice';

// const ProductDetail = () => {
//     const { productId } = useParams();
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const { user } = useSelector((state) => state.auth);
//     const [product, setProduct] = useState(null);
//     const [similarProducts, setSimilarProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [quantity, setQuantity] = useState(1);
//     const [selectedImage, setSelectedImage] = useState(0);
//     const [activeTab, setActiveTab] = useState('description');
//     const socketService = useSocket();
//     const [showBuyModal, setShowBuyModal] = useState(false);
//     const [reviewLoading, setReviewLoading] = useState(false);
//     const [reviewForm, setReviewForm] = useState({
//         rating: 0,
//         comment: '',
//         images: []
//     });
//     const [showReviewForm, setShowReviewForm] = useState(false);
//     const [userReview, setUserReview] = useState(null);
//     const { totalItems: cartCount } = useSelector((state) => state.cart);



//     useEffect(() => {
//         fetchProduct();
//         if (user) {
//             checkUserReview();
//         }
//     }, [productId, user]);

//     const fetchProduct = async () => {
//         try {
//             setLoading(true);
//             const response = await axiosClient.get(`/products/public/products/${productId}`);
//             setProduct(response.data.product);
//             setSimilarProducts(response.data.similarProducts || []);
//         } catch (error) {
//             console.error('Error fetching product:', error);
//             toast.error('Failed to load product');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const checkUserReview = async () => {
//         if (!product || !user) return;

//         try {
//             const existingReview = product.rating?.reviews?.find(
//                 review => review.userId?._id === user._id
//             );
//             setUserReview(existingReview || null);
//         } catch (error) {
//             console.error('Error checking user review:', error);
//         }
//     };

//     const addToCart = async () => {
//         if (!user) {
//             toast.error('Please login to add items to cart', {
//                 duration: 4000,
//                 icon: '🔒',
//                 style: {
//                     background: '#fff7ed',
//                     color: '#ea580c',
//                     border: '1px solid #fdba74',
//                 },
//             });
//             navigate('/login');
//             return;
//         }

//         try {
//             const response = await axiosClient.post('/auth/cart/add', {
//                 productId: product._id,
//                 quantity: quantity
//             });

//             toast.success(`Added ${quantity} ${product.name} to cart!`, {
//                 duration: 3000,
//                 icon: '🛒',
//                 position: 'bottom-right',
//                 style: {
//                     background: '#f0fdf4',
//                     color: '#166534',
//                     border: '1px solid #a7f3d0',
//                 },
//             });

//             dispatch(updateCartCount(response.data.cartCount));

//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to add to cart', {
//                 duration: 4000,
//                 icon: '❌',
//                 position: 'bottom-right',
//                 style: {
//                     background: '#fee',
//                     color: '#dc2626',
//                     border: '1px solid #fca5a5',
//                 },
//             });
//         }
//     };

//     const handleReviewSubmit = async () => {
//         if (!user) {
//             toast.error('Please login to submit a review');
//             navigate('/login');
//             return;
//         }

//         if (!reviewForm.rating) {
//             toast.error('Please select a rating');
//             return;
//         }

//         if (!reviewForm.comment.trim()) {
//             toast.error('Please enter a comment');
//             return;
//         }

//         setReviewLoading(true);
//         try {
//             const response = await axiosClient.post(`/products/${productId}/reviews`, {
//                 rating: reviewForm.rating,
//                 comment: reviewForm.comment,
//                 images: reviewForm.images
//             });

//             toast.success('Review submitted successfully!', {
//                 duration: 3000,
//                 icon: '⭐',
//                 position: 'bottom-right',
//             });

//             // Update product with new review
//             fetchProduct();

//             // Reset form
//             setReviewForm({
//                 rating: 0,
//                 comment: '',
//                 images: []
//             });
//             setShowReviewForm(false);
//             setUserReview(response.data.review);

//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to submit review', {
//                 duration: 4000,
//                 icon: '❌',
//             });
//         } finally {
//             setReviewLoading(false);
//         }
//     };

//     const handleReviewDelete = async () => {
//         if (!userReview || !user) return;

//         try {
//             await axiosClient.delete(`/products/${productId}/reviews/${userReview._id}`);

//             toast.success('Review deleted successfully', {
//                 duration: 3000,
//                 icon: '🗑️',
//             });

//             // Update product
//             fetchProduct();
//             setUserReview(null);

//         } catch (error) {
//             toast.error('Failed to delete review');
//         }
//     };

//     const renderStars = (rating) => {
//         return (
//             <div className="flex">
//                 {[...Array(5)].map((_, i) => (
//                     <button
//                         key={i}
//                         onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
//                         className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
//                         disabled={reviewLoading}
//                     >
//                         ★
//                     </button>
//                 ))}
//             </div>
//         );
//     };

//     useEffect(() => {
//         const socket = socketService.socket;

//         if (socket) {
//             // Buy request specific listeners
//             const handleBuyRequestAccepted = (data) => {
//                 toast.success(data.notification?.message || 'Purchase accepted!');
//                 // Update local state if needed
//             };

//             const handleBuyRequestRejected = (data) => {
//                 toast.error(data.notification?.message || 'Purchase declined');

//                 // Update local state if needed
//             };

//             socket.on('buy_request_accepted', handleBuyRequestAccepted);
//             socket.on('buy_request_rejected', handleBuyRequestRejected);

//             return () => {
//                 socket.off('buy_request_accepted', handleBuyRequestAccepted);
//                 socket.off('buy_request_rejected', handleBuyRequestRejected);
//             };
//         }
//     }, [socketService.socket]);

//     // const buyNow = async () => {
//     //     try {
//     //         // Get shipping address from user profile or form
//     //         const shippingAddress = {
//     //             address: "User's address", // Get from user profile or form
//     //             city: "City",
//     //             state: "State",
//     //             pincode: "Pincode"
//     //         };

//     //         const response = await axiosClient.post('/buy-requests', {
//     //             productId: product._id,
//     //             quantity: quantity,
//     //             message: `I want to buy ${quantity} ${product.name}`,
//     //             shippingAddress: shippingAddress,
//     //             paymentMethod: 'cash_on_delivery'
//     //         });

//     //         // toast.success('Buy request sent to seller!');
//     //         toast.error('Buy request sent to seller!', {
//     //             duration: 5000,
//     //             icon: '📨',
//     //             position: 'bottom-right',
//     //             style: {
//     //                 background: '#f0fdf4',
//     //                 color: '#166534',
//     //                 border: '1px solid #a7f3d0',
//     //             },
//     //             // action: {
//     //             //     label: 'Contact Support',
//     //             //     onClick: () => navigate('/')
//     //             // }
//     //         });

//     //         // Optionally navigate to requests page
//     //         // navigate('/my-purchase-requests');
//     //     } catch (error) {
//     //         // console.error('Error sending buy request:', error);
//     //         // toast.error(error.response?.data?.message || 'Failed to send buy request');
//     //         toast.error(error.response?.data?.message || 'Failed to send buy request', {
//     //             duration: 5000,
//     //             icon: '🚫',
//     //             position: 'bottom-right',
//     //             style: {
//     //                 background: '#fff7ed',
//     //                 color: '#ea580c',
//     //                 border: '1px solid #fdba74',
//     //             },
//     //             // action: {
//     //             //     label: 'Contact Support',
//     //             //     onClick: () => navigate('/')
//     //             // }
//     //         });
//     //     }
//     // };

//     const buyNow = () => {
//         setShowBuyModal(true);
//     };

//     const handleBuySuccess = (buyRequest) => {
//         console.log('Buy request successful:', buyRequest);
//         // You can update local state or show additional messages
//     };

//     const renderReviewsSection = () => (
//         <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
//                 {user && !userReview && (
//                     <button
//                         onClick={() => setShowReviewForm(true)}
//                         className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                     >
//                         Write a Review
//                     </button>
//                 )}
//             </div>

//             {/* Average Rating */}
//             <div className="flex items-center mb-8 p-4 bg-gray-50 rounded-lg">
//                 <div className="text-center mr-8">
//                     <div className="text-5xl font-bold text-gray-900">
//                         {product.rating?.average?.toFixed(1) || '0.0'}
//                     </div>
//                     <div className="flex justify-center mt-2">
//                         {[...Array(5)].map((_, i) => (
//                             <svg
//                                 key={i}
//                                 className={`w-5 h-5 ${i < Math.floor(product.rating?.average || 0)
//                                     ? 'text-yellow-400'
//                                     : 'text-gray-300'
//                                     }`}
//                                 fill="currentColor"
//                                 viewBox="0 0 20 20"
//                             >
//                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                             </svg>
//                         ))}
//                     </div>
//                     <p className="text-sm text-gray-600 mt-2">
//                         {product.rating?.count || 0} reviews
//                     </p>
//                 </div>
//                 <div className="flex-1">
//                     {[5, 4, 3, 2, 1].map((star) => {
//                         const count = product.rating?.reviews?.filter(r => Math.round(r.rating) === star).length || 0;
//                         const percentage = product.rating?.count ? (count / product.rating.count) * 100 : 0;

//                         return (
//                             <div key={star} className="flex items-center mb-2">
//                                 <span className="text-sm text-gray-600 w-8">{star} star</span>
//                                 <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full overflow-hidden">
//                                     <div
//                                         className="h-full bg-yellow-400"
//                                         style={{ width: `${percentage}%` }}
//                                     ></div>
//                                 </div>
//                                 <span className="text-sm text-gray-600 w-12">{count}</span>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>

//             {/* User's Review */}
//             {userReview && (
//                 <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <div className="flex justify-between items-start">
//                         <div>
//                             <h3 className="font-semibold text-gray-900">Your Review</h3>
//                             <div className="flex items-center mt-2">
//                                 <div className="flex mr-4">
//                                     {[...Array(5)].map((_, i) => (
//                                         <svg
//                                             key={i}
//                                             className={`w-5 h-5 ${i < userReview.rating
//                                                 ? 'text-yellow-400'
//                                                 : 'text-gray-300'
//                                                 }`}
//                                             fill="currentColor"
//                                             viewBox="0 0 20 20"
//                                         >
//                                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                         </svg>
//                                     ))}
//                                 </div>
//                                 <span className="text-sm text-gray-600">
//                                     {new Date(userReview.createdAt).toLocaleDateString()}
//                                 </span>
//                             </div>
//                             <p className="mt-3 text-gray-700">{userReview.comment}</p>
//                         </div>
//                         <button
//                             onClick={handleReviewDelete}
//                             className="text-red-600 hover:text-red-800 text-sm font-medium"
//                         >
//                             Delete
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Review Form Modal */}
//             {showReviewForm && (
//                 <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
//                         <h3 className="text-xl font-bold mb-4">Write a Review</h3>

//                         <div className="mb-4">
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Rating
//                             </label>
//                             <div className="flex">
//                                 {[1, 2, 3, 4, 5].map((star) => (
//                                     <button
//                                         key={star}
//                                         type="button"
//                                         onClick={() => setReviewForm({ ...reviewForm, rating: star })}
//                                         className={`text-3xl mr-2 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
//                                     >
//                                         ★
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="mb-4">
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Comment
//                             </label>
//                             <textarea
//                                 value={reviewForm.comment}
//                                 onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
//                                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                 rows="4"
//                                 placeholder="Share your experience with this product..."
//                             />
//                         </div>

//                         <div className="flex justify-end space-x-3">
//                             <button
//                                 onClick={() => setShowReviewForm(false)}
//                                 className="px-4 py-2 text-gray-600 hover:text-gray-800"
//                                 disabled={reviewLoading}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleReviewSubmit}
//                                 disabled={reviewLoading}
//                                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
//                             >
//                                 {reviewLoading ? 'Submitting...' : 'Submit Review'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Reviews List */}
//             <div className="space-y-6">
//                 {product.rating?.reviews?.filter(r => !user || r.userId?._id !== user._id).map((review, index) => (
//                     <div
//                         key={review._id || index}
//                         className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
//                     >
//                         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
//                             <div className="flex items-center space-x-4">
//                                 <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
//                                     {review.userId?.name?.charAt(0).toUpperCase() || "U"}
//                                 </div>
//                                 <div>
//                                     <p className="font-semibold text-gray-900">
//                                         {review.userId?.name || "Anonymous User"}
//                                     </p>
//                                     <p className="text-xs text-gray-500">
//                                         {review.userId?.email ? "Verified Customer" : "Registered User"}
//                                     </p>
//                                 </div>
//                             </div>

//                             <div className="flex flex-col items-start sm:items-end text-gray-600">
//                                 <div className="flex">
//                                     {[...Array(5)].map((_, i) => (
//                                         <svg
//                                             key={i}
//                                             className={`w-5 h-5 ${i < review.rating
//                                                 ? 'text-yellow-400'
//                                                 : 'text-gray-300'
//                                                 }`}
//                                             fill="currentColor"
//                                             viewBox="0 0 20 20"
//                                         >
//                                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                         </svg>
//                                     ))}
//                                 </div>
//                                 <span className="text-xs mt-1 text-gray-500">
//                                     {new Date(review.createdAt).toLocaleDateString()}
//                                 </span>
//                             </div>
//                         </div>

//                         <div className="mt-4 border-t border-gray-100 pt-4">
//                             <p className="text-gray-700 leading-relaxed">{review.comment}</p>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );

//     const incrementQuantity = () => {
//         if (quantity < (product?.stock || 0)) {
//             setQuantity(prev => prev + 1);
//         }
//     };

//     const decrementQuantity = () => {
//         if (quantity > 1) {
//             setQuantity(prev => prev - 1);
//         }
//     };

//     const getPrimaryImage = () => {
//         if (product?.images?.length > 0) {
//             const primary = product.images.find(img => img.isPrimary);
//             return primary ? primary.url : product.images[0].url;
//         }
//         return product?.ProductImage || '';
//     };

//     const getImages = () => {
//         if (product?.images?.length > 0) {
//             return product.images;
//         }
//         return [{ url: product?.ProductImage || '', alt: product?.name, isPrimary: true }];
//     };

//     const calculateDiscount = () => {
//         if (product?.comparePrice && product.comparePrice > product.price) {
//             return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
//         }
//         return 0;
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//             </div>
//         );
//     }

//     if (!product) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <div className="text-center">
//                     <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
//                     <Link to="/products" className="text-blue-600 hover:text-blue-700">
//                         Back to Products
//                     </Link>
//                 </div>
//             </div>
//         );
//     }

//     const images = getImages();
//     const discount = calculateDiscount();
//     const finalPrice = product.price * quantity;
//     const taxAmount = (finalPrice * (product.taxRate || 18)) / 100;
//     const totalPrice = finalPrice + taxAmount;

//     return (
//         <div className="min-h-screen bg-gray-50 py-8">
//             <Toaster position="bottom-center" />

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 {/* Breadcrumb */}
//                 <nav className="flex mb-6 text-center justify-between" aria-label="Breadcrumb">
//                     <ol className="flex text-xs items-center space-x-0">
//                         <li>
//                             <Link to="/" className="text-gray-400 hover:text-gray-700">Home</Link>
//                         </li>
//                         <li>
//                             <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                             </svg>
//                         </li>
//                         <li>
//                             <Link to="/Material_market" className="text-gray-400 hover:text-gray-500">Products</Link>
//                         </li>
//                         <li>
//                             <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                             </svg>
//                         </li>
//                         <li>
//                             <span className="text-gray-500">{product.category}</span>
//                         </li>
//                     </ol>
//                     <ol>
//                         <button
//                             onClick={() => navigate('/cart')}
//                             className="
//                                        flex items-center gap-2
//                                        px-6 py-2 rounded-xl
//                                        bg-white/40 border border-black/10
//                                        backdrop-blur-xl
//                                        text-black font-medium
//                                        shadow-[0_2px_10px_rgba(0,0,0,0.08)]
//                                        hover:bg-white/60
//                                        hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)]
//                                        hover:-translate-y-0.5
//                                        active:scale-95
//                                        transition-all duration-300
//                                        relative
//                                    "
//                         >
//                             <ShoppingCart className="w-4 h-4" />
//                             Cart
//                             {cartCount > 0 && (
//                                 <span className="
//                                            absolute -top-2 -right-2
//                                            bg-red-500 text-white
//                                            text-[9px] font-bold
//                                            rounded-full
//                                            w-5 h-5
//                                            flex items-center justify-center
//                                            animate-bounce
//                                        ">
//                                     {cartCount > 99 ? '99+' : cartCount}
//                                 </span>
//                             )}
//                         </button>

//                     </ol>
//                 </nav>

//                 {/* Product Main Section */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
//                         {/* Product Images */}
//                         <div className="space-y-4">
//                             {/* Main Image */}
//                             <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
//                                 <img
//                                     src={images[selectedImage]?.url || getPrimaryImage()}
//                                     alt={images[selectedImage]?.alt || product.name}
//                                     className="w-full h-96 object-cover"
//                                 />
//                             </div>

//                             {/* Thumbnail Images */}
//                             {images.length > 1 && (
//                                 <div className="grid grid-cols-4 gap-2">
//                                     {images.map((image, index) => (
//                                         <button
//                                             key={index}
//                                             onClick={() => setSelectedImage(index)}
//                                             className={`aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-blue-500' : 'border-transparent'
//                                                 }`}
//                                         >
//                                             <img
//                                                 src={image.url}
//                                                 alt={image.alt}
//                                                 className="w-full h-20 object-cover"
//                                             />
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Product Info */}
//                         <div className="space-y-6">
//                             {/* Product Header */}
//                             <div>
//                                 <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
//                                 <div className="flex items-center space-x-4 mb-3">
//                                     <div className="flex items-center">
//                                         {[...Array(5)].map((_, i) => (
//                                             <svg
//                                                 key={i}
//                                                 className={`w-5 h-5 ${i < Math.floor(product.rating?.average || 0)
//                                                     ? 'text-yellow-400'
//                                                     : 'text-gray-300'
//                                                     }`}
//                                                 fill="currentColor"
//                                                 viewBox="0 0 20 20"
//                                             >
//                                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                             </svg>
//                                         ))}
//                                         <span className="ml-2 text-sm text-gray-600">
//                                             {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0} reviews)
//                                         </span>
//                                     </div>
//                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock === 0 ? 'bg-red-100 text-red-800' :
//                                         product.stock <= product.minStockLevel ? 'bg-yellow-100 text-yellow-800' :
//                                             'bg-green-100 text-green-800'
//                                         }`}>
//                                         {product.stockStatus}
//                                     </span>
//                                 </div>
//                                 <p className="text-gray-600">{product.shortDescription || product.description}</p>
//                             </div>

//                             {/* Pricing */}
//                             <div className="space-y-2">
//                                 <div className="flex items-center space-x-3">
//                                     <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
//                                     {discount > 0 && (
//                                         <>
//                                             <span className="text-xl text-gray-500 line-through">₹{product.comparePrice}</span>
//                                             <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
//                                                 {discount}% OFF
//                                             </span>
//                                         </>
//                                     )}
//                                 </div>
//                                 <p className="text-sm text-gray-500">₹15/bag added over 5 bags</p>
//                             </div>

//                             {/* Key Features */}
//                             {product.features && product.features.length > 0 && (
//                                 <div className="space-y-2">
//                                     <h3 className="font-semibold text-gray-900">Key Features</h3>
//                                     <ul className="space-y-1">
//                                         {product.features.slice(0, 5).map((feature, index) => (
//                                             <li key={index} className="flex items-center text-sm text-gray-600">
//                                                 <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                                 </svg>
//                                                 {feature}
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                             )}

//                             {/* Quantity Selector */}
//                             <div className="space-y-2">
//                                 <label className="block text-sm font-medium text-gray-700">Quantity</label>
//                                 <div className="flex items-center space-x-3">
//                                     <div className="flex items-center border border-gray-300 rounded-lg">
//                                         <button
//                                             onClick={decrementQuantity}
//                                             disabled={quantity <= 1}
//                                             className="px-3 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
//                                         >
//                                             -
//                                         </button>
//                                         <span className="px-4 py-2 text-gray-900">{quantity}</span>
//                                         <button
//                                             onClick={incrementQuantity}
//                                             disabled={quantity >= product.stock}
//                                             className="px-3 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
//                                         >
//                                             +
//                                         </button>
//                                     </div>
//                                     <span className="text-sm text-gray-500">{product.stock} available</span>
//                                 </div>
//                             </div>

//                             {/* Action Buttons */}
//                             <div className="flex space-x-4">

//                                 <button
//                                     onClick={addToCart}
//                                     disabled={product.stock === 0}
//                                     className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
//                                 >
//                                     Add to Cart
//                                 </button>

//                                 <button
//                                     onClick={buyNow}
//                                     disabled={product.stock === 0}
//                                     className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
//                                 >
//                                     Buy Now
//                                 </button>

//                             </div>

//                             {/* Additional Info */}
//                             <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
//                                 <div className="text-sm">
//                                     <span className="text-gray-500">Brand:</span>
//                                     <span className="ml-2 text-gray-900 font-medium">{product.brand || 'Not specified'}</span>
//                                 </div>
//                                 <div className="text-sm">
//                                     <span className="text-gray-500">Category:</span>
//                                     <span className="ml-2 text-gray-900 font-medium">{product.category}</span>
//                                 </div>
//                                 <div className="text-sm">
//                                     <span className="text-gray-500">SKU:</span>
//                                     <span className="ml-2 text-gray-900 font-medium">{product.sku || 'N/A'}</span>
//                                 </div>
//                                 <div className="text-sm">
//                                     <span className="text-gray-500">Unit:</span>
//                                     <span className="ml-2 text-gray-900 font-medium">{product.unit}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Product Details Tabs */}
//                     <div className="border-t border-gray-200 ">
//                         <div className="px-6">
//                             <nav className="flex space-x-6 overflow-scroll ">
//                                 {['description', 'specifications', 'shipping'].map((tab) => (
//                                     <button
//                                         key={tab}
//                                         onClick={() => setActiveTab(tab)}
//                                         className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
//                                             ? 'border-blue-500 text-blue-600'
//                                             : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                                             }`}
//                                     >
//                                         {tab.charAt(0).toUpperCase() + tab.slice(1)}
//                                     </button>
//                                 ))}
//                             </nav>
//                         </div>

//                         <div className="px-6 py-4">
//                             {activeTab === 'description' && (
//                                 <div className="prose max-w-none">
//                                     <p className="text-gray-700">{product.description}</p>
//                                     {product.features && product.features.length > 0 && (
//                                         <div className="mt-4">
//                                             <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
//                                             <ul className="list-disc list-inside space-y-1 text-gray-700">
//                                                 {product.features.map((feature, index) => (
//                                                     <li key={index}>{feature}</li>
//                                                 ))}
//                                             </ul>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}

//                             {activeTab === 'specifications' && (
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
//                                         <div key={key} className="flex justify-between py-2 border-b border-gray-100">
//                                             <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
//                                             <span className="text-gray-900 font-medium">{value}</span>
//                                         </div>
//                                     ))}
//                                     {/* Fallback to basic specs */}
//                                     {(!product.specifications || Object.keys(product.specifications).length === 0) && (
//                                         <>
//                                             {product.size && (
//                                                 <div className="flex justify-between py-2 border-b border-gray-100">
//                                                     <span className="text-gray-600">Size:</span>
//                                                     <span className="text-gray-900 font-medium">{product.size}</span>
//                                                 </div>
//                                             )}
//                                             {product.weight && (
//                                                 <div className="flex justify-between py-2 border-b border-gray-100">
//                                                     <span className="text-gray-600">Weight:</span>
//                                                     <span className="text-gray-900 font-medium">{product.weight} kg</span>
//                                                 </div>
//                                             )}
//                                             {product.color && (
//                                                 <div className="flex justify-between py-2 border-b border-gray-100">
//                                                     <span className="text-gray-600">Color:</span>
//                                                     <span className="text-gray-900 font-medium">{product.color}</span>
//                                                 </div>
//                                             )}
//                                         </>
//                                     )}
//                                 </div>
//                             )}



//                             {activeTab === 'shipping' && (
//                                 <div className="space-y-4">
//                                     <div className="flex justify-between items-center py-2">
//                                         <span className="text-gray-600">Shipping:</span>
//                                         <span className="text-gray-900 font-medium">
//                                             {product.shipping?.isFree ? 'Free Shipping' : `₹${product.shipping?.cost || 0}`}
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-between items-center py-2">
//                                         <span className="text-gray-600">Delivery:</span>
//                                         <span className="text-gray-900 font-medium">
//                                             {product.shipping?.estimatedDays || 'MAX 1 to 2h ,within business days'}
//                                         </span>
//                                     </div>
//                                     {product.warranty && (
//                                         <div className="flex justify-between items-center py-2">
//                                             <span className="text-gray-600">Warranty:</span>
//                                             <span className="text-gray-900 font-medium">{product.warranty.period}</span>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Customer Reviews */}
//                     <div className="space-y-6">
//                         {renderReviewsSection()}
//                     </div>
//                 </div>

//                 {/* Similar Products */}
//                 {similarProducts.length > 0 && (
//                     <div className="mt-12">
//                         <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                             {similarProducts.map((similarProduct) => (
//                                 <div key={similarProduct._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
//                                     <Link to={`/product/${similarProduct._id}`}>
//                                         <img
//                                             src={similarProduct.ProductImage || similarProduct.images?.[0]?.url}
//                                             alt={similarProduct.name}
//                                             className="w-full h-48 object-cover rounded-lg mb-3"
//                                         />
//                                         <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{similarProduct.name}</h3>
//                                         <div className="flex items-center justify-between">
//                                             <span className="text-lg font-bold text-green-600">₹{similarProduct.price}</span>
//                                             <span className={`text-xs px-2 py-1 rounded-full ${similarProduct.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
//                                                 }`}>
//                                                 {similarProduct.stockStatus}
//                                             </span>
//                                         </div>
//                                     </Link>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}
//             </div>
//             <BuyRequestModal
//                 product={product}
//                 quantity={quantity}
//                 isOpen={showBuyModal}
//                 onClose={() => setShowBuyModal(false)}
//                 onSuccess={handleBuySuccess}
//             />
//         </div>
//     );
// };

// export default ProductDetail;


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
    MapPin, AlertCircle, Check
} from 'lucide-react';
import { updateCartCount } from '../redux/slice/cartSlice';

const ProductDetail = () => {
    // ================= LOGIC SECTION (Kept 100% same) =================
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

    useEffect(() => {
        fetchProduct();
        if (user) {
            checkUserReview();
        }
    }, [productId, user]);

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
        if (!user) {
            toast.error('Please login to add items', { icon: '🔒' });
            navigate('/login');
            return;
        }
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
        if (!user) { navigate('/login'); return; }
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
        if (!userReview || !user) return;
        try {
            await axiosClient.delete(`/products/${productId}/reviews/${userReview._id}`);
            toast.success('Review deleted');
            fetchProduct();
            setUserReview(null);
        } catch (error) {
            toast.error('Failed to delete review');
        }
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

    // ================= STYLES & RENDERING START =================

    // Shared Styling Constants
    const glassCard = "bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl overflow-hidden";
    const glassInput = "bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none backdrop-blur-sm";

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                <Link to="/" className="text-blue-600 hover:underline">Return Home</Link>
            </div>
        </div>
    );

    const images = getImages();
    const discount = product?.comparePrice > product?.price
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    // Review Modal Render
    const renderReviewModal = () => (
        <AnimatePresence>
            {showReviewForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setShowReviewForm(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className={`relative w-full max-w-lg ${glassCard} p-8 z-10`}
                    >
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Rate this Product</h3>

                        <div className="flex justify-center gap-2 mb-8">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                    className="transform hover:scale-110 transition-transform"
                                >
                                    <Star
                                        className={`w-10 h-10 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Your Experience</label>
                            <textarea
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                className={`${glassInput} w-full p-4 h-32 resize-none`}
                                placeholder="What did you like or dislike?"
                            />
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setShowReviewForm(false)}
                                className="flex-1 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReviewSubmit}
                                disabled={reviewLoading}
                                className="flex-1 bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition-all font-medium disabled:opacity-50"
                            >
                                {reviewLoading ? 'Submitting...' : 'Post Review'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-purple-50 pb-20 font-sans text-gray-800">
            <Toaster position="bottom-center" toastOptions={{ className: '!bg-white/80 !backdrop-blur !shadow-xl !rounded-lg' }} />
            {renderReviewModal()}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <nav className="flex items-center text-sm font-medium text-gray-500 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-hide">
                        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                        <Link to="/Material_market" className="hover:text-blue-600 transition-colors">Market</Link>
                        <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
                        <span className="text-gray-900 font-semibold">{product.name}</span>
                    </nav>

                    <button
                        onClick={() => navigate('/cart')}
                        className="group flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-900 rounded-full font-semibold shadow-sm hover:shadow-md hover:bg-gray-50 border border-gray-100 transition-all w-fit self-end md:self-auto"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm">Cart</span>
                        {cartCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full group-hover:bg-blue-700 transition-colors">
                                {cartCount}
                            </span>
                        )}
                    </button>

                </div>

                <div className="grid lg:grid-cols-2 gap-10 xl:gap-14">
                    {/* Left Column: Image Gallery */}
                    <div className="space-y-6">
                        <div className={`${glassCard} p-2 aspect-[4/3] flex items-center justify-center bg-white`}>
                            <motion.img
                                key={selectedImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                src={images[selectedImage]?.url || getPrimaryImage()}
                                alt={product.name}
                                className="w-full h-full object-contain rounded-2xl cursor-zoom-in"
                            />
                            {/* {!product.inStock && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                                    <span className="px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-widest transform -rotate-12 shadow-2xl">
                                        Out of Stock
                                    </span>
                                </div>
                            )} */}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-5 gap-4">
                                {images.map((image, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all duration-200 bg-white ${selectedImage === idx ? 'border-blue-500 shadow-md scale-95' : 'border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <img src={image.url} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:sticky lg:top-8 h-fit space-y-8">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                                        {product.name}
                                    </h1>
                                    <p className="text-gray-500 font-medium">{product.category} • {product.brand || 'Generic'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 rounded-full bg-white hover:bg-gray-50 text-gray-400 hover:text-red-500 shadow-sm border border-gray-100 transition-colors">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-bold text-gray-900">{product.rating?.average?.toFixed(1) || 'New'}</span>
                                    <span className="text-gray-400 text-xs pl-1">({product.rating?.count || 0} reviews)</span>
                                </div>
                                {product.stock > 0 ? (
                                    <div className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                                        In Stock
                                    </div>
                                ) : (
                                    <span className="text-sm font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">Out of Stock</span>
                                )}
                            </div>
                        </div>

                        {/* Price & Quantity Card */}
                        <div className={`${glassCard} p-6 border-l-4 border-l-blue-600`}>
                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-4xl font-black text-gray-900">₹{product.price}</span>
                                {discount > 0 && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg text-gray-400 line-through">₹{product.comparePrice}</span>
                                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                                            {discount}% OFF
                                        </span>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-gray-500 mb-6 flex items-center">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Price inclusive of taxes. Bulk discount available  5 bags.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Qty Stepper */}
                                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-2 py-1 border border-gray-200 w-full sm:w-36 h-12">
                                    <button
                                        onClick={decrementQuantity} disabled={quantity <= 1}
                                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-bold text-gray-900 text-lg tabular-nums">{quantity}</span>
                                    <button
                                        onClick={incrementQuantity} disabled={quantity >= product.stock}
                                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={addToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1 bg-white text-gray-900 border-2 border-gray-900 rounded-xl h-12 font-bold hover:bg-gray-900 hover:text-white transition-all disabled:opacity-50"
                                >
                                    Add to Cart
                                </button>

                                <button
                                    onClick={buyNow}
                                    disabled={product.stock === 0}
                                    className="flex-[1.5] bg-blue-600 text-white rounded-xl h-12 font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>

                        {/* Features List */}
                        {product.features?.length > 0 && (
                            <ul className="space-y-3">
                                {product.features.slice(0, 4).map((feature, i) => (
                                    <li key={i} className="flex items-start text-sm text-gray-600 bg-white/60 p-3 rounded-lg border border-gray-100">
                                        <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                                        <span className="leading-snug">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-100 bg-gray-50/50">
                        {['description', 'specifications', 'delivery'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === tab
                                    ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-5 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm leading-relaxed text-gray-600"
                            >
                                {activeTab === 'description' && (
                                    <div className="space-y-4">
                                        <p>{product.description}</p>
                                        {product.sku && <p className="text-xs text-gray-400 font-mono">SKU: {product.sku}</p>}
                                    </div>
                                )}
                                {activeTab === 'specifications' && (
                                    <div className="space-y-2">
                                        {product.specifications ? (
                                            Object.entries(product.specifications).map(([key, value]) => (
                                                <div key={key} className="flex justify-between border-b border-gray-50 pb-2">
                                                    <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                    <span className="text-gray-900">{value}</span>
                                                </div>
                                            ))
                                        ) : (
                                            // Fallbacks
                                            <>
                                                {product.unit && <div className="flex justify-between border-b border-gray-50 pb-1"><span>Unit</span><span className="font-semibold text-gray-800">{product.unit}</span></div>}
                                                {product.weight && <div className="flex justify-between border-b border-gray-50 pb-1"><span>Weight</span><span className="font-semibold text-gray-800">{product.weight}</span></div>}
                                            </>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'delivery' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><Truck className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-gray-900">{product.shipping?.isFree ? 'Free Shipping' : `₹${product.shipping?.cost}`}</div>
                                                <div className="text-xs">Est. {product.shipping?.estimatedDays || '3-5 business days'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-full"><Shield className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-gray-900">{product.warranty?.period || '1 Year Warranty'}</div>
                                                <div className="text-xs">Comprehensive coverage</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 text-orange-600 rounded-full"><RefreshCw className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-gray-900">7 Day Returns</div>
                                                <div className="text-xs">No questions asked</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
                {/* Professional Ratings Section */}
                <div className="mt-20">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h2>
                        {!userReview && user && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                            >
                                Write a Review
                            </button>
                        )}
                    </div>

                    <div className="grid md:grid-cols-12 gap-10">
                        {/* Rating Stats Board */}
                        <div className={`md:col-span-4 lg:col-span-3 ${glassCard} p-6 h-fit bg-gray-50`}>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-5xl font-extrabold text-gray-900">
                                    {product.rating?.average?.toFixed(1) || '0.0'}
                                </span>
                                <div className="flex flex-col">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating?.average || 0) ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">{product.rating?.count || 0} Ratings</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = product.rating?.reviews?.filter(r => Math.round(r.rating) === star).length || 0;
                                    const percentage = product.rating?.count ? (count / product.rating.count) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center text-sm gap-3">
                                            <span className="font-bold w-3">{star}</span>
                                            <Star className="w-3 h-3 text-gray-400" />
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 w-8 text-right">{Math.round(percentage)}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Review Cards Grid */}
                        <div className="md:col-span-8 lg:col-span-9 grid gap-4">
                            {/* Current User Review Highlight */}
                            {userReview && (
                                <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-6 relative">
                                    <span className="absolute top-4 right-4 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">YOUR REVIEW</span>
                                    <div className="flex gap-4 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{user.name}</h4>
                                            <div className="flex text-yellow-500 text-xs">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < userReview.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mt-2">{userReview.comment}</p>
                                    <button onClick={handleReviewDelete} className="text-red-500 text-xs font-bold mt-4 hover:underline">Delete Review</button>
                                </div>
                            )}

                            {product.rating?.reviews?.filter(r => r.userId?._id !== user?._id).map((review, index) => (
                                <div key={review._id || index} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                                {review.userId?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900">{review.userId?.name || 'Customer'}</h4>
                                                <div className="flex items-center gap-1">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-400">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {review.userId?.email && (
                                            <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
                                                <Shield className="w-3 h-3 mr-1" /> Verified
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <div className="mt-20">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Similar Items</h2>
                            <Link to="/Material_market" className="text-blue-600 text-sm font-semibold hover:underline">View All</Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {similarProducts.map((simProduct) => (
                                <Link
                                    to={`/product/${simProduct._id}`}
                                    key={simProduct._id}
                                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group"
                                >
                                    <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
                                        <img
                                            src={simProduct.ProductImage || simProduct.images?.[0]?.url}
                                            alt={simProduct.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full px-2 py-1 text-xs font-bold text-gray-800">
                                            ★ {simProduct.rating?.average?.toFixed(1) || 'NEW'}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{simProduct.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-gray-900">₹{simProduct.price}</span>
                                            {simProduct.stock > 0
                                                ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">IN STOCK</span>
                                                : <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">SOLD OUT</span>
                                            }
                                        </div>
                                    </div>
                                </Link>
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