// ** src/components/shop/AllBills.jsx **

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    FiFilter,
    FiCalendar,
    FiSearch,
    FiTrash2,
    FiEdit,
    FiAlertCircle,
    FiArrowLeft,
    FiArrowRight,
    FiDollarSign,
    FiUser,
    FiPhone,
    FiFileText,
    FiDownload,
    FiEye,
    FiX
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import axiosClient from '../../api/auth';
import BillDetailsModal from './BillDetailsModal';
import UpdateBillModal from './UpdateBillModal';

// --- Utility Functions ---
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'dd MMM yyyy, HH:mm');
    } catch (e) {
        return 'Invalid Date';
    }
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

// Client-side filtering function (temporary until backend is updated)
const filterBills = (bills, filters) => {
    return bills.filter(bill => {
        // Search query filter (name, phone, bill number)
        if (filters.searchQuery) {
            const searchLower = filters.searchQuery.toLowerCase();
            const matchesSearch =
                bill.customerName?.toLowerCase().includes(searchLower) ||
                bill.customerPhone?.includes(searchLower) ||
                bill.billNumber?.toLowerCase().includes(searchLower) ||
                bill.customerId?.name?.toLowerCase().includes(searchLower) ||
                bill.customerId?.phone?.includes(searchLower);

            if (!matchesSearch) return false;
        }

        // Payment status filter
        if (filters.paymentStatus !== 'all' && bill.paymentStatus !== filters.paymentStatus) {
            return false;
        }

        // Amount range filter
        if (filters.amountRange !== 'all') {
            const amount = bill.grandTotal;
            switch (filters.amountRange) {
                case 'low':
                    if (amount > 1000) return false;
                    break;
                case 'medium':
                    if (amount <= 1000 || amount > 5000) return false;
                    break;
                case 'high':
                    if (amount <= 5000) return false;
                    break;
            }
        }

        // Date range filter
        if (filters.startDate || filters.endDate) {
            const billDate = new Date(bill.billDate);
            if (filters.startDate && billDate < startOfDay(filters.startDate)) return false;
            if (filters.endDate && billDate > endOfDay(filters.endDate)) return false;
        }

        return true;
    });
};

const AllBills = () => {
    const [allBills, setAllBills] = useState([]); // All bills from API
    const [filteredBills, setFilteredBills] = useState([]); // Bills after client-side filtering
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        searchQuery: '', // Unified search for name, phone, bill number
        paymentStatus: 'all',
        amountRange: 'all',
        startDate: null,
        endDate: null,
        page: 1,
        limit: 20,
    });
    const [pagination, setPagination] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);
    const [selectedBill, setSelectedBill] = useState(null);
    const [showBillDetails, setShowBillDetails] = useState(false);

    // Add this view function
    const viewBillDetails = (bill) => {
        setSelectedBill(bill);
        setShowBillDetails(true);
    };

    const [selectedBillForEdit, setSelectedBillForEdit] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    // Add this function to handle edit
    const handleEditBill = (bill) => {
        setSelectedBillForEdit(bill);
        setShowUpdateModal(true);
    };

    // Add this function to handle update success
    const handleBillUpdate = (updatedBill) => {
        // Update the bill in the local state
        setAllBills(prevBills =>
            prevBills.map(bill =>
                bill._id === updatedBill._id ? updatedBill : bill
            )
        );
        setFilteredBills(prevBills =>
            prevBills.map(bill =>
                bill._id === updatedBill._id ? updatedBill : bill
            )
        );
    };

    // Fetch all bills (without filtering)
    const fetchBills = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: filters.page,
                limit: filters.limit,
            };

            // Only send date filters to backend for now
            if (filters.startDate) params.startDate = format(filters.startDate, 'yyyy-MM-dd');
            if (filters.endDate) params.endDate = format(filters.endDate, 'yyyy-MM-dd');

            const response = await axiosClient.get('/khata/allBills', { params });

            setAllBills(response.data.bills);
            setPagination(response.data.pagination);

        } catch (err) {
            console.error("Error fetching bills:", err);
            const errorMessage = err.response?.data?.message || "Failed to fetch bills.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters.page, filters.limit, filters.startDate, filters.endDate]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    // Apply client-side filtering whenever filters or allBills change
    useEffect(() => {
        if (allBills.length > 0) {
            const filtered = filterBills(allBills, filters);
            setFilteredBills(filtered);
        } else {
            setFilteredBills(allBills);
        }
    }, [allBills, filters]);

    // Enhanced handler functions
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleDateChange = (type, date) => {
        setFilters(prev => ({ ...prev, [type]: date, page: 1 }));
    };

    const clearAllFilters = () => {
        setFilters({
            searchQuery: '',
            paymentStatus: 'all',
            amountRange: 'all',
            startDate: null,
            endDate: null,
            page: 1,
            limit: 20,
        });
    };

    const removeFilter = (filterName) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: filterName === 'paymentStatus' ? 'all' :
                filterName === 'amountRange' ? 'all' :
                    filterName === 'startDate' ? null :
                        filterName === 'endDate' ? null : ''
        }));
    };

    // Active filters for display
    const activeFilters = useMemo(() => {
        const filters = [];
        if (filters.searchQuery) filters.push({ key: 'searchQuery', label: `Search: ${filters.searchQuery}` });
        if (filters.paymentStatus !== 'all') filters.push({ key: 'paymentStatus', label: `Status: ${filters.paymentStatus}` });
        if (filters.amountRange !== 'all') filters.push({ key: 'amountRange', label: `Amount: ${filters.amountRange}` });
        if (filters.startDate) filters.push({ key: 'startDate', label: `From: ${format(filters.startDate, 'dd/MM/yyyy')}` });
        if (filters.endDate) filters.push({ key: 'endDate', label: `To: ${format(filters.endDate, 'dd/MM/yyyy')}` });
        return filters;
    }, [filters]);

    // Calculate pagination for filtered results
    const paginatedBills = useMemo(() => {
        const startIndex = (filters.page - 1) * filters.limit;
        const endIndex = startIndex + filters.limit;
        return filteredBills.slice(startIndex, endIndex);
    }, [filteredBills, filters.page, filters.limit]);

    const totalFilteredPages = Math.ceil(filteredBills.length / filters.limit);

    // Rest of your component remains similar, but use paginatedBills instead of bills
    // ... (your existing JSX with modifications to use paginatedBills)

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Toaster position="top-right" reverseOrder={false} />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">🧾 Bill Register</h1>
                <button
                    onClick={() => toast.info("Export functionality to be implemented")}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    <FiDownload className="mr-2" />
                    Export Bills
                </button>
            </div>

            {/* Enhanced Filter Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-indigo-600 flex items-center">
                        <FiFilter className="mr-2" />
                        Filter Bills
                        {activeFilters.length > 0 && (
                            <span className="ml-2 bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full">
                                {activeFilters.length} active
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                    >
                        Clear All
                    </button>
                </div>

                {/* Active Filters Display */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {activeFilters.map(filter => (
                            <span
                                key={filter.key}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                                {filter.label}
                                <button
                                    onClick={() => removeFilter(filter.key)}
                                    className="ml-2 hover:bg-blue-200 rounded-full p-1"
                                >
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Unified Search */}
                    <div>
                        <label htmlFor="searchQuery" className="text-sm font-medium text-gray-600">
                            Search (Name, Phone, Bill No.)
                        </label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                id="searchQuery"
                                name="searchQuery"
                                value={filters.searchQuery}
                                onChange={handleFilterChange}
                                placeholder="Search customers, phone, bill number..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    {/* Payment Status Filter */}
                    <div>
                        <label htmlFor="paymentStatus" className="text-sm font-medium text-gray-600">
                            Payment Status
                        </label>
                        <select
                            id="paymentStatus"
                            name="paymentStatus"
                            value={filters.paymentStatus}
                            onChange={handleFilterChange}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                        </select>
                    </div>

                    {/* Amount Range Filter */}
                    <div>
                        <label htmlFor="amountRange" className="text-sm font-medium text-gray-600">
                            Amount Range
                        </label>
                        <select
                            id="amountRange"
                            name="amountRange"
                            value={filters.amountRange}
                            onChange={handleFilterChange}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">All Amounts</option>
                            <option value="low">Low (₹0 - ₹1,000)</option>
                            <option value="medium">Medium (₹1,001 - ₹5,000)</option>
                            <option value="high">High (₹5,001+)</option>
                        </select>
                    </div>
                </div>

                {/* Date Range Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="text-sm font-medium text-gray-600">From Date</label>
                        <div className="relative mt-1">
                            <DatePicker
                                selected={filters.startDate}
                                onChange={(date) => handleDateChange('startDate', date)}
                                selectsStart
                                startDate={filters.startDate}
                                endDate={filters.endDate}
                                placeholderText="Start Date"
                                dateFormat="dd/MM/yyyy"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                isClearable
                            />
                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600">To Date</label>
                        <div className="relative mt-1">
                            <DatePicker
                                selected={filters.endDate}
                                onChange={(date) => handleDateChange('endDate', date)}
                                selectsEnd
                                startDate={filters.startDate}
                                endDate={filters.endDate}
                                minDate={filters.startDate}
                                placeholderText="End Date"
                                dateFormat="dd/MM/yyyy"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                isClearable
                            />
                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bills List Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                {/* Stats Summary */}
                {!loading && filteredBills.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-sm text-blue-600 font-medium">Filtered Bills</div>
                            <div className="text-2xl font-bold text-blue-700">{filteredBills.length}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="text-sm text-green-600 font-medium">Total Amount</div>
                            <div className="text-2xl font-bold text-green-700">
                                {formatCurrency(filteredBills.reduce((sum, bill) => sum + bill.grandTotal, 0))}
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="text-sm text-purple-600 font-medium">Paid Bills</div>
                            <div className="text-2xl font-bold text-purple-700">
                                {filteredBills.filter(bill => bill.paymentStatus === 'paid').length}
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="text-sm text-orange-600 font-medium">Pending Bills</div>
                            <div className="text-2xl font-bold text-orange-700">
                                {filteredBills.filter(bill => bill.paymentStatus === 'pending').length}
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading/Error/Empty States */}
                {loading && (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <div className="mt-2 text-indigo-600">Loading bills...</div>
                    </div>
                )}

                {error && (
                    <div className="text-center py-10 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                        <FiAlertCircle className="inline-block w-6 h-6 mb-2" />
                        <div>{error}</div>
                    </div>
                )}

                {!loading && filteredBills.length === 0 && allBills.length > 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <FiFilter className="inline-block w-12 h-12 mb-4 text-gray-400" />
                        <div className="text-lg">No bills match your filters</div>
                        <div className="text-sm mt-1">Try adjusting your search criteria</div>
                    </div>
                )}

                {!loading && allBills.length === 0 && !error && (
                    <div className="text-center py-10 text-gray-500">
                        <FiFileText className="inline-block w-12 h-12 mb-4 text-gray-400" />
                        <div className="text-lg">No bills found</div>
                        <div className="text-sm mt-1">Create your first bill to get started</div>
                    </div>
                )}

                {/* Bill Table */}
                {!loading && paginatedBills.length > 0 && (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-indigo-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                            Bill No.
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                            Customer Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                            Total Amount
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedBills.map((bill) => (
                                        <tr key={bill._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-indigo-600">{bill.billNumber}</div>
                                                <div className="text-xs text-gray-500">#{bill._id.slice(-6)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <FiUser className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{bill.customerName}</div>
                                                        <div className="text-xs text-gray-500 flex items-center">
                                                            <FiPhone className="mr-1" />
                                                            {bill.customerPhone || 'No phone'}
                                                        </div>
                                                        {bill.customerEmail && (
                                                            <div className="text-xs text-gray-500">{bill.customerEmail}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(bill.billDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {formatCurrency(bill.grandTotal)}
                                                </div>
                                                {bill.discount > 0 && (
                                                    <div className="text-xs text-green-600">
                                                        Discount: {formatCurrency(bill.discount)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bill.paymentStatus === 'paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : bill.paymentStatus === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-1">
                                                <button
                                                    onClick={() => viewBillDetails(bill)}
                                                    className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-100 transition"
                                                    title="View Details"
                                                >
                                                    <FiEye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditBill(bill)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-indigo-100 transition"
                                                    title="Edit Bill"
                                                >
                                                    <FiEdit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setBillToDelete(bill);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-100 transition"
                                                    title="Delete Bill"
                                                >
                                                    <FiTrash2 className="h-4 w-4" />
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Enhanced Pagination */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100 space-y-4 sm:space-y-0">
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{paginatedBills.length}</span> of{' '}
                                <span className="font-semibold">{filteredBills.length}</span> filtered bills
                                (Page <span className="font-semibold">{filters.page}</span> of{' '}
                                <span className="font-semibold">{totalFilteredPages}</span>)
                            </div>

                            <div className="flex items-center space-x-2">
                                <select
                                    value={filters.limit}
                                    onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="10">10 per page</option>
                                    <option value="20">20 per page</option>
                                    <option value="50">50 per page</option>
                                    <option value="100">100 per page</option>
                                </select>

                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={filters.page === 1}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center ${filters.page > 1
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <FiArrowLeft className="mr-2" /> Previous
                                </button>

                                <div className="flex space-x-1">
                                    {[...Array(Math.min(5, totalFilteredPages))].map((_, index) => {
                                        const pageNum = Math.max(1, Math.min(
                                            totalFilteredPages - 4,
                                            filters.page - 2
                                        )) + index;

                                        if (pageNum > totalFilteredPages) return null;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${filters.page === pageNum
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={filters.page >= totalFilteredPages}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center ${filters.page < totalFilteredPages
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    Next <FiArrowRight className="ml-2" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && billToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all max-w-lg w-full">
                            <div className="bg-white px-6 pt-5 pb-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                        <FiAlertCircle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Confirm Deletion
                                        </h3>
                                        <div className="mt-2 text-sm text-gray-500">
                                            <p>Are you sure you want to delete:</p>
                                            <div className="mt-2 bg-red-50 p-3 rounded-lg">
                                                <p><strong>Bill #:</strong> {billToDelete.billNumber}</p>
                                                <p><strong>Customer:</strong> {billToDelete.customerName}</p>
                                                <p><strong>Amount:</strong> {formatCurrency(billToDelete.grandTotal)}</p>
                                                <p><strong>Date:</strong> {formatDate(billToDelete.billDate)}</p>
                                            </div>
                                            <p className="mt-2 text-red-600 font-medium">This action cannot be undone!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        setShowDeleteModal(false);
                                        const deleteToastId = toast.loading(`Deleting Bill #${billToDelete.billNumber}...`);
                                        try {
                                            await axiosClient.delete(`/khata/delete_bill/${billToDelete._id}`);
                                            toast.success(`Bill #${billToDelete.billNumber} deleted successfully!`, { id: deleteToastId });
                                            fetchBills(); // Refresh the list
                                        } catch (err) {
                                            console.error("Error deleting bill:", err);
                                            toast.error(err.response?.data?.message || "Failed to delete the bill.", { id: deleteToastId });
                                        } finally {
                                            setBillToDelete(null);
                                        }
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 transition"
                                >
                                    Yes, Delete Bill
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <BillDetailsModal
                bill={selectedBill}
                isOpen={showBillDetails}
                onClose={() => setShowBillDetails(false)}
            />
            <UpdateBillModal
                bill={selectedBillForEdit}
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                onUpdate={handleBillUpdate}
            />
        </div>

    );

};

export default AllBills;