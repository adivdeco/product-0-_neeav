import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Profile = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) return <div className="text-sm text-gray-400">Loading profile...</div>;

    if (!isAuthenticated || !user) return null;

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <img
                src={user.picture}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500"
            />
            <div className="text-center">
                <div className="text-lg font-semibold text-white">{user.name}</div>
                <div className="text-sm text-gray-300">{user.email}</div>
            </div>
        </div>
    );
};

export default Profile;
