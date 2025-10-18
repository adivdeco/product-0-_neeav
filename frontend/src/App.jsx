
import './App.css'
// import { Routes, Route, Navigate, useLocation } from "react-router";
// import Main1 from "./pages/Main1";
// import SignUp from "./auth/SignUp";
// import Login from "./auth/Login";
// import Dashboard from "./pages/Dashbord";

// function App() {

//   return (
//     <>
//       <Routes>
//         <Route path="/" element={<Main1 />} />
//         <Route path="/register" element={<SignUp />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//       </Routes>
//     </>
//   )
// }

// export default App


import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";

import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./pages/Dashbord";
import Main1 from "./pages/Main1";

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) return <p className="text-center mt-20">Checking session...</p>;

  return (
    <Routes>
      {/* <Route path="/" element={<Main1 />} /> */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />

      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/" />
        }
      />
    </Routes>
  );
}

export default App;

