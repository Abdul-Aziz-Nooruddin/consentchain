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
  const [loading, setLoading] = useState("");
  const [transactions, setTransactions] = useState([]);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
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

  const giveConsent = async () => {
    try {
      setLoading("give");
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
      addTransaction("Give Consent", `To: ${companyAddress.slice(0, 10)}...`, "success");
      setCompanyAddress("");
      setDataType("");
      setPurpose("");
      setDuration("");
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
      addTransaction("Give Consent", "Failed", "error");
    } finally {
      setLoading("");
    }
  };

  const revokeConsent = async () => {
    try {
      setLoading("revoke");
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
      addTransaction("Revoke Consent", `From: ${revokeAddress.slice(0, 10)}...`, "success");
      setRevokeAddress("");
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
      addTransaction("Revoke Consent", "Failed", "error");
    } finally {
      setLoading("");
    }
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
      const result = await contract.checkConsent(checkUser, checkCompany);
      setStatus("Consent status: " + (result ? "✅ Active" : "❌ Not Active"));
      setStatusType(result ? "success" : "error");
      addTransaction("Check Consent", result ? "Active" : "Not Active", result ? "success" : "error");
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    } finally {
      setLoading("");
    }
  };

  const withdrawEarnings = async () => {
    try {
      setLoading("withdraw");
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
      addTransaction("Withdraw", `${earnings} ETH`, "success");
      loadEarnings(account);
    } catch (err) {
      setStatus("Error: " + err.message);
      setStatusType("error");
    } finally {
      setLoading("");
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
          <div className="connected-badge">
            <div className="dot"></div>
            {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}
      </div>

      <div className="grid">
        <div className="card">
          <h3>💰 Your Earnings</h3>
          <div className="earnings">{earnings} ETH</div>
          <button
            className={`btn-success ${loading === "withdraw" ? "btn-loading" : ""}`}
            onClick={withdrawEarnings}
            disabled={loading === "withdraw"}
          >
            {loading === "withdraw" ? "⏳ Withdrawing..." : "Withdraw Earnings"}
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
          <button
            className={`btn-primary ${loading === "give" ? "btn-loading" : ""}`}
            onClick={giveConsent}
            disabled={loading === "give"}
          >
            {loading === "give" ? "⏳ Processing..." : "Give Consent"}
          </button>
        </div>

        <div className="card">
          <h3>❌ Revoke Consent</h3>
          <input
            placeholder="Company Address (0x...)"
            value={revokeAddress}
            onChange={(e) => setRevokeAddress(e.target.value)}
          />
          <button
            className={`btn-danger ${loading === "revoke" ? "btn-loading" : ""}`}
            onClick={revokeConsent}
            disabled={loading === "revoke"}
          >
            {loading === "revoke" ? "⏳ Revoking..." : "Revoke Consent"}
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
          <button
            className={`btn-primary ${loading === "check" ? "btn-loading" : ""}`}
            onClick={checkConsent}
            disabled={loading === "check"}
          >
            {loading === "check" ? "⏳ Checking..." : "Check Consent"}
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

export default UserDashboard;