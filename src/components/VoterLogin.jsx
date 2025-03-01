import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config2";

function VoterLogin() {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet && contract) {
      checkVoterStatus();
    }
  }, [wallet, contract]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setWallet(userAddress);

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);
      checkVoterRegistration(contractInstance, userAddress);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const checkVoterRegistration = async (contractInstance, userAddress) => {
    try {
      const isRegistered = await contractInstance.voters(userAddress);
      if (!isRegistered.isRegistered) {
        alert("You are not registered! Please register first.");
        navigate("/voter-registration");
        return;
      }
      checkVoterStatus(contractInstance, userAddress);
    } catch (error) {
      console.error("Error checking voter registration:", error);
      alert("Error checking registration. Try again.");
      navigate("/register");
    }
  };

  const checkVoterStatus = async () => {
    try {
      if (!contract || !wallet) return;
      const isVoterLoggedIn = await contract.isVoterLoggedIn(wallet);
      setIsLoggedIn(isVoterLoggedIn);

      if (isVoterLoggedIn) {
        alert("Already logged in! Redirecting...");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error checking voter status:", error);
    }
  };

  const handleLogin = async () => {
    if (!contract) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!name || !wallet) {
      alert("Enter both Name and Wallet Address");
      return;
    }
    setLoading(true);

    try {
      const tx = await contract.loginVoter(name, wallet);
      await tx.wait();
      const isLoggedInNow = await contract.isVoterLoggedIn(wallet);

      if (isLoggedInNow) {
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        alert("Login failed! Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed! Check details.");
    }
    setLoading(false);
  };

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100"
      style={{
        background: "linear-gradient(135deg, #1c1c3c, #2a5298, #00c6ff)",
        backgroundSize: "400% 400%",
        animation: "gradientAnimation 8s ease infinite",
      }}
    >
      <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .glassmorphism {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            padding: 30px;
            width: 100%;
            max-width: 500px;
            text-align: center;
            color: white;
          }

          .btn-custom {
            transition: all 0.3s ease-in-out;
            background: rgba(255, 255, 255, 0.3);
            color: white;
            border: none;
          }

          .btn-custom:hover {
            transform: scale(1.05);
            background: rgba(255, 255, 255, 0.5);
          }

          .form-control {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
          }

          .form-control:focus {
            background: rgba(255, 255, 255, 0.3);
            color: white;
            outline: none;
          }

          ::placeholder {
            color: white;
            opacity: 0.7;
          }
        `}
      </style>

      <div className="glassmorphism">
        <h2 className="mb-4">🗳️ Voter Login</h2>

        {!isLoggedIn && (
          <button onClick={connectWallet} className="btn btn-custom mb-3">
            {wallet
              ? `Connected: ${wallet.substring(0, 6)}...${wallet.slice(-4)}`
              : "Connect Wallet"}
          </button>
        )}

        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your name"
            disabled={isLoggedIn}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Wallet Address</label>
          <input
            type="text"
            className="form-control"
            value={wallet}
            readOnly
            placeholder="Wallet will be auto-filled"
          />
        </div>

        <button
          className="btn btn-custom w-100"
          onClick={handleLogin}
          disabled={loading || !name || !wallet || isLoggedIn}
        >
          {loading
            ? "Logging in..."
            : isLoggedIn
            ? "Already Logged In"
            : "Login"}
        </button>
      </div>
    </div>
  );
}

export default VoterLogin;
