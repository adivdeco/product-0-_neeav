import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    if (isAuthenticated) return null;
    return (
        <button
            onClick={() => loginWithRedirect()}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-md transition transform hover:-translate-y-0.5"
        >
            Sign in with Auth0
        </button>
    );
};

export default LoginButton;
