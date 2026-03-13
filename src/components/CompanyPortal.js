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

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      setStatus("Wallet connected: " + accounts[0]);
      setStatusType("success");
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

  const checkConsent = async () => {
    try {
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
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    }
  };

  const depositFee = async () => {
    try {
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
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    }
  };

  const subscribe = async (plan) => {
    try {
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
      setStatus("Subscribed successfully!");
      setStatusType("success");
      loadChecksRemaining(account);
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    }
  };

  return (
    <div>
      <div className="card">
        <h2>🏢 Company Portal</h2>
        {!account ? (
          <button className="btn-primary" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <p style={{ color: "#34d399" }}>✅ Connected: {account}</p>
        )}
        {checksRemaining && (
          <p style={{ marginTop: "10px", color: "#a78bfa" }}>
            Checks Remaining: {checksRemaining}
          </p>
        )}
      </div>

      <div className="grid">
        <div className="card">
          <h3>📋 Subscription Plans</h3>
          <div style={{ marginBottom: "10px" }}>
            <p style={{ color: "#a78bfa", marginBottom: "5px" }}>
              Starter — 0.001 ETH / 10,000 checks
            </p>
            <button className="btn-primary" onClick={() => subscribe(1)}>
              Subscribe Starter
            </button>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <p style={{ color: "#a78bfa", marginBottom: "5px" }}>
              Growth — 0.005 ETH / 100,000 checks
            </p>
            <button className="btn-primary" onClick={() => subscribe(2)}>
              Subscribe Growth
            </button>
          </div>
          <div>
            <p style={{ color: "#a78bfa", marginBottom: "5px" }}>
              Scale — 0.015 ETH / 1,000,000 checks
            </p>
            <button className="btn-primary" onClick={() => subscribe(3)}>
              Subscribe Scale
            </button>
          </div>
        </div>

        <div className="card">
          <h3>🔍 Check User Consent</h3>
          <input
            placeholder="User Address (0x...)"
            value={checkUser}
            onChange={(e) => setCheckUser(e.target.value)}
          />
          <button className="btn-primary" onClick={checkConsent}>
            Check Consent
          </button>
          {consentResult && (
            <p style={{ marginTop: "10px", fontSize: "18px" }}>
              {consentResult}
            </p>
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
          <button className="btn-primary" onClick={depositFee}>
            Pay Fee
          </button>
        </div>
      </div>

      {status && (
        <div className={`status ${statusType}`}>
          {status}
        </div>
      )}
    </div>
  );
}

export default CompanyPortal;