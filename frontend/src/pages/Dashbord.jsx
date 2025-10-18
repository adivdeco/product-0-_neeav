import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";

export default function Dashboard() {
    const dispatch = useDispatch();
    const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logoutUser());
    };
    console.log(user, isAuthenticated, loading, error);

    return (
        <div className="flex flex-col items-center justify-center mt-20">
            <h1 className="text-2xl font-bold">Welcome, {user?.name || "User"} 👋</h1>
            <p className="mt-2 text-gray-600">Email: {user?.email}</p>
            <button
                className="bg-red-500 text-white px-4 py-2 rounded mt-5"
                onClick={handleLogout}
            >
                Logout
            </button>
        </div>
    );
}
