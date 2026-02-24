import React from "react";
import "../styles/SkeletonProductCard.css";

const SkeletonProductCard = () => {
  return (
    <div className="skeleton-card skeleton-animate">
      <div className="skeleton-image" />
      <div className="skeleton-text" />
      <div className="skeleton-text-short" />
    </div>
  );
};

export default SkeletonProductCard;
