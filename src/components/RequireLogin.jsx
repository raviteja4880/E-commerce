import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";

export default function RequireLogin({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  // Extract page name from pathname
  const getPageName = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes("cart")) return "cart";
    if (path.includes("profile")) return "profile";
    if (path.includes("my-orders")) return "orders";
    if (path.includes("order-success")) return "order details";
    return "this page";
  };

  const pageName = getPageName();

  if (!userInfo?.token) {
    return (
      <div className="require-login-wrapper">
        <div className="require-login-card">
          <div className="lock-icon">
            <Lock size={36} />
          </div>

          <h4 className="require-title">Login Required</h4>

          <p className="require-text">
            Please log in to access your <strong>{pageName}</strong>.
          </p>

          <button
            className="btn btn-primary px-4 py-2 fw-semibold"
            onClick={() =>
              navigate("/login", { state: { from: location.pathname } })
            }
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
}
