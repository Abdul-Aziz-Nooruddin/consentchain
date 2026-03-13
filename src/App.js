import { useState } from "react";
import UserDashboard from "./components/UserDashboard";
import CompanyPortal from "./components/CompanyPortal";
import AdminPanel from "./components/AdminPanel";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("user");

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">🔐 ConsentChain</div>
        <div className="nav-links">
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

      <div className="content">
        {activePage === "user" && <UserDashboard />}
        {activePage === "company" && <CompanyPortal />}
        {activePage === "admin" && <AdminPanel />}
      </div>
    </div>
  );
}

export default App;
