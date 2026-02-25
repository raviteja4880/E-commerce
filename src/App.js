import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useParams,
} from "react-router-dom";
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

// SEO Meta Tags Component
function SEO({ title, description, image }) {
  useEffect(() => {
    const defaultTitle = "MyStorX — Online Shopping Made Easy";
    const defaultDesc = "Shop your favorite products with secure checkout and fast delivery on MyStorX.";
    
    document.title = title || defaultTitle;
    
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    const updateOgMeta = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.property = property;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    updateMeta("title", title || defaultTitle);
    updateOgMeta("og:title", title || defaultTitle);
    updateOgMeta("twitter:title", title || defaultTitle);
    
    updateMeta("description", description || defaultDesc);
    updateOgMeta("og:description", description || defaultDesc);
    updateOgMeta("twitter:description", description || defaultDesc);
    
    const ogImage = image || "%PUBLIC_URL%/favicon.ico";
    updateOgMeta("og:image", ogImage);
    updateOgMeta("twitter:image", ogImage);

    return () => {
      document.title = defaultTitle;
    };
  }, [title, description, image]);

  return null;
}

// Page wrapper with SEO
function SEOWrapper({ children, seo }) {
  return (
    <>
      <SEO {...seo} />
      {children}
    </>
  );
}

function Layout({ children }) {
  const location = useLocation();

  const isAuthPage = location.pathname === "/login";
  const loggedIn = !!localStorage.getItem("userInfo");
  const isMobile = window.innerWidth < 768;

  const showFooter = !loggedIn && !isMobile;

  return (
    <>
      {!isAuthPage && <Navbar />}
      {children}
      {!isAuthPage && <MobileBottomNav />}
      {showFooter && <Footer />}
    </>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem("splashSeen");
    if (seen) {
      setShowSplash(false);
      return;
    }
    const timer = setTimeout(() => {
      sessionStorage.setItem("splashSeen", "true");
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<SEOWrapper seo={{ title: "MyStorX — Best Online Shopping Store" }}><Home /></SEOWrapper>} />
            <Route path="/product/:id" element={<SEOWrapper seo={{ title: "Product Details - MyStorX" }}><ProductDetails /></SEOWrapper>} />
            <Route path="/login" element={<SEOWrapper seo={{ title: "Login - MyStorX" }}><Login /></SEOWrapper>} />
            <Route path="/categories" element={<SEOWrapper seo={{ title: "Shop by Category - MyStorX", description: "Browse our wide range of product categories" }}><CategoriesPage /></SEOWrapper>} />
            <Route path="/cart" element={<SEOWrapper seo={{ title: "Shopping Cart - MyStorX" }}><Cart /></SEOWrapper>} />
            <Route path="/profile" element={<SEOWrapper seo={{ title: "My Profile - MyStorX" }}><ProfilePage /></SEOWrapper>} />
            <Route path="/my-orders" element={<SEOWrapper seo={{ title: "My Orders - MyStorX", description: "Track your order history" }}><MyOrdersPage /></SEOWrapper>} />
            <Route path="/checkout" element={<ProtectedRoute><SEOWrapper seo={{ title: "Checkout - MyStorX" }}><CheckoutPage /></SEOWrapper></ProtectedRoute>} />
            <Route path="/payment/:orderId" element={<ProtectedRoute><SEOWrapper seo={{ title: "Payment - MyStorX" }}><PaymentPage /></SEOWrapper></ProtectedRoute>} />
            <Route path="/order-success/:orderId" element={<ProtectedRoute><SEOWrapper seo={{ title: "Order Confirmed - MyStorX" }}><OrderDetails /></SEOWrapper></ProtectedRoute>} />
          </Routes>
        </Layout>
        <ToastContainer position="top-right" theme="colored" />
      </Router>
    </CartProvider>
  );
}

export default App;
