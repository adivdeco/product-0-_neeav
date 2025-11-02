import { motion } from "framer-motion";
import { Star } from "lucide-react";
import ReviewForm from "./ReviewForm";

export default function ReviewSection({ contractor, activeTab, fetchContractor }) {
    if (activeTab !== "reviews") return null;

    const renderStars = (count) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={18}
                    className={`${i <= count ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        } transition-colors duration-200`}
                />
            );
        }
        return <div className="flex items-center space-x-1">{stars}</div>;
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Customer Reviews
                </h3>
                <div className="mt-1 h-1 w-16 bg-blue-500 rounded-full mx-auto md:mx-0"></div>
            </div>

            {/* Review Form */}
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Add Your Review
                </h4>
                <ReviewForm contractorId={contractor._id} onReviewAdded={fetchContractor} />
            </div>

            {/* Review List */}
            {contractor.rating?.reviews?.length > 0 ? (
                <div className="space-y-6">
                    {contractor.rating.reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                {/* User Info */}
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                                        {review.userId?.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {review.userId?.name || "Anonymous User"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {review.userId?.email ? "Verified Customer" : "Registered User"}
                                        </p>
                                    </div>
                                </div>

                                {/* Rating & Date */}
                                <div className="flex flex-col items-start sm:items-end text-gray-600">
                                    {renderStars(review.rating)}
                                    <span className="text-xs mt-1 text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                    <div className="text-6xl mb-4 text-gray-300">⭐</div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-1">
                        No reviews yet
                    </h4>
                    <p className="text-gray-500 text-sm">
                        Be the first to share your experience with this contractor!
                    </p>
                </div>
            )}
        </div>
    );
}
