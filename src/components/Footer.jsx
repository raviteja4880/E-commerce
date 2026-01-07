import { Link } from "react-router-dom";
import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* ===== Brand Info ===== */}
        <div className="footer-section">
          <h3 className="footer-brand">MyStore</h3>
          <p className="footer-text">
            Your trusted destination for quality products, secure payments,
            and fast delivery.
          </p>
        </div>

        {/* ===== Quick Links ===== */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/my-orders">My Orders</Link></li>
            <li><Link to="/profile">My Account</Link></li>
          </ul>
        </div>

        {/* ===== Support ===== */}
        <div className="footer-section">
          <h4>Support</h4>
          <ul>
            <li>Email: <a href="mailto:231fa04880@gmail.com">support@mystore.com</a></li>
            <li>Help Center</li>
            <li>Shipping & Delivery</li>
            <li>Returns & Refunds</li>
          </ul>
        </div>

        {/* ===== Address ===== */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p className="footer-text">
            MyStore Pvt Ltd <br />
            Guntur, AndhraPradesh <br />
            India – 522611
          </p>
        </div>
      </div>

      {/* ===== Bottom Bar ===== */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} MyStore. All rights reserved.
      </div>
    </footer>
  );
}
