import { useState } from "react";
import { ethers } from "ethers";
import ConsentRegistry from "../contracts/ConsentRegistry.json";
import DataAccessEscrow from "../contracts/DataAccessEscrow.json";
import addresses from "../contracts/addresses";

function UserDashboard() {
  const [account, setAccount] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [dataType, setDataType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("");
  const [revokeAddress, setRevokeAddress] = useState("");
  const [checkUser, setCheckUser] = useState("");
  const [checkCompany, setCheckCompany] = useState("");
  const [earnings, setEarnings] = useState("0");
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
      loadEarnings(accounts[0]);
    } catch (err) {
      setStatus("Error connecting wallet");
      setStatusType("error");
    }
  };

  const loadEarnings = async (userAccount) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const escrow = new ethers.Contract(
        addresses.DataAccessEscrow,
        DataAccessEscrow.abi,
        provider
      );
      const amount = await escrow.getEarnings(userAccount);
      setEarnings(ethers.formatEther(amount));
    } catch (err) {
      console.error(err);
    }
  };

  const giveConsent = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.ConsentRegistry,
        ConsentRegistry.abi,
        signer
      );
      const tx = await contract.giveConsent(
        companyAddress,
        dataType,
        purpose,
        parseInt(duration)
      );
      setStatus("Giving consent... please wait");
      setStatusType("info");
      await tx.wait();
      setStatus("Consent given successfully!");
      setStatusType("success");
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    }
  };

  const revokeConsent = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.ConsentRegistry,
        ConsentRegistry.abi,
        signer
      );
      const tx = await contract.revokeConsent(revokeAddress);
      setStatus("Revoking consent... please wait");
      setStatusType("info");
      await tx.wait();
      setStatus("Consent revoked successfully!");
      setStatusType("success");
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
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
      const result = await contract.checkConsent(checkUser, checkCompany);
      setStatus("Consent status: " + (result ? "✅ Active" : "❌ Not Active"));
      setStatusType(result ? "success" : "error");
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    }
  };

  const withdrawEarnings = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        addresses.DataAccessEscrow,
        DataAccessEscrow.abi,
        signer
      );
      const tx = await contract.withdrawEarnings();
      setStatus("Withdrawing earnings... please wait");
      setStatusType("info");
      await tx.wait();
      setStatus("Earnings withdrawn successfully!");
      setStatusType("success");
      loadEarnings(account);
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    }
  };

  return (
    <div>
      <div className="card">
        <h2>👤 User Dashboard</h2>
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
          <h3>💰 Your Earnings</h3>
          <div className="earnings">{earnings} ETH</div>
          <button className="btn-success" onClick={withdrawEarnings}>
            Withdraw Earnings
          </button>
        </div>

        <div className="card">
          <h3>✅ Give Consent</h3>
          <input
            placeholder="Company Address (0x...)"
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
          />
          <input
            placeholder="Data Type (e.g. email, phone)"
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
          />
          <input
            placeholder="Purpose (e.g. KYC, marketing)"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
          <input
            placeholder="Duration in days (e.g. 30)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <button className="btn-primary" onClick={giveConsent}>
            Give Consent
          </button>
        </div>

        <div className="card">
          <h3>❌ Revoke Consent</h3>
          <input
            placeholder="Company Address (0x...)"
            value={revokeAddress}
            onChange={(e) => setRevokeAddress(e.target.value)}
          />
          <button className="btn-danger" onClick={revokeConsent}>
            Revoke Consent
          </button>
        </div>

        <div className="card">
          <h3>🔍 Check Consent</h3>
          <input
            placeholder="User Address (0x...)"
            value={checkUser}
            onChange={(e) => setCheckUser(e.target.value)}
          />
          <input
            placeholder="Company Address (0x...)"
            value={checkCompany}
            onChange={(e) => setCheckCompany(e.target.value)}
          />
          <button className="btn-primary" onClick={checkConsent}>
            Check Consent
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

export default UserDashboard;