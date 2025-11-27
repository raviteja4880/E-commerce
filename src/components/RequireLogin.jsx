import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
      <div
        className="d-flex flex-column justify-content-center align-items-center text-center"
        style={{ minHeight: "70vh" }}
      >
        <h5 className="mb-3 fw-semibold text-muted">
          You need to log in to access your {pageName}.
        </h5>
        <button
          className="btn btn-primary px-4 py-2 fw-semibold"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    );
  }

  return children;
}
