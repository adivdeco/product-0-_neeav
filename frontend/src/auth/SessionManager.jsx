import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import { socialLogin } from '../redux/slice/authSlice';
import toast from 'react-hot-toast';

const SessionManager = () => {
    const { user: auth0User, isAuthenticated: isAuth0Authenticated, isLoading: auth0Loading } = useAuth0();
    const { isAuthenticated: isAppAuthenticated, loading: appLoading, user: appUser } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        // Prevent sync if already loading or if Auth0 is not ready
        if (auth0Loading || appLoading) return;

        // If authenticated with Auth0 but not with our App (or App user mismatch), sync!
        if (isAuth0Authenticated && auth0User && !isAppAuthenticated) {

            // console.log("🔄 Syncing Auth0 session with Backend...", auth0User.email);

            dispatch(socialLogin({
                email: auth0User.email,
                name: auth0User.name,
                auth0Id: auth0User.sub,
                avatar: auth0User.picture,
                email_verified: auth0User.email_verified
            }))
                .unwrap()
                .then(() => {
                    toast.success(`Signed in as ${auth0User.name}`);
                })
                .catch((err) => {
                    console.error("Session sync failed:", err);
                    // Optional: Logout from Auth0 if backend refuses? 
                    // logout();
                });
        }
    }, [isAuth0Authenticated, auth0User, isAppAuthenticated, auth0Loading, appLoading, dispatch]);

    return null; // This component handles logic only, no UI
};

export default SessionManager;
