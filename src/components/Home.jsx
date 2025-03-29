import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "bootstrap/dist/css/bootstrap.min.css";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config2"; // Import contract details

function Home() {
  const navigate = useNavigate();
  const [voterName, setVoterName] = useState("User"); // Default name is "User"
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          setAccount(userAddress);

          const contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );
          setContract(contractInstance);

          const loggedIn = await contractInstance.isVoterLoggedIn(userAddress);
          setIsLoggedIn(loggedIn);

          if (loggedIn) {
            const [name] = await contractInstance.getVoterDetails(userAddress);
            setVoterName(name || "User"); // Default to "User" if name is empty
          }
        } catch (error) {
          console.error("Error loading blockchain data:", error);
        }
      } else {
        alert("Please install MetaMask to use this feature!");
      }
    }

    loadBlockchainData();
  }, []);

  // Logout function
  const handleLogout = async () => {
    if (!contract || !account) return;
    try {
      const tx = await contract.logoutVoter(account);
      await tx.wait(); // Wait for transaction confirmation
      setVoterName("User"); // Reset voter name
      setAccount(null); // Clear account state
      setIsLoggedIn(false); // Update login state
      alert("Successfully logged out!");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Try again.");
    }
  };

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100 position-relative"
      style={{
        background: "radial-gradient(circle at top, #4CAF50, #1E3A8A, #000000)",
        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.5)",
        color: "white",
      }}
    >
      {/* Top-Left Corner Display */}
      {isLoggedIn && (
        <div className="position-absolute top-0 start-0 m-3 px-3 py-2 text-white rounded d-flex flex-column align-items-start">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-person-circle fs-4"></i> {/* User Icon */}
            <span>Welcome, {voterName}!</span>
          </div>
          <button className="btn btn-sm btn-danger mt-2" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      <h1 className="mb-4 fw-bold text-center text-shadow-lg">
        Blockchain-Based E-Voting
      </h1>

      <div className="d-grid gap-3 w-50">
        <button
          className="btn btn-primary btn-lg custom-btn"
          onClick={() => navigate("/candidate-registration")}
        >
          Candidate Registration
        </button>
        <button
          className="btn btn-secondary btn-lg custom-btn"
          onClick={() => navigate("/voter-registration")}
        >
          Voter Registration
        </button>
        <button
          className="btn btn-success btn-lg custom-btn"
          onClick={() => navigate("/voting-dashboard")}
        >
          Start Voting
        </button>
        <button
          className="btn btn-warning btn-lg custom-btn"
          onClick={() => navigate("/result-calculation")}
        >
          Result Calculation
        </button>
        <button
          className="btn btn-dark btn-lg custom-btn"
          onClick={() => navigate("/analyze-election")}
        >
          Voting Analysis
        </button>
        {!isLoggedIn && ( // Show Login button only if user is NOT logged in
          <button
            className="btn btn-info btn-lg custom-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>

      {/* Add Custom Styles */}
      <style>
        {`
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
  );
}

export default Home;
