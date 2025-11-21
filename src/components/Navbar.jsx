import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  FaShoppingCart,
  FaUserCircle,
  FaBoxOpen,
  FaSignOutAlt,
  FaHome,
  FaEdit,
} from "react-icons/fa";
import "../styles/ProductCard.css"; 

function Navbar() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();
  const { state } = useCart();
  const cartCount =
    state.cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bounce cart icon when an item is added
  useEffect(() => {
    const addedItem = sessionStorage.getItem("cartAnimation");
    if (addedItem) {
      const cartIcon = document.getElementById("cart-icon");
      if (cartIcon) {
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 600);
      }
      sessionStorage.removeItem("cartAnimation");
    }
  }, [cartCount]);

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top shadow-sm"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <div className="container">
        {/* === Brand === */}
        <Link
          className="navbar-brand fw-semibold"
          to="/"
          style={{ color: "#222", fontSize: "1.4rem", textDecoration: "none" }}
        >
          MyStore
        </Link>

        {/* === Nav Links === */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center gap-2" to="/">
                <FaHome size={18} />
                <span className="fw-medium">Home</span>
              </Link>
            </li>

            {userInfo ? (
              <>
                {/*  Cart icon with animation and fixed badge */}
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-2 position-relative"
                    to="/cart"
                    style={{ position: "relative" }}
                  >
                    <div style={{ position: "relative" }}>
                      <FaShoppingCart size={20} id="cart-icon" />
                      {cartCount > 0 && (
                        <span
                          className="badge bg-primary position-absolute"
                          style={{
                            top: "-8px",
                            right: "-10px",
                            fontSize: "0.7rem",
                            borderRadius: "50%",
                            padding: "4px 6px",
                            minWidth: "18px",
                            height: "18px",
                            lineHeight: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 0 4px rgba(0,0,0,0.25)",
                          }}
                        >
                          {cartCount}
                        </span>
                      )}
                    </div>
                    <span className="fw-medium">Cart</span>
                  </Link>
                </li>

                {/* My Orders */}
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-2"
                    to="/my-orders"
                  >
                    <FaBoxOpen size={18} />
                    <span className="fw-medium">My Orders</span>
                  </Link>
                </li>

                {/* === User Dropdown === */}
                <li className="nav-item dropdown" ref={dropdownRef}>
                  <div
                    className="nav-link d-flex align-items-center gap-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <FaUserCircle size={20} />
                    <span className="fw-medium">
                      {userInfo.name || "Account"}
                    </span>
                  </div>

                  {dropdownOpen && (
                    <ul
                      className="dropdown-menu dropdown-menu-end show mt-2 border-0 shadow"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        borderRadius: "12px",
                        minWidth: "230px",
                        padding: "0.6rem 0.5rem",
                        background: "white",
                      }}
                    >
                      {/* User Info */}
                      <li
                        className="dropdown-item"
                        style={{
                          padding: "1rem 2rem",
                          borderRadius: "8px",
                          background: "#f8f9fa",
                          marginBottom: "0.4rem",
                          lineHeight: "1.5",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "#333",
                          }}
                        >
                          {userInfo.name}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#777" }}>
                          {userInfo.email}
                        </div>
                      </li>

                      <li>
                        <hr className="dropdown-divider my-2" />
                      </li>

                      {/* Edit Profile */}
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2 fw-semibold text-primary"
                          style={{
                            padding: "0.7rem 1rem",
                            borderRadius: "8px",
                            transition: "all 0.2s ease-in-out",
                          }}
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/profile");
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#f0f8ff")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <FaEdit size={16} />
                          Edit Profile
                        </button>
                      </li>

                      {/* Logout */}
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2 text-danger fw-semibold"
                          style={{
                            padding: "0.7rem 1rem",
                            borderRadius: "8px",
                            transition: "all 0.2s ease-in-out",
                          }}
                          onClick={handleLogout}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#fff5f5")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <FaSignOutAlt size={16} />
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link
                  className="nav-link d-flex align-items-center gap-2"
                  to="/login"
                >
                  <FaUserCircle size={18} />
                  <span className="fw-medium">Login</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
