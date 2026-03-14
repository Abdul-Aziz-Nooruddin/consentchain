import { useState } from "react";
import UserDashboard from "./components/UserDashboard";
import CompanyPortal from "./components/CompanyPortal";
import AdminPanel from "./components/AdminPanel";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("home");

  return (
    <div className="app">
      <div className="animated-bg">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">🔐</span>
          <span className="logo-text">ConsentChain</span>
        </div>
        <div className="nav-links">
          <button
            className={activePage === "home" ? "active" : ""}
            onClick={() => setActivePage("home")}
          >
            Home
          </button>
          <button
            className={activePage === "user" ? "active" : ""}
            onClick={() => setActivePage("user")}
          >
            User Dashboard
          </button>
          <button
            className={activePage === "company" ? "active" : ""}
            onClick={() => setActivePage("company")}
          >
            Company Portal
          </button>
          <button
            className={activePage === "admin" ? "active" : ""}
            onClick={() => setActivePage("admin")}
          >
            Admin Panel
          </button>
        </div>
      </nav>

      {activePage === "home" && (
        <div className="hero">
          <div className="hero-badge">Built on Polygon • DPDP Act 2023 Compliant</div>
          <h1 className="hero-title">
            We didn't build a privacy policy.
            <br />
            <span className="gradient-text">We built a privacy protocol.</span>
          </h1>
          <p className="hero-subtitle">
            ConsentChain is India's first blockchain-based consent registry.
            Every consent recorded immutably. Every user paid fairly.
          </p>
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={() => setActivePage("user")}>
              I'm a User →
            </button>
            <button className="btn-hero-secondary" onClick={() => setActivePage("company")}>
              I'm a Company →
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">4</div>
              <div className="stat-label">Smart Contracts</div>
            </div>
            <div className="stat">
              <div className="stat-number">27</div>
              <div className="stat-label">Tests Passing</div>
            </div>
            <div className="stat">
              <div className="stat-number">₹250Cr</div>
              <div className="stat-label">Max DPDP Penalty</div>
            </div>
            <div className="stat">
              <div className="stat-number">100%</div>
              <div className="stat-label">On-Chain</div>
            </div>
          </div>
        </div>
      )}

      <div className="content">
        {activePage === "user" && <UserDashboard />}
        {activePage === "company" && <CompanyPortal />}
        {activePage === "admin" && <AdminPanel />}
      </div>
    </div>
  );
}

export default App;