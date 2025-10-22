
import './App.css'
import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice";

import Login from "./auth/Login";
import Register from "./auth/Register";
// import Main1 from "./pages/Main1";
import Homepg from './pages/Home';
import LocalShop from './pages/localShop';
import Services from './pages/Services';
import Ai_tools from './pages/Ai_tools';
import Material_market from './pages/Material_market'
import Add_shop from './components/admin/Add_shop';
import Add_services from './components/admin/Add_services';
import Business from './components/admin/bussiness';
import ShopHome from './components/shop/shopHome';
import AddBill from './components/shop/addBill';
import UpdateBill from './components/shop/updateBill';
import AllBill from './components/shop/allBills';

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
          isAuthenticated ? <Homepg /> : <Navigate to="/register" />
        }
      />
      <Route path='/localShop' element={isAuthenticated ? <LocalShop /> : <Login />} />
      <Route path='/Services' element={isAuthenticated ? <Services /> : <Login />} />
      <Route path='/Planning_tools' element={isAuthenticated ? <Ai_tools /> : <Login />} />
      <Route path='/Material_market' element={isAuthenticated ? <Material_market /> : <Login />} />
      <Route path='/addShop' element={isAuthenticated ? <Add_shop /> : <Login />} />
      <Route path='/addServices' element={isAuthenticated ? <Add_services /> : <Login />} />
      <Route path='/business' element={isAuthenticated ? <Business /> : <Login />} />
      {/* shop */}
      <Route path='/shop' element={isAuthenticated ? <ShopHome /> : <Login />} />
      <Route path='/shop/addBill' element={isAuthenticated ? <AddBill /> : <Login />} />
      <Route path='/shop/updateBill' element={isAuthenticated ? < UpdateBill /> : <Login />} />
      {/* <Route path='/shop/searchBills' element={isAuthenticated ? <AddBill /> : <Login />} /> */}
      <Route path='/shop/allBills' element={isAuthenticated ? <AllBill /> : <Login />} />

    </Routes>
  );
}

export default App;


