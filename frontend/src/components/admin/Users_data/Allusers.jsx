
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastContainer, toast } from 'react-toastify';
import axiosClient from "../../../api/auth";
import { UserUpdateSchema } from "../../../api/userValidationSchema";
import Navbar from "../../home/navbar";
import ImageUpload from "./ImageUpload";

function AllUsers() {
    const [users, setUsers] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    // Get current user role from your auth context or localStorage
    const [currentUserRole] = useState("admin"); // Replace with actual current user role

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
        reset
    } = useForm({
        resolver: zodResolver(UserUpdateSchema)
    });

    const watchedRole = watch("role");

    // Product categories and specializations
    const productCategories = [
        'Cement & Concrete',
        'Bricks & Blocks',
        'Steel & Reinforcement',
        'Sand & Aggregates',
        'Paints & Finishes',
        'Tools & Equipment',
        'Plumbing',
        'Electrical',
        'Tiles & Sanitary',
        'Hardware & Fittings'
    ];

    const specializations = [
        'Masonry',
        'Plumbing',
        'Electrical',
        'Carpentry',
        'Painting',
        'Flooring',
        'Roofing',
        'Structural',
        'Labor Supply',
        'Construction',
        'Renovation',
        'Demolition',
        'Landscaping',
        'HVAC',
        'Welding'
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get("/auth/all_users");
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone?.includes(searchTerm)
            );
        }

        if (roleFilter !== "all") {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axiosClient.delete(`/auth/delete_user/${userToDelete._id}`);
            setUsers(users.filter(user => user._id !== userToDelete._id));
            setShowDeleteModal(false);
            setUserToDelete(null);
            toast.success("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(selectedUser?._id === user._id ? null : user);
    };

    const handleUpdateClick = (user) => {
        // Set selectedUser first
        setSelectedUser(user);

        // Reset form and set all values
        reset();

        setValue("name", user.name || "");
        setValue("email", user.email || "");
        setValue("phone", user.phone || "");
        setValue("role", user.role || "User");

        // Set address fields
        setValue("address.street", user.address?.street || "");
        setValue("address.city", user.address?.city || "");
        setValue("address.state", user.address?.state || "");
        setValue("address.pincode", user.address?.pincode || "");
        setValue("address.country", user.address?.country || "");

        // Set store details
        setValue("storeDetails.storeName", user.storeDetails?.storeName || "");
        setValue("storeDetails.gstNumber", user.storeDetails?.gstNumber || "");
        setValue("storeDetails.licenseId", user.storeDetails?.licenseId || "");
        setValue("storeDetails.isVerified", user.storeDetails?.isVerified || false);
        setValue("storeDetails.rating", user.storeDetails?.rating || 0);
        setValue("storeDetails.productCategories", user.storeDetails?.productCategories || []);

        // Set contractor details
        setValue("contractorDetails.specialization", user.contractorDetails?.specialization || []);
        setValue("contractorDetails.yearsOfExperience", user.contractorDetails?.yearsOfExperience || 0);
        setValue("contractorDetails.hourlyRate", user.contractorDetails?.hourlyRate || 0);
        setValue("contractorDetails.licenseNumber", user.contractorDetails?.licenseNumber || "");
        setValue("contractorDetails.isVerified", user.contractorDetails?.isVerified || false);
        setValue("contractorDetails.totalProjects", user.contractorDetails?.totalProjects || 0);
        setValue("contractorDetails.completedProjects", user.contractorDetails?.completedProjects || 0);
        setValue("contractorDetails.skills", user.contractorDetails?.skills || []);
        setValue("contractorDetails.bio", user.contractorDetails?.bio || "");

        // setValue("avatar", user.avatar || "");

        setShowUpdateModal(true);
    };

    const handleAvatarUpdate = (url) => {
        console.log('Avatar URL received:', url);
        setAvatarUrl(url);

        // Also update the form data immediately
        setValue('avatar', url);
    };

    const handleUpdateSubmit = async (data) => {
        try {

            if (!selectedUser || !selectedUser._id) {
                toast.error("User ID is missing. Please try again.");
                return;
            }

            const updateData = {
                ...data,
                avatar: avatarUrl || data.avatar // Use new avatar URL if available, otherwise keep existing
            };

            console.log('Updating user with ID:', selectedUser?._id);
            console.log('Update data:', updateData);

            // Only allow admin to change roles
            if (currentUserRole !== "admin") {
                delete data.role;
            }

            const response = await axiosClient.put(`/auth/update_user/${selectedUser._id}`, data);

            console.log("Update response:", response);

            if (response.status === 200) {
                toast.success(response.data.message || 'User updated successfully');
                setShowUpdateModal(false);
                fetchUsers(); // Refresh the user list
                setAvatarUrl(''); // Reset avatar URL
            }

            // Update local state
            setUsers(users.map(user =>
                user._id === selectedUser._id ? { ...user, ...data } : user
            ));

            setShowUpdateModal(false);
            setSelectedUser(null);
            toast.success("User updated successfully");
        } catch (error) {
            console.error("Error updating user:", error);
            console.error("Error details:", error.response?.data);
            toast.error(error.response?.data?.message || "Failed to update user");
        }
    };

    const handleCategoryToggle = (category) => {
        const currentCategories = watch("storeDetails.productCategories") || [];
        const updatedCategories = currentCategories.includes(category)
            ? currentCategories.filter(c => c !== category)
            : [...currentCategories, category];
        setValue("storeDetails.productCategories", updatedCategories);
    };

    const handleSpecializationToggle = (specialization) => {
        const currentSpecializations = watch("contractorDetails.specialization") || [];
        const updatedSpecializations = currentSpecializations.includes(specialization)
            ? currentSpecializations.filter(s => s !== specialization)
            : [...currentSpecializations, specialization];
        setValue("contractorDetails.specialization", updatedSpecializations);
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'co-admin': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'store_owner': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'contractor': return 'bg-green-100 text-green-800 border-green-200';
            case 'User': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // const handleFileUpdate = (event) => {
    //     const files = Array.from(event.target.files);
    //     if (!files || files.length === 0) return;
    //     setSelectedFiles(files);
    //     // Your existing handleFileUpdate logic
    // };

    return (
        <div className="min-h-screen bg-gray-50 ">
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
            <Navbar />
            <div className=" py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-2">Manage all registered users in the system</p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Users
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Role
                            </label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="co-admin">Co-Admin</option>
                                <option value="store_owner">Store Owner</option>
                                <option value="contractor">Contractor</option>
                                <option value="User">User</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Results
                            </label>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-gray-900 font-semibold">
                                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">👥</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <div key={user._id} className="transition-all duration-200 hover:bg-gray-50">
                                    <div className="p-6 cursor-pointer" onClick={() => handleUserClick(user)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                                        {user.avatar ? <img src={user.avatar} alt="" className=" h-full w-full rounded-full object-cover border-2 border-gray-200"
                                                        /> : user.name?.charAt(0).toUpperCase()}

                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3">
                                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                            {user.name || 'No Name'}
                                                        </h3>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                                            {user.role?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 mt-1">
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            📧 {user.email}
                                                        </p>
                                                        {user.phone && (
                                                            <p className="text-sm text-gray-600 flex items-center">
                                                                📱 {user.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateClick(user);
                                                    }}
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-150"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(user);
                                                    }}
                                                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition duration-150"
                                                >
                                                    🗑️ Delete
                                                </button>
                                                <div className={`transform transition-transform duration-200 ${selectedUser?._id === user._id ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedUser?._id === user._id && (
                                        <div className="px-6 pb-6 bg-gray-50 border-t border-gray-200">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900">Personal Information</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Name</label>
                                                            <p className="text-gray-900">{user.name}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Email</label>
                                                            <p className="text-gray-900">{user.email}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Phone</label>
                                                            <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Role</label>
                                                            <p className="text-gray-900 capitalize">{user.role}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900">Address</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Street</label>
                                                            <p className="text-gray-900">{user.address?.street || 'Not provided'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">City</label>
                                                            <p className="text-gray-900">{user.address?.city || 'Not provided'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">State</label>
                                                            <p className="text-gray-900">{user.address?.state || 'Not provided'}</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Pincode</label>
                                                            <p className="text-gray-900">{user.address?.pincode || 'Not provided'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {user.role === 'store_owner' && user.storeDetails && (
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-gray-900">Store Details</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Store Name</label>
                                                                <p className="text-gray-900">{user.storeDetails.storeName}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Rating</label>
                                                                <p className="text-gray-900">{user.storeDetails.rating}/5</p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="text-sm font-medium text-gray-600">Categories</label>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {user.storeDetails.productCategories?.map(cat => (
                                                                        <span key={cat} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                                            {cat}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {user.role === 'contractor' && user.contractorDetails && (
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-gray-900">Contractor Details</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Experience</label>
                                                                <p className="text-gray-900">{user.contractorDetails.yearsOfExperience} years</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Hourly Rate</label>
                                                                <p className="text-gray-900">₹{user.contractorDetails.hourlyRate}</p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <label className="text-sm font-medium text-gray-600">Specializations</label>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {user.contractorDetails.specialization?.map(spec => (
                                                                        <span key={spec} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                                            {spec}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <span className="text-red-600 text-xl">⚠️</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Delete User
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition duration-150"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition duration-150"
                                >
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Update User Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Update User</h3>
                                <button
                                    onClick={() => setShowUpdateModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition duration-150"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(handleUpdateSubmit)} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            {...register("name")}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            {...register("email")}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            {...register("phone")}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                        />
                                    </div>

                                    {currentUserRole === "admin" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Role *
                                            </label>
                                            <select
                                                {...register("role")}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                            >
                                                <option value="User">User</option>
                                                <option value="store_owner">Store Owner</option>
                                                <option value="contractor">Contractor</option>
                                                <option value="co-admin">Co-Admin</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Address Information */}
                                <div className="border-t pt-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Street
                                            </label>
                                            <input
                                                type="text"
                                                {...register("address.street")}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                {...register("address.city")}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                {...register("address.state")}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Pincode
                                            </label>
                                            <input
                                                type="text"
                                                {...register("address.pincode")}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Store Owner Details */}
                                {(watchedRole === "store_owner" || selectedUser?.role === "store_owner") && (
                                    <div className="border-t pt-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Store Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Store Name
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("storeDetails.storeName")}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                                />
                                                {errors.storeDetails?.storeName && (
                                                    <p className="text-red-500 text-xs mt-1">{errors.storeDetails.storeName.message}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    GST Number
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("storeDetails.gstNumber")}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    License ID
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("storeDetails.licenseId")}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    {...register("storeDetails.isVerified")}
                                                    className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    Verified Store
                                                </label>
                                            </div>
                                        </div>

                                        {/* Product Categories */}
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Product Categories
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {productCategories.map(category => (
                                                    <label key={category} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={watch("storeDetails.productCategories")?.includes(category) || false}
                                                            onChange={() => handleCategoryToggle(category)}
                                                            className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{category}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Contractor Details */}
                                {(watchedRole === "contractor" || selectedUser?.role === "contractor") && (
                                    <div className="border-t pt-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Contractor Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Years of Experience
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register("contractorDetails.yearsOfExperience", { valueAsNumber: true })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Hourly Rate (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    {...register("contractorDetails.hourlyRate", { valueAsNumber: true })}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    License Number
                                                </label>
                                                <input
                                                    type="text"
                                                    {...register("contractorDetails.licenseNumber")}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    {...register("contractorDetails.isVerified")}
                                                    className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    Verified Contractor
                                                </label>
                                            </div>
                                        </div>

                                        {/* Specializations */}
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Specializations
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {specializations.map(spec => (
                                                    <label key={spec} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={watch("contractorDetails.specialization")?.includes(spec) || false}
                                                            onChange={() => handleSpecializationToggle(spec)}
                                                            className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                                                        />
                                                        <span className="text-sm text-gray-700">{spec}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bio */}
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                {...register("contractorDetails.bio")}
                                                rows="3"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition duration-150"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Media Upload */}
                                <div className="border-t pt-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h4>
                                    <ImageUpload
                                        userId={selectedUser?._id}
                                        onUploadSuccess={(results) => {
                                            console.log('Upload successful:', results);
                                        }}
                                        onAvatarUpdate={handleAvatarUpdate} // Add this prop
                                    />
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex space-x-3 pt-6 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpdateModal(false)}
                                        className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition duration-150"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 px-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition duration-150 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Updating..." : "Update User"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
}

export default AllUsers;