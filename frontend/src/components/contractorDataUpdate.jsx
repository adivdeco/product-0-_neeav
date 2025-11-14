import React, { useState, useEffect } from 'react';
import Navbar from './home/navbar';
import axiosClient from '../api/auth';
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import ImgUpload from './admin/ImgUpload';

const ContractorProfileUpdate = () => {
    // --- State Initialization (Kept as is for functionality) ---
    const [contractorData, setContractorData] = useState({
        contractorName: '',
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
        services: [],
        experience: {
            years: 0,
            description: ''
        },
        availability: 'available',
        pricing: {
            hourlyRate: 0,
            dailyRate: 0,
            projectRate: ''
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

    const availableServices = [
        'Masonry', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Flooring', 'Roofing',
        'Structural', 'Labor Supply', 'Construction', 'Renovation', 'Demolition',
        'Landscaping', 'HVAC', 'Welding'
    ];

    const availabilityOptions = [
        { value: 'available', label: 'Available' },
        { value: 'busy', label: 'Busy' },
        { value: 'on-leave', label: 'On Leave' }
    ];

    const projectRateOptions = [
        'Fixed Price', 'Negotiable', 'Per Square Foot', 'Time & Material'
    ];

    useEffect(() => {
        fetchContractorData();
    }, []);

    const fetchContractorData = async () => {
        try {
            const response = await axiosClient.get('/auth/Contractor_Profile');
            console.log(response.data);

            if (response.data.contractor) {
                const contractor = response.data.contractor;
                setContractorData({
                    contractorName: contractor.contractorName || '',
                    description: contractor.description || '',
                    contact: {
                        email: contractor.contact?.email || '',
                        phone: contractor.contact?.phone || '',
                        alternatePhone: contractor.contact?.alternatePhone || ''
                    },
                    availability: contractor.availability,
                    address: {
                        street: contractor.address?.street || '',
                        city: contractor.address?.city || '',
                        state: contractor.address?.state || '',
                        pincode: contractor.address?.pincode || '',
                        landmark: contractor.address?.landmark || ''
                    },
                    experience: {
                        years: contractor.experience.years,
                        description: contractor.experience.description,
                    },
                    pricing: {
                        hourlyRate: contractor.pricing.hourlyRate,
                        dailyRate: contractor.pricing.dailyRate,
                        projectRate: contractor.pricing.projectRate
                    },
                    services: contractor.services || [],

                    avatar: contractor.avatar || '',
                    images: contractor.images || []
                });
                setAvatarPreview(contractor.avatar || '');
                setImagesUrl(contractor.images || []);
            }
        } catch (error) {
            console.error('Failed to fetch contractor data:', error);
            toast.error('Failed to load profile data');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('contact.')) {
            const contactField = name.split('.')[1];
            setContractorData(prev => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    [contactField]: value
                }
            }));
        } else if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setContractorData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else if (name.startsWith('experience.')) {
            const experienceField = name.split('.')[1];
            setContractorData(prev => ({
                ...prev,
                experience: {
                    ...prev.experience,
                    [experienceField]: value
                }
            }));

        } else if (name.startsWith('pricing.')) {
            const pricingField = name.split('.')[1];
            setContractorData(prev => ({
                ...prev,
                pricing: {
                    ...prev.pricing,
                    [pricingField]: value
                }
            }));
        }
        else {
            setContractorData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }

    const handleServiceChange = (service) => {
        setContractorData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
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

            setContractorData(prev => ({
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
        setContractorData(prev => ({
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

        if (!contractorData.contractorName.trim()) {
            toast.error('Contractor name is required');
            return;
        }

        if (!contractorData.contact.email.trim()) {
            toast.error('Email is required');
            return;
        }

        setLoading(true);

        try {
            const submitData = {
                ...contractorData,
                images: imagesUrl
            };

            const response = await axiosClient.put('/auth/contractor/services', submitData, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.data) {
                toast.success('Contractor profile updated successfully!');

            }


        } catch (error) {
            console.error('Contractor update error:', error);
            toast.error(error.response?.data?.message || 'Error updating contractor profile');
        } finally {
            setLoading(false);
        }
    };



    return (

        <div className="min-h-screen py-12 relative overflow-hidden"
            style={{
                backgroundImage: "url('/login.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>

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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">


                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:shadow-cyan-500/10">

                    {/* Header with gradient */}
                    <div className="px-8 py-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-white">⚙️ Professional Profile Update</h2>
                                <p className="text-white/60 mt-2">Elevate your profile: Showcase your expertise, services, and work portfolio.</p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                                    <span className="text-green-300 text-sm font-medium">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contractor Avatar Section */}
                    <section className="px-8 py-8 border-b border-white/20">
                        <h3 className="text-xl font-bold text-white mb-6">Your Profile Photo</h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">

                            {/* Avatar Display */}
                            <div className="relative group flex-shrink-0">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border-4 border-white/30 shadow-2xl overflow-hidden flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Contractor Avatar"
                                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${avatarPreview ? 'hidden' : 'flex'}`}>
                                        <span className="text-3xl font-bold text-white/80">
                                            {contractorData.contractorName ? contractorData.contractorName.charAt(0).toUpperCase() : 'C'}
                                        </span>
                                    </div>
                                </div>

                                {/* Animated upload indicator */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-all duration-500 -z-10"></div>

                                {/* Upload Icon */}
                                <label
                                    htmlFor="contractor-avatar-upload"
                                    className="absolute bottom-2 right-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white p-2 rounded-full shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-cyan-500/50 group/btn border-2 border-white/30"
                                    title="Upload new photo"
                                >
                                    <svg className="w-5 h-5 transform transition-transform duration-300 group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                                <input
                                    id="contractor-avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Photo Info and Actions */}
                            <div className="flex-grow">
                                <h4 className="text-lg font-semibold text-white">Contractor Photo Upload</h4>
                                <p className="text-white/60 text-sm mt-1">
                                    Accepted formats: JPG, GIF, PNG. Max size: 5MB. A professional headshot builds trust.
                                </p>
                                {selectedAvatarFile && (
                                    <div className="flex items-center space-x-2 text-cyan-300 mt-2 animate-fade-in">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm">File selected: {selectedAvatarFile.name}</span>
                                    </div>
                                )}

                                {/* Upload Progress with enhanced animation */}
                                {uploading && (
                                    <div className="mt-4 transform transition-all duration-500 animate-slide-up">
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
                                {selectedAvatarFile && !uploading && (
                                    <button
                                        onClick={handleAvatarUpload}
                                        disabled={uploading}
                                        className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 animate-pulse-gentle"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span>Upload New Photo</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* 1. Basic Contractor Information */}
                        <section className="space-y-6 transform transition-all duration-500 hover:scale-[1.01]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-semibold text-white border-b border-cyan-400/50 pb-2">📝 General Information</h3>
                                <div className={`w-3 h-3 rounded-full ${contractorData.contractorName && contractorData.description ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contractor Name */}
                                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                    <label className="block text-sm font-medium text-white/80 mb-3">
                                        Contractor Name <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="contractorName"
                                            value={contractorData.contractorName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 backdrop-blur-sm"
                                            placeholder="E.g., Swift Construction Services"
                                        />
                                        {contractorData.contractorName && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 animate-scale-in">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Availability */}
                                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                    <label className="block text-sm font-medium text-white/80 mb-3">
                                        Current Availability
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="availability"
                                            value={contractorData.availability}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 backdrop-blur-sm appearance-none pr-10"
                                        >
                                            {availabilityOptions.map(option => (
                                                <option key={option.value} value={option.value} className="bg-gray-800">
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 pointer-events-none">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                <label className="block text-sm font-medium text-white/80 mb-3">
                                    Company Description (Max 500 characters)
                                </label>
                                <div className="relative">
                                    <textarea
                                        name="description"
                                        value={contractorData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        maxLength={500}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 backdrop-blur-sm resize-none"
                                        placeholder="Briefly describe your core services, expertise, and company mission. This is what clients see first!"
                                    />
                                    {contractorData.description && (
                                        <div className="absolute right-3 top-3 text-cyan-400 animate-scale-in">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* 2. Contact and Address Information */}
                        <section className="space-y-6 transform transition-all duration-500 hover:scale-[1.01]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-semibold text-white border-b border-purple-400/50 pb-2">📞 Contact & Location</h3>
                                {/* <div className={`w-3 h-3 rounded-full ${isAddressComplete() ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`}></div> */}
                            </div>

                            {/* Contact Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {['email', 'phone', 'alternatePhone'].map((field, index) => (
                                    <div key={field} className="transform transition-all duration-300 hover:scale-[1.02]">
                                        <label className="block text-sm font-medium text-white/80 mb-3 capitalize">
                                            {field === 'alternatePhone' ? 'Alternate Phone' : field}
                                            {(field === 'email' || field === 'phone') && <span className="text-red-400"> *</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={field === 'email' ? 'email' : 'tel'}
                                                name={`contact.${field}`}
                                                value={contractorData.contact[field]}
                                                onChange={handleInputChange}
                                                required={field === 'email' || field === 'phone'}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm"
                                                placeholder={field === 'email' ? 'contact@yourcompany.com' : field === 'phone' ? '+1 555-123-4567' : 'Optional contact number'}
                                            />
                                            {contractorData.contact[field] && (
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

                            {/* Address Fields */}
                            <div className="space-y-6">
                                <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                    <label className="block text-sm font-medium text-white/80 mb-3">
                                        Street Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="address.street"
                                            value={contractorData.address.street}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm"
                                            placeholder="Building number and street name"
                                        />
                                        {contractorData.address.street && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 animate-scale-in">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {['city', 'state', 'pincode', 'landmark'].map((field) => (
                                        <div key={field} className="transform transition-all duration-300 hover:scale-[1.02]">
                                            <label className="block text-sm font-medium text-white/80 mb-3 capitalize">
                                                {field === 'pincode' ? 'PIN Code' : field}
                                                {(field === 'city' || field === 'state' || field === 'pincode') && <span className="text-red-400"> *</span>}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name={`address.${field}`}
                                                    value={contractorData.address[field]}
                                                    onChange={handleInputChange}
                                                    required={field === 'city' || field === 'state' || field === 'pincode'}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm"
                                                    placeholder={field === 'landmark' ? 'Nearby landmark (optional)' : field.charAt(0).toUpperCase() + field.slice(1)}
                                                />
                                                {contractorData.address[field] && (
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
                        </section>

                        {/* 3. Services Offered */}
                        <section className="space-y-6 transform transition-all duration-500 hover:scale-[1.01]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-semibold text-white border-b border-green-400/50 pb-2">🛠️ Services & Expertise</h3>
                                <div className={`w-3 h-3 rounded-full ${contractorData.services.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {availableServices.map((service) => (
                                    <label
                                        key={service}
                                        className={`flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transform transition-all duration-300 hover:scale-105 backdrop-blur-sm
                                    ${contractorData.services.includes(service)
                                                ? 'bg-green-500/20 border-green-400/50 shadow-lg shadow-green-500/25 text-green-300 font-semibold'
                                                : 'bg-white/5 border-white/10 hover:border-green-300/50 text-white/80 hover:text-white'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={contractorData.services.includes(service)}
                                            onChange={() => handleServiceChange(service)}
                                            className="rounded border-white/20 bg-white/5 text-green-500 focus:ring-green-500 w-4 h-4 flex-shrink-0"
                                        />
                                        <span className="text-sm">{service}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* 4. Experience & Pricing */}
                        <section className="space-y-6 transform transition-all duration-500 hover:scale-[1.01]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-semibold text-white border-b border-yellow-400/50 pb-2">💰 Experience & Rates</h3>
                                <div className={`w-3 h-3 rounded-full ${contractorData.experience.years > 0 ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { name: 'experience.years', label: 'Years of Experience', type: 'number', placeholder: '0' },
                                    { name: 'pricing.hourlyRate', label: 'Hourly Rate (in local currency)', type: 'number', placeholder: 'E.g., 50 (per hour)' },
                                    { name: 'pricing.dailyRate', label: 'Daily Rate (in local currency)', type: 'number', placeholder: 'E.g., 400 (per day)' }
                                ].map((field, index) => (
                                    <div key={field.name} className="transform transition-all duration-300 hover:scale-[1.02]">
                                        <label className="block text-sm font-medium text-white/80 mb-3">
                                            {field.label}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                value={contractorData[field.name.split('.')[0]][field.name.split('.')[1]]}
                                                onChange={handleInputChange}
                                                min="0"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 backdrop-blur-sm"
                                                placeholder={field.placeholder}
                                            />
                                            {contractorData[field.name.split('.')[0]][field.name.split('.')[1]] > 0 && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 animate-scale-in">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <div className="md:col-span-2 transform transition-all duration-300 hover:scale-[1.02]">
                                    <label className="block text-sm font-medium text-white/80 mb-3">
                                        Project Rate Type
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="pricing.projectRate"
                                            value={contractorData.pricing.projectRate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 backdrop-blur-sm appearance-none pr-10"
                                        >
                                            <option value="" className="bg-gray-800">Select a Project Rate Type</option>
                                            {projectRateOptions.map(option => (
                                                <option key={option} value={option} className="bg-gray-800">
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-400 pointer-events-none">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="transform transition-all duration-300 hover:scale-[1.02]">
                                <label className="block text-sm font-medium text-white/80 mb-3">
                                    Detailed Experience Overview
                                </label>
                                <div className="relative">
                                    <textarea
                                        name="experience.description"
                                        value={contractorData.experience.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 backdrop-blur-sm resize-none"
                                        placeholder="Highlight major projects, certifications, and special skills to impress potential clients."
                                    />
                                    {contractorData.experience.description && (
                                        <div className="absolute right-3 top-3 text-yellow-400 animate-scale-in">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* 5. Work Portfolio Images */}
                        <section className="space-y-6 transform transition-all duration-500 hover:scale-[1.01]">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-semibold text-white border-b border-cyan-400/50 pb-2">🖼️ Work Portfolio Images</h3>
                                <div className={`w-3 h-3 rounded-full ${imagesUrl.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-cyan-400'}`}></div>
                            </div>

                            <p className="text-white/60 text-sm">
                                Upload up to 10 high-quality images of your finished projects. This is crucial for securing new contracts!
                            </p>

                            {/* ImgUpload Component Integration */}
                            <div className="border border-dashed border-white/20 rounded-xl p-6 bg-white/5 backdrop-blur-sm">
                                <ImgUpload
                                    handleOtherImages={handleOtherImages}
                                    initialImages={imagesUrl}
                                    maxImages={10}
                                />
                            </div>

                            {/* Display current images */}
                            {imagesUrl && imagesUrl.length > 0 && (
                                <div className="mt-4 transform transition-all duration-500 animate-slide-up">
                                    <h4 className="text-lg font-semibold text-white mb-3">Current Work Images ({imagesUrl.length} uploaded)</h4>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {imagesUrl.map((url, index) => (
                                            <div key={index} className="aspect-square relative overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:scale-105">
                                                <img
                                                    src={url}
                                                    alt={`Work Image ${index + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Form Submission Footer */}
                        <footer className="pt-6 flex justify-end border-t border-white/20">
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 group"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Save & Update Profile</span>
                                        <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </footer>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContractorProfileUpdate;