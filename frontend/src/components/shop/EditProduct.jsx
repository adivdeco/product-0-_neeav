// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router';
// import axiosClient from '../../api/auth';
// import { useSelector } from "react-redux";
// import { toast } from 'react-toastify';
// import { Toaster } from 'react-hot-toast';

// const EditProduct = () => {
//     const { productId } = useParams();
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [updating, setUpdating] = useState(false);
//     const [productData, setProductData] = useState({
//         name: '',
//         description: '',
//         category: '',
//         brand: '',
//         model: '',
//         size: '',
//         weight: '',
//         color: '',
//         price: '',
//         costPrice: '',
//         taxRate: 18,
//         stock: 0,
//         minStockLevel: 5,
//         unit: '',
//         supplier: '',
//         hsnCode: '',
//         isActive: true,
//         ProductImage: ''
//     });

//     const categories = [
//         'Cement & Concrete',
//         'Bricks & Blocks',
//         'Steel & Reinforcement',
//         'Sand & Aggregates',
//         'Paints & Finishes',
//         'Tools & Equipment',
//         'Plumbing',
//         'Electrical',
//         'Tiles & Sanitary',
//         'Hardware & Fittings',
//         'Other'
//     ];

//     const units = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter'];

//     useEffect(() => {
//         fetchProduct();
//     }, [productId]);

//     const fetchProduct = async () => {
//         try {
//             setLoading(true);
//             const response = await axiosClient.get(`/products/${productId}`);
//             setProductData(response.data.product);
//         } catch (error) {
//             console.error('Error fetching product:', error);
//             toast.error('Failed to load product');
//             navigate('/allProduct');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;

//         setProductData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     const handleNumberInputChange = (e) => {
//         const { name, value } = e.target;

//         setProductData(prev => ({
//             ...prev,
//             [name]: value === '' ? '' : Number(value)
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setUpdating(true);

//         try {
//             await axiosClient.put(`/products/${productId}`, productData);
//             toast.success('Product updated successfully!');
//             navigate('/allProduct');
//         } catch (error) {
//             console.error('Error updating product:', error);

//             if (error.response?.data?.message) {
//                 toast.error(error.response.data.message);
//             } else if (error.response?.data?.errors) {
//                 error.response.data.errors.forEach(err => toast.error(err));
//             } else {
//                 toast.error('Failed to update product');
//             }
//         } finally {
//             setUpdating(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 py-8">
//             <Toaster position="top-right" />

//             <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//                 {/* Header */}
//                 <div className="mb-8">
//                     <div className="flex justify-between items-center">
//                         <div>
//                             <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
//                             <p className="text-gray-600 mt-2">Update product information</p>
//                         </div>
//                         <button
//                             onClick={() => navigate('/allProduct')}
//                             className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
//                         >
//                             ← Back to Products
//                         </button>
//                     </div>
//                 </div>

//                 {/* Edit Form */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         {/* Basic Information */}
//                         <div className="space-y-4">
//                             <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Product Name *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="name"
//                                         value={productData.name}
//                                         onChange={handleInputChange}
//                                         required
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Category *
//                                     </label>
//                                     <select
//                                         name="category"
//                                         value={productData.category}
//                                         onChange={handleInputChange}
//                                         required
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     >
//                                         <option value="">Select Category</option>
//                                         {categories.map(cat => (
//                                             <option key={cat} value={cat}>{cat}</option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 <div className="md:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Description
//                                     </label>
//                                     <textarea
//                                         name="description"
//                                         value={productData.description}
//                                         onChange={handleInputChange}
//                                         rows="3"
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Product Details */}
//                         <div className="space-y-4">
//                             <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Brand
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="brand"
//                                         value={productData.brand}
//                                         onChange={handleInputChange}
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Model
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="model"
//                                         value={productData.model}
//                                         onChange={handleInputChange}
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Size
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="size"
//                                         value={productData.size}
//                                         onChange={handleInputChange}
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Weight (kg)
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="weight"
//                                         value={productData.weight}
//                                         onChange={handleNumberInputChange}
//                                         step="0.01"
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Color
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="color"
//                                         value={productData.color}
//                                         onChange={handleInputChange}
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Pricing & Inventory */}
//                         <div className="space-y-4">
//                             <h3 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Selling Price *
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="price"
//                                         value={productData.price}
//                                         onChange={handleNumberInputChange}
//                                         required
//                                         step="0.01"
//                                         min="0"
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Cost Price
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="costPrice"
//                                         value={productData.costPrice}
//                                         onChange={handleNumberInputChange}
//                                         step="0.01"
//                                         min="0"
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Tax Rate (%)
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="taxRate"
//                                         value={productData.taxRate}
//                                         onChange={handleNumberInputChange}
//                                         min="0"
//                                         max="100"
//                                         step="0.01"
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Unit *
//                                     </label>
//                                     <select
//                                         name="unit"
//                                         value={productData.unit}
//                                         onChange={handleInputChange}
//                                         required
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     >
//                                         <option value="">Select Unit</option>
//                                         {units.map(unit => (
//                                             <option key={unit} value={unit}>{unit}</option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Stock Quantity
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="stock"
//                                         value={productData.stock}
//                                         onChange={handleNumberInputChange}
//                                         min="0"
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Min Stock Level
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="minStockLevel"
//                                         value={productData.minStockLevel}
//                                         onChange={handleNumberInputChange}
//                                         min="0"
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Additional Information */}
//                         <div className="space-y-4">
//                             <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Supplier
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="supplier"
//                                         value={productData.supplier}
//                                         onChange={handleInputChange}
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         HSN Code
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="hsnCode"
//                                         value={productData.hsnCode}
//                                         onChange={handleInputChange}
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
//                                     />
//                                 </div>
//                             </div>

//                             <div className="flex items-center space-x-3">
//                                 <input
//                                     type="checkbox"
//                                     name="isActive"
//                                     checked={productData.isActive}
//                                     onChange={handleInputChange}
//                                     className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
//                                 />
//                                 <label className="text-sm font-medium text-gray-700">
//                                     Product is active and available for sale
//                                 </label>
//                             </div>
//                         </div>

//                         {/* Submit Buttons */}
//                         <div className="flex space-x-3 pt-6 border-t">
//                             <button
//                                 type="button"
//                                 onClick={() => navigate('/products')}
//                                 className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition duration-150"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={updating}
//                                 className="flex-1 py-3 px-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition duration-150 disabled:opacity-50"
//                             >
//                                 {updating ? "Updating..." : "Update Product"}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EditProduct; v








import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import axiosClient from '../../api/auth';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import '@vaadin/rich-text-editor';
import { ArrowLeft, Upload, Save, Image as ImageIcon, Loader, Plus, Trash2, Edit2, X } from 'lucide-react';

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);

    // --- Loading States ---
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // --- Data States ---
    // 1. Core Product Data
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        category: '',
        brand: '',
        model: '',
        material: '',
        taxRate: 18,
        supplier: '',
        hsnCode: '',
        isActive: true,
        ProductImage: ''
    });

    // 2. Shipping Data
    const [shippingData, setShippingData] = useState({
        isFree: false,
        cost: 0,
        estimatedDays: ''
    });

    // 3. Variants Management
    const [variantsList, setVariantsList] = useState([]);
    const [currentVariant, setCurrentVariant] = useState({
        variantName: '',
        sku: '',
        size: '',
        color: '',
        weightValue: 0,
        unit: 'pcs',
        price: '',
        costPrice: '',
        stock: 0,
        minStockLevel: 5
    });
    const [editingVariantIndex, setEditingVariantIndex] = useState(null); // Index of variant being edited

    // 4. Image Handling
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const categories = [
        'Cement & Concrete', 'Bricks & Blocks', 'Steel & Reinforcement',
        'Sand & Aggregates', 'Paints & Finishes', 'Tools & Equipment',
        'Plumbing', 'Electrical', 'Tiles & Sanitary', 'Hardware & Fittings', 'Other'
    ];
    const units = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter'];

    // --- 1. Fetch Product Data ---
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/products/public/products/${productId}`);
                const data = response.data.product;

                // Populate State
                setProductData({
                    name: data.name || '',
                    description: data.description || '',
                    category: data.category || '',
                    brand: data.brand || '',
                    model: data.model || '',
                    material: data.material || '',
                    taxRate: data.taxRate || 18,
                    supplier: data.supplier || '',
                    hsnCode: data.hsnCode || '',
                    isActive: data.isActive,
                    ProductImage: data.ProductImage || ''
                });

                if (data.shipping) {
                    setShippingData({
                        isFree: data.shipping.isFree || false,
                        cost: data.shipping.cost || 0,
                        estimatedDays: data.shipping.estimatedDays || ''
                    });
                }

                if (data.variants && Array.isArray(data.variants)) {
                    setVariantsList(data.variants);
                }

                if (data.ProductImage) setImagePreview(data.ProductImage);

                // Set Description in Editor
                if (editorRef.current) {
                    editorRef.current.htmlValue = data.description || '';
                }

            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Failed to load product');
                navigate('/allProduct');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, navigate]);

    // Vaadin Editor Listener
    useEffect(() => {
        const editor = editorRef.current;
        const handleEditorChange = () => {
            if (editor) {
                setProductData(prev => ({ ...prev, description: editor.htmlValue }));
            }
        };
        if (editor) {
            editor.addEventListener('html-value-changed', handleEditorChange);
            // Re-set value if loading finished and editor exists
            if(productData.description) editor.htmlValue = productData.description;
        }
        return () => {
            if (editor) editor.removeEventListener('html-value-changed', handleEditorChange);
        };
    }, [loading]); // Re-run when loading finishes

    // --- 2. Handlers ---

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleShippingChange = (e) => {
        const { name, value, type, checked } = e.target;
        setShippingData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // --- 3. Variant Handlers ---

    const handleVariantChange = (e) => {
        const { name, value, type } = e.target;
        setCurrentVariant(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }));
    };

    const addOrUpdateVariant = () => {
        // Validation
        if (!currentVariant.price || !currentVariant.unit) {
            toast.error('Price and Unit are required');
            return;
        }
        if (!currentVariant.variantName && !currentVariant.size) {
            toast.error('Variant Name or Size is required');
            return;
        }

        const newVariants = [...variantsList];
        
        if (editingVariantIndex !== null) {
            // Update Existing
            newVariants[editingVariantIndex] = currentVariant;
            toast.success('Variant updated');
        } else {
            // Add New
            newVariants.push(currentVariant);
            toast.success('Variant added');
        }

        setVariantsList(newVariants);
        resetVariantForm();
    };

    const editVariant = (index) => {
        setCurrentVariant(variantsList[index]);
        setEditingVariantIndex(index);
        // Scroll to form
        document.getElementById('variant-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const deleteVariant = (index) => {
        if(!window.confirm("Are you sure you want to remove this variant?")) return;
        const newVariants = variantsList.filter((_, i) => i !== index);
        setVariantsList(newVariants);
        if (editingVariantIndex === index) resetVariantForm();
    };

    const resetVariantForm = () => {
        setEditingVariantIndex(null);
        setCurrentVariant({
            variantName: '', sku: '', size: '', color: '', weightValue: 0,
            unit: 'pcs', price: '', costPrice: '', stock: 0, minStockLevel: 5
        });
    };

    // --- 4. Image Upload ---

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return toast.error('Max file size is 5MB');
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return toast.error('Select a file first');
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', selectedFile);
            
            const response = await axiosClient.post('/upload/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total)),
            });

            const url = response.data.imageUrl || response.data.url;
            setProductData(prev => ({ ...prev, ProductImage: url }));
            setImagePreview(url);
            setSelectedFile(null);
            toast.success('Image uploaded!');
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // --- 5. Final Submit ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (selectedFile) {
            toast.error('Please upload the selected image before saving.');
            return;
        }
        if (variantsList.length === 0) {
            toast.error('Please add at least one variant.');
            return;
        }

        setUpdating(true);
        try {
            const submitData = {
                ...productData,
                shipping: shippingData,
                variants: variantsList
            };

            await axiosClient.put(`/products/${productId}`, submitData);
            toast.success('Product updated successfully!');
            setTimeout(() => navigate('/allProduct'), 1000);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <Loader className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen py-12 relative overflow-hidden" style={{ backgroundImage: "url('/login.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <Toaster position="top-right" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-purple-900/40 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Edit Product</h1>
                        <p className="text-white/60 mt-1">Updating <span className="text-cyan-400">{productData.name}</span></p>
                    </div>
                    <button onClick={() => navigate('/allProduct')} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all border border-white/10">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                </div>

                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
                    
                    {/* Image Section */}
                    <div className="p-8 border-b border-white/10 bg-black/20 flex flex-col md:flex-row gap-8 items-center">
                        <div className="relative group w-32 h-32 shrink-0">
                            <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 bg-gray-800">
                                
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/30"><ImageIcon className="w-8 h-8" /></div>
                                )}
                            </div>
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-bold rounded-2xl">
                                Change
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                        <div className="flex-1 w-full">
                            <h3 className="text-lg font-semibold text-white">Product Image</h3>
                            {selectedFile ? (
                                <div className="mt-3 flex items-center gap-4">
                                    <span className="text-cyan-300 text-sm">{selectedFile.name}</span>
                                    <button onClick={handleUpload} disabled={uploading} className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm flex items-center gap-2 transition-all">
                                        {uploading ? <Loader className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} Upload
                                    </button>
                                </div>
                            ) : (
                                <p className="text-white/50 text-sm mt-1">Click the image to select a new file.</p>
                            )}
                            {uploading && <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-cyan-500 transition-all duration-300" style={{width: `${uploadProgress}%`}}></div></div>}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-10">
                        
                        {/* 1. Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white/90 border-b border-white/10 pb-2">Basic Info</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">Product Name *</label>
                                    <input type="text" name="name" value={productData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">Category *</label>
                                    <select name="category" value={productData.category} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white bg-gray-900 focus:border-cyan-500 outline-none">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm text-white/70">Description</label>
                                    <div className="bg-white rounded-xl overflow-hidden text-black">
                                        <vaadin-rich-text-editor ref={editorRef} theme="no-border" style={{ maxHeight: '300px' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Details & Specs */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white/90 border-b border-white/10 pb-2">Specifications</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                {['Brand', 'Model', 'Material'].map(field => (
                                    <div key={field} className="space-y-2">
                                        <label className="text-sm text-white/70">{field}</label>
                                        <input type="text" name={field.toLowerCase()} value={productData[field.toLowerCase()]} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-500 outline-none" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Variants Management */}
                        <div className="space-y-6" id="variant-form">
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                <h3 className="text-xl font-semibold text-white/90">Variants</h3>
                                {editingVariantIndex !== null && (
                                    <button type="button" onClick={resetVariantForm} className="text-xs text-red-400 flex items-center gap-1"><X className="w-3 h-3" /> Cancel Edit</button>
                                )}
                            </div>

                            {/* Add/Edit Form */}
                            <div className={`p-6 rounded-2xl border transition-all ${editingVariantIndex !== null ? 'bg-cyan-900/20 border-cyan-500/50' : 'bg-white/5 border-white/10'}`}>
                                <h4 className="text-white font-medium mb-4">{editingVariantIndex !== null ? 'Edit Variant' : 'Add New Variant'}</h4>
                                <div className="grid md:grid-cols-4 gap-4 mb-4">
                                    <div className="md:col-span-2"><input type="text" name="variantName" placeholder="Name (e.g. Small Pack)" value={currentVariant.variantName} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm" /></div>
                                    <div><input type="text" name="sku" placeholder="SKU" value={currentVariant.sku} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm" /></div>
                                    <div><input type="text" name="size" placeholder="Size" value={currentVariant.size} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm" /></div>
                                </div>
                                <div className="grid md:grid-cols-5 gap-4 mb-4">
                                    <div><label className="text-xs text-cyan-300 block mb-1">Price *</label><input type="number" name="price" value={currentVariant.price} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/30 border border-cyan-500/50 rounded-lg text-white text-sm" /></div>
                                    <div><label className="text-xs text-cyan-300 block mb-1">Unit *</label><select name="unit" value={currentVariant.unit} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/30 border border-cyan-500/50 rounded-lg text-white text-sm bg-gray-900">{units.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
                                    <div><label className="text-xs text-white/50 block mb-1">Stock</label><input type="number" name="stock" value={currentVariant.stock} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm" /></div>
                                    <div><label className="text-xs text-white/50 block mb-1">Cost</label><input type="number" name="costPrice" value={currentVariant.costPrice} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm" /></div>
                                    <div className="flex items-end">
                                        <button type="button" onClick={addOrUpdateVariant} className={`w-full py-2 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 ${editingVariantIndex !== null ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-green-600 hover:bg-green-500'}`}>
                                            {editingVariantIndex !== null ? <><Save className="w-4 h-4"/> Update</> : <><Plus className="w-4 h-4"/> Add</>}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Variants List Table */}
                            {variantsList.length > 0 && (
                                <div className="overflow-x-auto border border-white/10 rounded-xl">
                                    <table className="w-full text-sm text-left text-white/80">
                                        <thead className="text-xs uppercase bg-white/10 text-white">
                                            <tr>
                                                <th className="px-4 py-3">Variant</th>
                                                <th className="px-4 py-3">Price</th>
                                                <th className="px-4 py-3">Stock</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variantsList.map((variant, index) => (
                                                <tr key={index} className={`border-b border-white/5 hover:bg-white/5 transition ${editingVariantIndex === index ? 'bg-cyan-900/20' : ''}`}>
                                                    <td className="px-4 py-3 font-medium text-white">{variant.variantName || variant.size} <span className="text-white/40 text-xs">({variant.unit})</span></td>
                                                    <td className="px-4 py-3 text-green-400">₹{variant.price}</td>
                                                    <td className="px-4 py-3">{variant.stock}</td>
                                                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                        <button type="button" onClick={() => editVariant(index)} className="p-1.5 hover:bg-white/10 rounded text-cyan-400 transition"><Edit2 className="w-4 h-4" /></button>
                                                        <button type="button" onClick={() => deleteVariant(index)} className="p-1.5 hover:bg-white/10 rounded text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* 4. Shipping & Extras */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white/90 border-b border-white/10 pb-2">Shipping & Settings</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">Shipping Cost</label>
                                    <input type="number" name="cost" value={shippingData.cost} onChange={handleShippingChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">Est. Delivery Days</label>
                                    <input type="text" name="estimatedDays" value={shippingData.estimatedDays} onChange={handleShippingChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                                </div>
                                <div className="flex items-center pt-8">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" name="isFree" checked={shippingData.isFree} onChange={handleShippingChange} className="w-5 h-5 rounded text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-500" />
                                        <span className="text-white/90 font-medium">Free Shipping</span>
                                    </label>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-white/70">Supplier</label>
                                    <input type="text" name="supplier" value={productData.supplier} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none" />
                                </div>
                                <div className="flex items-center pt-8">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" name="isActive" checked={productData.isActive} onChange={handleInputChange} className="w-5 h-5 rounded text-green-500 bg-gray-700 border-gray-600 focus:ring-green-500" />
                                        <span className="text-white/90 font-medium">Product is Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-8 border-t border-white/10">
                            <button type="button" onClick={() => navigate('/allProduct')} className="flex-1 py-4 bg-transparent border border-white/20 text-white rounded-xl font-semibold hover:bg-white/5 transition-all">Cancel</button>
                            <button type="submit" disabled={updating || uploading} className="flex-[2] py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                {updating ? <><Loader className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;




