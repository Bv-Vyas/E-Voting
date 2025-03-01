import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config2";

function Dashboard() {
  const [wallet, setWallet] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [voterName, setVoterName] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [contract, setContract] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      if (!window.ethereum) {
        alert("MetaMask is required to continue.");
        navigate("/login");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setWallet(userAddress);

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);

      const status = await contractInstance.isVoterLoggedIn(userAddress);
      if (!status) {
        alert("Please log in first.");
        navigate("/login");
      } else {
        setIsLoggedIn(true);
        fetchVoterDetails(contractInstance, userAddress);
        checkVotingStatus(contractInstance, userAddress);
      }
    };

    const fetchVoterDetails = async (contractInstance, userAddress) => {
      try {
        const [name] = await contractInstance.getVoterDetails(userAddress);
        setVoterName(name);
      } catch (error) {
        console.error("Error fetching voter details:", error);
      }
    };

    const checkVotingStatus = async (contractInstance, userAddress) => {
      try {
        const votedStatus = await contractInstance.hasVoted(userAddress);
        setHasVoted(votedStatus);
      } catch (error) {
        console.error("Error checking voting status:", error);
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const handleLogout = async () => {
    if (!contract || !wallet) {
      alert("Contract not loaded or wallet not connected.");
      return;
    }

    try {
      const tx = await contract.logoutVoter(wallet);
      await tx.wait();

      alert("You have been logged out!");
      setIsLoggedIn(false);
      setWallet(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed! Ensure MetaMask is connected and try again.");
    }
  };

  return isLoggedIn ? (
    <div
      className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100"
      style={{
        background: "radial-gradient(circle at top, #4CAF50, #1E3A8A, #000000)",
        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.5)",
        color: "white",
      }}
    >
      <h2 className="fw-bold text-center text-shadow-lg">Voter Dashboard</h2>

      {/* Card for Voter Details */}
      <div className="card p-4 mt-4 custom-card">
        <h4 className="fw-bold text-primary text-center">Voter Details</h4>
        <p>
          <strong>Name:</strong> {voterName}
        </p>
        <p>
          <strong>Wallet:</strong> {wallet}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={
              hasVoted ? "text-success fw-bold" : "text-danger fw-bold"
            }
          >
            {hasVoted ? "Voted ✅" : "Not Voted ❌"}
          </span>
        </p>
      </div>

      {/* Buttons */}
      <button
        className="btn btn-primary mt-3 custom-btn"
        onClick={() => navigate("/voting-dashboard")} // Redirect to Voting Dashboard
        disabled={hasVoted}
      >
        {hasVoted ? "Already Voted" : "Vote Now"}
      </button>
      <button className="btn btn-danger mt-3 custom-btn" onClick={handleLogout}>
        Logout
      </button>

      {/* Custom Styles */}
      <style>
        {`
          .custom-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.5);
            width: 350px;
            text-align: left;
            color: white;
          }

          .custom-btn {
            box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.5);
            transition: all 0.3s ease-in-out;
          }

          .custom-btn:hover {
            transform: translateY(-3px);
            box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.7);
          }

          .text-shadow-lg {
            text-shadow: 2px 2px 10px rgba(255, 255, 255, 0.7);
          }
        `}
      </style>
    </div>
  ) : null;
}

export default Dashboard;
