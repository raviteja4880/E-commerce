import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { orderAPI, paymentAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";

function PaymentPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const initialMethod = searchParams.get("method") || "qr";

  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [method, setMethod] = useState(initialMethod);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState({});
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const pollingRef = useRef(null);

  // ===== FETCH ORDER & AUTO-GENERATE QR =====
  useEffect(() => {
    const fetchOrderAndInitQr = async () => {
      try {
        const { data } = await orderAPI.getById(orderId);
        setOrder(data);

        if (initialMethod === "qr") {
          try {
            const payload = { orderId, amount: data.totalPrice, method: "qr" };
            const { data: qrData } = await paymentAPI.initiate(payload);
            setQrCode(qrData.qrCodeUrl);
            startPolling();
          } catch (qrErr) {
            console.error("QR generation failed:", qrErr.message);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      }
    };

    fetchOrderAndInitQr();
    
    return () => pollingRef.current && clearInterval(pollingRef.current);
  }, [orderId]);

  // ===== CARD VALIDATION =====
  const validateCardDetails = () => {
    const errors = {};
    const digits = cardDetails.number.replace(/\D/g, "");
    if (digits.length !== 16) errors.number = "Card number must be 16 digits.";
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry))
      errors.expiry = "Invalid expiry format (MM/YY).";
    if (!/^\d{3,4}$/.test(cardDetails.cvv))
      errors.cvv = "CVV must be 3–4 digits.";
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== INITIATE PAYMENT =====
  const handleInitiatePayment = async () => {
    if (method === "card" && !validateCardDetails()) return;
    
    setLoading(true);
    try {
      const payload = {
        orderId,
        amount: order.totalPrice,
        method,
        ...(method === "card" ? { cardDetails } : {}),
      };
      const { data } = await paymentAPI.initiate(payload);
      
      if (method === "qr") {
        setQrCode(data.qrCodeUrl);
        startPolling();
      }
      
      setPaymentInitiated(true);
    } catch {
      toast.error("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  // ===== CONFIRM PAYMENT - This sends email and marks as paid =====
  const handleConfirmPayment = async () => {
    if (method === "card" && !validateCardDetails()) return;

    setLoading(true);
    try {
      const res = await paymentAPI.confirm(orderId);
      if (res?.data?.success) {
        clearCart();

        // COD → simple toast success
        if (method === "cod") {
          toast.success("Order placed successfully! Pay on delivery.");
          navigate(`/order-success/${orderId}`);
          return;
        }

        // QR / CARD → modern success animation overlay
        showSuccessOverlay();
      } else {
        toast.error("Payment confirmation failed");
      }
    } catch {
      toast.error("Payment confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  // ===== POLLING (QR) =====
  const startPolling = () => {
    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await paymentAPI.verify(orderId);
        if (data.status === "paid") {
          clearCart();
          clearInterval(pollingRef.current);
          showSuccessOverlay();
        }
      } catch (err) {
        console.error("Polling error:", err.message);
      }
    }, 5000);
  };

  // ===== MODERN SUCCESS OVERLAY =====
  const showSuccessOverlay = () => {
    const overlay = document.createElement("div");
    overlay.innerHTML = `
      <div id="success-overlay" style="
        position: fixed; inset: 0;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        background: linear-gradient(135deg, #e3ffe7 0%, #d9e7ff 100%);
        z-index: 9999; font-family: 'Poppins', sans-serif;
        animation: fadeIn 0.3s ease-in-out;
      ">
        <div style="
          width: 140px; height: 140px;
          background: radial-gradient(circle at 30% 30%, #4ade80, #16a34a);
          border-radius: 50%; display: flex;
          justify-content: center; align-items: center;
          box-shadow: 0 10px 40px rgba(22,163,74,0.25);
          animation: popIn 0.5s ease-out;
        ">
          <svg viewBox="0 0 52 52" width="64" height="64">
            <circle cx="26" cy="26" r="25" fill="transparent" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
            <path d="M14 27 L22.5 35 L38 18"
              fill="transparent" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
              style="stroke-dasharray: 100; stroke-dashoffset: 100; animation: draw 0.6s ease forwards 0.4s;"
            />
          </svg>
        </div>
        <h2 style="margin-top: 25px; font-weight: 600; color: #111;">Payment Successful</h2>
        <p style="color: #444; margin-top: 5px;">Redirecting to order details...</p>
      </div>

      <style>
        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      </style>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
      document.getElementById("success-overlay")?.remove();
      navigate(`/order-success/${orderId}`);
    }, 2800);
  };

  if (!order) return <Loader />;

  return (
    <div className="container mt-4" style={{ maxWidth: "650px" }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="text-center mb-4">
        <h2 className="fw-bold">Payment for Order #{order._id}</h2>
        <h5 className="text-muted">Total Amount: ₹{order.totalPrice}</h5>
      </div>

      {error && (
        <div className="alert alert-danger text-center fw-semibold">{error}</div>
      )}

      <div className="alert alert-secondary text-center shadow-sm rounded-3 fw-semibold">
        <strong>Payment Method:</strong> {method.toUpperCase()}
      </div>

      {/* ===== QR PAYMENT ===== */}
      {method === "qr" && (
        <div className="text-center mt-4">
          {!qrCode ? (
            <div className="p-4 border rounded-4 shadow-sm d-inline-block bg-light">
              <p className="text-muted fw-semibold mb-3">
                Generating QR Code for payment of ₹{order.totalPrice}...
              </p>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-4 shadow-sm d-inline-block bg-light">
              <img
                src={qrCode}
                alt="QR Code"
                className="rounded-3 shadow-sm"
                style={{ width: 220, height: 220 }}
              />
              <p className="mt-3 text-muted fw-semibold">
                Scan this QR to pay ₹{order.totalPrice}.
              </p>
              <button
                className="btn btn-success px-4 fw-semibold mt-2"
                onClick={handleConfirmPayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Confirming...
                  </>
                ) : (
                  "I Have Paid"
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== CARD PAYMENT ===== */}
      {method === "card" && (
        <div className="card shadow-lg p-4 mt-4 border-0 rounded-4">
          <h5 className="text-center fw-semibold mb-4">Card Payment</h5>

          <label className="form-label fw-semibold">Card Number</label>
          <input
            type="text"
            inputMode="numeric"
            className={`form-control mb-2 py-2 ${
              cardErrors.number ? "is-invalid" : ""
            }`}
            placeholder="1234 5678 9012 3456"
            value={cardDetails.number}
            onChange={(e) =>
              setCardDetails({ ...cardDetails, number: e.target.value })
            }
          />
          {cardErrors.number && (
            <div className="invalid-feedback">{cardErrors.number}</div>
          )}

          <div className="d-flex gap-3 mt-3">
            <div className="flex-fill">
              <label className="form-label fw-semibold">Expiry (MM/YY)</label>
              <input
                type="text"
                className={`form-control py-2 ${
                  cardErrors.expiry ? "is-invalid" : ""
                }`}
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, expiry: e.target.value })
                }
              />
              {cardErrors.expiry && (
                <div className="invalid-feedback">{cardErrors.expiry}</div>
              )}
            </div>

            <div style={{ width: 120 }}>
              <label className="form-label fw-semibold">CVV</label>
              <input
                type="password"
                className={`form-control py-2 ${
                  cardErrors.cvv ? "is-invalid" : ""
                }`}
                placeholder="CVV"
                value={cardDetails.cvv}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, cvv: e.target.value })
                }
              />
              {cardErrors.cvv && (
                <div className="invalid-feedback">{cardErrors.cvv}</div>
              )}
            </div>
          </div>

          {!paymentInitiated ? (
            <button
              className="btn btn-primary w-100 mt-4 py-2 fw-semibold rounded-3"
              onClick={handleInitiatePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Processing...
                </>
              ) : (
                "Proceed to Pay"
              )}
            </button>
          ) : (
            <button
              className="btn btn-success w-100 mt-4 py-2 fw-semibold rounded-3"
              onClick={handleConfirmPayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Confirming...
                </>
              ) : (
                "I Have Paid"
              )}
            </button>
          )}
        </div>
      )}

      {/* ===== COD PAYMENT ===== */}
      {method === "cod" && (
        <div className="alert alert-info mt-4 text-center rounded-3 shadow-sm">
          <strong>Cash on Delivery:</strong> Please pay the amount to the
          delivery partner when you receive your order.
          <button
            className="btn btn-success mt-3 px-4"
            onClick={handleConfirmPayment}
            disabled={loading}
          >
            Confirm Order
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
