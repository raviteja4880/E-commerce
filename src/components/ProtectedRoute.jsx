import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  let userInfo = null;

  try {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      userInfo = JSON.parse(stored); 
    }
  } catch (err) {
    console.error("Invalid userInfo in localStorage", err);
  }

  // If user is NOT logged in → redirect
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
