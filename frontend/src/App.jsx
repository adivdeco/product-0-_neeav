import './App.css'
import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./authSlice"; // Fixed import path
import { useSocket } from './hooks/useSocket'; // Custom hook for socket

// Auth Components
import Login from "./auth/Login";
import Register from "./auth/Register";

// Pages
import Homepg from './pages/Home';
import LocalShop from './pages/localShop';
import Services from './pages/Services';
import Ai_tools from './pages/Ai_tools';
import Material_market from './pages/Material_market'
import ContractorProfile from './pages/allContractor'
import ProductDetail from './pages/ProductDetail';

// Admin Components
import Add_shop from './components/admin/Add_shop';
import Add_services from './components/admin/Add_services';
import Business from './components/admin/bussiness';
import AllUsers from './components/admin/Users_data/Allusers';

// Shop Components
import ShopHome from './components/shop/shopHome';
import AddBill from './components/shop/addBill';
import AllCustomers from './components/shop/AllCustomers';
import AllBill from './components/shop/allBills';
import ProductAddPage from './components/shop/addProducts';
import ProductManagement from './components/shop/productManagment';
import EditProduct from './components/shop/EditProduct';

// Profile Components
import UserProfileUpdate from './components/userDataUpdate';
import ShopProfileUpdate from './components/shopDataUpdate';
import ContractorProfileUpdate from './components/contractorDataUpdate';

// Dashboard Components
import ContractorDashboard from './components/ContractorDashbord';
import EmployeeDashboard from './components/EmployeeDashboard';
import UserDashboard from './components/UserDashboard';

// sockets
import SocketService from './utils/socket';


const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-600">Checking authentication...</span>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);



  useSocket();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     SocketService.connect();
  //   } else {
  //     SocketService.disconnect();
  //   }

  //   return () => {
  //     // SocketService.disconnect();
  //   };
  // }, [isAuthenticated, user]);


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
      <Route path='/product/:productId' element={isAuthenticated ? <ProductDetail /> : <Login />} />

      <Route path='/addShop' element={isAuthenticated ? <Add_shop /> : <Login />} />
      <Route path='/addServices' element={isAuthenticated ? <Add_services /> : <Login />} />
      <Route path='/business' element={isAuthenticated ? <Business /> : <Login />} />
      {/* shop */}
      {/* test */}
      <Route path='/shop' element={isAuthenticated ? <ShopHome /> : <Login />} />
      <Route path='/shop/addBill' element={isAuthenticated ? <AddBill /> : <Login />} />
      <Route path='/shop/allCustomers' element={isAuthenticated ? <AllCustomers /> : <Login />} />
      <Route path='/shop/allBills' element={isAuthenticated ? <AllBill /> : <Login />} />
      <Route path='/addProducts' element={isAuthenticated ? < ProductAddPage /> : <Login />} />
      <Route path='/allProduct' element={isAuthenticated ? <ProductManagement /> : <Login />} />
      <Route path="/edit-product/:productId" element={isAuthenticated ? <EditProduct /> : <Login />} />


      {/* userPage */}
      {/* <Route path='/admin/user' element={isAuthenticated ? <UserHome /> : <Login />} /> */}
      <Route path='/admin/user/allusers' element={isAuthenticated ? <AllUsers /> : <Login />} />
      {/* <Route path='/admin/shop' */}

      {/* updates */}
      <Route path='/setting/user' element={isAuthenticated ? <UserProfileUpdate /> : <Login />} />
      <Route path='/setting/shop' element={isAuthenticated ? <ShopProfileUpdate /> : <Login />} />
      <Route path='/setting/Contractor' element={isAuthenticated ? <ContractorProfileUpdate /> : <Login />} />

      {/* dashbord- Notofaction */}
      <Route path="/contractor/dashboard" element={<ContractorDashboard />} />
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/my-requests" element={isAuthenticated ? <UserDashboard /> : <Login />} />
    </Routes>

  );
}

export default App;








