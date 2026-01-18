import React from "react";

const SkeletonProductCard = () => {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "8px",
        padding: "12px",
        backgroundColor: "#f8f9fa",
        height: "300px",
        animation: "pulse 1.4s infinite",
      }}
    >
      <div
        style={{
          height: "180px",
          backgroundColor: "#e0e0e0",
          borderRadius: "6px",
          marginBottom: "10px",
        }}
      />
      <div style={{ height: "14px", background: "#e0e0e0", marginBottom: "6px" }} />
      <div style={{ height: "12px", background: "#e0e0e0", width: "60%" }} />
      <style>{`
        @keyframes pulse {
          0% { opacity: 1 }
          50% { opacity: 0.4 }
          100% { opacity: 1 }
        }
      `}</style>
    </div>
  );
};

export default SkeletonProductCard;
