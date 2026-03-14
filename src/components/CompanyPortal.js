import { useState } from "react";
import { ethers } from "ethers";
import ConsentRegistry from "../contracts/ConsentRegistry.json";
import DataAccessEscrow from "../contracts/DataAccessEscrow.json";
import SubscriptionManager from "../contracts/SubscriptionManager.json";
import addresses from "../contracts/addresses";

function CompanyPortal() {
  const [account, setAccount] = useState("");
  const [checkUser, setCheckUser] = useState("");
  const [depositUser, setDepositUser] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [consentResult, setConsentResult] = useState("");
  const [checksRemaining, setChecksRemaining] = useState("");
  const [loading, setLoading] = useState("");
  const [transactions, setTransactions] = useState([]);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      loadChecksRemaining(accounts[0]);
    } catch (err) {
      setStatus("Error connecting wallet");
      setStatusType("error");
    }
  };

  const loadChecksRemaining = async (companyAccount) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        addresses.SubscriptionManager,
        SubscriptionManager.abi,
        provider
      );
      const remaining = await contract.getChecksRemaining(companyAccount);
      setChecksRemaining(remaining.toString());
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

  const checkConsent = async () => {
    try {
      setLoading("check");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        addresses.ConsentRegistry,
        ConsentRegistry.abi,
        provider
      );
      const result = await contract.checkConsent(checkUser, account);
      setConsentResult(result ? "✅ Consent Active" : "❌ No Consent");
      setStatus(result ? "Valid consent found!" : "No consent found!");
      setStatusType(result ? "success" : "error");
      addTransaction("Check Consent", result ? "Active" : "Not Active", result ? "success" : "error");
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    } finally {
      setLoading("");
    }
  };

  const depositFee = async () => {
    try {
      setLoading("deposit");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.DataAccessEscrow,
        DataAccessEscrow.abi,
        signer
      );
      const tx = await contract.depositFee(depositUser, {
        value: ethers.parseEther(depositAmount),
      });
      setStatus("Processing payment... please wait");
      setStatusType("info");
      await tx.wait();
      setStatus("Payment processed successfully!");
      setStatusType("success");
      addTransaction("Pay Fee", `${depositAmount} ETH`, "success");
      setDepositUser("");
      setDepositAmount("");
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
      addTransaction("Pay Fee", "Failed", "error");
    } finally {
      setLoading("");
    }
  };

  const subscribe = async (plan, planName) => {
    try {
      setLoading(`plan${plan}`);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.SubscriptionManager,
        SubscriptionManager.abi,
        signer
      );
      const price = await contract.getPlanPrice(plan);
      const tx = await contract.subscribe(plan, { value: price });
      setStatus("Subscribing... please wait");
      setStatusType("info");
      await tx.wait();
      setStatus(`Subscribed to ${planName} successfully!`);
      setStatusType("success");
      addTransaction("Subscribe", planName, "success");
      loadChecksRemaining(account);
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    } finally {
      setLoading("");
    }
  };

  const plans = [
    { id: 1, name: "Starter", price: "0.001", checks: "10,000" },
    { id: 2, name: "Growth", price: "0.005", checks: "100,000" },
    { id: 3, name: "Scale", price: "0.015", checks: "1,000,000" },
  ];

  return (
    <div>
      <div className="card">
        <h2>🏢 Company Portal</h2>
        {!account ? (
          <button className="btn-primary" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div className="connected-badge">
              <div className="dot"></div>
              {account.slice(0, 6)}...{account.slice(-4)}
            </div>
            {checksRemaining && (
              <div className="connected-badge" style={{ background: "rgba(109,40,217,0.15)", borderColor: "rgba(109,40,217,0.3)", color: "#a78bfa" }}>
                🔍 {checksRemaining} checks remaining
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid">
        <div className="card">
          <h3>📋 Subscription Plans</h3>
          {plans.map((plan) => (
            <div key={plan.id} style={{ marginBottom: "16px", padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontWeight: "600" }}>{plan.name}</span>
                <span style={{ color: "#a78bfa" }}>{plan.price} ETH/mo</span>
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "10px" }}>
                {plan.checks} consent checks included
              </div>
              <button
                className={`btn-primary ${loading === `plan${plan.id}` ? "btn-loading" : ""}`}
                onClick={() => subscribe(plan.id, plan.name)}
                disabled={loading === `plan${plan.id}`}
                style={{ marginTop: "0" }}
              >
                {loading === `plan${plan.id}` ? "⏳ Processing..." : `Subscribe ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>🔍 Check User Consent</h3>
          <input
            placeholder="User Address (0x...)"
            value={checkUser}
            onChange={(e) => setCheckUser(e.target.value)}
          />
          <button
            className={`btn-primary ${loading === "check" ? "btn-loading" : ""}`}
            onClick={checkConsent}
            disabled={loading === "check"}
          >
            {loading === "check" ? "⏳ Checking..." : "Check Consent"}
          </button>
          {consentResult && (
            <div style={{ marginTop: "16px", fontSize: "18px", fontWeight: "600" }}>
              {consentResult}
            </div>
          )}
        </div>

        <div className="card">
          <h3>💳 Pay For Data Access</h3>
          <input
            placeholder="User Address (0x...)"
            value={depositUser}
            onChange={(e) => setDepositUser(e.target.value)}
          />
          <input
            placeholder="Amount in ETH (e.g. 0.01)"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <button
            className={`btn-primary ${loading === "deposit" ? "btn-loading" : ""}`}
            onClick={depositFee}
            disabled={loading === "deposit"}
          >
            {loading === "deposit" ? "⏳ Processing..." : "Pay Fee"}
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

export default CompanyPortal;