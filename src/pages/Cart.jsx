import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import Loader from "../pages/Loader";
import "../styles/Cart.css";
import RequireLogin from "../components/RequireLogin";

// ✅ Consistent Rupee formatter
const Rupee = ({ value, size = "1rem", bold = false, color = "#000" }) => (
  <span
    style={{
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: size,
      fontWeight: bold ? 600 : 500,
      color,
      display: "inline-flex",
      alignItems: "baseline",
      gap: "2px",
    }}
  >
    <span
      style={{
        fontFamily: "sans-serif",
        fontWeight: 600,
        transform: "translateY(-0.5px)",
      }}
    >
      ₹
    </span>
    <span>{value?.toLocaleString("en-IN")}</span>
  </span>
);

function Cart() {
  const { state, updateCartQty, removeFromCart, clearCart } = useCart();
  const { cartItems, totalPrice, loading, error } = state;
  const navigate = useNavigate();

  const [addedItem, setAddedItem] = useState(null);

  useEffect(() => {
    const newItem = sessionStorage.getItem("cartAnimation");
    if (newItem) {
      setAddedItem(newItem);
      setTimeout(() => {
        setAddedItem(null);
        sessionStorage.removeItem("cartAnimation");
      }, 2000);
    }
  }, []);

  if (loading) return <Loader />;
  if (error)
    return (
      <p className="text-center mt-5 text-danger fw-semibold">{error}</p>
    );

  const handleQuantityChange = (productId, value) => {
    const qty = Math.max(1, Number(value) || 1);
    updateCartQty(productId, qty);
  };

  return (
    <RequireLogin>
      <div className="container mt-4 mb-5 position-relative">
        {/* Floating add-to-cart animation */}
        {addedItem && (
          <div className="cart-added-toast">
            <strong>{addedItem}</strong> added to cart!
          </div>
        )}

        <h2 className="fw-bold mb-4 text-center text-primary">My Cart</h2>

        {cartItems.length === 0 ? (
          <div className="text-center mt-5">
            <p className="text-muted fs-5">Your cart is empty.</p>
            <button
              className="btn btn-primary mt-3 fw-semibold"
              onClick={() => navigate("/")}
            >
              Go Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Cart Table */}
            <div className="table-responsive shadow-sm rounded-3 border bg-white">
              <table className="table align-middle m-0">
                <thead className="table-light text-center">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {cartItems.map((item) => {
                    const productId = item.product?._id ?? item.productId;
                    const productName =
                      item.product?.name || "Product Unavailable";
                    const productPrice = item.product?.price || 0;
                    const productImage = item.product?.image;

                    return (
                      <tr key={productId}>
                        {/* Product Info */}
                        <td className="text-start">
                          <div className="d-flex align-items-center gap-2">
                            {productImage && (
                              <img
                                src={productImage}
                                alt={productName}
                                style={{
                                  width: "55px",
                                  height: "55px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: "1px solid #ddd",
                                }}
                              />
                            )}
                            <span className="fw-medium text-dark">
                              {productName}
                            </span>
                          </div>
                        </td>

                        {/* Price */}
                        <td>
                          <Rupee value={productPrice} />
                        </td>

                        {/* Quantity Controls */}
                        <td>
                          <div className="d-flex align-items-center justify-content-center">
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={() =>
                                handleQuantityChange(productId, item.qty - 1)
                              }
                              disabled={item.qty <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.qty}
                              min="1"
                              className="form-control text-center"
                              style={{
                                width: "60px",
                                borderRadius: "6px",
                              }}
                              onChange={(e) =>
                                handleQuantityChange(productId, e.target.value)
                              }
                              onBlur={(e) => {
                                if (!e.target.value || e.target.value < 1) {
                                  handleQuantityChange(productId, 1);
                                }
                              }}
                            />
                            <button
                              className="btn btn-sm btn-outline-secondary ms-2"
                              onClick={() =>
                                handleQuantityChange(productId, item.qty + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Subtotal */}
                        <td>
                          <Rupee value={productPrice * item.qty} bold />
                        </td>

                        {/* Remove */}
                        <td>
                          <button
                            className="btn btn-danger btn-sm fw-semibold"
                            onClick={() => removeFromCart(productId)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Total & Buttons */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 p-3 border rounded-3 shadow-sm bg-light">
              <h4 className="mb-3 mb-md-0 fw-bold text-dark">
                Total: <Rupee value={totalPrice} bold size="1.2rem" />
              </h4>
              <div>
                <button
                  className="btn btn-outline-danger me-3 fw-semibold"
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
                <button
                  className="btn btn-success fw-semibold"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </RequireLogin>
  );
}

export default Cart;
