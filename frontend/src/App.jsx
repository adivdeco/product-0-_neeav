
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
import AllCustomers from './components/shop/AllCustomers';
import AllBill from './components/shop/allBills';
// import UserHome from './components/admin/Users_data/user_Home';
import AllUsers from './components/admin/Users_data/Allusers';
import ContractorProfile from './pages/allContractor'
import UserProfileUpdate from './components/userDataUpdate';
import ShopProfileUpdate from './components/shopDataUpdate';
import ContractorProfileUpdate from './components/contractorDataUpdate';

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
      <Route path="/contractor/:id" element={isAuthenticated ? <ContractorProfile /> : <Login />} />

      <Route path='/Planning_tools' element={isAuthenticated ? <Ai_tools /> : <Login />} />
      <Route path='/Material_market' element={isAuthenticated ? <Material_market /> : <Login />} />

      <Route path='/addShop' element={isAuthenticated ? <Add_shop /> : <Login />} />
      <Route path='/addServices' element={isAuthenticated ? <Add_services /> : <Login />} />
      <Route path='/business' element={isAuthenticated ? <Business /> : <Login />} />
      {/* shop */}
      <Route path='/shop' element={isAuthenticated ? <ShopHome /> : <Login />} />
      <Route path='/shop/addBill' element={isAuthenticated ? <AddBill /> : <Login />} />
      <Route path='/shop/allCustomers' element={isAuthenticated ? <AllCustomers /> : <Login />} />
      <Route path='/shop/allBills' element={isAuthenticated ? <AllBill /> : <Login />} />

      {/* userPage */}
      {/* <Route path='/admin/user' element={isAuthenticated ? <UserHome /> : <Login />} /> */}
      <Route path='/admin/user/allusers' element={isAuthenticated ? <AllUsers /> : <Login />} />
      {/* <Route path='/admin/shop' */}


      {/* updates */}
      <Route path='/setting/user' element={isAuthenticated ? <UserProfileUpdate /> : <Login />} />
      <Route path='/setting/shop' element={isAuthenticated ? <ShopProfileUpdate /> : <Login />} />
      <Route path='/setting/Contractor' element={isAuthenticated ? <ContractorProfileUpdate /> : <Login />} />

    </Routes>
  );
}

export default App;


