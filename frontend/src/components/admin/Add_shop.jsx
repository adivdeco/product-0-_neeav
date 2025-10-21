import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify'; // Import toast components
import { shopSchema, CATEGORIES_ENUM, WORKING_DAYS_ENUM } from '../../api/shopValidationSchema';
import '../../AddShop.css'; // Import the corresponding CSS file

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

const AddShop = () => {
    const [shopData, setShopData] = useState(initialShopState);
    const [loading, setLoading] = useState(false);

    // Generic handler for nested state
    const handleChange = (e, section) => {
        const { name, value } = e.target;
        setShopData(prevData => ({
            ...prevData,
            ...(section ? { [section]: { ...prevData[section], [name]: value } } : { [name]: value })
        }));
    };

    // Handler for categories/working days (checkboxes)
    const handleCheckboxChange = (e, field, subSection = null) => {
        const { value, checked } = e.target;
        setShopData(prevData => {
            const currentArray = subSection ? prevData[field][subSection] : prevData[field];
            const newArray = checked
                ? [...currentArray, value]
                : currentArray.filter(item => item !== value);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Zod Validation
            const validatedData = shopSchema.parse(shopData);

            // 2. Prepare Payload for Backend (matches backend requirements)
            const payload = {
                shopName: validatedData.shopName,
                ownerName: validatedData.ownerName,
                description: validatedData.description,
                contact: validatedData.contact,
                address: validatedData.address,
                categories: validatedData.categories,
                businessHours: validatedData.businessHours,
            };

            // 3. API Call
            const response = await fetch('/useas/addshopowners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                // Backend error (e.g., 409 Conflict, 500 Internal Error)
                toast.error(`❌ ${result.message || 'Failed to add shop. Check server logs.'}`);
                throw new Error(result.message || 'API call failed');
            }

            // Success
            toast.success(`✅ Shop "${result.newShop.shopName}" added! Owner: ${result.ownerUser.name}`);
            setShopData(initialShopState); // Reset form

        } catch (error) {
            if (error.issues) {
                // Zod Validation Error
                error.issues.forEach(issue => {
                    // Extract path: contact.phone -> Phone Number
                    const fieldPath = issue.path.join('.');
                    const niceName = fieldPath.split('.').pop().replace(/([A-Z])/g, ' $1').trim();
                    toast.error(`${niceName}: ${issue.message}`);
                });
            } else if (!toast.isActive()) {
                // Catch API error if not already handled by a more specific toast
                toast.error(`Error: ${error.message}`);
            }
            console.error('Submission Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper components for cleaner JSX
    const InputField = ({ label, name, value, section, type = 'text', required = false, placeholder = '' }) => (
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
                onChange={(e) => handleChange(e, section)}
                placeholder={placeholder}
            />
        </div>
    );

    return (
        <div className="add-shop-container">
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="form-card">
                <header>
                    <h2>➕ Add New Shop</h2>
                    <p>Enter the details for the new shop and its owner. All fields marked with * are required.</p>
                </header>

                <hr />

                <form onSubmit={handleSubmit}>
                    {/* Basic Shop Information */}
                    <section>
                        <h3>🏢 Shop Details</h3>
                        <div className="form-row">
                            <InputField label="Shop Name" name="shopName" value={shopData.shopName} required />
                            <InputField label="Owner Name" name="ownerName" value={shopData.ownerName} required />
                        </div>
                        <div className="form-group full-width">
                            <label htmlFor="description">Description (Max 500 chars)</label>
                            <textarea
                                id="description"
                                name="description"
                                value={shopData.description}
                                onChange={(e) => handleChange(e, null)}
                                maxLength="500"
                                rows="3"
                                placeholder="Brief description of the shop and its services."
                            />
                        </div>
                    </section>

                    <hr />

                    {/* Contact Information */}
                    <section>
                        <h3>📞 Contact & Owner Login</h3>
                        <div className="form-row">
                            <InputField label="Phone Number" name="phone" value={shopData.contact.phone} section="contact" required placeholder="E.g., 9876543210" />
                            <InputField label="Alternate Phone" name="alternatePhone" value={shopData.contact.alternatePhone} section="contact" placeholder="Optional secondary number" />
                        </div>
                        <div className="form-row">
                            <InputField label="Email Address" name="email" value={shopData.contact.email} section="contact" type="email" required placeholder="E.g., owner@shop.com" />
                            <InputField label="Owner Password" name="password" value={shopData.contact.password} section="contact" type="password" required placeholder="Set a temporary password" />
                        </div>
                    </section>

                    <hr />

                    {/* Address Information */}
                    <section>
                        <h3>📍 Shop Address</h3>
                        <div className="form-row">
                            <InputField label="Street/Locality" name="street" value={shopData.address.street} section="address" />
                            <InputField label="Landmark (Optional)" name="landmark" value={shopData.address.landmark} section="address" />
                        </div>
                        <div className="form-row three-col">
                            <InputField label="City" name="city" value={shopData.address.city} section="address" required />
                            <InputField label="State" name="state" value={shopData.address.state} section="address" required />
                            <InputField label="Pincode" name="pincode" value={shopData.address.pincode} section="address" required />
                        </div>
                    </section>

                    <hr />

                    {/* Shop Specialization & Hours */}
                    <section>
                        <h3>🏷️ Categories & Hours</h3>

                        {/* Categories Checkboxes */}
                        <div className="form-group full-width checkbox-group">
                            <label>Categories (Select all that apply):</label>
                            <div className="categories-grid">
                                {CATEGORIES_ENUM.map(category => (
                                    <label key={category} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            value={category}
                                            checked={shopData.categories.includes(category)}
                                            onChange={(e) => handleCheckboxChange(e, 'categories')}
                                        />
                                        {category}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Business Hours and Days */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="open">Opening Time</label>
                                <input type="time" id="open" name="open" value={shopData.businessHours.open} onChange={(e) => handleChange(e, 'businessHours')} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="close">Closing Time</label>
                                <input type="time" id="close" name="close" value={shopData.businessHours.close} onChange={(e) => handleChange(e, 'businessHours')} />
                            </div>
                        </div>

                        <div className="form-group full-width checkbox-group">
                            <label>Working Days:</label>
                            <div className="days-grid">
                                {WORKING_DAYS_ENUM.map(day => (
                                    <label key={day} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            value={day}
                                            checked={shopData.businessHours.workingDays.includes(day)}
                                            onChange={(e) => handleCheckboxChange(e, 'businessHours', 'workingDays')}
                                        />
                                        {day.substring(0, 3)}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    <hr />

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Add Shop & Create Owner Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddShop;