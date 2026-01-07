import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { socialLogin } from '../redux/slice/authSlice';
import toast from 'react-hot-toast';

const Auth0Callback = () => {
    const { user, isAuthenticated, isLoading, error } = useAuth0();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLoading) return;

        if (error) {
            toast.error('Social login failed');
            navigate('/login');
            return;
        }

        if (isAuthenticated && user) {
            // Dispatch action to sync with backend
            dispatch(socialLogin({
                email: user.email,
                name: user.name,
                auth0Id: user.sub,
                avatar: user.picture,
                email_verified: user.email_verified
            }))
                .unwrap()
                .then(() => {
                    toast.success(`Welcome back, ${user.name}!`);
                    navigate('/');
                })
                .catch((err) => {
                    console.error('Social login sync failed:', err);
                    toast.error(err.message || 'Login failed');
                    navigate('/login');
                });
        }
    }, [isAuthenticated, isLoading, user, error, dispatch, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">Authenticating...</p>
        </div>
    );
};

export default Auth0Callback;
