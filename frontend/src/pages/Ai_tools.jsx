// ConstructionEstimator.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBuilding, FaMapMarkerAlt, FaRulerCombined, FaDollarSign, FaClock, FaCheckCircle, FaLightbulb, FaSpinner, FaTimesCircle, FaHome, FaPaintBrush, FaHardHat, FaTools, FaCity, FaExpandArrowsAlt, FaRobot, FaShieldAlt, FaRegLightbulb } from 'react-icons/fa';
import { RiRocket2Fill, RiLayout3Fill, RiPinDistanceFill } from 'react-icons/ri';

// --- Framer Motion Variants ---

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const resultVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" } }
};

const serviceCardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            stiffness: 100
        }
    },
    hover: {
        y: -15,
        scale: 1.05,
        boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.4)",
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
    }
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

const ServiceCard = ({ icon: Icon, title, description, status, delay }) => (
    <motion.div
        variants={serviceCardVariants}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay }}
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 overflow-hidden group cursor-pointer"
    >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Floating icon */}
        <motion.div
            animate={floatingAnimation}
            className="relative z-10 mb-4"
        >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Icon className="w-8 h-8 text-white" />
            </div>
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-2 relative z-10">{title}</h3>
        <p className="text-gray-400 mb-4 relative z-10 leading-relaxed">{description}</p>

        <div className="flex justify-between items-center relative z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'Available'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : status === 'Coming Soon'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}>
                {status}
            </span>
            <motion.div
                whileHover={{ x: 5 }}
                className="text-indigo-400 text-sm font-medium flex items-center"
            >
                Explore <RiRocket2Fill className="ml-1 w-4 h-4" />
            </motion.div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </motion.div>
);

const FutureUpdateCard = ({ title, description, eta, icon: Icon }) => (
    <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        viewport={{ once: true }}
        className="relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-indigo-500/50 transition-all duration-500 group"
    >
        <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors duration-300">
                <Icon className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
                <p className="text-gray-400 text-sm mb-3 leading-relaxed">{description}</p>
                <div className="flex items-center text-xs text-indigo-400">
                    <FaClock className="w-3 h-3 mr-1" />
                    ETA: {eta}
                </div>
            </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full bg-gray-700 rounded-full h-1.5">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "70%" }}
                transition={{ duration: 2, delay: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
            />
        </div>
    </motion.div>
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

    // Future services data
    const futureServices = [
        {
            icon: FaHome,
            title: "AI Interior Design",
            description: "AI-powered interior design with virtual reality previews and automated furniture arrangement.",
            status: "Coming Soon",
            delay: 0.1
        },
        {
            icon: FaPaintBrush,
            title: "3D Architectural Visualization",
            description: "Photorealistic 3D renderings and virtual walkthroughs of your future property.",
            status: "In Development",
            delay: 0.2
        },
        {
            icon: FaHardHat,
            title: "Construction Management",
            description: "End-to-end project management with real-time progress tracking and automated scheduling.",
            status: "Coming Soon",
            delay: 0.3
        },
        {
            icon: FaTools,
            title: "Smart Home Integration",
            description: "Complete smart home solutions with IoT device integration and automation systems.",
            status: "Available",
            delay: 0.4
        },
        {
            icon: FaCity,
            title: "Urban Planning AI",
            description: "Advanced urban development analysis and sustainable city planning tools.",
            status: "In Development",
            delay: 0.5
        },
        {
            icon: FaExpandArrowsAlt,
            title: "Property Valuation AI",
            description: "Machine learning-based property valuation with market trend analysis and investment insights.",
            status: "Coming Soon",
            delay: 0.6
        }
    ];

    // Future updates data
    const futureUpdates = [
        {
            icon: FaRobot,
            title: "Generative AI Design",
            description: "AI that generates unique architectural designs based on your preferences and site constraints.",
            eta: "Q2 2024"
        },
        {
            icon: FaShieldAlt,
            title: "Blockchain Contracts",
            description: "Smart contract integration for transparent construction agreements and automated payments.",
            eta: "Q3 2024"
        },
        {
            icon: FaRegLightbulb,
            title: "Sustainability Analytics",
            description: "Advanced carbon footprint analysis and sustainable material recommendations.",
            eta: "Q4 2024"
        }
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
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Main Content */}
            <div className="py-12 px-4 sm:px-6 lg:px-8">
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-20">
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
            </div>

            {/* Amazing Footer Section */}
            <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-b from-gray-900 to-black border-t border-indigo-900/50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Future Services Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <motion.div
                            animate={floatingAnimation}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-indigo-500/25"
                        >
                            <RiRocket2Fill className="w-10 h-10 text-white" />
                        </motion.div>
                        <h2 className="text-4xl font-bold text-white mb-4">
                            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r font-Chango from-green-400 to-gray-400 ">Construction Technology</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                            Explore our expanding ecosystem of AI-powered construction and design solutions
                        </p>
                    </motion.div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {futureServices.map((service, index) => (
                            <ServiceCard
                                key={index}
                                icon={service.icon}
                                title={service.title}
                                description={service.description}
                                status={service.status}
                                delay={service.delay}
                            />
                        ))}
                    </div>

                    {/* Future Updates Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="bg-gray-800/30 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 mb-12"
                    >
                        <div className="text-center mb-10">
                            <h3 className="text-3xl font-bold text-white mb-3">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-green-400">Coming Soon</span> - Revolutionary Updates
                            </h3>
                            <p className="text-gray-400 text-lg">We're constantly evolving to bring you the most advanced construction technology</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {futureUpdates.map((update, index) => (
                                <FutureUpdateCard
                                    key={index}
                                    icon={update.icon}
                                    title={update.title}
                                    description={update.description}
                                    eta={update.eta}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Final CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-600/10 rounded-2xl p-8 border border-indigo-500/20">
                            <h4 className="text-2xl font-bold text-white mb-4">
                                Ready to Build the Future?
                            </h4>
                            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                                Join thousands of architects, builders, and visionaries who are already transforming construction with AI-powered insights.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/25">
                                    Schedule Demo
                                </button>
                                <button className="px-8 py-3 border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 font-semibold rounded-xl transition-all duration-300">
                                    Download Whitepaper
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bottom Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center pt-12 border-t border-gray-800 mt-12"
                    >
                        <p className="text-gray-500">
                            © 2025 Project Genesis. Built with ❤️ for the future of construction.
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                            Revolutionizing construction, one estimate at a time.
                        </p>
                    </motion.div>
                </div>
            </motion.footer>

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