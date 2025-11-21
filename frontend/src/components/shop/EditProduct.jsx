import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from '../../api/auth';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        category: '',
        brand: '',
        model: '',
        size: '',
        weight: '',
        color: '',
        price: '',
        costPrice: '',
        taxRate: 18,
        stock: 0,
        minStockLevel: 5,
        unit: '',
        supplier: '',
        hsnCode: '',
        isActive: true,
        ProductImage: ''
    });

    const categories = [
        'Cement & Concrete',
        'Bricks & Blocks',
        'Steel & Reinforcement',
        'Sand & Aggregates',
        'Paints & Finishes',
        'Tools & Equipment',
        'Plumbing',
        'Electrical',
        'Tiles & Sanitary',
        'Hardware & Fittings',
        'Other'
    ];

    const units = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter'];

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/products/${productId}`);
            setProductData(response.data.product);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
            navigate('/allProduct');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setProductData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNumberInputChange = (e) => {
        const { name, value } = e.target;

        setProductData(prev => ({
            ...prev,
            [name]: value === '' ? '' : Number(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            await axiosClient.put(`/products/${productId}`, productData);
            toast.success('Product updated successfully!');
            navigate('/allProduct');
        } catch (error) {
            console.error('Error updating product:', error);

            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.data?.errors) {
                error.response.data.errors.forEach(err => toast.error(err));
            } else {
                toast.error('Failed to update product');
            }
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Toaster position="top-right" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
                            <p className="text-gray-600 mt-2">Update product information</p>
                        </div>
                        <button
                            onClick={() => navigate('/allProduct')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
                        >
                            ← Back to Products
                        </button>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={productData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={productData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={productData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Brand
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={productData.brand}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Model
                                    </label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={productData.model}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Size
                                    </label>
                                    <input
                                        type="text"
                                        name="size"
                                        value={productData.size}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={productData.weight}
                                        onChange={handleNumberInputChange}
                                        step="0.01"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Color
                                    </label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={productData.color}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Selling Price *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={productData.price}
                                        onChange={handleNumberInputChange}
                                        required
                                        step="0.01"
                                        min="0"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cost Price
                                    </label>
                                    <input
                                        type="number"
                                        name="costPrice"
                                        value={productData.costPrice}
                                        onChange={handleNumberInputChange}
                                        step="0.01"
                                        min="0"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tax Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="taxRate"
                                        value={productData.taxRate}
                                        onChange={handleNumberInputChange}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Unit *
                                    </label>
                                    <select
                                        name="unit"
                                        value={productData.unit}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    >
                                        <option value="">Select Unit</option>
                                        {units.map(unit => (
                                            <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={productData.stock}
                                        onChange={handleNumberInputChange}
                                        min="0"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min Stock Level
                                    </label>
                                    <input
                                        type="number"
                                        name="minStockLevel"
                                        value={productData.minStockLevel}
                                        onChange={handleNumberInputChange}
                                        min="0"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Supplier
                                    </label>
                                    <input
                                        type="text"
                                        name="supplier"
                                        value={productData.supplier}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        HSN Code
                                    </label>
                                    <input
                                        type="text"
                                        name="hsnCode"
                                        value={productData.hsnCode}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={productData.isActive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Product is active and available for sale
                                </label>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex space-x-3 pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => navigate('/products')}
                                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updating}
                                className="flex-1 py-3 px-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition duration-150 disabled:opacity-50"
                            >
                                {updating ? "Updating..." : "Update Product"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;