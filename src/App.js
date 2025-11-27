import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import CheckoutPage from "./pages/CheckoutPage";
import OrderDetails from "./pages/OrderDetails";
import { CartProvider } from "./context/CartContext";
import ProductDetails from "./pages/ProductDetails";
import PaymentPage from "./pages/PaymentPage";
import ProfilePage from "./pages/ProfilePage";
import MyOrdersPage from "./pages/MyOrdersPage";
import MobileBottomNav from "./components/MobileBottomNav";
import CategoriesPage from "./pages/CategoriesPage";
import Footer from "./pages/Footer";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/ProtectedRoute";

function Layout({ children }) {
  const location = useLocation();

  // Hide navbar + mobile bottom nav on login/register pages
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  const showFooterOnlyOnHome = location.pathname === "/";

  return (
    <>
      {/* Desktop/Tablet Navbar */}
      {!hideNavbar && <Navbar />}

      {/* Page Content */}
      {children}

      {/* Mobile Bottom Navbar */}
      {!hideNavbar && <MobileBottomNav />}

      {/* Footer */}
      {showFooterOnlyOnHome && <Footer />}
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />            

            {/* Protected Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payment/:orderId"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/order-success/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />

          </Routes>
        </Layout>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </Router>
    </CartProvider>
  );
}

export default App;
