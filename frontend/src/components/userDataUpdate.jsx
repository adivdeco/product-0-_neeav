import React, { useState, useEffect } from 'react';
import Navbar from './home/navbar';
import axiosClient from '../api/auth';
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import { calculateCompletion, isAddressComplete } from "../utils/calculateCompletion"

const UserProfileUpdate = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'In, Bihar 821115'
        },
        avatar: ''
    });
    const [uploading, setUploading] = useState(false);
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    pincode: user.address?.pincode || '',
                    country: user.address?.country || 'In, Bihar 821115'
                },
                avatar: user.avatar || ''
            });
            setImagePreview(user.avatar || '');
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setUserData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setUserData(prev => ({
                ...prev,
                [name]: value
            }));
        }
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
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
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

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file first');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const result = await uploadToCloudinary(selectedFile);
            console.log("Upload result:", result);

            const cloudinaryUrl = result.imageUrl || result.url || result.data?.url;

            if (!cloudinaryUrl) {
                throw new Error('No image URL returned from server');
            }

            setUserData(prev => ({
                ...prev,
                avatar: cloudinaryUrl
            }));

            setImagePreview(cloudinaryUrl);
            setSelectedFile(null);

            toast.success('Avatar uploaded successfully!');

        } catch (error) {
            console.error('Upload failed:', error);
            toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                ...userData,
                address: userData.address
            };

            console.log("Submitting data:", submitData);

            const response = await axiosClient.put('/auth/profile', submitData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data) {
                toast.success('Profile updated successfully!');
                // dispatch(updateUser(response.data.user));
            } else {
                throw new Error('No data returned from server');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen py-12 relative overflow-hidden"
            style={{
                backgroundImage: "url('/login.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <Toaster position="bottom-center" />

            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full filter blur-3xl animate-float"></div>
                <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-cyan-400/10 rounded-full filter blur-3xl animate-pulse-medium"></div>

                {/* Animated floating particles */}
                <div className="absolute inset-0">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${25 + Math.random() * 20}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Dark overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-purple-900/20 pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Progress Indicator */}
                <div className="mb-2  backdrop-blur-lg rounded-2xl overflow-hidden border px-4 shadow-2xl">
                    {/* <div className="flex items-center justify-end mb-4">
                        <h3 className="text-white text-lg font-semibold">Profile Completion</h3>
                        <span className="text-white text-xl font-bold">{calculateCompletion(userData)}%</span>
                    </div> */}
                    <div className="w-full bg-white/20 rounded-full h-0.5 animate-pulse">
                        <div
                            className="bg-gradient-to-r from-cyan-400 to-green-500 h-0.5 rounded-full transition-all duration-1000 ease-out shadow-xl shadow-cyan-500/25"
                            style={{ width: `${calculateCompletion(userData)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-white/70 opacity-55 text-sm mt-2">
                        <span>Basic Info</span>
                        <span>Contact</span>
                        <span>Address</span>
                        <span>Complete</span>

                    </div>

                </div>

                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:shadow-cyan-500/10">
                    {/* Header with gradient */}
                    <div className="px-8 py-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white">Update Profile</h2>
                                <p className="text-white/60 mt-2">Manage your account information and preferences</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                                    <span className="text-green-300 text-sm font-medium">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Image Section */}
                    <div className="px-8 py-8 border-b border-white/20">
                        <div className="flex items-center space-x-8">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border-4 border-white/30 shadow-2xl overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Profile"
                                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${imagePreview ? 'hidden' : 'flex'}`}>
                                        <span className="text-3xl font-bold text-white/80">
                                            {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                </div>

                                {/* Animated upload indicator */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-all duration-500 -z-10"></div>

                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-2 right-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-2 rounded-full shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-cyan-500/50 group/btn"
                                >
                                    <svg className="w-5 h-5 transform transition-transform duration-300 group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">Profile Photo</h3>
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

                                {/* Upload Progress with enhanced animation */}
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

                                {/* Upload Button */}
                                {selectedFile && !uploading && (
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 animate-pulse-gentle"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span>Upload Avatar</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Personal Information */}
                        <div className="space-y-6 transform transition-all duration-500 hover:scale-[1.01]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-white border-b border-cyan-400/50 pb-2">Personal Information</h3>
                                <div className={`w-3 h-3 rounded-full ${userData.name && userData.email ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                    <label className="block text-sm font-medium text-white/80 mb-3">
                                        Full Name *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="name"
                                            value={userData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 backdrop-blur-sm"
                                            placeholder="Enter your full name"
                                        />
                                        {userData.name && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 animate-scale-in">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                    <label className="block text-sm font-medium text-white/80 mb-3">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            name="email"
                                            value={userData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 backdrop-blur-sm"
                                            placeholder="Enter your email"
                                        />
                                        {userData.email && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 animate-scale-in">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                    <label className="block text-sm font-medium text-white/80 mb-3">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={userData.phone || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 backdrop-blur-sm"
                                            placeholder="Enter phone number"
                                        />
                                        {userData.phone && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 animate-scale-in">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="space-y-6 transform transition-all duration-500 hover:scale-[1.01]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-white border-b border-purple-400/50 pb-2">Address Information</h3>
                                <div className={`w-3 h-3 rounded-full ${isAddressComplete() ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`}></div>
                            </div>

                            <div className="space-y-6">
                                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                    <label className="block text-sm font-medium text-white/80 mb-3">
                                        Street Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="address.street"
                                            value={userData.address.street}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm"
                                            placeholder="Enter street address"
                                        />
                                        {userData.address.street && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 animate-scale-in">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {['city', 'state', 'pincode'].map((field) => (
                                        <div key={field} className="transform transition-all duration-300 hover:scale-[1.02]">
                                            <label className="block text-sm font-medium text-white/80 mb-3 capitalize">
                                                {field === 'pincode' ? 'PIN Code' : field}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name={`address.${field}`}
                                                    value={userData.address[field]}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder={field === 'pincode' ? 'PIN Code' : field.charAt(0).toUpperCase() + field.slice(1)}
                                                />
                                                {userData.address[field] && (
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 animate-scale-in">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-white/20">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 group"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Updating Profile...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Update Profile</span>
                                        <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
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

export default UserProfileUpdate;