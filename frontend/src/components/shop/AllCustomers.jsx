import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Download,
    Upload,
    Phone,
    Mail,
    MapPin,
    User,
    Building,
    CreditCard,
    MoreVertical
} from 'lucide-react';
import axiosClient from '../../api/auth';

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [creditFilter, setCreditFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('active');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // New customer form state
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        type: 'Individual',
        // address: {
        //     street: '',
        //     city: '',
        //     state: '',
        //     pincode: '',
        //     landmark: ''
        // },
        address: '',
        creditAllowed: false,
        creditLimit: 0,
        gstNumber: ''
    });

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/khata/customer');
            console.log(response.data);
            setCustomers(response.data.customers || response.data);
        } catch (err) {
            setError('Failed to fetch customers');
            console.error('Error fetching customers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Filter customers
    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone?.includes(searchTerm) ||
                customer.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = selectedType === 'all' || customer.type === selectedType;

            const matchesCredit = creditFilter === 'all' ||
                (creditFilter === 'withCredit' && customer.creditAllowed) ||
                (creditFilter === 'withoutCredit' && !customer.creditAllowed);

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && customer.isActive) ||
                (statusFilter === 'inactive' && !customer.isActive);

            return matchesSearch && matchesType && matchesCredit && matchesStatus;
        });
    }, [customers, searchTerm, selectedType, creditFilter, statusFilter]);

    // Add new customer
    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/customers', newCustomer);
            setShowAddModal(false);
            setNewCustomer({
                name: '',
                phone: '',
                email: '',
                type: 'Individual',
                // address: { street: '', city: '', state: '', pincode: '', landmark: '' },
                address: '',
                creditAllowed: false,
                creditLimit: 0,
                gstNumber: ''
            });
            fetchCustomers();
        } catch (err) {
            setError('Failed to add customer');
        }
    };

    // Delete customer
    const handleDeleteCustomer = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                await axiosClient.delete(`/customers/${customerId}`);
                fetchCustomers();
            } catch (err) {
                setError('Failed to delete customer');
            }
        }
    };

    // Customer types for filter
    const customerTypes = ['all', 'Individual', 'Contractor', 'Builder', 'Construction Company', 'Other'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                        <p className="text-gray-600 mt-2">Manage your customers and their information</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Add Customer</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <User className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Customers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {customers.filter(c => c.isActive).length}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <User className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">With Credit</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {customers.filter(c => c.creditAllowed).length}
                            </p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <CreditCard className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Business Customers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {customers.filter(c => c.type !== 'Individual').length}
                            </p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                            <Building className="text-orange-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow mb-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {customerTypes.map(type => (
                            <option key={type} value={type}>
                                {type === 'all' ? 'All Types' : type}
                            </option>
                        ))}
                    </select>

                    {/* Credit Filter */}
                    <select
                        value={creditFilter}
                        onChange={(e) => setCreditFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Credit Types</option>
                        <option value="withCredit">With Credit</option>
                        <option value="withoutCredit">Without Credit</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Credit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Balance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="text-blue-600" size={20} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {customer.name}
                                                </div>
                                                {customer.gstNumber && (
                                                    <div className="text-sm text-gray-500">
                                                        GST: {customer.gstNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900 flex items-center space-x-1">
                                            <Phone size={16} />
                                            <span>{customer.phone}</span>
                                        </div>
                                        {customer.email && (
                                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                                                <Mail size={16} />
                                                <span>{customer.email}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${customer.type === 'Individual'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-purple-100 text-purple-800'
                                            }`}>
                                            {customer.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${customer.creditAllowed
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {customer.creditAllowed ? 'Allowed' : 'Not Allowed'}
                                        </span>
                                        {customer.creditAllowed && customer.creditLimit > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                Limit: ₹{customer.creditLimit}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-medium ${customer.currentBalance > 0 ? 'text-red-600' : 'text-green-600'
                                            }`}>
                                            ₹{customer.currentBalance || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${customer.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {customer.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCustomer(customer);
                                                    setShowViewModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button className="text-green-600 hover:text-green-900">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCustomer(customer._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-12">
                        <User className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding a new customer'}
                        </p>
                    </div>
                )}
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Add New Customer</h3>
                            <form onSubmit={handleAddCustomer} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newCustomer.name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={newCustomer.phone}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={newCustomer.email}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Customer Type
                                    </label>
                                    <select
                                        value={newCustomer.type}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="Individual">Individual</option>
                                        <option value="Contractor">Contractor</option>
                                        <option value="Builder">Builder</option>
                                        <option value="Construction Company">Construction Company</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={newCustomer.creditAllowed}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, creditAllowed: e.target.checked })}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label className="text-sm font-medium text-gray-700">
                                        Allow Credit
                                    </label>
                                </div>

                                {newCustomer.creditAllowed && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Credit Limit (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={newCustomer.creditLimit}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: parseFloat(e.target.value) || 0 })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                                    >
                                        Add Customer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Customer Modal */}
            {showViewModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Customer Details</h3>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Name</label>
                                            <p className="text-gray-900">{selectedCustomer.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Phone</label>
                                            <p className="text-gray-900">{selectedCustomer.phone}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Email</label>
                                            <p className="text-gray-900">{selectedCustomer.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Type</label>
                                            <p className="text-gray-900">{selectedCustomer.type}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-4">Financial Information</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Credit Allowed</label>
                                            <p className="text-gray-900">{selectedCustomer.creditAllowed ? 'Yes' : 'No'}</p>
                                        </div>
                                        {selectedCustomer.creditAllowed && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Credit Limit</label>
                                                <p className="text-gray-900">₹{selectedCustomer.creditLimit || 'No limit'}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Current Balance</label>
                                            <p className={`font-medium ${selectedCustomer.currentBalance > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                ₹{selectedCustomer.currentBalance || 0}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Status</label>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedCustomer.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedCustomer.address && (
                                <div className="mt-6">
                                    <h4 className="font-medium text-gray-900 mb-4">Address</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="text-gray-400 mt-1" size={16} />
                                            <div>
                                                {selectedCustomer.address && typeof selectedCustomer.address === 'string' ? (
                                                    <p>{selectedCustomer.address}</p>
                                                ) : (
                                                    <>
                                                        {selectedCustomer.address.street && <p>{selectedCustomer.address.street}</p>}
                                                        {selectedCustomer.address.city && <p>{selectedCustomer.address.city}</p>}
                                                        {selectedCustomer.address.state && <p>{selectedCustomer.address.state}</p>}
                                                        {selectedCustomer.address.pincode && <p>PIN: {selectedCustomer.address.pincode}</p>}
                                                        {selectedCustomer.address.landmark && <p>Landmark: {selectedCustomer.address.landmark}</p>}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
                    {error}
                </div>
            )}
        </div>
    );
};

export default CustomersPage;