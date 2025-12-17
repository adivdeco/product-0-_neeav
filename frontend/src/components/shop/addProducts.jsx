import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import axiosClient from '../../api/auth';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import '@vaadin/rich-text-editor'; // Import the component definition

const AddProductForm = () => {
    // Ref for the Vaadin Editor
    const editorRef = useRef(null);

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
        isActive: true
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const { user, isAuthenticated } = useSelector((state) => state.auth);

    // --- VAADIN EDITOR LOGIC START ---
    useEffect(() => {
        const editor = editorRef.current;

        // Function to update React state when Editor changes
        const handleEditorChange = () => {
            if (editor) {
                setProductData(prev => ({
                    ...prev,
                    description: editor.htmlValue // Capture HTML format
                }));
            }
        };

        if (editor) {
            // Add listener for value changes
            editor.addEventListener('html-value-changed', handleEditorChange);

            // Set initial value if editing (optional, good for safety)
            editor.htmlValue = productData.description;
        }

        // Cleanup listener
        return () => {
            if (editor) {
                editor.removeEventListener('html-value-changed', handleEditorChange);
            }
        };
    }, []);
    // --- VAADIN EDITOR LOGIC END ---

    const categories = [
        'Cement & Concrete', 'Bricks & Blocks', 'Steel & Reinforcement',
        'Sand & Aggregates', 'Paints & Finishes', 'Tools & Equipment',
        'Plumbing', 'Electrical', 'Tiles & Sanitary', 'Hardware & Fittings', 'Other'
    ];

    const units = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter'];

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result); };
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const response = await axiosClient.post('/upload/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });
            return response.data;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) { toast.error('Please select a file first'); return; }
        setUploading(true);
        setUploadProgress(0);
        try {
            const result = await uploadToCloudinary(selectedFile);
            const cloudinaryUrl = result.imageUrl || result.url || result.data?.url;
            if (!cloudinaryUrl) throw new Error('No image URL returned from server');

            setProductData(prev => ({ ...prev, ProductImage: cloudinaryUrl }));
            setImagePreview(cloudinaryUrl);
            setSelectedFile(null);
            toast.success('Product image uploaded successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!productData.name || !productData.category || !productData.price || !productData.unit) {
                toast.error('Please fill all required fields');
                setLoading(false);
                return;
            }

            const submitData = {
                ...productData,
                weight: productData.weight === '' ? null : productData.weight,
                costPrice: productData.costPrice === '' ? null : productData.costPrice
            };

            const response = await axiosClient.post('/products/add_items', submitData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data) {
                toast.success('Product added successfully!');
                // Reset form
                setProductData({
                    name: '', description: '', category: '', brand: '', model: '',
                    size: '', weight: '', color: '', price: '', costPrice: '',
                    taxRate: 18, stock: 0, minStockLevel: 5, unit: '', supplier: '',
                    hsnCode: '', isActive: true
                });
                // Reset Editor Manually
                if (editorRef.current) { editorRef.current.htmlValue = ''; }

                setImagePreview('');
                setSelectedFile(null);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error adding product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 relative overflow-hidden" style={{ backgroundImage: "url('/login.webp')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            <Toaster position="bottom-center" />
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full filter blur-3xl animate-float"></div>
                <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full filter blur-3xl animate-pulse-medium"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-purple-900/20 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:shadow-cyan-500/10">

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white">Add New Product</h2>
                                <p className="text-white/60 mt-2">Add building materials and products to your inventory</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Image Section */}
                    <div className="px-8 py-8 border-b border-white/20">
                        <div className="flex items-center space-x-8">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border-4 border-white/30 shadow-2xl overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Product"
                                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${imagePreview ? 'hidden' : 'flex'}`}>
                                        <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>

                                <label
                                    htmlFor="product-image-upload"
                                    className="absolute bottom-2 right-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-2 rounded-full shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-cyan-500/50 group/btn"
                                >
                                    <svg className="w-5 h-5 transform transition-transform duration-300 group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                                <input
                                    id="product-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">Product Image</h3>
                                <p className="text-white/60 text-sm mb-4">
                                    JPG, GIF or PNG. Max size of 5MB.
                                </p>

                                {selectedFile && (
                                    <div className="flex items-center space-x-2 text-cyan-300 mb-4 animate-fade-in">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm">File selected: {selectedFile.name}</span>
                                    </div>
                                )}

                                {uploading && (
                                    <div className="mb-4 transform transition-all duration-500 animate-slide-up">
                                        <div className="flex justify-between text-sm text-white/80 mb-3">
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading...
                                            </span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-out shadow-lg shadow-cyan-500/25 relative"
                                                style={{ width: `${uploadProgress}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedFile && !uploading && (
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 animate-pulse-gentle"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span>Upload Image</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white border-b border-cyan-400/50 pb-2">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-3">Product Name *</label>
                                    <input type="text" name="name" value={productData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" placeholder="Enter name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-3">Category *</label>
                                    <select name="category" value={productData.category} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white bg-gray-800">
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>

                                {/* --- RICH TEXT EDITOR START --- */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-white/80 mb-3">Description</label>

                                    <div className="rounded-xl  bg-white border border-white/10 text-black">
                                        <vaadin-rich-text-editor
                                            ref={editorRef}
                                            theme="no-border"
                                            style={{ maxHeight: '300px' }}
                                            colorOptions={['#000000']}

                                        // vaadin-rich-text-editor::part(toolbar-button-color)
                                        ></vaadin-rich-text-editor>
                                    </div>
                                </div>
                                {/* --- RICH TEXT EDITOR END --- */}

                            </div>
                        </div>

                        {/* Product Details - KEPT AS IS */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white border-b border-purple-400/50 pb-2">Product Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div><label className="block text-white/80 mb-2">Brand</label><input type="text" name="brand" value={productData.brand} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">Model</label><input type="text" name="model" value={productData.model} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">Size</label><input type="text" name="size" value={productData.size} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">Weight</label><input type="number" name="weight" value={productData.weight} onChange={handleNumberInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">Color</label><input type="text" name="color" value={productData.color} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                            </div>
                        </div>

                        {/* Pricing - KEPT AS IS */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white border-b border-green-400/50 pb-2">Pricing & Inventory</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div><label className="block text-white/80 mb-2">Price *</label><input type="number" name="price" value={productData.price} onChange={handleNumberInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">Cost Price</label><input type="number" name="costPrice" value={productData.costPrice} onChange={handleNumberInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">Tax Rate</label><input type="number" name="taxRate" value={productData.taxRate} onChange={handleNumberInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div>
                                    <label className="block text-white/80 mb-2">Unit *</label>
                                    <select name="unit" value={productData.unit} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white bg-gray-800">
                                        <option value="">Select Unit</option>
                                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div><label className="block text-white/80 mb-2">Stock</label><input type="number" name="stock" value={productData.stock} onChange={handleNumberInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">Min Stock</label><input type="number" name="minStockLevel" value={productData.minStockLevel} onChange={handleNumberInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                            </div>
                        </div>

                        {/* Extra - KEPT AS IS */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white border-b border-orange-400/50 pb-2">Additional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-white/80 mb-2">Supplier</label><input type="text" name="supplier" value={productData.supplier} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">HSN Code</label><input type="text" name="hsnCode" value={productData.hsnCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input type="checkbox" name="isActive" checked={productData.isActive} onChange={handleInputChange} className="w-4 h-4 text-cyan-500 rounded" />
                                <label className="text-white/80 text-sm font-medium">Product is active</label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-white/20">
                            <button type="submit" disabled={loading} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-all">
                                {loading ? 'Adding Product...' : 'Add Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProductForm;