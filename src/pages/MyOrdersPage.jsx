import React, { useEffect, useState, useRef } from "react";
import { orderAPI } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import Loader from "./Loader";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaQrcode,
  FaCreditCard,
} from "react-icons/fa";
import RequireLogin from "../components/RequireLogin"; 

// Unified Rupee formatter
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

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo")); // ✅ check login

  const fetchOrders = async () => {
    try {
      const { data } = await orderAPI.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ only fetch if logged in
    if (userInfo?.token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, []);

  if (!userInfo?.token) {
    return (
      <RequireLogin>
        <div className="text-center mt-5">
          <p className="text-muted fs-5">Please log in to view your orders.</p>
        </div>
      </RequireLogin>
    );
  }

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (orders.length === 0)
    return <p className="text-center mt-5 fs-5 text-muted">No orders yet.</p>;


  return (
    <RequireLogin>
      <div
        className="container-fluid py-5 px-3 px-md-5"
        style={{
          backgroundColor: "#f8f9fb",
          minHeight: "100vh",
        }}
      >
        <h2 className="text-center fw-bold mb-5" style={{ color: "#007bff" }}>
          My Orders
        </h2>

        <div
          className="order-grid"
          style={{
            display: "grid",
            gap: "24px",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} navigate={navigate} />
          ))}
        </div>
      </div>
    </RequireLogin>
  );
}

// ========================= ORDER CARD =========================
const OrderCard = ({ order, navigate }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // ===================== EXPECTED DELIVERY =====================
  const expected = order.expectedDeliveryDate
    ? new Date(order.expectedDeliveryDate)
    : new Date(order.createdAt);

  const expectedDelivery = expected.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // ===================== DELIVERY MESSAGE =====================
  const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : null;
  const now = new Date();

  let deliveryMessage = "";
  let deliveryColor = "#28a745";

  if (order.isDelivered) {
    deliveryMessage = `Delivered on ${deliveredDate.toLocaleDateString(
      "en-IN",
      { day: "2-digit", month: "short", year: "numeric" }
    )}`;
    deliveryColor = "#28a745";
  } else if (now > expected) {
    const delayDays = Math.floor((now - expected) / (1000 * 60 * 60 * 24));
    if (delayDays === 0) {
      deliveryMessage = "Delivering soon — on the way";
    } else if (delayDays === 1) {
      deliveryMessage = "Delivery delayed by 1 day — arriving soon";
    } else {
      deliveryMessage = `Delivery delayed by ${delayDays} days — arriving soon`;
    }
    deliveryColor = "#ff8c00";
  } else {
    deliveryMessage = `Expected by ${expectedDelivery}`;
    deliveryColor = "#666";
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="order-card position-relative"
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        transition: "transform 0.25s ease",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom flex-wrap"
        style={{ background: "#f9fafc" }}
      >
        <span style={{ fontSize: "0.85rem" }}>
          <strong style={{ color: "#007bff" }}>
            #{order._id.slice(-6).toUpperCase()}
          </strong>
        </span>
        <span className="text-muted" style={{ fontSize: "0.85rem" }}>
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* ITEMS */}
      <div className="p-3">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="d-flex justify-content-between align-items-center mb-2 flex-wrap"
          >
            <div className="d-flex align-items-center gap-2 mb-1">
              <img
                src={item.image || item.product?.image}
                alt={item.name}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 6,
                  objectFit: "cover",
                  border: "1px solid #eee",
                }}
              />
              <div style={{ maxWidth: "180px" }}>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "#333",
                    lineHeight: "1.2",
                  }}
                >
                  {item.name}
                </div>
                <small className="text-muted">x {item.qty}</small>
              </div>
            </div>
            <div className="fw-semibold text-nowrap">
              <Rupee value={item.price * item.qty} color="#333" />
            </div>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div
        className="d-flex justify-content-between align-items-center border-top border-bottom px-3 py-2"
        style={{ background: "#f9fafc", fontWeight: "600" }}
      >
        <span>Total</span>
        <Rupee value={order.totalPrice} bold color="#000" />
      </div>

      {/* STATUS */}
      <div className="px-3 py-3 d-flex flex-column gap-2">
        <StatusBadge
          isActive={order.isPaid}
          activeColor="#28a745"
          inactiveColor="#ffc107"
          icon={order.isPaid ? <FaCheckCircle /> : <FaClock />}
          label={
            order.isPaid
              ? `Paid (${order.paymentMethod.toUpperCase()})`
              : `Pending (${order.paymentMethod.toUpperCase()})`
          }
        />

        <StatusBadge
          isActive={order.isDelivered}
          activeColor="#28a745"
          inactiveColor="#dc3545"
          icon={order.isDelivered ? <FaTruck /> : <FaTimesCircle />}
          label={order.isDelivered ? "Delivered" : "Not Delivered"}
        />
      </div>

      {/* BUTTONS */}
      <div className="px-3 pb-3 position-relative" ref={dropdownRef}>
        {!order.isPaid && (
          <div className="position-relative mb-2">
            <button
              ref={buttonRef}
              className="btn btn-success w-100 fw-semibold py-2"
              onClick={() => setOpen(!open)}
              style={{
                borderRadius: "10px",
                background: "#28a745",
                border: "none",
              }}
            >
              Pay Now ▾
            </button>

            {open && (
              <div
                className="shadow dropdown-fade"
                style={{
                  position: "absolute",
                  top: "110%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "90%",
                  background: "#fff",
                  borderRadius: "10px",
                  marginTop: "6px",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  overflow: "hidden",
                  zIndex: 999,
                }}
              >
                <button
                  className="dropdown-item py-2 d-flex align-items-center gap-2"
                  onClick={() => {
                    navigate(`/payment/${order._id}?method=qr`);
                    setOpen(false);
                  }}
                >
                  <FaQrcode /> Pay via QR Code
                </button>
                <button
                  className="dropdown-item py-2 d-flex align-items-center gap-2"
                  onClick={() => {
                    navigate(`/payment/${order._id}?method=card`);
                    setOpen(false);
                  }}
                >
                  <FaCreditCard /> Pay via Card
                </button>
              </div>
            )}
          </div>
        )}

        <Link
          to={`/order-success/${order._id}`}
          className="btn w-100 fw-semibold py-2"
          style={{
            borderRadius: "10px",
            border: "1.5px solid #007bff",
            color: "#007bff",
            background: "#fff",
          }}
        >
          View Details
        </Link>
      </div>

      {/* FOOTER */}
      <div
        className="text-center border-top py-2"
        style={{
          background: "#f9fafc",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
          fontSize: "0.9rem",
          fontWeight: 600,
          color: deliveryColor,
        }}
      >
        {deliveryMessage}
      </div>
    </div>
  );
};

// ========================= STATUS BADGE =========================
const StatusBadge = ({ isActive, activeColor, inactiveColor, icon, label }) => (
  <div
    className="badge d-flex align-items-center justify-content-center gap-2 text-wrap"
    style={{
      backgroundColor: isActive ? `${activeColor}15` : `${inactiveColor}15`,
      color: isActive ? activeColor : inactiveColor,
      fontSize: "0.9rem",
      padding: "8px",
      borderRadius: "8px",
      textAlign: "center",
      width: "100%",
    }}
  >
    {icon} {label}
  </div>
);

export default MyOrdersPage;
