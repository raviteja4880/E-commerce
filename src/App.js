import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import SplashScreen from "./components/SplashScreen";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import CheckoutPage from "./pages/CheckoutPage";
import OrderDetails from "./pages/OrderDetails";
import ProductDetails from "./pages/ProductDetails";
import PaymentPage from "./pages/PaymentPage";
import ProfilePage from "./pages/ProfilePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import CategoriesPage from "./pages/CategoriesPage";

import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const isLoggedIn = () => {
  try {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    return !!user;
  } catch {
    return false;
  }
};

function Layout({ children }) {
  const location = useLocation();

  const isAuthPage = location.pathname === "/login";
  const loggedIn = !!localStorage.getItem("userInfo");
  const isMobile = window.innerWidth < 768;

  const showFooter =
    !loggedIn &&        
    !isMobile;        

  return (
    <>
      {/* Navbar */}
      {!isAuthPage && <Navbar />}

      {/* Page Content */}
      {children}

      {/* Mobile Bottom Nav */}
      {!isAuthPage && <MobileBottomNav />}

      {/* Footer */}
      {showFooter && <Footer />}
    </>
  );
}


function App() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("splashSeen");
    if (!seen) {
      setShowSplash(true);
      setTimeout(() => {
        sessionStorage.setItem("splashSeen", "true");
        setShowSplash(false);
      }, 1800);
    }
  }, []);

  return (
    <CartProvider>
      <Router>
        <AnimatePresence>{showSplash && <SplashScreen />}</AnimatePresence>

        {!showSplash && (
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
              <Route path="/checkout" element={<ProtectedRoute> <CheckoutPage /> </ProtectedRoute>} />
              <Route path="/payment/:orderId" element={<ProtectedRoute> <PaymentPage /> </ProtectedRoute>} />
              <Route path="/order-success/:orderId" element={<ProtectedRoute> <OrderDetails /> </ProtectedRoute>} />
            </Routes>
          </Layout>
        )}
        <ToastContainer position="top-right" theme="colored" />
      </Router>
    </CartProvider>
  );
}

export default App;
