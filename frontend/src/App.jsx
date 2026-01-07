import './App.css'
import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./redux/slice/authSlice"; // Fixed import path

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
import { useSocket } from './hooks/useSocket';
import ShopOwnerDashboard from './components/ShopOwnerDashboard';
import UserBuyRequestsDashboard from './components/UserBuyRequestsDashboard';
import EmployeeBuyDashboard from './components/EmployeeBuyDashbord';
import SocketStatus from './components/SocketStatus';
import SocketDebug from './components/SocketDebug';
import Cart from './pages/Cart';
import { fetchCart } from './redux/slice/cartSlice';


const LoadingSpinner = () => (
  <div className="min-h-screen">
    {/* <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div> */}
    <div className="animate-pulse">

      {/* Hero text */}
      <div className="mt-36 flex flex-col items-center gap-4">
        <div className="h-8 w-60 bg-gray-200 rounded"></div>
        <div className="h-8 w-80 bg-gray-200 rounded"></div>
        <div className="h-4 w-96 bg-gray-200 rounded mt-2"></div>
        {/* <div className="h-4 w-72 bg-gray-200 rounded"></div> */}
      </div>

      {/* Search Bar Skeleton */}
      <div className="mt-26 flex justify-center gap-4">
        <div className="h-10 w-[400px] bg-gray-200 rounded-2xl shadow"></div>
        <div className="h-10 w-[400px] bg-gray-200 rounded-2xl shadow"></div>

      </div>

      {/* Feature Cards */}
      <div className="mt-10 flex justify-center gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-64 h-40 bg-gray-200 rounded-2xl shadow"
          ></div>
        ))}
      </div>

      {/* Section Title */}
      <div className="mt-14 flex justify-center">
        <div className="h-6 w-80 bg-gray-200 rounded"></div>
      </div>

      {/* Big Banner Skeleton */}
      <div className="mt-6 flex justify-center">
        <div className="h-48 w-[90%] bg-gray-200 rounded-2xl shadow"></div>
      </div>

    </div>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, token } = useSelector((state) => state.auth);
  const socketService = useSocket();




  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (isAuthenticated && user && token) {
      // console.log('🏪 App: User authenticated, connecting socket...');

      // Connect socket after a short delay to ensure token is set
      const connectTimer = setTimeout(() => {
        socketService.connect();
      }, 1000);

      return () => {
        clearTimeout(connectTimer);
      };
    } else {
      // console.log('🔌 App: Disconnecting socket - not authenticated');
      socketService.disconnect();
    }
  }, [isAuthenticated, user, token, socketService]);

  if (loading) {
    return <LoadingSpinner />;
  }


  return (


    <>
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
        <Route path='/employee/buy/dashboard' element={isAuthenticated ? <EmployeeBuyDashboard /> : <Login />} />
        <Route path="/shop-owner/dashboard" element={isAuthenticated ? <ShopOwnerDashboard /> : <Login />} />
        <Route path="/my-requests" element={isAuthenticated ? <UserDashboard /> : <Login />} />
        <Route path='/my-Orders' element={isAuthenticated ? <UserBuyRequestsDashboard /> : <Login />} />
        <Route path="/cart" element={isAuthenticated ? <Cart /> : <Login />} />

      </Routes>

      {/* <SocketStatus /> */}
      {/* <SocketDebug /> */}

    </>


  );
}

export default App;








