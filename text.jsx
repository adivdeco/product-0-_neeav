// components/EmployeeDashboard.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axiosClient from '../api/auth';
import Loading from './Loader';
import SocketService from '../utils/socket'; // Import the socket service

const EmployeeDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactType, setContactType] = useState('');
    const [contactMessage, setContactMessage] = useState('');

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'co-admin')) {
            fetchPendingRequests();

            // Set up real-time listeners
            const handleNewRequest = (data) => {
                fetchPendingRequests(); // Refresh the list
            };

            const handleRequestUpdate = (data) => {
                fetchPendingRequests(); // Refresh the list
            };

            // Listen for socket events
            if (SocketService.socket) {
                SocketService.socket.on('new_work_request', handleNewRequest);
                SocketService.socket.on('request_status_updated', handleRequestUpdate);
                SocketService.socket.on('employee_contact', handleRequestUpdate);
            }

            // Cleanup listeners on unmount
            return () => {
                if (SocketService.socket) {
                    SocketService.socket.off('new_work_request', handleNewRequest);
                    SocketService.socket.off('request_status_updated', handleRequestUpdate);
                    SocketService.socket.off('employee_contact', handleRequestUpdate);
                }
            };
        }
    }, [user, currentPage]);

// ... rest of your component code remains the same