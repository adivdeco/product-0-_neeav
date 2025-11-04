import React, { useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { shopSchema, CATEGORIES_ENUM, WORKING_DAYS_ENUM } from '../../api/shopValidationSchema';
import 'react-toastify/dist/ReactToastify.css';
import '../../AddShop.css';
import axiosClient from '../../api/auth';
import ImageUpload from '../admin/Users_data/ImageUpload';
import ImgUpload from './ImgUpload'

const initialShopState = {
    shopName: '',
    ownerName: '',
    description: '',
    contact: {
        email: '',
        phone: '',
        alternatePhone: '',
        password: '',
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
};

// Enhanced InputField with validation
const InputField = ({
    label,
    name,
    value,
    section,
    type = 'text',
    required = false,
    placeholder = '',
    onChangeHandler,
    onBlurHandler,
    error = ''
}) => (
    <div className="form-group">
        <label htmlFor={name}>
            {label}
            {required && <span className="required-star">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChangeHandler(e, section)}
            onBlur={(e) => onBlurHandler(e, section)}
            placeholder={placeholder}
            className={`modern-input ${error ? 'input-error' : ''}`}
        />
        {error && <div className="field-error">{error}</div>}
    </div>
);

// Textarea component with validation
const TextareaField = ({
    label,
    name,
    value,
    section,
    required = false,
    placeholder = '',
    maxLength,
    onChangeHandler,
    onBlurHandler,
    error = ''
}) => (
    <div className="form-group full-width">
        <label htmlFor={name}>
            {label}
            {required && <span className="required-star">*</span>}
        </label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChangeHandler(e, section)}
            onBlur={(e) => onBlurHandler(e, section)}
            maxLength={maxLength}
            rows="3"
            placeholder={placeholder}
            className={`modern-textarea ${error ? 'input-error' : ''}`}
        />
        <div className="char-counter">
            {value.length}/{maxLength}
        </div>
        {error && <div className="field-error">{error}</div>}
    </div>
);

const AddShop = () => {
    const [shopData, setShopData] = useState(initialShopState);
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [ImagesUrl, setImagesUrl] = useState([])
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [activeSection, setActiveSection] = useState(0);

    const sections = [
        { id: 'shop', title: 'Shop Details', icon: '🏢' },
        { id: 'contact', title: 'Contact & Login', icon: '📞' },
        { id: 'address', title: 'Address', icon: '📍' },
        { id: 'categories', title: 'Categories & Hours', icon: '🏷️' }
    ];

    const handleAvatarUpdate = (url) => {
        console.log('Avatar URL received:', url);
        setAvatarUrl(url);
    };


    const handleOtherImages = (imagesArray) => {
        console.log("Other images received:", imagesArray);

        // Add safety check
        if (!imagesArray) {
            console.error("No images array received");
            toast.error("No images received from upload");
            return;
        }

        // Extract URLs from the images array safely
        const imageUrls = imagesArray.map(img => {
            if (typeof img === 'string') {
                return img; // If it's already a URL string
            } else if (img && img.url) {
                return img.url; // If it's an object with url property
            }
            return null;
        }).filter(url => url !== null); // Remove any null values

        console.log("Processed image URLs:", imageUrls);

        setImagesUrl(imageUrls);

        if (imageUrls.length === 0) {
            toast.warning("No valid image URLs found in upload");
        }
    };


    // Real-time validation function
    const validateField = useCallback((path, value) => {
        try {
            let fieldSchema;

            if (path.includes('.')) {
                const [parent, child] = path.split('.');
                if (parent === 'contact' || parent === 'address') {
                    fieldSchema = shopSchema.shape[parent].shape[child];
                } else if (parent === 'businessHours') {
                    fieldSchema = shopSchema.shape.businessHours?.shape[child];
                }
            } else {
                fieldSchema = shopSchema.shape[path];
            }

            if (fieldSchema) {
                fieldSchema.parse(value);
            }
            return '';
        } catch (error) {
            if (error.issues && error.issues.length > 0) {
                return error.issues[0].message;
            }
            return 'Invalid value';
        }
    }, []);

    const handleChange = (e, section) => {
        const { name, value } = e.target;
        const fieldPath = section ? `${section}.${name}` : name;

        setShopData(prevData => ({
            ...prevData,
            ...(section ? { [section]: { ...prevData[section], [name]: value } } : { [name]: value })
        }));

        // Real-time validation for the field
        if (touched[fieldPath]) {
            const error = validateField(fieldPath, value);
            setErrors(prev => ({
                ...prev,
                [fieldPath]: error
            }));
        }
    };

    const handleBlur = (e, section) => {
        const { name, value } = e.target;
        const fieldPath = section ? `${section}.${name}` : name;

        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [fieldPath]: true
        }));

        // Validate the field
        const error = validateField(fieldPath, value);
        setErrors(prev => ({
            ...prev,
            [fieldPath]: error
        }));
    };

    // Handler for categories/working days (checkboxes)
    const handleCheckboxChange = (e, field, subSection = null) => {
        const { value, checked } = e.target;
        const fieldPath = subSection ? `${field}.${subSection}` : field;

        setShopData(prevData => {
            const currentArray = subSection ? prevData[field][subSection] : prevData[field];
            const newArray = checked
                ? [...currentArray, value]
                : currentArray.filter(item => item !== value);

            // Validate in real-time
            if (touched[fieldPath]) {
                const error = validateField(fieldPath, newArray);
                setErrors(prev => ({
                    ...prev,
                    [fieldPath]: error
                }));
            }

            if (subSection) {
                return {
                    ...prevData,
                    [field]: { ...prevData[field], [subSection]: newArray }
                };
            }
            return {
                ...prevData,
                [field]: newArray
            };
        });
    };

    const validateSection = (sectionIndex) => {
        const sectionFields = getSectionFields(sectionIndex);
        let isValid = true;
        const newErrors = {};

        sectionFields.forEach(field => {
            const { path, value } = field;
            const error = validateField(path, value);
            if (error) {
                newErrors[path] = error;
                isValid = false;
            }
        });

        setErrors(prev => ({ ...prev, ...newErrors }));
        setTouched(prev => {
            const newTouched = { ...prev };
            sectionFields.forEach(field => {
                newTouched[field.path] = true;
            });
            return newTouched;
        });

        return isValid;
    };

    const getSectionFields = (sectionIndex) => {
        const fields = [];

        switch (sectionIndex) {
            case 0: // Shop Details
                fields.push(
                    { path: 'shopName', value: shopData.shopName },
                    { path: 'ownerName', value: shopData.ownerName }
                );
                break;
            case 1: // Contact & Login
                fields.push(
                    { path: 'contact.phone', value: shopData.contact.phone },
                    { path: 'contact.email', value: shopData.contact.email },
                    { path: 'contact.password', value: shopData.contact.password }
                );
                break;
            case 2: // Address
                fields.push(
                    { path: 'address.city', value: shopData.address.city },
                    { path: 'address.state', value: shopData.address.state },
                    { path: 'address.pincode', value: shopData.address.pincode }
                );
                break;
            case 3: // Categories & Hours
                fields.push(
                    { path: 'categories', value: shopData.categories }
                );
                break;
        }

        return fields;
    };

    const nextSection = () => {
        if (validateSection(activeSection)) {
            setActiveSection(prev => Math.min(prev + 1, sections.length - 1));
        } else {
            toast.error('Please fix the validation errors before proceeding.');
        }
    };

    const prevSection = () => setActiveSection(prev => Math.max(prev - 1, 0));

    // Completely prevent form submission on Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // Only allow Enter to submit on the final section
            if (activeSection === sections.length - 1) {
                // Don't do anything here - let the submit button handle it
                return;
            } else {
                // For other sections, treat Enter as Next button
                nextSection();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Only allow submission from the final section
        if (activeSection !== sections.length - 1) {
            toast.error('Please complete all sections before submitting.');
            return;
        }

        setLoading(true);

        // Validate all sections before final submission
        let allValid = true;
        for (let i = 0; i < sections.length; i++) {
            if (!validateSection(i)) {
                allValid = false;
            }
        }

        if (!allValid) {
            toast.error('Please fix all validation errors before submitting.');
            setLoading(false);
            return;
        }

        try {
            // 1. Zod Validation
            const validatedData = shopSchema.parse(shopData);

            // 2. Prepare Payload for Backend
            const payload = {
                shopName: validatedData.shopName,
                ownerName: validatedData.ownerName,
                description: validatedData.description,
                contact: validatedData.contact,
                address: validatedData.address,
                categories: validatedData.categories,
                businessHours: validatedData.businessHours,
                image: avatarUrl || "", // avtar
                image2: ImagesUrl || []

            };


            const response = await axiosClient.post('/useas/addshopowners', payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });

            // Success
            toast.success(`✅ Shop "${response.data.newShop.shopName}" added! Owner: ${response.data.ownerUser.name}`);
            setShopData(initialShopState);
            setErrors({});
            setTouched({});
            setActiveSection(0);
            setAvatarUrl(''); // Reset avatar URL
            setImagesUrl([]);

        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data?.message || 'Failed to add shop. Please try again.';
                toast.error(`❌ ${errorMessage}`);
            } else if (error.issues) {
                error.issues.forEach(issue => {
                    const fieldPath = issue.path.join('.');
                    const niceName = fieldPath.split('.').pop().replace(/([A-Z])/g, ' $1').trim();
                    toast.error(`${niceName}: ${issue.message}`);
                });
            } else if (error.code === 'ECONNABORTED') {
                toast.error('❌ Request timeout. Please try again.');
            } else {
                toast.error(`❌ Error: ${error.message}`);
            }
            console.error('Submission Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get error for a field
    const getError = (path) => errors[path] || '';

    return (
        <div className="add-shop-container full-screen-page">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            <div className="form-glass-card">
                {/* Progress Header */}
                <div className="progress-header">
                    <div className="progress-steps">
                        {sections.map((section, index) => (
                            <div key={section.id} className="step-container">
                                <div
                                    className={`step-circle ${index === activeSection ? 'active' : ''} ${index < activeSection ? 'completed' : ''}`}
                                    onClick={() => {
                                        if (index <= activeSection) {
                                            setActiveSection(index);
                                        }
                                    }}
                                >
                                    {index < activeSection ? '✓' : section.icon}
                                </div>
                                <span className="step-label">{section.title}</span>
                                {
                                    index < sections.length - 1 && (
                                        <div className={`step-connector ${index < activeSection ? 'completed' : ''}`}></div>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-content-wrapper">
                    <header className="form-header">
                        <h1>➕ Add New Shop</h1>
                        <p>Enter the details for the new shop and its owner. All fields marked with * are required.</p>
                        <div className="current-step-info">
                            Step {activeSection + 1} of {sections.length}: {sections[activeSection].title}
                        </div>
                    </header>

                    {/* Remove form tag and use div instead to prevent any automatic submission */}
                    <div className="multi-step-form" onKeyDown={handleKeyDown}>
                        {/* Shop Information */}
                        <div className={`form-section ${activeSection === 0 ? 'active' : ''}`}>
                            <h3>🏢 Shop Details</h3>
                            <div className="form-grid">
                                <InputField
                                    label="Shop Name"
                                    name="shopName"
                                    value={shopData.shopName}
                                    required
                                    placeholder="Enter shop name"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('shopName')}
                                />
                                <InputField
                                    label="Owner Name"
                                    name="ownerName"
                                    value={shopData.ownerName}
                                    required
                                    placeholder="Enter owner's full name"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('ownerName')}
                                />
                            </div>
                            <TextareaField
                                label="Description"
                                name="description"
                                value={shopData.description}
                                maxLength="200"
                                placeholder="Brief description of the shop and its services."
                                onChangeHandler={handleChange}
                                onBlurHandler={handleBlur}
                                error={getError('description')}
                            />

                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h4>

                                <ImageUpload

                                    onUploadSuccess={(results) => {
                                        console.log('Upload successful:', results);
                                    }}
                                    onAvatarUpdate={handleAvatarUpdate}
                                />
                            </div>

                        </div>

                        {/* Contact & Login */}
                        <div className={`form-section ${activeSection === 1 ? 'active' : ''}`}>
                            <h3>📞 Contact & Owner Login</h3>
                            <div className="form-grid">
                                <InputField
                                    label="Phone Number"
                                    name="phone"
                                    value={shopData.contact.phone}
                                    section="contact"
                                    required
                                    placeholder="9876543210"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('contact.phone')}
                                />
                                <InputField
                                    label="Alternate Phone"
                                    name="alternatePhone"
                                    value={shopData.contact.alternatePhone}
                                    section="contact"
                                    placeholder="Optional secondary number"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('contact.alternatePhone')}
                                />
                                <InputField
                                    label="Email Address"
                                    name="email"
                                    value={shopData.contact.email}
                                    section="contact"
                                    type="email"
                                    required
                                    placeholder="owner@shop.com"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('contact.email')}
                                />
                                <InputField
                                    label="Owner Password"
                                    name="password"
                                    value={shopData.contact.password}
                                    section="contact"
                                    type="password"
                                    required
                                    placeholder="Set a temporary password"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('contact.password')}
                                />
                            </div>
                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Store Images</h4>

                                <ImgUpload

                                    onUploadSuccess={(results) => {
                                        console.log('Upload successful:', results);
                                    }}
                                    onAvatarUpdate={handleOtherImages}
                                />
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className={`form-section ${activeSection === 2 ? 'active' : ''}`}>
                            <h3>📍 Shop Address</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <InputField
                                        label="Street/Locality"
                                        name="street"
                                        value={shopData.address.street}
                                        section="address"
                                        placeholder="Building, street, area"
                                        onChangeHandler={handleChange}
                                        onBlurHandler={handleBlur}
                                        error={getError('address.street')}
                                    />
                                </div>
                                <InputField
                                    label="Landmark"
                                    name="landmark"
                                    value={shopData.address.landmark}
                                    section="address"
                                    placeholder="Near famous location"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('address.landmark')}
                                />
                                <InputField
                                    label="City"
                                    name="city"
                                    value={shopData.address.city}
                                    section="address"
                                    required
                                    placeholder="City name"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('address.city')}
                                />
                                <InputField
                                    label="State"
                                    name="state"
                                    value={shopData.address.state}
                                    section="address"
                                    required
                                    placeholder="State"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('address.state')}
                                />
                                <InputField
                                    label="Pincode"
                                    name="pincode"
                                    value={shopData.address.pincode}
                                    section="address"
                                    required
                                    placeholder="6-digit pincode"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('address.pincode')}
                                />
                            </div>
                        </div>

                        {/* Categories & Hours */}
                        <div className={`form-section ${activeSection === 3 ? 'active' : ''}`}>
                            <h3>🏷️ Categories & Hours</h3>

                            {/* Categories Checkboxes */}
                            <div className="services-section">
                                <label className="section-label">
                                    Categories (Select all that apply) <span className="required-star">*</span>
                                </label>
                                {getError('categories') && <div className="field-error">{getError('categories')}</div>}
                                <div className="categories-grid">
                                    {CATEGORIES_ENUM.map(category => (
                                        <label key={category} className="service-card">
                                            <input
                                                type="checkbox"
                                                value={category}
                                                checked={shopData.categories.includes(category)}
                                                onChange={(e) => handleCheckboxChange(e, 'categories')}
                                                className="service-checkbox"
                                            />
                                            <div className="service-content">
                                                <span className="service-name">{category}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Business Hours and Days */}
                            <div className="business-hours-section">
                                <h4>🕒 Business Hours</h4>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="open">Opening Time</label>
                                        <input
                                            type="time"
                                            id="open"
                                            name="open"
                                            value={shopData.businessHours.open}
                                            onChange={(e) => handleChange(e, 'businessHours')}
                                            className="modern-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="close">Closing Time</label>
                                        <input
                                            type="time"
                                            id="close"
                                            name="close"
                                            value={shopData.businessHours.close}
                                            onChange={(e) => handleChange(e, 'businessHours')}
                                            className="modern-input"
                                        />
                                    </div>
                                </div>

                                <div className="working-days-section">
                                    <label className="section-label">Working Days</label>
                                    <div className="days-grid">
                                        {WORKING_DAYS_ENUM.map(day => (
                                            <label key={day} className="day-checkbox">
                                                <input
                                                    type="checkbox"
                                                    value={day}
                                                    checked={shopData.businessHours.workingDays.includes(day)}
                                                    onChange={(e) => handleCheckboxChange(e, 'businessHours', 'workingDays')}
                                                />
                                                <span className="day-label">{day.substring(0, 3)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="form-navigation">
                            {activeSection > 0 && (
                                <button type="button" onClick={prevSection} className="nav-button secondary">
                                    ← Previous
                                </button>
                            )}
                            {activeSection < sections.length - 1 ? (
                                <button type="button" onClick={nextSection} className="nav-button primary">
                                    Next →
                                </button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={loading} className="submit-button">
                                    {loading ? (
                                        <>
                                            <div className="spinner"></div>
                                            Adding Shop...
                                        </>
                                    ) : (
                                        'Add Shop & Create Owner Account'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default AddShop;