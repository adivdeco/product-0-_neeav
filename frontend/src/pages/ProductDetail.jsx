import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import axiosClient from '../api/auth';
import { toast } from 'react-toastify';

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/public/products/${productId}`);
            setProduct(response.data.product);
            setSimilarProducts(response.data.similarProducts);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = () => {
        toast.success(`Added ${quantity} ${product.name} to cart!`);
    };

    const buyNow = () => {
        toast.success(`Proceeding to buy ${quantity} ${product.name}`);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Product details implementation */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    {/* Add full product details here */}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;