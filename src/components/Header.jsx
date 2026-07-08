import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-content container">
        <Link to="/" className="site-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>AQI India</span>
        </Link>
        <nav className="site-nav">
          <a href="/" title="Home">Dashboard</a>
          <a href="/about" title="About">About</a>
          <a href="/contact" title="Contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}
