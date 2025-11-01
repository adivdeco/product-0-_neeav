import { useState } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../api/auth';
import { MdStar, MdStarBorder } from "react-icons/md";

const ReviewForm = ({ contractorId, onReviewAdded }) => {
    const { user } = useSelector((state) => state.auth);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError('Please login to submit a review');
            return;
        }

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            setError('Please write a review comment');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            await axiosClient.post(`/useas/${contractorId}/reviews`, {
                rating,
                comment: comment.trim()
            });

            // Reset form
            setRating(0);
            setComment('');
            setHoverRating(0);

            // Refresh contractor data
            if (onReviewAdded) {
                onReviewAdded();
            }

        } catch (error) {
            console.error('Review submission error:', error);
            setError(error.response?.data?.message || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStarRating = () => {
        return (
            <div className="flex items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className="text-2xl focus:outline-none"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        {star <= (hoverRating || rating) ? (
                            <MdStar className="text-yellow-400" />
                        ) : (
                            <MdStarBorder className="text-gray-300" />
                        )}
                    </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                    {rating > 0 ? `${rating} out of 5` : 'Select rating'}
                </span>
            </div>
        );
    };

    if (!user) {
        return (
            <div className="text-center py-4">
                <p className="text-gray-600">
                    Please <button className="text-blue-600 hover:underline">login</button> to write a review
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Star Rating */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating *
                </label>
                {renderStarRating()}
            </div>

            {/* Comment */}
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                </label>
                <textarea
                    id="comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this contractor..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    maxLength={500}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Share your honest experience</span>
                    <span>{comment.length}/500</span>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={submitting || rating === 0 || !comment.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;