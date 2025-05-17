import React, { useContext, useState, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/session/AuthContext ";
import clsx from "clsx";
import Main from "./components/main/Main";
import Header from "./components/Header/Header";
import Footer from "./components/footer/Footer";
import ScrollToTop from "./contexts/ScrollToTop";
import "./index.css";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
// Lazy load route-based and large components
const Menu = lazy(() => import("./components/menu/Menu"));
const BookTruck = lazy(() => import("./components/BookTruck/BookTruck"));
const Catering = lazy(() => import("./components/catering/Catering"));
const LogIn = lazy(() => import("./components/logIn/logIn"));
const Cart = lazy(() => import("./components/cart/Cart"));
const SignUp = lazy(() => import("./components/signUp/signUp.jsx"));
const FindTruck = lazy(() => import("./components/findTruck/FindTruck"));
const ForgotPassword = lazy(() =>
  import("./components/dashboard/passwordMangement/ForgotPassword")
);
const ContactUs = lazy(() => import("./components/contactUs/ContactUs"));
const PrivateRoute = lazy(() => import("./contexts/privateRoute"));
const Home = lazy(() => import("./components/dashboard/home/Home"));
const CustomerPage = lazy(() =>
  import("./components/dashboard/Customers/CustomerPage")
);
const EditProfile = lazy(() =>
  import("./components/dashboard/passwordMangement/EditProfile")
);
const Orders = lazy(() => import("./components/dashboard/Orders/Orders"));
const GeocodingService = lazy(() =>
  import("./components/findTruck/GeocodingService")
);
const Dishes = lazy(() =>
  import("./components/dashboard/Inventory/Dishes/Dishes")
);
const ContainerOrders = lazy(() =>
  import("./components/dashboard/currentOrders/ordersContainer")
);
const Ingredients = lazy(() =>
  import("./components/dashboard/Inventory/ingredients/Ingredients")
);
const Extras = lazy(() =>
  import("./components/dashboard/Inventory/Extras/Extras")
);
const SideDashboard = lazy(() =>
  import("./components/dashboard/sideDashboard/SideDashboard")
);

const AppContent = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="App">
      {/* Critical components are loaded without Suspense */}
      <Header />
      <ScrollToTop />

      {/* Lazy loading the sidebar as it's non-critical */}
      {isAuthenticated && (
        <Suspense fallback={<LoadingScreen />}>
          <SideDashboard setSidebarOpen={setSidebarOpen} />
        </Suspense>
      )}

      <div className={clsx("container", { "content-shift": sidebarOpen })}>
        <Suspense fallback={<LoadingScreen/>}>
          <Routes>
            <Route path="/home" element={<Main />} />
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/bookTruck" element={<BookTruck />} />
            <Route path="/catering" element={<Catering />} />
            <Route path="/login" element={<LogIn />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/find-truck" element={<FindTruck />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />
            <Route path="/contactUs" element={<ContactUs />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <PrivateRoute>
                  <CustomerPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/editProfile"
              element={
                <PrivateRoute>
                  <EditProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/truckLocation"
              element={
                <PrivateRoute>
                  <GeocodingService />
                </PrivateRoute>
              }
            />
            <Route
              path="/dishes"
              element={
                <PrivateRoute>
                  <Dishes />
                </PrivateRoute>
              }
            />
            <Route
              path="/tabOrders"
              element={
                <PrivateRoute>
                  <ContainerOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/ingredients"
              element={
                <PrivateRoute>
                  <Ingredients />
                </PrivateRoute>
              }
            />
            <Route
              path="/extras"
              element={
                <PrivateRoute>
                  <Extras />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </Suspense>
      </div>

      {/* Footer is critical and small, no need for lazy loading */}
      <Footer />
    </div>
  );
};

export default AppContent;
