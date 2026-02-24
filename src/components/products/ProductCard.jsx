import React, { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import "../../styles/ProductCard.css";

const ProductCard = React.memo(({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  /** Memoized handler — stable between renders */
  const handleAddToCart = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.token) {
        toast.warning("You need to log in to access the cart");
        navigate("/login");
        return;
      }

      const productImage = e.currentTarget.closest("div").querySelector("img");
      const cartIcon = document.getElementById("cart-icon");
      if (!cartIcon || !productImage) return;

      // Create flying clone
      const clone = productImage.cloneNode(true);
      const imgRect = productImage.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      Object.assign(clone.style, {
        position: "fixed",
        left: imgRect.left + "px",
        top: imgRect.top + "px",
        width: imgRect.width + "px",
        height: imgRect.height + "px",
        borderRadius: "8px",
        transition:
          "all 0.8s cubic-bezier(0.4, 0.7, 0.2, 1.1), opacity 0.8s",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 1,
      });
      document.body.appendChild(clone);

      requestAnimationFrame(() => {
        clone.style.transform = `translate3d(
          ${cartRect.left - imgRect.left}px,
          ${cartRect.top - imgRect.top}px,
          0
        ) scale(0.2) rotate(25deg)`;
        clone.style.opacity = 0.1;
      });

      setTimeout(() => {
        clone.remove();

        // Bounce animation on cart icon
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 600);

        addToCart(product._id, 1)
          .then(() => {
            sessionStorage.setItem("cartAnimation", product.name);
          })
          .catch(() => toast.error("Failed to add to cart"));
      }, 850);
    },
    [addToCart, navigate, product]
  );

  const stock = Number(product.countInStock ?? 0);
  const out = stock <= 0;

  return (
    <div className="product-card">
      <Link
        to={`/product/${product._id}`}
        onClick={() => {
          sessionStorage.setItem("homeScroll", window.scrollY);
        }}
        className="product-card-link"
      >
        <div className="product-card-image-wrapper">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="product-card-image"
          />
        </div>
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-brand">{product.brand}</p>
        <p className="product-card-price">
          <span className="product-card-price-symbol">₹</span>
          {product.price.toLocaleString("en-IN")}
        </p>
        {out && <span className="badge bg-danger mb-2">Out of Stock</span>}

        {stock > 0 && stock <= 5 && (
          <span className="badge bg-warning text-dark mb-2">
            Only {stock} left
          </span>
        )}
      </Link>

      <button
        className="product-card-button"
        disabled={out}
        onClick={handleAddToCart}
      >
        {out ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
});

export default ProductCard;
