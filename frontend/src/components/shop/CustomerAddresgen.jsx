import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { detectCityFromPhone, getCurrentLocation, popularCities } from '../../utils/addressHelper';
import { generateCustomerEmail, shouldGenerateEmail } from '../../utils/emailGenerator';

// CSS Classes (add these to your existing classes)
const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white hover:border-gray-400";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2";
const errorClass = "text-red-500 text-xs mt-1 animate-pulse";

const CustomerForm = ({ selectedCustomer, customer }) => {
    const { register, watch, setValue, formState: { errors } } = useForm();
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    // Watch form fields
    const watchCustomerName = watch('customerName');
    const watchPhone = watch('phone');
    const watchEmail = watch('email');
    const watchAddress = watch('address');

    // Auto-generate email
    useEffect(() => {
        if (shouldGenerateEmail(watchEmail, selectedCustomer) && watchCustomerName) {
            const generatedEmail = generateCustomerEmail(watchCustomerName, watchPhone);
            setValue('email', generatedEmail);
        }
    }, [watchCustomerName, watchPhone, watchEmail, selectedCustomer, setValue]);

    // Auto-detect city from phone
    useEffect(() => {
        if (!selectedCustomer && watchPhone?.length >= 4) {
            const detectedCity = detectCityFromPhone(watchPhone);
            if (detectedCity && !watchAddress) {
                setValue('address', detectedCity);
            }
        }
    }, [watchPhone, selectedCustomer, watchAddress, setValue]);

    // Handle current location detection
    const handleGetCurrentLocation = async () => {
        setIsGettingLocation(true);
        setLocationError('');

        try {
            const location = await getCurrentLocation();
            if (location.fullAddress && location.fullAddress !== 'Location detected but details unavailable') {
                setValue('address', location.fullAddress);
            } else {
                setLocationError('Location detected but address details unavailable. Please type manually.');
            }
        } catch (error) {
            console.error('Error getting location:', error);
            setLocationError('Location access denied or unavailable. Please type address manually.');

            // Fallback to phone-based city detection
            const detectedCity = detectCityFromPhone(watchPhone);
            if (detectedCity) {
                setValue('address', detectedCity);
            }
        } finally {
            setIsGettingLocation(false);
        }
    };

    // Pre-fill data if customer is selected
    useEffect(() => {
        if (selectedCustomer && customer) {
            if (customer.address) {
                if (typeof customer.address === 'string') {
                    setValue('address', customer.address);
                } else {
                    const addressParts = [
                        customer.address?.street,
                        customer.address?.city,
                        customer.address?.state,
                        customer.address?.pincode
                    ].filter(Boolean);
                    setValue('address', addressParts.join(', '));
                }
            }
        }
    }, [selectedCustomer, customer, setValue]);

    return (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Customer Name */}
            <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                <label htmlFor="customerName" className={labelClass}>
                    Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                    id="customerName"
                    type="text"
                    {...register('customerName', {
                        required: 'Customer name is required'
                    })}
                    className={inputClass}
                    placeholder="John Doe"
                    disabled={selectedCustomer}
                />
                {errors.customerName && (
                    <p className={errorClass}>{errors.customerName.message}</p>
                )}
            </div>

            {/* Phone */}
            <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                <label htmlFor="phone" className={labelClass}>
                    Phone <span className="text-xs text-gray-500">(for city detection)</span>
                </label>
                <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className={inputClass}
                    placeholder="9876543210"
                    disabled={selectedCustomer}
                />
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div className="transform transition-transform duration-300 hover:scale-[1.02]">
                <label htmlFor="email" className={labelClass}>
                    Email <span className="text-xs text-blue-600">(Auto-generated)</span>
                </label>
                <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={inputClass}
                    placeholder="Auto-generated email"
                    disabled={selectedCustomer}
                />
                {watchEmail && (
                    <p className="text-xs text-green-600 mt-1">
                        ✓ Email auto-generated for bill tracking
                    </p>
                )}
                {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>

            {/* Smart Address Section */}
            <div className="lg:col-span-1 transform transition-transform duration-300 hover:scale-[1.02]">
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="address" className={labelClass}>
                        Address
                    </label>
                    <div className="flex gap-1">
                        {!selectedCustomer && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const detectedCity = detectCityFromPhone(watchPhone);
                                        if (detectedCity) {
                                            setValue('address', detectedCity);
                                        } else {
                                            setLocationError('Could not detect city from phone number');
                                        }
                                    }}
                                    disabled={!watchPhone}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Detect city from phone area code"
                                >
                                    From Phone
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGetCurrentLocation}
                                    disabled={isGettingLocation}
                                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50 flex items-center gap-1"
                                    title="Use current location"
                                >
                                    {isGettingLocation ? '📡' : '📍'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <input
                    id="address"
                    type="text"
                    {...register('address')}
                    className={inputClass}
                    placeholder="Start typing city or use buttons above"
                    disabled={selectedCustomer}
                    list="popularCities"
                />

                <datalist id="popularCities">
                    {popularCities.map(city => (
                        <option key={city} value={city} />
                    ))}
                </datalist>

                {/* Location Error */}
                {locationError && (
                    <p className="text-xs text-red-600 mt-1">{locationError}</p>
                )}

                {/* Smart suggestions */}
                {!selectedCustomer && watchAddress && watchAddress.length > 0 && (
                    <div className="mt-2">
                        {watchAddress.length < 3 ? (
                            <p className="text-xs text-gray-500">
                                💡 Tip: Add area/locality for better tracking
                            </p>
                        ) : (
                            <p className="text-xs text-green-600">
                                ✓ Address saved for billing
                            </p>
                        )}
                    </div>
                )}

                {/* Quick city buttons */}
                {!selectedCustomer && !watchAddress && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Quick select:</p>
                        <div className="flex flex-wrap gap-1">
                            {popularCities.slice(0, 6).map(city => (
                                <button
                                    key={city}
                                    type="button"
                                    onClick={() => setValue('address', city)}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 border border-gray-300"
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {isGettingLocation && (
                    <p className="text-xs text-blue-600 mt-1">
                        🔍 Detecting your location...
                    </p>
                )}
            </div>

        </div>
    );
};

export default CustomerForm;