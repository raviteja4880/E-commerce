import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import Loader from "../pages/Loader";
import {
  ShoppingCart,
  Package,
  Truck,
  MapPin,
  CheckCircle,
} from "lucide-react";

// Reusable Rupee formatter
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

function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressStage, setProgressStage] = useState(1);
  const [expectedDate, setExpectedDate] = useState("");

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const stages = [
    { label: "Order Placed", icon: ShoppingCart },
    { label: "Packed", icon: Package },
    { label: "Shipped", icon: Truck },
    { label: "Out for Delivery", icon: MapPin },
    { label: "Delivered", icon: CheckCircle },
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await orderAPI.getById(orderId);
        setOrder(data);

        // Expected Delivery
        const expected = data.expectedDeliveryDate
          ? new Date(data.expectedDeliveryDate)
          : new Date(data.createdAt || Date.now());

        setExpectedDate(
          expected.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        );

        // Progress Logic
        if (data.isCanceled) setProgressStage(0);
        else if (data.isDelivered) setProgressStage(5);
        else {
          const created = new Date(data.createdAt);
          const today = new Date();
          const daysPassed = Math.floor((today - created) / (1000 * 60 * 60 * 24));
          const calculatedStage = Math.min(daysPassed + 1, stages.length - 1); 
          setProgressStage(calculatedStage);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleConfirmCancel = async () => {
    if (!order?._id) {
      alert("Order details not loaded yet. Please wait a moment.");
      return;
    }

    const finalReason =
      cancelReason === "Other" ? customReason.trim() : cancelReason;

    if (!finalReason) {
      alert("Please select or enter a reason for cancellation.");
      return;
    }

    try {
      setSubmittingCancel(true);
      const { data } = await orderAPI.cancelOrder(order._id, {
        reason: finalReason,
      });

      setOrder(data.order || data);
      setShowCancelModal(false);
      setProgressStage(0);
      alert("Order cancelled successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setSubmittingCancel(false);
    }
  };

  if (loading) return <Loader />;
if (error)
  return <p className="text-center mt-5 text-danger fw-semibold">{error}</p>;
if (!order)
  return <p className="text-center mt-5 text-muted">Order not found.</p>;

const progressColor = order?.isCanceled
  ? "#dc3545"
  : order?.isDelivered
  ? "#28a745"
  : "#0d6efd";


  const progressWidth =
    progressStage === 0
      ? "0%"
      : progressStage >= stages.length
      ? "80%"
      : `${((progressStage - 1) / (stages.length - 1)) * 80}%`;

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h2 className="text-primary mb-4 fw-bold text-center">Order Details</h2>

      <div className="card shadow-sm p-4 rounded-4 border-0">
        <div className="row gy-3">
          {/* LEFT COLUMN */}
          <div className="col-md-6">
            <p>
              <strong>Order ID:</strong> {order._id}
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              {order.paymentMethod?.toUpperCase()}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span
                style={{
                  color: order.isCanceled
                    ? "#dc3545"
                    : order.isDelivered
                    ? "#28a745"
                    : order.isPaid
                    ? "#28a745"
                    : "#f0ad4e",
                  fontWeight: 600,
                }}
              >
                {order.isCanceled
                  ? "Cancelled"
                  : order.isDelivered
                  ? "Delivered"
                  : order.isPaid
                  ? "Paid"
                  : "Pending"}
              </span>
            </p>

            <p>
              <strong>Total:</strong>{" "}
              <Rupee value={order.totalPrice} bold size="1.05rem" />
            </p>

            <p>
              <strong>Expected Delivery:</strong> {expectedDate}
            </p>

            {order.isDelivered && (
              <p style={{ color: "#28a745", fontWeight: 600 }}>
                Delivered on{" "}
                {new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}

            {order.isCanceled && (
              <div style={{ color: "#dc3545", fontWeight: 600 }}>
                <p>
                  <strong>Cancelled on:</strong>{" "}
                  {new Date(order.canceledAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <strong>Reason:</strong>{" "}
                  {order.cancelReason || "Not provided"}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-md-6">
            <h5 className="fw-semibold mb-3">Items Ordered</h5>
            <ul className="list-unstyled m-0">
              {order.items.map((item, idx) => (
                <li
                  key={idx}
                  className="d-flex align-items-center justify-content-between border-bottom py-2"
                >
                  <div className="d-flex align-items-center gap-2">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 6,
                          objectFit: "cover",
                          border: "1px solid #ddd",
                        }}
                      />
                    )}
                    <span className="fw-medium">
                      {item.name} × {item.qty}
                    </span>
                  </div>
                  <Rupee value={item.price * item.qty} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* DELIVERY TRACKING */}
        <div className="mt-5">
          <h5 className="fw-semibold mb-3">Delivery Tracking</h5>

          <div className="position-relative" style={{ padding: "40px 0 20px" }}>
            {/* Background line */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "10%",
                right: "10%",
                height: "4px",
                background: "#e9ecef",
                borderRadius: 5,
                transform: "translateY(-50%)",
              }}
            />

            {/* Progress line */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "10%",
                width: progressWidth,
                height: "4px",
                background: progressColor,
                borderRadius: 5,
                transform: "translateY(-50%)",
                transition: "width 0.6s ease-in-out",
              }}
            />

            {/* Stage Icons */}
            <div
              className="d-flex justify-content-between"
              style={{ position: "relative", zIndex: 2 }}
            >
              {stages.map(({ label, icon: Icon }, index) => {
                const active = !order.isCanceled && index + 1 <= progressStage;
                const color = active ? progressColor : "#adb5bd";
                return (
                  <div
                    key={label}
                    className="text-center"
                    style={{
                      width: `${100 / stages.length}%`,
                      color,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: active ? color : "#dee2e6",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 10px",
                        fontSize: "20px",
                        boxShadow: active
                          ? `0 0 10px ${color}80`
                          : "inset 0 0 3px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cancelled Badge */}
            {order.isCanceled && (
              <div
                style={{
                  position: "absolute",
                  right: "12%",
                  top: "-10px",
                  background: "#dc3545",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                Cancelled
              </div>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="text-center mt-4">
          {!order.isDelivered && !order.isCanceled && (
            <button
              className="btn btn-danger"
              disabled={!order?._id || submittingCancel}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Order
            </button>
          )}

          <Link
            to="/"
            className="btn btn-primary fw-semibold px-4 py-2 mx-2"
            style={{ minWidth: "160px" }}
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 9999 }}
        >
          <div className="bg-white p-4 rounded-3 shadow-lg" style={{ width: "420px" }}>
            <h5 className="fw-bold text-center mb-3">Cancel Order</h5>

            <p className="text-muted">Choose a reason for cancellation:</p>

            <div className="d-flex flex-column gap-2">
              {[
                "Ordered by mistake",
                "Found cheaper elsewhere",
                "Product is no longer needed",
                "Expected delivery time is too long",
                "Other",
              ].map((reason) => (
                <label key={reason} className="d-flex align-items-center">
                  <input
                    type="radio"
                    className="form-check-input me-2"
                    name="cancelReason"
                    value={reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    checked={cancelReason === reason}
                  />
                  {reason}
                </label>
              ))}
            </div>

            {cancelReason === "Other" && (
              <textarea
                className="form-control mt-3"
                rows="3"
                placeholder="Write your reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                Close
              </button>

              <button
                className="btn btn-danger"
                disabled={submittingCancel}
                onClick={handleConfirmCancel}
              >
                {submittingCancel ? "Please wait..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderSuccessPage;
