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

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      setStatus("Wallet connected: " + accounts[0]);
      setStatusType("success");
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

  const withdrawEscrowFees = async () => {
    try {
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
      loadPlatformEarnings();
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    }
  };

  const withdrawSubscriptionFees = async () => {
    try {
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
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    }
  };

  const creditUserEarnings = async () => {
    try {
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
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
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
          <p style={{ color: "#34d399" }}>✅ Connected: {account}</p>
        )}
      </div>

      <div className="grid">
        <div className="card">
          <h3>💰 Platform Earnings</h3>
          <div className="earnings">{platformEarnings} ETH</div>
          <button className="btn-success" onClick={withdrawEscrowFees}>
            Withdraw Escrow Fees
          </button>
        </div>

        <div className="card">
          <h3>📋 Subscription Fees</h3>
          <p style={{ color: "#a78bfa", marginBottom: "15px" }}>
            Withdraw all subscription payments
          </p>
          <button className="btn-success" onClick={withdrawSubscriptionFees}>
            Withdraw Subscription Fees
          </button>
        </div>

        <div className="card">
          <h3>🎁 Credit User Earnings</h3>
          <p style={{ color: "#a78bfa", marginBottom: "15px" }}>
            Manually credit 0.01 ETH to connected wallet
          </p>
          <button className="btn-primary" onClick={creditUserEarnings}>
            Credit Earnings
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

export default AdminPanel;