import React from "react";
import "../Footer.css";
import { Github, Linkedin, Mail, MessageCircle } from "lucide-react";

function Footer() {
  return (
    <footer className="mystore-footer">
      <div className="footer-container">

        {/* About MyStore */}
        <div className="footer-section">
          <h5 className="footer-title">MyStore</h5>
          <p className="footer-text">
            MyStore is your trusted online shopping destination offering
            quality products at the best prices with fast and reliable delivery.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h6 className="footer-heading">Quick Links</h6>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/categories">Categories</a></li>
            <li><a href="/my-orders">Order Tracking</a></li>
            <li><a href="/profile">My Account</a></li>
          </ul>
        </div>

        {/* Developer Contact */}
        <div className="footer-section">
          <h6 className="footer-heading">Contact Us</h6>

          <ul>
            <li><strong>Ravi Teja Kandula</strong></li>
            <li>MERN-Stack Developer</li>
          </ul>

          <div className="social-icons">

            <a
              href="https://github.com/raviteja4880"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <Github size={22} />
            </a>

            <a
              href="https://www.linkedin.com/in/RaviTejaKandula/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <Linkedin size={22} />
            </a>

            <a
              href="mailto:ravitejakandul@gmail.com"
              className="social-icon"
            >
              <Mail size={22} />
            </a>

            <a
              href="https://wa.me/8885674269"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <MessageCircle size={22} />
            </a>

          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} MyStore | All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;
