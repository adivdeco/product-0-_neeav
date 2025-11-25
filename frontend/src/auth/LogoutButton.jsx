import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LogoutButton = () => {
    const { logout, isAuthenticated } = useAuth0();
    if (!isAuthenticated) return null;
    return (
        <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="px-5 py-2 bg-red-500 hover:bg-red-400 text-white rounded-md shadow-sm transition"
        >
            Sign Out
        </button>
    );
};

export default LogoutButton;
