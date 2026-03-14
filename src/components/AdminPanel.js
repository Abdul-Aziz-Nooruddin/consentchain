import { useState } from "react";
import { ethers } from "ethers";
import DataAccessEscrow from "../contracts/DataAccessEscrow.json";
import SubscriptionManager from "../contracts/SubscriptionManager.json";
import UserEarningsWallet from "../contracts/UserEarningsWallet.json";
import addresses from "../contracts/addresses";

function AdminPanel() {
  const [account, setAccount] = useState("");
  const [platformEarnings, setPlatformEarnings] = useState("0");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [loading, setLoading] = useState("");
  const [transactions, setTransactions] = useState([]);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      loadPlatformEarnings();
    } catch (err) {
      setStatus("Error connecting wallet");
      setStatusType("error");
    }
  };

  const loadPlatformEarnings = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        addresses.DataAccessEscrow,
        DataAccessEscrow.abi,
        provider
      );
      const amount = await contract.platformEarnings();
      setPlatformEarnings(ethers.formatEther(amount));
    } catch (err) {
      console.error(err);
    }
  };

  const addTransaction = (type, detail, status) => {
    const tx = {
      id: Date.now(),
      type,
      detail,
      status,
      time: new Date().toLocaleTimeString(),
    };
    setTransactions((prev) => [tx, ...prev].slice(0, 10));
  };

  const withdrawEscrowFees = async () => {
    try {
      setLoading("escrow");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.DataAccessEscrow,
        DataAccessEscrow.abi,
        signer
      );
      const tx = await contract.withdrawPlatformFees();
      setStatus("Withdrawing escrow fees... please wait");
      setStatusType("info");
      await tx.wait();
      setStatus("Escrow fees withdrawn successfully!");
      setStatusType("success");
      addTransaction("Withdraw Escrow", `${platformEarnings} ETH`, "success");
      loadPlatformEarnings();
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
      addTransaction("Withdraw Escrow", "Failed", "error");
    } finally {
      setLoading("");
    }
  };

  const withdrawSubscriptionFees = async () => {
    try {
      setLoading("subscription");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.SubscriptionManager,
        SubscriptionManager.abi,
        signer
      );
      const tx = await contract.withdrawFees();
      setStatus("Withdrawing subscription fees... please wait");
      setStatusType("info");
      await tx.wait();
      setStatus("Subscription fees withdrawn successfully!");
      setStatusType("success");
      addTransaction("Withdraw Subscription", "Success", "success");
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
      addTransaction("Withdraw Subscription", "Failed", "error");
    } finally {
      setLoading("");
    }
  };

  const creditUserEarnings = async () => {
    try {
      setLoading("credit");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.UserEarningsWallet,
        UserEarningsWallet.abi,
        signer
      );
      const tx = await contract.creditEarnings(account, {
        value: ethers.parseEther("0.01"),
      });
      setStatus("Crediting earnings... please wait");
      setStatusType("info");
      await tx.wait();
      setStatus("Earnings credited successfully!");
      setStatusType("success");
      addTransaction("Credit Earnings", "0.01 ETH", "success");
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
      addTransaction("Credit Earnings", "Failed", "error");
    } finally {
      setLoading("");
    }
  };

  return (
    <div>
      <div className="card">
        <h2>⚙️ Admin Panel</h2>
        {!account ? (
          <button className="btn-primary" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <div className="connected-badge">
            <div className="dot"></div>
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}
      </div>

      <div className="grid">
        <div className="card">
          <h3>💰 Escrow Earnings</h3>
          <div className="earnings">{platformEarnings} ETH</div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "10px" }}>
            50% platform share from all data access payments
          </p>
          <button
            className={`btn-success ${loading === "escrow" ? "btn-loading" : ""}`}
            onClick={withdrawEscrowFees}
            disabled={loading === "escrow"}
          >
            {loading === "escrow" ? "⏳ Withdrawing..." : "Withdraw Escrow Fees"}
          </button>
        </div>

        <div className="card">
          <h3>📋 Subscription Earnings</h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "16px" }}>
            All subscription payments from companies
          </p>
          <div style={{ marginBottom: "12px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Starter Plan</span>
              <span style={{ color: "#a78bfa" }}>0.001 ETH/mo</span>
            </div>
          </div>
          <div style={{ marginBottom: "12px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Growth Plan</span>
              <span style={{ color: "#a78bfa" }}>0.005 ETH/mo</span>
            </div>
          </div>
          <div style={{ marginBottom: "12px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Scale Plan</span>
              <span style={{ color: "#a78bfa" }}>0.015 ETH/mo</span>
            </div>
          </div>
          <button
            className={`btn-success ${loading === "subscription" ? "btn-loading" : ""}`}
            onClick={withdrawSubscriptionFees}
            disabled={loading === "subscription"}
          >
            {loading === "subscription" ? "⏳ Withdrawing..." : "Withdraw Subscription Fees"}
          </button>
        </div>

        <div className="card">
          <h3>🎁 Credit User Earnings</h3>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "16px" }}>
            Manually credit 0.01 ETH to connected wallet for testing
          </p>
          <button
            className={`btn-primary ${loading === "credit" ? "btn-loading" : ""}`}
            onClick={creditUserEarnings}
            disabled={loading === "credit"}
          >
            {loading === "credit" ? "⏳ Crediting..." : "Credit 0.01 ETH"}
          </button>
        </div>
      </div>

      {status && (
        <div className={`status ${statusType}`}>
          {status}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>📋 Transaction History</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Detail</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.type}</td>
                    <td>{tx.detail}</td>
                    <td>
                      <span className={`badge badge-${tx.status}`}>
                        {tx.status === "success" ? "✅ Success" : "❌ Failed"}
                      </span>
                    </td>
                    <td>{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;