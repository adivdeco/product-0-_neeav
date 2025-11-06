// src/components/QuoteRequestForm.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../../api/auth';
import {
    MdDescription,
    MdCalendarToday,
    MdLocationOn,
    MdClose
} from "react-icons/md";

export default function QuoteRequestForm({ contractor, onClose, onSuccess }) {
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        projectType: '',
        workDescription: '',
        timeline: '',
        startDate: '',
        address: '',
        specialRequirements: '',
        urgency: 'normal'
    });

    const projectTypes = [
        'Home Renovation',
        'New Construction',
        'Repair Work',
        'Commercial Project',
        'Interior Design',
        'Exterior Work',
        'Structural Work',
        'Maintenance',
        'Other'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                // Notification required fields
                senderId: user._id,
                receiverId: contractor._id,
                title: `New Quote Request from ${user.name}`,
                message: `Project: ${formData.projectType} | Timeline: ${formData.timeline}`,
                type: "service_request",

                // Service request specific fields
                projectType: formData.projectType,
                workDescription: formData.workDescription,
                timeline: formData.timeline,
                startDate: formData.startDate,
                address: formData.address,
                specialRequirements: formData.specialRequirements,
                urgency: formData.urgency,
                contractorName: contractor.contractorName,
                customerName: user.name,
                customerPhone: user.phone,
                customerEmail: user.email
            };

            console.log('📤 Sending payload:', payload);

            const response = await axiosClient.post('/notifications/send', payload);

            console.log('✅ Quote request sent:', response.data);

            if (onSuccess) {
                onSuccess(response.data);
            }

            onClose();

        } catch (error) {
            console.error('❌ Failed to send quote request:', error);
            console.log('🔍 Error details:', error.response?.data);
            alert('Failed to send request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Request Quote</h2>
                        <p className="text-gray-600 mt-1">
                            Send your project details to {contractor.contractorName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Project Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Project Type *
                        </label>
                        <select
                            name="projectType"
                            value={formData.projectType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                            <option value="">Select Project Type</option>
                            {projectTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Work Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Work Description *
                        </label>
                        <div className="relative">
                            <MdDescription className="absolute left-3 top-3 text-gray-400" size={20} />
                            <textarea
                                name="workDescription"
                                value={formData.workDescription}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Describe the work you need in detail..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Expected Timeline *
                        </label>
                        <input
                            type="text"
                            name="timeline"
                            value={formData.timeline}
                            onChange={handleChange}
                            required
                            placeholder="e.g., 2 weeks, 1 month, etc."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Start Date & Urgency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Preferred Start Date
                            </label>
                            <div className="relative">
                                <MdCalendarToday className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Urgency Level
                            </label>
                            <select
                                name="urgency"
                                value={formData.urgency}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="low">Low - Flexible timing</option>
                                <option value="normal">Normal - Within few weeks</option>
                                <option value="high">High - Need soon</option>
                                <option value="urgent">Urgent - Immediate attention</option>
                            </select>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Project Address *
                        </label>
                        <div className="relative">
                            <MdLocationOn className="absolute left-3 top-3 text-gray-400" size={20} />
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows={2}
                                placeholder="Enter complete project address..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>
                    </div>

                    {/* Special Requirements */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Special Requirements
                        </label>
                        <textarea
                            name="specialRequirements"
                            value={formData.specialRequirements}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Any specific materials, designs, or special requirements..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Sending...
                                </div>
                            ) : (
                                'Send Quote Request'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}