import React, { useState, useEffect } from 'react';
import Navbar from './home/navbar';
import axiosClient from '../api/auth';
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import ImgUpload from './admin/ImgUpload';

const ShopProfileUpdate = () => {
    const [shopData, setShopData] = useState({
        shopName: '',
        ownerName: '',
        description: '',
        contact: {
            email: '',
            phone: '',
            alternatePhone: ''
        },
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            landmark: ''
        },
        categories: [],
        businessHours: {
            open: '09:00',
            close: '18:00',
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        avatar: '',
        images: []
    });

    const [uploading, setUploading] = useState(false);
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagesUrl, setImagesUrl] = useState([]);

    // Available categories from your schema
    const availableCategories = [
        'Cement & Concrete',
        'Bricks & Blocks',
        'Steel & Reinforcement',
        'Sand & Aggregates',
        'Paints & Finishes',
        'Tools & Equipment',
        'Plumbing',
        'Electrical',
        'Tiles & Sanitary',
        'Hardware & Fittings'
    ];

    // Days of the week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        // Fetch shop data when component mounts
        fetchShopData();
    }, []);

    const fetchShopData = async () => {
        try {
            const response = await axiosClient.get('/auth/profile');
            console.log(response.data);

            if (response.data.shop) {
                const shop = response.data.shop;
                setShopData({
                    shopName: shop.shopName || '',
                    ownerName: shop.ownerName || '',
                    description: shop.description || '',
                    contact: {
                        email: shop.contact?.email || '',
                        phone: shop.contact?.phone || '',
                        alternatePhone: shop.contact?.alternatePhone || ''
                    },
                    address: {
                        street: shop.address?.street || '',
                        city: shop.address?.city || '',
                        state: shop.address?.state || '',
                        pincode: shop.address?.pincode || '',
                        landmark: shop.address?.landmark || ''
                    },
                    categories: shop.categories || [],
                    businessHours: shop.businessHours || {
                        open: '09:00',
                        close: '18:00',
                        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                    },
                    avatar: shop.avatar || '',
                    images: shop.images || []
                });
                setAvatarPreview(shop.avatar || '');
                setImagesUrl(shop.images || []);
            }
        } catch (error) {
            console.error('Error fetching shop data:', error);
            toast.error('Error loading shop data');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('contact.')) {
            const contactField = name.split('.')[1];
            setShopData(prev => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    [contactField]: value
                }
            }));
        } else if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setShopData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else if (name.startsWith('businessHours.')) {
            const businessHoursField = name.split('.')[1];
            setShopData(prev => ({
                ...prev,
                businessHours: {
                    ...prev.businessHours,
                    [businessHoursField]: value
                }
            }));
        } else {
            setShopData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCategoryChange = (category) => {
        setShopData(prev => {
            const currentCategories = prev.categories || [];
            if (currentCategories.includes(category)) {
                return {
                    ...prev,
                    categories: currentCategories.filter(cat => cat !== category)
                };
            } else {
                return {
                    ...prev,
                    categories: [...currentCategories, category]
                };
            }
        });
    };

    const handleWorkingDayChange = (day) => {
        setShopData(prev => {
            const currentDays = prev.businessHours?.workingDays || [];
            if (currentDays.includes(day)) {
                return {
                    ...prev,
                    businessHours: {
                        ...prev.businessHours,
                        workingDays: currentDays.filter(d => d !== day)
                    }
                };
            } else {
                return {
                    ...prev,
                    businessHours: {
                        ...prev.businessHours,
                        workingDays: [...currentDays, day]
                    }
                };
            }
        });
    };

    const handleAvatarChange = (e) => {
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
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setSelectedAvatarFile(file);
        }
    };

    const uploadAvatarToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axiosClient.post('/upload/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(progress);
                },
            });

            return response.data;
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const handleAvatarUpload = async () => {
        if (!selectedAvatarFile) {
            toast.error('Please select a file first');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const result = await uploadAvatarToCloudinary(selectedAvatarFile);
            console.log("Avatar upload result:", result);

            const cloudinaryUrl = result.imageUrl || result.url || result.data?.url;

            if (!cloudinaryUrl) {
                throw new Error('No image URL returned from server');
            }

            setShopData(prev => ({
                ...prev,
                avatar: cloudinaryUrl
            }));

            setAvatarPreview(cloudinaryUrl);
            setSelectedAvatarFile(null);

            toast.success('Shop avatar uploaded successfully!');

        } catch (error) {
            console.error('Avatar upload failed:', error);
            toast.error(error.response?.data?.message || 'Avatar upload failed. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleOtherImages = (imagesArray) => {
        console.log("Other images received:", imagesArray);

        if (!imagesArray) {
            console.error("No images array received");
            toast.error("No images received from upload");
            return;
        }

        const imageUrls = imagesArray.map(img => {
            if (typeof img === 'string') {
                return img;
            } else if (img && img.url) {
                return img.url;
            }
            return null;
        }).filter(url => url !== null);

        console.log("Processed image URLs:", imageUrls);

        setImagesUrl(imageUrls);
        setShopData(prev => ({
            ...prev,
            images: imageUrls
        }));

        if (imageUrls.length === 0) {
            toast.warning("No valid image URLs found in upload");
        } else {
            toast.success(`${imageUrls.length} images added successfully!`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                ...shopData,
                images: imagesUrl
            };

            console.log("Submitting shop data:", submitData);

            const response = await axiosClient.put('/auth/shop/data', submitData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data) {
                toast.success('Shop profile updated successfully!');
                // Update Redux store if needed
                // dispatch(updateShop(response.data.shop));
            } else {
                throw new Error('No data returned from server');
            }
        } catch (error) {
            console.error('Shop update error:', error);
            toast.error(error.response?.data?.message || 'Error updating shop profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm mb-8">
                <Navbar />
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800">Update Shop Profile</h2>
                        <p className="text-gray-600 mt-1">Manage your shop information and business details</p>
                    </div>

                    {/* Shop Avatar Section */}
                    <div className="px-6 py-6 border-b border-gray-200">
                        <div className="flex items-center space-x-6 mb-4">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-white shadow-sm overflow-hidden">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Shop Avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${avatarPreview ? 'hidden' : 'flex'}`}>
                                        <span className="text-2xl font-semibold text-gray-400">
                                            {shopData.shopName ? shopData.shopName.charAt(0).toUpperCase() : 'S'}
                                        </span>
                                    </div>
                                </div>
                                <label
                                    htmlFor="shop-avatar-upload"
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                                <input
                                    id="shop-avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Shop Logo</h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    JPG, GIF or PNG. Max size of 5MB.
                                </p>
                                {selectedAvatarFile && (
                                    <p className="text-green-600 text-sm mt-1">
                                        File selected: {selectedAvatarFile.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Upload Progress */}
                        {uploading && (
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        {selectedAvatarFile && !uploading && (
                            <button
                                onClick={handleAvatarUpload}
                                disabled={uploading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                            >
                                Upload Shop Logo
                            </button>
                        )}
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {/* Basic Shop Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Shop Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Shop Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="shopName"
                                        value={shopData.shopName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter shop name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Owner Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={shopData.ownerName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter owner name"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Shop Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={shopData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Describe your shop and services..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Contact Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="contact.email"
                                        value={shopData.contact.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter shop email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="contact.phone"
                                        value={shopData.contact.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter shop phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Alternate Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="contact.alternatePhone"
                                        value={shopData.contact.alternatePhone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter alternate phone"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Address Information</h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={shopData.address.street}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter street address"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            name="address.city"
                                            value={shopData.address.city}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="address.state"
                                            value={shopData.address.state}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="State"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            PIN Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="address.pincode"
                                            value={shopData.address.pincode}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="PIN Code"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Landmark
                                        </label>
                                        <input
                                            type="text"
                                            name="address.landmark"
                                            value={shopData.address.landmark}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Nearby landmark"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Product Categories</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {availableCategories.map((category) => (
                                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={shopData.categories.includes(category)}
                                            onChange={() => handleCategoryChange(category)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Business Hours */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Business Hours</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Opening Time
                                    </label>
                                    <input
                                        type="time"
                                        name="businessHours.open"
                                        value={shopData.businessHours.open}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Closing Time
                                    </label>
                                    <input
                                        type="time"
                                        name="businessHours.close"
                                        value={shopData.businessHours.close}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Working Days
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {daysOfWeek.map((day) => (
                                        <label key={day} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={shopData.businessHours.workingDays.includes(day)}
                                                onChange={() => handleWorkingDayChange(day)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{day}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Store Images Section */}
                        <div className="border-t pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Store Images</h4>
                            <ImgUpload
                                onUploadSuccess={(results) => {
                                    console.log('Upload successful:', results);
                                }}
                                onAvatarUpdate={handleOtherImages}
                            />

                            {/* Display current images */}
                            {imagesUrl.length > 0 && (
                                <div className="mt-4">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Current Store Images:</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {imagesUrl.map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt={`Store image ${index + 1}`}
                                                className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Updating Shop...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Update Shop Profile</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShopProfileUpdate;