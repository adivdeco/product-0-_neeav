
import './App.css'
import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";

import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./pages/Dashbord";
// import Main1 from "./pages/Main1";
import Homepg from './pages/Dashbord';
import LocalShop from './pages/localShop';
import Services from './pages/Services';
import Ai_tools from './pages/Ai_tools';
import Material_market from './pages/Material_market'

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
      <Route path="/" element={isAuthenticated ? <Homepg /> : <Login />} />

      <Route
        path="/register"
        element={
          isAuthenticated ? <Homepg /> : <Register />
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <Dashboard /> : <Navigate to="/register" />
        }
      />
      <Route path='/localShop' element={isAuthenticated ? <LocalShop /> : <Login />} />
      <Route path='/Services' element={isAuthenticated ? <Services /> : <Login />} />
      <Route path='/Planning_tools' element={isAuthenticated ? <Ai_tools /> : <Login />} />
      <Route path='/Material_market' element={isAuthenticated ? <Material_market /> : <Login />} />


    </Routes>
  );
}

export default App;

