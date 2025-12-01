// house blue print


import React, { useState, useRef } from 'react';

const HomeDesignVisualizer = () => {
    const [designData, setDesignData] = useState({
        bedrooms: 2,
        bathrooms: 1,
        toilets: 1,
        kitchen: 1,
        livingRoom: 1,
        diningRoom: 0,
        studyRoom: 0,
        storeRoom: 0,
        floorStyle: 'modern',
        totalFloors: 1,
        preferredLayout: 'rectangular'
    });

    const [generatedImage, setGeneratedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [designHistory, setDesignHistory] = useState([]);
    const canvasRef = useRef(null);

    const floorStyles = [
        { value: 'modern', label: 'Modern', color: '#3B82F6' },
        { value: 'traditional', label: 'Traditional', color: '#EF4444' },
        { value: 'contemporary', label: 'Contemporary', color: '#10B981' },
        { value: 'minimalist', label: 'Minimalist', color: '#8B5CF6' },
        { value: 'villa', label: 'Villa Style', color: '#F59E0B' }
    ];

    const layouts = [
        { value: 'rectangular', label: 'Rectangular' },
        { value: 'square', label: 'Square' },
        { value: 'l-shaped', label: 'L-Shaped' },
        { value: 'u-shaped', label: 'U-Shaped' },
        { value: 'duplex', label: 'Duplex' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setDesignData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    // Simulated AI Image Generation
    const generateHomeDesign = async () => {
        setLoading(true);

        try {
            // In real implementation, you would call an AI image generation API
            // For demo, we'll generate a canvas-based floor plan
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Generate floor plan based on inputs
            drawFloorPlan(ctx, designData);

            // Convert canvas to image
            const imageUrl = canvas.toDataURL('image/png');

            const newDesign = {
                id: Date.now(),
                image: imageUrl,
                data: { ...designData },
                timestamp: new Date().toLocaleString()
            };

            setGeneratedImage(imageUrl);
            setDesignHistory(prev => [newDesign, ...prev.slice(0, 4)]); // Keep last 5 designs

            // Simulate AI analysis
            await generateAIFeedback(designData);

        } catch (error) {
            console.error('Error generating design:', error);
        } finally {
            setLoading(false);
        }
    };

    const drawFloorPlan = (ctx, data) => {
        const { bedrooms, bathrooms, livingRoom, kitchen, preferredLayout } = data;
        const totalRooms = bedrooms + bathrooms + (livingRoom ? 1 : 0) + (kitchen ? 1 : 0);

        // Set background
        ctx.fillStyle = '#F9FAFB';
        ctx.fillRect(0, 0, 400, 300);

        // Draw outer structure based on layout
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, 360, 260);

        // Room dimensions and positions based on layout
        const roomConfig = calculateRoomLayout(data);

        // Draw rooms
        roomConfig.forEach(room => {
            ctx.fillStyle = room.color + '40'; // Add transparency
            ctx.fillRect(room.x, room.y, room.width, room.height);

            ctx.strokeStyle = room.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(room.x, room.y, room.width, room.height);

            // Room label
            ctx.fillStyle = '#1F2937';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(room.label, room.x + room.width / 2, room.y + room.height / 2);

            // Room dimensions
            ctx.fillStyle = '#6B7280';
            ctx.font = '10px Arial';
            ctx.fillText(
                `${room.width / 10}m × ${room.height / 10}m`,
                room.x + room.width / 2,
                room.y + room.height / 2 + 15
            );
        });

        // Draw doors
        ctx.fillStyle = '#8B4513';
        roomConfig.forEach(room => {
            if (room.door) {
                ctx.fillRect(room.door.x, room.door.y, room.door.width, room.door.height);
            }
        });

        // Draw windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(20, 120, 5, 60); // Left window
        ctx.fillRect(375, 120, 5, 60); // Right window
    };

    const calculateRoomLayout = (data) => {
        const rooms = [];
        const { preferredLayout, floorStyle } = data;

        // Get style color
        const style = floorStyles.find(s => s.value === floorStyle);
        const baseColor = style?.color || '#3B82F6';

        // Different layouts based on preferred layout
        switch (preferredLayout) {
            case 'rectangular':
                rooms.push(
                    { label: 'Living Room', x: 30, y: 30, width: 160, height: 120, color: baseColor, door: { x: 190, y: 140, width: 4, height: 20 } },
                    { label: 'Kitchen', x: 200, y: 30, width: 80, height: 80, color: baseColor, door: { x: 200, y: 110, width: 20, height: 4 } },
                    { label: 'Bedroom 1', x: 290, y: 30, width: 80, height: 120, color: baseColor, door: { x: 290, y: 140, width: 4, height: 20 } },
                    { label: 'Bathroom', x: 200, y: 120, width: 80, height: 60, color: baseColor, door: { x: 200, y: 120, width: 20, height: 4 } },
                    { label: 'Bedroom 2', x: 30, y: 160, width: 160, height: 110, color: baseColor, door: { x: 190, y: 250, width: 4, height: 20 } }
                );
                break;

            case 'square':
                rooms.push(
                    { label: 'Living Room', x: 30, y: 30, width: 170, height: 120, color: baseColor },
                    { label: 'Kitchen', x: 210, y: 30, width: 160, height: 80, color: baseColor },
                    { label: 'Bedroom 1', x: 30, y: 160, width: 160, height: 110, color: baseColor },
                    { label: 'Bathroom', x: 200, y: 120, width: 80, height: 60, color: baseColor },
                    { label: 'Bedroom 2', x: 290, y: 120, width: 80, height: 150, color: baseColor }
                );
                break;

            default:
                // Default rectangular layout
                rooms.push(
                    { label: 'Living Room', x: 30, y: 30, width: 160, height: 120, color: baseColor },
                    { label: 'Kitchen', x: 200, y: 30, width: 80, height: 80, color: baseColor },
                    { label: 'Bedroom 1', x: 290, y: 30, width: 80, height: 120, color: baseColor },
                    { label: 'Bathroom', x: 200, y: 120, width: 80, height: 60, color: baseColor },
                    { label: 'Bedroom 2', x: 30, y: 160, width: 160, height: 110, color: baseColor }
                );
        }

        return rooms.slice(0, data.bedrooms + data.bathrooms + (data.livingRoom ? 1 : 0) + (data.kitchen ? 1 : 0));
    };

    const generateAIFeedback = async (data) => {
        // Simulate AI analysis of the design
        return new Promise((resolve) => {
            setTimeout(() => {
                const feedbacks = [
                    "Your layout provides good space utilization. Consider adding more windows for natural light.",
                    "The room distribution is efficient. You might want to increase bathroom size for better comfort.",
                    "This design offers excellent privacy between bedrooms and living areas.",
                    "Consider merging the living and dining areas for a more open feel.",
                    "The layout is functional. Adding a small balcony could enhance the design."
                ];
                // In real implementation, this would come from your AI model
                console.log('AI Feedback:', feedbacks[Math.floor(Math.random() * feedbacks.length)]);
                resolve();
            }, 1000);
        });
    };

    const loadPreviousDesign = (design) => {
        setDesignData(design.data);
        setGeneratedImage(design.image);
    };

    const exportDesign = () => {
        if (generatedImage) {
            const link = document.createElement('a');
            link.download = `home-design-${Date.now()}.png`;
            link.href = generatedImage;
            link.click();
        }
    };

    const totalRooms = designData.bedrooms + designData.bathrooms + designData.livingRoom + designData.kitchen + designData.diningRoom + designData.studyRoom + designData.storeRoom;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        AI Home Design Visualizer
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Generate structural visualizations and floor plans based on your room requirements.
                        Get AI-powered suggestions for optimal space utilization.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Design Input Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Design Specifications</h2>

                            <div className="space-y-6">
                                {/* Room Configuration */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-4">Room Configuration</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Bedrooms
                                            </label>
                                            <input
                                                type="number"
                                                name="bedrooms"
                                                value={designData.bedrooms}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="6"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Bathrooms
                                            </label>
                                            <input
                                                type="number"
                                                name="bathrooms"
                                                value={designData.bathrooms}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="4"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Living Room
                                            </label>
                                            <select
                                                name="livingRoom"
                                                value={designData.livingRoom}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value={1}>Yes</option>
                                                <option value={0}>No</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Kitchen
                                            </label>
                                            <select
                                                name="kitchen"
                                                value={designData.kitchen}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value={1}>Yes</option>
                                                <option value={0}>No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Rooms */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-4">Additional Rooms</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Dining Room
                                            </label>
                                            <select
                                                name="diningRoom"
                                                value={designData.diningRoom}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value={1}>Yes</option>
                                                <option value={0}>No</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Study Room
                                            </label>
                                            <select
                                                name="studyRoom"
                                                value={designData.studyRoom}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value={1}>Yes</option>
                                                <option value={0}>No</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Design Style */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-4">Design Preferences</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Architectural Style
                                            </label>
                                            <select
                                                name="floorStyle"
                                                value={designData.floorStyle}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {floorStyles.map(style => (
                                                    <option key={style.value} value={style.value}>
                                                        {style.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Preferred Layout
                                            </label>
                                            <select
                                                name="preferredLayout"
                                                value={designData.preferredLayout}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {layouts.map(layout => (
                                                    <option key={layout.value} value={layout.value}>
                                                        {layout.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Total Floors
                                            </label>
                                            <input
                                                type="number"
                                                name="totalFloors"
                                                value={designData.totalFloors}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="4"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Design Summary</h4>
                                    <div className="text-sm text-blue-700 space-y-1">
                                        <p>Total Rooms: {totalRooms}</p>
                                        <p>Bedrooms: {designData.bedrooms}</p>
                                        <p>Bathrooms: {designData.bathrooms}</p>
                                        <p>Style: {floorStyles.find(s => s.value === designData.floorStyle)?.label}</p>
                                        <p>Layout: {layouts.find(l => l.value === designData.preferredLayout)?.label}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={generateHomeDesign}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating Design...
                                        </div>
                                    ) : (
                                        'Generate Home Design'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">Design Visualization</h2>
                                {generatedImage && (
                                    <button
                                        onClick={exportDesign}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Export Design
                                    </button>
                                )}
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 min-h-[400px] flex items-center justify-center">
                                {generatedImage ? (
                                    <div className="text-center">
                                        <img
                                            src={generatedImage}
                                            alt="Generated Home Design"
                                            className="max-w-full mx-auto rounded-lg shadow-md"
                                        />
                                        <p className="text-sm text-gray-500 mt-4">
                                            AI-Generated Floor Plan - {floorStyles.find(s => s.value === designData.floorStyle)?.label} Style
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-lg">Your design visualization will appear here</p>
                                        <p className="text-sm mt-2">Configure your requirements and click "Generate Home Design"</p>
                                    </div>
                                )}
                            </div>

                            {/* Hidden canvas for drawing */}
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={300}
                                className="hidden"
                            />
                        </div>

                        {/* Design History */}
                        {designHistory.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Designs</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {designHistory.map((design) => (
                                        <div
                                            key={design.id}
                                            className="border border-gray-200 rounded-lg p-2 cursor-pointer hover:border-blue-500 transition-colors"
                                            onClick={() => loadPreviousDesign(design)}
                                        >
                                            <img
                                                src={design.image}
                                                alt="Previous design"
                                                className="w-full h-20 object-cover rounded mb-2"
                                            />
                                            <p className="text-xs text-gray-600 text-center">
                                                {design.data.bedrooms}B {design.data.bathrooms}Ba
                                            </p>
                                            <p className="text-xs text-gray-500 text-center">
                                                {design.timestamp.split(',')[0]}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeDesignVisualizer;