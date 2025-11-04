import React, { useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { contractorSchema, SERVICES_ENUM } from '../../api/contractorValidationSchema';
import 'react-toastify/dist/ReactToastify.css';
import '../../AddContractor.css';
import axiosClient from '../../api/auth';
import { useNavigate } from 'react-router';
import ImageUpload from '../admin/Users_data/ImageUpload';
import ImgUpload from './ImgUpload'

const initialContractorState = {
    contractorName: '',
    description: '',
    contact: {
        email: '',
        phone: '',
        alternatePhone: '',
    },
    password: '',
    address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        landmark: ''
    },
    services: [],
    experience: {
        years: undefined,
        description: ''
    },
    pricing: {
        hourlyRate: undefined,
        dailyRate: undefined,
        projectRate: ''
    },
};

// Enhanced InputField with real-time validation
const InputField = ({
    label,
    name,
    value,
    section,
    type = 'text',
    required = false,
    placeholder = '',
    onChangeHandler,
    error = '',
    onBlurHandler
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
            onChange={(e) => onChangeHandler && onChangeHandler(e, section)}
            onBlur={(e) => onBlurHandler && onBlurHandler(e, section)}
            placeholder={placeholder}
            className={`modern-input text-black ${error ? 'input-error' : ''}`}
        />
        {error && <div className="field-error">{error}</div>}
    </div>
);

// Textarea component with real-time validation
const TextareaField = ({
    label,
    name,
    value,
    section,
    required = false,
    placeholder = '',
    maxLength,
    onChangeHandler,
    error = '',
    onBlurHandler
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
            onChange={(e) => onChangeHandler && onChangeHandler(e, section)}
            onBlur={(e) => onBlurHandler && onBlurHandler(e, section)}
            maxLength={maxLength}
            rows="4"
            placeholder={placeholder}
            className={`modern-textarea ${error ? 'input-error' : ''}`}
        />
        <div className="char-counter">
            {value.length}/{maxLength}
        </div>
        {error && <div className="field-error">{error}</div>}
    </div>
);

const AddContractor = () => {
    const [contractorData, setContractorData] = useState(initialContractorState);
    const [loading, setLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [ImagesUrl, setImagesUrl] = useState([])
    const [activeSection, setActiveSection] = useState(0);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const navigate = useNavigate();

    const sections = [
        { id: 'contractor', title: 'Contractor Details', icon: '👤' },
        { id: 'contact', title: 'Contact & Account', icon: '📞' },
        { id: 'address', title: 'Address', icon: '📍' },
        { id: 'services', title: 'Services & Pricing', icon: '🛠️' }
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
            // Get the specific schema for this field
            let fieldSchema;

            if (path.includes('.')) {
                const [parent, child] = path.split('.');
                if (parent === 'contact' || parent === 'address') {
                    fieldSchema = contractorSchema.shape[parent].shape[child];
                } else if (parent === 'experience') {
                    fieldSchema = contractorSchema.shape.experience?.shape[child];
                } else if (parent === 'pricing') {
                    fieldSchema = contractorSchema.shape.pricing?.shape[child];
                }
            } else {
                fieldSchema = contractorSchema.shape[path];
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
        const { name, value, type } = e.target;
        const newValue = type === 'number' ? (value === '' ? undefined : Number(value)) : value;
        const fieldPath = section ? `${section}.${name}` : name;

        setContractorData(prevData => ({
            ...prevData,
            ...(section ? { [section]: { ...prevData[section], [name]: newValue } } : { [name]: newValue })
        }));

        // Real-time validation for the field
        if (touched[fieldPath]) {
            const error = validateField(fieldPath, newValue);
            setErrors(prev => ({
                ...prev,
                [fieldPath]: error
            }));
        }
    };

    const handleBlur = (e, section) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' ? (value === '' ? undefined : Number(value)) : value;
        const fieldPath = section ? `${section}.${name}` : name;

        // Mark field as touched
        setTouched(prev => ({
            ...prev,
            [fieldPath]: true
        }));

        // Validate the field
        const error = validateField(fieldPath, newValue);
        setErrors(prev => ({
            ...prev,
            [fieldPath]: error
        }));
    };

    const handleServiceChange = (e) => {
        const { value, checked } = e.target;
        setContractorData(prevData => {
            const newServices = checked
                ? [...prevData.services, value]
                : prevData.services.filter(svc => svc !== value);

            // Validate services in real-time
            if (touched['services']) {
                const error = validateField('services', newServices);
                setErrors(prev => ({
                    ...prev,
                    'services': error
                }));
            }

            return {
                ...prevData,
                services: newServices
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
            case 0: // Contractor Details
                fields.push(
                    { path: 'contractorName', value: contractorData.contractorName },
                    // { path: 'experience.years', value: contractorData.experience.years },
                    { path: 'description', value: contractorData.description }
                );
                break;
            case 1: // Contact & Account
                fields.push(
                    { path: 'contact.phone', value: contractorData.contact.phone },
                    { path: 'contact.email', value: contractorData.contact.email },
                    { path: 'password', value: contractorData.password }
                );
                break;
            case 2: // Address
                fields.push(
                    { path: 'address.city', value: contractorData.address.city },
                    { path: 'address.state', value: contractorData.address.state },
                    { path: 'address.pincode', value: contractorData.address.pincode }
                );
                break;
            case 3: // Services & Pricing
                fields.push(
                    { path: 'services', value: contractorData.services }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validate all sections before submission
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
            const validationPayload = {
                ...contractorData,
                experience: {
                    ...contractorData.experience,
                    years: contractorData.experience.years === undefined ? undefined : contractorData.experience.years
                },
                pricing: {
                    ...contractorData.pricing,
                    hourlyRate: contractorData.pricing.hourlyRate === undefined ? undefined : contractorData.pricing.hourlyRate,
                    dailyRate: contractorData.pricing.dailyRate === undefined ? undefined : contractorData.pricing.dailyRate
                },
            };
            const validatedData = contractorSchema.parse(validationPayload);

            const payload = {
                contractorName: validatedData.contractorName,
                description: validatedData.description,
                contact: validatedData.contact,
                password: validatedData.password,
                address: validatedData.address,
                services: validatedData.services,
                experience: validatedData.experience,
                pricing: validatedData.pricing,
                image: avatarUrl || "", // avtar
                image2: ImagesUrl || []
            };

            // Use axios client to POST
            const { data } = await axiosClient.post('/useas/addcontractors', payload);

            toast.success(`✅ Contractor "${data.contractor.contractorName}" added successfully!`, {
                style: {
                    background: '#1f2937',
                    color: '#fff',
                    border: '1px solid #374151',
                    position: 'top-right'
                }
            });

            // reset form state
            setContractorData(initialContractorState);
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
        <div className="add-contractor-container full-screen-page">
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
                                    onClick={() => setActiveSection(index)}
                                >
                                    {index < activeSection ? '✓' : section.icon}
                                </div>
                                <span className="step-label">{section.title}</span>
                                {index < sections.length - 1 && <div className="step-connector"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-content-wrapper">
                    <header className="form-header">
                        <h1>Add New Contractor</h1>
                        <p>Register a new service provider with comprehensive details</p>
                    </header>

                    <form onSubmit={handleSubmit} className="multi-step-form">
                        {/* Contractor Information */}
                        <div className={`form-section ${activeSection === 0 ? 'active' : ''}`}>
                            <h3>Contractor Profile</h3>
                            <div className="form-grid">
                                <InputField
                                    label="Contractor Name"
                                    name="contractorName"
                                    value={contractorData.contractorName}
                                    required
                                    placeholder="Enter full business name"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('contractorName')}
                                />
                                <InputField
                                    label="Experience (Years)"
                                    name="years"
                                    value={contractorData.experience.years === undefined ? '' : contractorData.experience.years}
                                    section="experience"
                                    type="number"
                                    placeholder="Years of experience"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                // error={getError('experience.years')}
                                />
                            </div>
                            <TextareaField
                                label="Professional Bio"
                                name="description"
                                value={contractorData.description}
                                required
                                maxLength="500"
                                placeholder="Describe expertise, specialization, and key achievements..."
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
                            <h3>Contact & Account Information</h3>
                            <div className="form-grid">
                                <InputField
                                    label="Phone Number"
                                    name="phone"
                                    value={contractorData.contact.phone}
                                    section="contact"
                                    required
                                    placeholder="+91 9876543210"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('contact.phone')}
                                />
                                <InputField
                                    label="Alternate Phone"
                                    name="alternatePhone"
                                    value={contractorData.contact.alternatePhone}
                                    section="contact"
                                    placeholder="Optional backup number"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('contact.alternatePhone')}
                                />
                                <InputField
                                    label="Email Address"
                                    name="email"
                                    value={contractorData.contact.email}
                                    section="contact"
                                    type="email"
                                    required
                                    placeholder="business@example.com"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('contact.email')}
                                />
                                <InputField
                                    label="Temporary Password"
                                    name="password"
                                    value={contractorData.password}
                                    required
                                    type="password"
                                    placeholder="Set secure temporary password"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('password')}
                                />
                            </div>

                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Images</h4>

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
                            <h3>Business Address</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <InputField
                                        label="Street Address"
                                        name="street"
                                        value={contractorData.address.street}
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
                                    value={contractorData.address.landmark}
                                    section="address"
                                    placeholder="Near famous location"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('address.landmark')}
                                />
                                <InputField
                                    label="City"
                                    name="city"
                                    value={contractorData.address.city}
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
                                    value={contractorData.address.state}
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
                                    value={contractorData.address.pincode}
                                    section="address"
                                    required
                                    placeholder="6-digit pincode"
                                    onChangeHandler={handleChange}
                                    onBlurHandler={handleBlur}
                                    error={getError('address.pincode')}
                                />
                            </div>
                        </div>

                        {/* Services & Pricing */}
                        <div className={`form-section ${activeSection === 3 ? 'active' : ''}`}>
                            <h3>Services & Pricing Structure</h3>

                            <div className="services-section">
                                <label className="section-label">
                                    Services Provided <span className="required-star">*</span>
                                </label>
                                {getError('services') && <div className="field-error">{getError('services')}</div>}
                                <div className="services-grid">
                                    {SERVICES_ENUM.map(service => (
                                        <label key={service} className="service-card">
                                            <input
                                                type="checkbox"
                                                value={service}
                                                checked={contractorData.services.includes(service)}
                                                onChange={handleServiceChange}
                                                className="service-checkbox"
                                            />
                                            <div className="service-content">
                                                <span className="service-name">{service}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pricing-section">
                                <h4>Pricing Rates</h4>
                                <div className="form-grid">
                                    <InputField
                                        label="Hourly Rate (₹)"
                                        name="hourlyRate"
                                        value={contractorData.pricing.hourlyRate === undefined ? '' : contractorData.pricing.hourlyRate}
                                        section="pricing"
                                        type="number"
                                        placeholder="500"
                                        onChangeHandler={handleChange}
                                        onBlurHandler={handleBlur}
                                    // error={getError('pricing.hourlyRate')}
                                    />
                                    <InputField
                                        label="Daily Rate (₹)"
                                        name="dailyRate"
                                        value={contractorData.pricing.dailyRate === undefined ? '' : contractorData.pricing.dailyRate}
                                        section="pricing"
                                        type="number"
                                        placeholder="4000"
                                        onChangeHandler={handleChange}
                                        onBlurHandler={handleBlur}
                                    // error={getError('pricing.dailyRate')}
                                    />
                                    <InputField
                                        label="Project Rate"
                                        name="projectRate"
                                        value={contractorData.pricing.projectRate}
                                        section="pricing"
                                        placeholder="Negotiable or Fixed amount"
                                        onChangeHandler={handleChange}
                                        onBlurHandler={handleBlur}
                                    // error={getError('pricing.projectRate')}
                                    />
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
                                <button type="submit" disabled={loading} className="submit-button">
                                    {loading ? (
                                        <>
                                            <div className="spinner"></div>
                                            Adding Contractor...
                                        </>
                                    ) : (
                                        'Add Contractor & Create Account'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddContractor;