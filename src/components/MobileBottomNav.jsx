import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaList, FaShoppingCart, FaBoxOpen, FaUser } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import "../styles/MobileBottomNav.css";

export default function MobileBottomNav() {
  const location = useLocation();
  const { state } = useCart();
  const cartCount = state.cartItems?.length || 0;


  return (
    <div className="mobile-bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === "/" ? "active" : ""}`}>
        <FaHome size={20} />
        <span>Home</span>
      </Link>

      <Link to="/categories" className={`nav-item ${location.pathname === "/categories" ? "active" : ""}`}>
        <FaList size={20} />
        <span>Categories</span>
      </Link>

      <Link to="/cart" className="nav-item cart">
        <FaShoppingCart size={22} id="cart-icon" />
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        <span>Cart</span>
      </Link>

      <Link to="/my-orders" className={`nav-item ${location.pathname === "/my-orders" ? "active" : ""}`}>
        <FaBoxOpen size={20} />
        <span>Orders</span>
      </Link>

      <Link to="/profile" className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}>
        <FaUser size={20} />
        <span>Account</span>
      </Link>
    </div>
  );
}
