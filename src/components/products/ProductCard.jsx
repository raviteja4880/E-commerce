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

      const cardElement = e.currentTarget.closest(".product-card") || e.currentTarget.closest("div[style*='flex']");
      const productImage = cardElement?.querySelector("img");
      
      let cartIcon = document.getElementById("cart-icon");
      
      if (!cartIcon) {
        const mobileCartIcon = document.querySelector(".mobile-bottom-nav .cart");
        if (mobileCartIcon) {
          cartIcon = mobileCartIcon;
        }
      }
      
      if (!cartIcon || !productImage) {
        addToCart(product._id, 1)
          .then(() => toast.success("Added to cart!"))
          .catch(() => toast.error("Failed to add to cart"));
        return;
      }

      // Get positions
      const imgRect = productImage.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      // Create flying clone with improved styling
      const clone = productImage.cloneNode(true);
      Object.assign(clone.style, {
        position: "fixed",
        left: imgRect.left + "px",
        top: imgRect.top + "px",
        width: imgRect.width + "px",
        height: imgRect.height + "px",
        objectFit: "cover",
        borderRadius: "8px",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 1,
        boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      });
      document.body.appendChild(clone);

      // Calculate distance to cart
      const translateX = cartRect.left + (cartRect.width / 2) - (imgRect.width / 2) - imgRect.left;
      const translateY = cartRect.top + (cartRect.height / 2) - (imgRect.height / 2) - imgRect.top;

      // Animate towards cart
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.15) rotate(15deg)`;
        clone.style.opacity = "0.8";
      });

      setTimeout(() => {
        // Remove clone
        clone.remove();

        // Bounce animation on cart icon
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 600);

        // Add to cart after animation
        addToCart(product._id, 1)
          .then(() => {
            sessionStorage.setItem("cartAnimation", product.name);
          })
          .catch(() => toast.error("Failed to add to cart"));
      }, 600);
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
