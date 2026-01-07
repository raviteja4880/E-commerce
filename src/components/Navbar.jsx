import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaShoppingCart, FaBoxOpen, FaHome } from "react-icons/fa";
import { authAPI } from "../services/api";
import "../styles/ProductCard.css";

function Navbar() {
  const navigate = useNavigate();
  const { state } = useCart();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const cartCount =
    state.cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  /* ================= FETCH USER PROFILE ================= */
  const loadProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await authAPI.getMiniProfile();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    // listen for profile updates (avatar change, logout, etc.)
    const handler = () => loadProfile();
    window.addEventListener("userUpdated", handler);

    return () => window.removeEventListener("userUpdated", handler);
  }, []);

  /* ================= AVATAR FALLBACK ================= */
  const getAvatarSrc = () => {
    if (user?.avatar) return user.avatar;

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User"
    )}&background=87cefa&color=ffffff&size=128`;
  };

  if (loading) return null;

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
          style={{ color: "#222", fontSize: "1.4rem" }}
        >
          MyStore
        </Link>

        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">

            {/* Home */}
            <li className="nav-item">
              <Link className="nav-link d-flex gap-2" to="/">
                <FaHome size={18} />
                Home
              </Link>
            </li>

            {user ? (
              <>
                {/* Cart */}
                <li className="nav-item">
                  <Link className="nav-link d-flex gap-2 position-relative" to="/cart">
                    <FaShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="badge bg-primary position-absolute top-0 start-100 translate-middle">
                        {cartCount}
                      </span>
                    )}
                    Cart
                  </Link>
                </li>

                {/* Orders */}
                <li className="nav-item">
                  <Link className="nav-link d-flex gap-2" to="/my-orders">
                    <FaBoxOpen size={18} />
                    My Orders
                  </Link>
                </li>

                {/* Profile */}
                <li className="nav-item">
                  <button
                    className="nav-link d-flex align-items-center gap-2 bg-transparent border-0"
                    onClick={() => navigate("/profile")}
                  >
                    <img
                      src={getAvatarSrc()}
                      alt="avatar"
                      width={28}
                      height={28}
                      className="rounded-circle"
                      style={{ objectFit: "cover" }}
                    />
                    {user.name}
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
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
