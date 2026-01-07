// import React, { useState, useEffect, useRef } from 'react';
// import axiosClient from '../../api/auth';
// import { useSelector } from "react-redux";
// import { toast } from 'react-toastify';
// import { Toaster } from 'react-hot-toast';
// import '@vaadin/rich-text-editor';

// const AddProductForm = () => {
//     const editorRef = useRef(null);

//     // Added 'material' to state matching new schema
//     const [productData, setProductData] = useState({
//         name: '',
//         description: '',
//         category: '',
//         brand: '',
//         model: '',
//         material: '', // New field
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

//     const [loading, setLoading] = useState(false);
//     const [uploading, setUploading] = useState(false);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [imagePreview, setImagePreview] = useState('');
//     const [uploadProgress, setUploadProgress] = useState(0);

//     // Vaadin Editor Logic
//     useEffect(() => {
//         const editor = editorRef.current;
//         const handleEditorChange = () => {
//             if (editor) {
//                 setProductData(prev => ({
//                     ...prev,
//                     description: editor.htmlValue
//                 }));
//             }
//         };
//         if (editor) {
//             editor.addEventListener('html-value-changed', handleEditorChange);
//             editor.htmlValue = productData.description;
//         }
//         return () => {
//             if (editor) editor.removeEventListener('html-value-changed', handleEditorChange);
//         };
//     }, []);

//     const categories = [
//         'Cement & Concrete', 'Bricks & Blocks', 'Steel & Reinforcement',
//         'Sand & Aggregates', 'Paints & Finishes', 'Tools & Equipment',
//         'Plumbing', 'Electrical', 'Tiles & Sanitary', 'Hardware & Fittings', 'Other'
//     ];

//     const units = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter'];

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

//     const handleImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             if (file.size > 5 * 1024 * 1024) {
//                 toast.error('File size should be less than 5MB');
//                 return;
//             }
//             const reader = new FileReader();
//             reader.onloadend = () => { setImagePreview(reader.result); };
//             reader.readAsDataURL(file);
//             setSelectedFile(file);
//         }
//     };

//     const uploadToCloudinary = async (file) => {
//         const formData = new FormData();
//         formData.append('avatar', file);
//         try {
//             const response = await axiosClient.post('/upload/avatar', formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' },
//                 onUploadProgress: (progressEvent) => {
//                     const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
//                     setUploadProgress(progress);
//                 },
//             });
//             return response.data;
//         } catch (error) {
//             throw error;
//         }
//     };

//     const handleUpload = async () => {
//         if (!selectedFile) { toast.error('Please select a file first'); return; }
//         setUploading(true);
//         try {
//             const result = await uploadToCloudinary(selectedFile);
//             const cloudinaryUrl = result.imageUrl || result.url || result.data?.url;
//             setProductData(prev => ({ ...prev, ProductImage: cloudinaryUrl }));
//             setImagePreview(cloudinaryUrl);
//             setSelectedFile(null);
//             toast.success('Image uploaded!');
//         } catch (error) {
//             toast.error('Upload failed.');
//         } finally {
//             setUploading(false);
//             setUploadProgress(0);
//         }
//     };

//     // --- REFACTORED SUBMIT LOGIC ---
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             if (!productData.name || !productData.category || !productData.price || !productData.unit) {
//                 toast.error('Please fill all required fields');
//                 setLoading(false);
//                 return;
//             }

//             // HERE IS THE MAGIC:
//             // Transform the flat form data into the Nested Variant Structure
//             const formattedPayload = {
//                 // 1. Root Level Info
//                 name: productData.name,
//                 description: productData.description,
//                 category: productData.category,
//                 brand: productData.brand,
//                 model: productData.model,
//                 material: productData.material, // Added material
//                 taxRate: productData.taxRate,
//                 supplier: productData.supplier,
//                 hsnCode: productData.hsnCode,
//                 isActive: productData.isActive,
//                 ProductImage: productData.ProductImage,

//                 // 2. The Variants Array (Creating the first default variant)
//                 variants: [{
//                     sku: Date.now().toString(), // Auto-generate simple SKU
//                     variantName: "Standard",
//                     size: productData.size,
//                     color: productData.color,
//                     weightValue: productData.weight === '' ? 0 : productData.weight,
//                     unit: productData.unit,

//                     price: Number(productData.price),
//                     costPrice: productData.costPrice === '' ? 0 : Number(productData.costPrice),

//                     stock: Number(productData.stock),
//                     minStockLevel: Number(productData.minStockLevel)
//                 }]
//             };

//             const response = await axiosClient.post('/products/add_items', formattedPayload, {
//                 headers: { 'Content-Type': 'application/json' }
//             });

//             if (response.data) {
//                 toast.success('Product added successfully!');
//                 // Reset form
//                 setProductData({
//                     name: '', description: '', category: '', brand: '', model: '', material: '',
//                     size: '', weight: '', color: '', price: '', costPrice: '',
//                     taxRate: 18, stock: 0, minStockLevel: 5, unit: '', supplier: '',
//                     hsnCode: '', isActive: true, ProductImage: ''
//                 });
//                 if (editorRef.current) { editorRef.current.htmlValue = ''; }
//                 setImagePreview('');
//                 setSelectedFile(null);
//             }
//         } catch (error) {
//             console.error(error);
//             toast.error(error.response?.data?.message || 'Error adding product');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen py-12 relative overflow-hidden" style={{ backgroundImage: "url('/login.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
//             <Toaster position="bottom-center" />

//             {/* ... (Background Effects - Kept same) ... */}

//             <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//                 <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">

//                     {/* Header */}
//                     <div className="px-8 py-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10">
//                         <h2 className="text-3xl font-bold text-white">Add New Product</h2>
//                     </div>

//                     {/* Image Section (Kept same as your code) */}
//                     <div className="px-8 py-8 border-b border-white/20">
//                         {/* ... Your Image Upload UI ... */}
//                         <div className="flex items-center space-x-8">
//                             <div className="relative group">
//                                 <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border-4 border-white/30 shadow-2xl overflow-hidden">
//                                     {imagePreview ? (
//                                         <img src={imagePreview} alt="Product" className="w-full h-full object-cover" />
//                                     ) : (
//                                         <div className="w-full h-full flex items-center justify-center bg-gray-800">
//                                             <span className="text-white/50">Img</span>
//                                         </div>
//                                     )}
//                                 </div>
//                                 <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
//                             </div>
//                             <div className="flex-1">
//                                 <h3 className="text-white font-bold">Product Image</h3>
//                                 {selectedFile && !uploading && (
//                                     <button onClick={handleUpload} className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded">Upload Now</button>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     <form onSubmit={handleSubmit} className="p-8 space-y-8">
//                         {/* Basic Info */}
//                         <div className="space-y-6">
//                             <h3 className="text-xl font-semibold text-white border-b border-cyan-400/50 pb-2">Basic Information</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div>
//                                     <label className="block text-sm font-medium text-white/80 mb-3">Product Name *</label>
//                                     <input type="text" name="name" value={productData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-white/80 mb-3">Category *</label>
//                                     <select name="category" value={productData.category} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white">
//                                         <option value="">Select Category</option>
//                                         {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//                                     </select>
//                                 </div>
//                                 <div className="md:col-span-2">
//                                     <label className="block text-sm font-medium text-white/80 mb-3">Description</label>
//                                     <div className="rounded-xl bg-white text-black">
//                                         <vaadin-rich-text-editor ref={editorRef} theme="no-border" style={{ maxHeight: '300px' }}></vaadin-rich-text-editor>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Product Details - Updated */}
//                         <div className="space-y-6">
//                             <h3 className="text-xl font-semibold text-white border-b border-purple-400/50 pb-2">Product Details</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                 <div><label className="block text-white/80 mb-2">Brand</label><input type="text" name="brand" value={productData.brand} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                                 <div><label className="block text-white/80 mb-2">Model</label><input type="text" name="model" value={productData.model} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                                 {/* NEW MATERIAL FIELD */}
//                                 <div><label className="block text-white/80 mb-2">Material</label><input type="text" name="material" value={productData.material} onChange={handleInputChange} placeholder="e.g. Iron, PVC" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>

//                                 <div><label className="block text-white/80 mb-2">Size</label><input type="text" name="size" value={productData.size} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                                 <div><label className="block text-white/80 mb-2">Weight (kg)</label><input type="number" name="weight" value={productData.weight} onChange={handleNumberInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                                 <div><label className="block text-white/80 mb-2">Color</label><input type="text" name="color" value={productData.color} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                             </div>
//                         </div>

//                         {/* Pricing & Inventory */}
//                         <div className="space-y-6">
//                             <h3 className="text-xl font-semibold text-white border-b border-green-400/50 pb-2">Pricing & Inventory</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                                 <div><label className="block text-white/80 mb-2">Price *</label><input type="number" name="price" value={productData.price} onChange={handleNumberInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                                 <div><label className="block text-white/80 mb-2">Cost Price</label><input type="number" name="costPrice" value={productData.costPrice} onChange={handleNumberInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                                 <div>
//                                     <label className="block text-white/80 mb-2">Unit *</label>
//                                     <select name="unit" value={productData.unit} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white">
//                                         <option value="">Select Unit</option>
//                                         {units.map(u => <option key={u} value={u}>{u}</option>)}
//                                     </select>
//                                 </div>
//                                 <div><label className="block text-white/80 mb-2">Stock</label><input type="number" name="stock" value={productData.stock} onChange={handleNumberInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                                 <div><label className="block text-white/80 mb-2">Min Stock</label><input type="number" name="minStockLevel" value={productData.minStockLevel} onChange={handleNumberInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                                 <div><label className="block text-white/80 mb-2">Tax Rate (%)</label><input type="number" name="taxRate" value={productData.taxRate} onChange={handleNumberInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                             </div>
//                         </div>

//                         {/* Additional Info */}
//                         <div className="space-y-6">
//                             <h3 className="text-xl font-semibold text-white border-b border-orange-400/50 pb-2">Additional Information</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div><label className="block text-white/80 mb-2">Supplier</label><input type="text" name="supplier" value={productData.supplier} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                                 <div><label className="block text-white/80 mb-2">HSN Code</label><input type="text" name="hsnCode" value={productData.hsnCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
//                             </div>
//                             <div className="flex items-center space-x-3">
//                                 <input type="checkbox" name="isActive" checked={productData.isActive} onChange={handleInputChange} className="w-4 h-4" />
//                                 <label className="text-white/80 text-sm font-medium">Product is active</label>
//                             </div>
//                         </div>

//                         <div className="flex justify-end pt-6 border-t border-white/20">
//                             <button type="submit" disabled={loading} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-all">
//                                 {loading ? 'Adding...' : 'Add Product'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AddProductForm;



import axiosClient from '../../api/auth';
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import '@vaadin/rich-text-editor';
import React, { useState, useEffect, useRef } from 'react';

const AddProductForm = () => {
    const editorRef = useRef(null);

    // 1. General Product Data
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        category: '',
        brand: '',
        model: '',
        material: '', // New schema field
        taxRate: 18,
        supplier: '',
        hsnCode: '',
        isActive: true,
        ProductImage: ''
    });

    // 2. Shipping Data (New Schema)
    const [shippingData, setShippingData] = useState({
        isFree: false,
        cost: 0,
        estimatedDays: ''
    });

    // 3. Current Variant Input (Temporary holder before adding to list)
    const [currentVariant, setCurrentVariant] = useState({
        variantName: '',
        sku: '',
        size: '',
        color: '',
        weightValue: 0,
        unit: '',
        price: '',
        costPrice: '',
        stock: 0,
        minStockLevel: 5
    });

    // 4. List of added variants
    const [variantsList, setVariantsList] = useState([]);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    const { user } = useSelector((state) => state.auth);

    // Vaadin Editor Logic
    useEffect(() => {
        const editor = editorRef.current;
        const handleEditorChange = () => {
            if (editor) {
                setProductData(prev => ({ ...prev, description: editor.htmlValue }));
            }
        };
        if (editor) {
            editor.addEventListener('html-value-changed', handleEditorChange);
            editor.htmlValue = productData.description;
        }
        return () => {
            if (editor) editor.removeEventListener('html-value-changed', handleEditorChange);
        };
    }, []);

    const categories = [
        'Cement & Concrete', 'Bricks & Blocks', 'Steel & Reinforcement',
        'Sand & Aggregates', 'Paints & Finishes', 'Tools & Equipment',
        'Plumbing', 'Electrical', 'Tiles & Sanitary', 'Hardware & Fittings', 'Other'
    ];

    const units = ['kg', 'g', 'l', 'ml', 'pcs', 'pack', 'bag', 'ton', 'sqft', 'meter'];

    // --- Handlers ---

    // Handle General Info
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle Shipping Info
    const handleShippingChange = (e) => {
        const { name, value, type, checked } = e.target;
        setShippingData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle Variant Inputs
    const handleVariantChange = (e) => {
        const { name, value, type } = e.target;
        setCurrentVariant(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }));
    };

    // Add Variant to List
    const addVariant = () => {
        if (!currentVariant.price || !currentVariant.unit) {
            toast.error('Price and Unit are required for a variant');
            return;
        }
        setVariantsList([...variantsList, currentVariant]);
        // Reset current variant inputs
        setCurrentVariant({
            variantName: '', sku: '', size: '', color: '', weightValue: 0,
            unit: '', price: '', costPrice: '', stock: 0, minStockLevel: 5
        });
        toast.success('Variant added to list!');
    };

    // Remove Variant from List
    const removeVariant = (index) => {
        const newList = variantsList.filter((_, i) => i !== index);
        setVariantsList(newList);
    };

    // Image Upload Logic (Kept mostly same)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return toast.error('File size > 5MB');
            if (!file.type.startsWith('image/')) return toast.error('Select an image');
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await axiosClient.post('/upload/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total)),
        });
        return response.data;
    };

    const handleUpload = async () => {
        if (!selectedFile) { toast.error('Select file first'); return; }
        setUploading(true);
        try {
            const result = await uploadToCloudinary(selectedFile);
            const url = result.imageUrl || result.url || result.data?.url;
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

    // Final Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!productData.name || !productData.category) {
                toast.error('Name and Category are required');
                setLoading(false);
                return;
            }

            // Logic: If user filled inputs but didn't click "Add Variant", add it automatically
            let finalVariants = [...variantsList];
            if (finalVariants.length === 0) {
                if (currentVariant.price && currentVariant.unit) {
                    finalVariants.push(currentVariant);
                } else {
                    toast.error('Please add at least one variant (Price & Unit required)');
                    setLoading(false);
                    return;
                }
            }

            const submitData = {
                ...productData,
                shipping: shippingData,
                variants: finalVariants
            };

            const response = await axiosClient.post('/products/add_items', submitData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data) {
                toast.success('Product added successfully!');
                // Reset Form
                setProductData({
                    name: '', description: '', category: '', brand: '', model: '', material: '',
                    taxRate: 18, supplier: '', hsnCode: '', isActive: true, ProductImage: ''
                });
                setShippingData({ isFree: false, cost: 0, estimatedDays: '' });
                setVariantsList([]);
                setCurrentVariant({
                    variantName: '', sku: '', size: '', color: '', weightValue: 0,
                    unit: '', price: '', costPrice: '', stock: 0, minStockLevel: 5
                });
                if (editorRef.current) editorRef.current.htmlValue = '';
                setImagePreview('');
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
            {/* Background effects kept same */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full filter blur-3xl animate-float"></div>
                <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full filter blur-3xl animate-pulse-medium"></div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-purple-900/20 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:shadow-cyan-500/10">

                    <div className="px-8 py-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10">
                        <h2 className="text-3xl font-bold text-white">Add New Product</h2>
                        <p className="text-white/60 mt-2">Manage inventory with variants support</p>
                    </div>

                    {/* Image Upload Section (Kept exact same) */}
                    <div className="px-8 py-8 border-b border-white/20">
                        <div className="flex items-center space-x-8">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border-4 border-white/30 shadow-2xl overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Product" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                            <svg className="w-8 h-8 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <label htmlFor="product-image-upload" className="absolute bottom-2 right-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-2 rounded-full shadow-2xl cursor-pointer hover:scale-110">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </label>
                                <input id="product-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">Product Image</h3>
                                {selectedFile && !uploading && (
                                    <button onClick={handleUpload} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold">Upload Image</button>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* 1. Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white border-b border-cyan-400/50 pb-2">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-3">Product Name *</label>
                                    <input type="text" name="name" value={productData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" placeholder="e.g. UltraTech Cement" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-3">Category *</label>
                                    <select name="category" value={productData.category} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white bg-gray-800">
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-white/80 mb-3">Description</label>
                                    <div className="rounded-xl bg-white border border-white/10 text-black">
                                        <vaadin-rich-text-editor ref={editorRef} theme="no-border" style={{ maxHeight: '300px' }}></vaadin-rich-text-editor>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Global Details (Brand, Model, Material) */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white border-b border-purple-400/50 pb-2">Product Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div><label className="block text-white/80 mb-2">Brand</label><input type="text" name="brand" value={productData.brand} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">Model</label><input type="text" name="model" value={productData.model} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">Material</label><input type="text" name="material" value={productData.material} onChange={handleInputChange} placeholder="e.g. Steel, PVC" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                            </div>
                        </div>

                        {/* 3. Variants Section - CHANGED to support List */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-green-400/50 pb-2">
                                <h3 className="text-xl font-semibold text-white">Pricing & Variants</h3>
                                <span className="text-sm text-white/60">Add different sizes/prices</span>
                            </div>

                            {/* Variant Input Fields */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h4 className="text-white font-medium mb-4">Add New Variant</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                    <div className="md:col-span-2"><label className="block text-white/60 text-xs mb-1">Variant Name (Optional)</label><input type="text" name="variantName" placeholder="e.g. Small Pack" value={currentVariant.variantName} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" /></div>
                                    <div><label className="block text-white/60 text-xs mb-1">SKU</label><input type="text" name="sku" value={currentVariant.sku} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" /></div>
                                    <div><label className="block text-white/60 text-xs mb-1">Tax Rate %</label><input type="number" name="taxRate" value={productData.taxRate} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                                    <div><label className="block text-cyan-300 text-xs mb-1">Price *</label><input type="number" name="price" value={currentVariant.price} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/20 border border-cyan-500/50 rounded-lg text-white" /></div>
                                    <div><label className="block text-cyan-300 text-xs mb-1">Unit *</label>
                                        <select name="unit" value={currentVariant.unit} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/20 border border-cyan-500/50 rounded-lg text-white bg-gray-900">
                                            <option value="">Select</option>
                                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="block text-white/60 text-xs mb-1">Size</label><input type="text" name="size" value={currentVariant.size} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" /></div>
                                    <div><label className="block text-white/60 text-xs mb-1">Color</label><input type="text" name="color" value={currentVariant.color} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" /></div>
                                    <div><label className="block text-white/60 text-xs mb-1">Weight</label><input type="number" name="weightValue" value={currentVariant.weightValue} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div><label className="block text-white/60 text-xs mb-1">Stock</label><input type="number" name="stock" value={currentVariant.stock} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" /></div>
                                    <div><label className="block text-white/60 text-xs mb-1">Min Stock</label><input type="number" name="minStockLevel" value={currentVariant.minStockLevel} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" /></div>
                                    <div><label className="block text-white/60 text-xs mb-1">Cost Price</label><input type="number" name="costPrice" value={currentVariant.costPrice} onChange={handleVariantChange} className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white" /></div>
                                    <div className="flex items-end">
                                        <button type="button" onClick={addVariant} className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-semibold">
                                            + Add This Variant
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Added Variants List */}
                            {variantsList.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-white/80">
                                        <thead className="text-xs text-white uppercase bg-white/10">
                                            <tr>
                                                <th className="px-4 py-3">Variant/Size</th>
                                                <th className="px-4 py-3">Price</th>
                                                <th className="px-4 py-3">Stock</th>
                                                <th className="px-4 py-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {variantsList.map((variant, index) => (
                                                <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                                                    <td className="px-4 py-3 font-medium text-white">{variant.variantName || variant.size || 'Standard'} ({variant.unit})</td>
                                                    <td className="px-4 py-3">{variant.price}</td>
                                                    <td className="px-4 py-3">{variant.stock}</td>
                                                    <td className="px-4 py-3">
                                                        <button type="button" onClick={() => removeVariant(index)} className="text-red-400 hover:text-red-300">Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* 4. Shipping & Extra Info */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white border-b border-orange-400/50 pb-2">Shipping & Extras</h3>

                            {/* Shipping Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div><label className="block text-white/80 mb-2">Shipping Cost</label><input type="number" name="cost" value={shippingData.cost} onChange={handleShippingChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">Est. Delivery (Days)</label><input type="text" name="estimatedDays" value={shippingData.estimatedDays} onChange={handleShippingChange} placeholder="e.g. 2-3 Days" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div className="flex items-center space-x-3 pt-8">
                                    <input type="checkbox" name="isFree" checked={shippingData.isFree} onChange={handleShippingChange} className="w-5 h-5 text-cyan-500 rounded" />
                                    <label className="text-white/80 font-medium">Free Shipping</label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div><label className="block text-white/80 mb-2">Supplier</label><input type="text" name="supplier" value={productData.supplier} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                                <div><label className="block text-white/80 mb-2">HSN Code</label><input type="text" name="hsnCode" value={productData.hsnCode} onChange={handleInputChange} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" /></div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <input type="checkbox" name="isActive" checked={productData.isActive} onChange={handleInputChange} className="w-5 h-5 text-cyan-500 rounded" />
                                <label className="text-white/80 font-medium">Product is active</label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-white/20">
                            <button type="submit" disabled={loading} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/20">
                                {loading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProductForm;










// ==========================================
// PUBLIC / CUSTOMER ROUTES
// ==========================================

// Get all active products for customers
ProductRouter.get('/public/products', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            search,
            minPrice,
            maxPrice,
            brand,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            inStock = true
        } = req.query;

        const filter = { isActive: true };

        // Stock Filter: Check if Total Stock > 0
        if (inStock === 'true') {
            filter['variants.stock'] = { $gt: 0 }; // At least one variant has stock
        }

        if (category) filter.category = category;
        if (brand) filter.brand = { $regex: brand, $options: 'i' };

        // Search
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { 'variants.variantName': { $regex: search, $options: 'i' } }
            ];
        }

        // Price Filter (Variants)
        if (minPrice || maxPrice) {
            filter['variants.price'] = {};
            if (minPrice) filter['variants.price'].$gte = Number(minPrice);
            if (maxPrice) filter['variants.price'].$lte = Number(maxPrice);
        }

        const skip = (page - 1) * limit;
        const sort = {};
        if (sortBy === 'price') {
            // Sort by min price found in variants
            sort['variants.price'] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        const products = await Product.find(filter)
            .populate('shopId', 'name address rating contact')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const productsWithDetails = products.map(product => {
            // Determine display price (e.g., lowest price among variants)
            const prices = product.variants.map(v => v.price);
            const minP = prices.length > 0 ? Math.min(...prices) : 0;
            const maxP = prices.length > 0 ? Math.max(...prices) : 0;

            return {
                ...product.toObject(),
                displayPrice: minP === maxP ? minP : `${minP} - ${maxP}`, // For UI to show "100 - 200"
                totalStock: product.totalStock,
                stockStatus: product.stockStatus,
                shopName: product.shopId?.name,
                shopRating: product.shopId?.rating
            };
        });

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        // Calculate Global Min/Max Price for UI Filters
        // We need aggregation to unwind variants and find absolute min/max
        const priceAgg = await Product.aggregate([
            { $match: { isActive: true } },
            { $unwind: "$variants" },
            {
                $group: {
                    _id: null,
                    min: { $min: "$variants.price" },
                    max: { $max: "$variants.price" }
                }
            }
        ]);

        res.status(200).json({
            message: "Products retrieved successfully",
            products: productsWithDetails,
            pagination: {
                currentPage: Number(page),
                totalPages,
                totalProducts,
                limit: Number(limit)
            },
            filters: {
                categories: await Product.distinct('category', { isActive: true }),
                brands: await Product.distinct('brand', { isActive: true, brand: { $ne: null } }),
                priceRange: priceAgg.length > 0 ? { min: priceAgg[0].min, max: priceAgg[0].max } : { min: 0, max: 0 }
            }
        });

    } catch (error) {
        console.error("Error in fetching products:", error);
        res.status(500).json({ message: "Error in fetching products", error: error.message });
    }
});

// Get single product public details
ProductRouter.get('/public/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({ _id: productId, isActive: true })
            .populate('shopId', 'name address rating contact ownerId')
            .populate('rating.reviews.userId', 'name avatar');

        if (!product) return res.status(404).json({ message: "Product not found" });

        // Similar Products Logic
        const similarProducts = await Product.find({
            category: product.category,
            isActive: true,
            _id: { $ne: productId },
            'variants.stock': { $gt: 0 } // Check variant stock
        })
            .populate('shopId', 'name rating')
            .limit(4);

        res.status(200).json({
            message: "Product retrieved successfully",
            product: {
                ...product.toObject(),
                totalStock: product.totalStock,
                stockStatus: product.stockStatus
            },
            similarProducts
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
});

// Reviews logic remains the same (No schema changes affected this part)
// ... (Your existing review routes: POST and DELETE reviews can remain exactly as they were) ...

module.exports = ProductRouter;