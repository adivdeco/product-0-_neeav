// ConstructionEstimator.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaMapMarkerAlt, FaRulerCombined, FaDollarSign, FaClock, FaCheckCircle, FaLightbulb, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import { RiRocket2Fill, RiLayout3Fill, RiPinDistanceFill } from 'react-icons/ri';
import axiosClient from "../api/auth"

// --- Framer Motion Variants ---

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const resultVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } }
};

// --- Helper Components ---

const DetailCard = ({ icon: Icon, title, value }) => (
    <div className="flex items-center space-x-3 bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 hover:border-indigo-500 transition-colors duration-300">
        <Icon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
        <div>
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <p className="text-lg font-bold text-white">{value}</p>
        </div>
    </div>
);


const ConstructionEstimator = () => {
    const [formData, setFormData] = useState({
        length: '50',
        breadth: '30',
        area: '1500',
        floors: 1,
        constructionType: 'standard',
        location: 'urban',
        amenities: [],
        timeline: '6'
    });

    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [aiFeedback, setAiFeedback] = useState('');
    const [error, setError] = useState(null);

    // Available amenities
    const amenitiesList = [
        'Swimming Pool', 'Garden', 'Parking', 'Solar Panels',
        'Smart Home', 'Security System', 'Modular Kitchen'
    ];

    // --- Handlers ---

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setError(null); // Clear errors on input change

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                amenities: checked
                    ? [...prev.amenities, value]
                    : prev.amenities.filter(item => item !== value)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    useEffect(() => {
        calculateArea();
    }, [formData.length, formData.breadth]);

    const calculateArea = () => {
        const len = parseFloat(formData.length);
        const bre = parseFloat(formData.breadth);

        if (!isNaN(len) && !isNaN(bre) && len > 0 && bre > 0) {
            const area = len * bre;
            setFormData(prev => ({
                ...prev,
                area: area.toFixed(2)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                area: ''
            }));
        }
    };

    // --- Connect to Backend ---

    const generateEstimate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setEstimate(null);
        setAiFeedback('');

        if (!formData.area || parseFloat(formData.area) <= 0) {
            setError("Please enter valid Length and Breadth values and calculate the area.");
            setLoading(false);
            return;
        }

        try {
            // Send ALL form data to the Express backend endpoint
            const response = await axiosClient.post('/ai-build', formData);

            const { estimate, aiFeedback } = response.data;

            setEstimate(estimate);
            setAiFeedback(aiFeedback);

        } catch (err) {
            console.error('Backend Estimation Error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to connect to the estimation service. Please check the server.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            length: '50',
            breadth: '30',
            area: '1500',
            floors: 1,
            constructionType: 'standard',
            location: 'urban',
            amenities: [],
            timeline: '6'
        });
        setEstimate(null);
        setAiFeedback('');
        setError(null);
    };

    // --- Renderer ---

    const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 border-b border-indigo-700/50 pb-6"
                >
                    <h1 className="text-5xl font-extrabold tracking-tight text-indigo-400 sm:text-6xl">
                        Project Genesis 🏗️
                    </h1>
                    <p className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto">
                        Your futuristic platform for precise construction budgeting and AI insights.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Input Form Panel */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        className="lg:col-span-2 bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700"
                    >
                        <h2 className="text-3xl font-bold text-indigo-300 mb-8 flex items-center">
                            <RiLayout3Fill className="w-7 h-7 mr-3" /> Define Your Structure
                        </h2>

                        <form onSubmit={generateEstimate} className="space-y-8">
                            {/* Section 1: Dimensions */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2">
                                    <FaRulerCombined className="inline w-5 h-5 mr-2 text-indigo-400" /> Area & Floors
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {/* Length */}
                                    <div className="md:col-span-1">
                                        <label className="input-label">Length (ft)</label>
                                        <input
                                            type="number" name="length" value={formData.length} onChange={handleInputChange} onBlur={calculateArea}
                                            className="input-field" placeholder="e.g., 50" min="1"
                                        />
                                    </div>
                                    {/* Breadth */}
                                    <div className="md:col-span-1">
                                        <label className="input-label">Breadth (ft)</label>
                                        <input
                                            type="number" name="breadth" value={formData.breadth} onChange={handleInputChange} onBlur={calculateArea}
                                            className="input-field" placeholder="e.g., 30" min="1"
                                        />
                                    </div>
                                    {/* Area */}
                                    <div className="md:col-span-1">
                                        <label className="input-label">Total Area (sq ft)</label>
                                        <input
                                            type="text" name="area" value={formData.area} readOnly
                                            className="input-field bg-gray-900 border-indigo-500/50" placeholder="Calculated area"
                                        />
                                    </div>
                                    {/* Floors */}
                                    <div className="md:col-span-1">
                                        <label className="input-label">Floors</label>
                                        <select name="floors" value={formData.floors} onChange={handleInputChange} className="input-field">
                                            {[1, 2, 3, 4, 5].map(floor => (<option key={floor} value={floor}>{floor}</option>))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Type, Location, Timeline */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2">
                                    <RiPinDistanceFill className="inline w-5 h-5 mr-2 text-indigo-400" /> Style & Logistics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Construction Type */}
                                    <div>
                                        <label className="input-label">Construction Type</label>
                                        <select name="constructionType" value={formData.constructionType} onChange={handleInputChange} className="input-field">
                                            <option value="economy">Economy (₹1200/sqft)</option>
                                            <option value="standard">Standard (₹1800/sqft)</option>
                                            <option value="premium">Premium (₹2500/sqft)</option>
                                            <option value="luxury">Luxury (₹4000/sqft)</option>
                                        </select>
                                    </div>
                                    {/* Location Type */}
                                    <div>
                                        <label className="input-label">Location Type</label>
                                        <select name="location" value={formData.location} onChange={handleInputChange} className="input-field">
                                            <option value="rural">Rural (x0.9)</option>
                                            <option value="suburban">Suburban (x1.0)</option>
                                            <option value="urban">Urban (x1.2)</option>
                                            <option value="metro">Metro (x1.5)</option>
                                        </select>
                                    </div>
                                    {/* Timeline */}
                                    <div>
                                        <label className="input-label">Timeline (months)</label>
                                        <select name="timeline" value={formData.timeline} onChange={handleInputChange} className="input-field">
                                            {[3, 6, 9, 12, 18, 24].map(month => (
                                                <option key={month} value={month}>{month} months</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Amenities */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2">
                                    <FaCheckCircle className="inline w-5 h-5 mr-2 text-indigo-400" /> Premium Features
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {amenitiesList.map(amenity => (
                                        <div key={amenity} className="flex items-center amenity-checkbox-container">
                                            <input
                                                type="checkbox" id={amenity} value={amenity}
                                                checked={formData.amenities.includes(amenity)} onChange={handleInputChange}
                                                className="hidden" // Hide default checkbox
                                            />
                                            <label htmlFor={amenity} className="amenity-checkbox-label">
                                                {amenity}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex space-x-4">
                                <button
                                    type="submit" disabled={loading || !formData.area || parseFloat(formData.area) <= 0}
                                    className="action-button primary-button"
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin h-5 w-5 mr-3" />
                                            Analyzing & Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <RiRocket2Fill className="h-5 w-5 mr-2" /> Generate Estimate
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button" onClick={resetForm}
                                    className="action-button secondary-button"
                                >
                                    Reset Form
                                </button>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 bg-red-900 rounded-lg text-red-300 flex items-center">
                                    <FaTimesCircle className="w-5 h-5 mr-3" />
                                    {error}
                                </motion.div>
                            )}

                        </form>
                    </motion.div>

                    {/* Results Panel */}
                    <div className="lg:col-span-1">
                        {loading && (
                            <motion.div initial="hidden" animate="visible" variants={itemVariants} className="bg-gray-800 rounded-3xl p-8 border border-gray-700 flex flex-col items-center justify-center min-h-[400px]">
                                <FaSpinner className="animate-spin h-10 w-10 text-indigo-500 mb-4" />
                                <p className="text-lg text-indigo-300">Calculating Estimates...</p>
                                <p className="text-sm text-gray-500 mt-1">Generating AI recommendations...</p>
                            </motion.div>
                        )}

                        {estimate && !loading ? (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={resultVariants}
                                className="bg-gray-800 rounded-3xl shadow-2xl p-8 border border-indigo-600 sticky top-6"
                            >
                                <h2 className="text-3xl font-bold text-green-400 mb-6 border-b border-indigo-700 pb-3">
                                    <FaDollarSign className="inline w-6 h-6 mr-2" /> Final Projection
                                </h2>

                                {/* Key Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <DetailCard icon={FaRulerCombined} title="Total Construction Area" value={`${estimate.totalArea} sq ft`} />
                                    <DetailCard icon={FaDollarSign} title="Cost Per Sq Ft" value={formatCurrency(estimate.costPerSqFt)} />
                                </div>

                                {/* Cost Breakdown */}
                                <div className="space-y-3 mb-6 p-4 bg-gray-900 rounded-xl border border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Cost Breakdown</h3>
                                    <div className="flex justify-between text-sm text-gray-400"><span>Base Cost</span><span>{formatCurrency(estimate.baseCost)}</span></div>
                                    <div className="flex justify-between text-sm text-gray-400"><span>Location Adjustment</span><span className={estimate.locationAdjustment > 0 ? "text-red-400" : "text-green-400"}>{formatCurrency(estimate.locationAdjustment)}</span></div>
                                    <div className="flex justify-between text-sm text-gray-400"><span>Amenities Cost</span><span>{formatCurrency(estimate.amenitiesCost)}</span></div>
                                    <div className="flex justify-between text-sm text-gray-400"><span>Timeline Premium</span><span className={estimate.timelineAdjustment > 0 ? "text-red-400" : "text-green-400"}>{formatCurrency(estimate.timelineAdjustment)}</span></div>
                                    <div className="flex justify-between text-sm text-gray-400 pt-2 border-t border-gray-700"><span>Contingency (8%)</span><span>{formatCurrency(estimate.contingency)}</span></div>
                                </div>

                                {/* Total Cost Display */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-6 p-5 bg-indigo-900/50 rounded-xl border border-indigo-600 shadow-xl"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-semibold text-indigo-200">GRAND TOTAL ESTIMATE</span>
                                        <span className="text-3xl font-extrabold text-green-400 tracking-wider">{formatCurrency(estimate.totalCost)}</span>
                                    </div>
                                </motion.div>

                                {/* AI Feedback */}
                                {aiFeedback && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.0 }}
                                        className="mt-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-700/50"
                                    >
                                        <h3 className="text-md font-bold text-indigo-300 flex items-center mb-2">
                                            <FaLightbulb className="w-4 h-4 mr-2" /> AI Project Advisory
                                        </h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">{aiFeedback}</p>
                                    </motion.div>
                                )}

                            </motion.div>
                        ) : (
                            <div className="bg-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] border border-gray-700">
                                <FaBuilding className="h-12 w-12 text-gray-600 mb-4" />
                                <h3 className="text-lg font-medium text-gray-400">Estimation Ready</h3>
                                <p className="mt-1 text-sm text-gray-500 text-center">Enter your project details on the left and click 'Generate Estimate' to see your breakdown and AI advice.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Injected CSS for futuristic styling */}
            <style>{`
                .input-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #9ca3af; /* gray-400 */
                    margin-bottom: 0.25rem;
                }
                .input-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #374151; /* gray-700 */
                    border-radius: 0.75rem; /* rounded-xl */
                    background-color: #1f2937; /* gray-800 */
                    color: white;
                    transition: all 0.3s;
                }
                .input-field:focus {
                    border-color: #6366f1; /* indigo-500 */
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5);
                    outline: none;
                }
                .action-button {
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.75rem;
                    font-weight: 600;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .primary-button {
                    flex: 1;
                    background-color: #4f46e5; /* indigo-600 */
                    color: white;
                }
                .primary-button:hover:not(:disabled) {
                    background-color: #4338ca; /* indigo-700 */
                }
                .secondary-button {
                    background-color: #374151; /* gray-700 */
                    color: #d1d5db; /* gray-300 */
                    border: 1px solid #4b5563; /* gray-600 */
                }
                .secondary-button:hover:not(:disabled) {
                    background-color: #4b5563; /* gray-600 */
                    color: white;
                }

                .amenity-checkbox-container input[type="checkbox"]:checked + .amenity-checkbox-label {
                    background-color: #4f46e5; /* indigo-600 */
                    border-color: #4f46e5;
                    color: white;
                    box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
                }

                .amenity-checkbox-label {
                    cursor: pointer;
                    padding: 0.5rem 1rem;
                    border: 1px solid #4b5563;
                    border-radius: 9999px; /* rounded-full */
                    font-size: 0.875rem;
                    color: #d1d5db;
                    background-color: #1f2937;
                    transition: all 0.3s;
                    white-space: nowrap;
                    flex-grow: 1;
                    text-align: center;
                }
                .amenity-checkbox-label:hover {
                    border-color: #6366f1;
                }
            `}</style>
        </div>
    );
};

export default ConstructionEstimator;