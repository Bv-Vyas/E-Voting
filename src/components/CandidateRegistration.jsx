import { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

function CandidateRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    party: "",
    address: "",
  });

  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const navigate = useNavigate();

  // Function to connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      // Connect to the smart contract
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);

      console.log("Connected Account:", address);
      console.log("Contract Connected:", contractInstance);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!contract) {
        alert("Please connect your wallet first!");
        return;
      }

      // Call the smart contract function
      const tx = await contract.registerCandidate(
        formData.name,
        formData.age,
        formData.party,
        formData.address
      );

      await tx.wait(); // Wait for transaction confirmation

      alert("Candidate Registered Successfully!");
      navigate("/pending-verification");
    } catch (error) {
      console.error("Error registering candidate:", error);
      alert("Error registering candidate. Check console for details.");
    }
  };

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100"
      style={{
        background: "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)",
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
            max-width: 450px;
          }

          .btn-custom {
            transition: all 0.3s ease-in-out;
          }

          .btn-custom:hover {
            transform: scale(1.05);
            box-shadow: 0px 5px 15px rgba(255, 255, 255, 0.3);
          }
        `}
      </style>

      <h2 className="text-white mb-4">Candidate Registration</h2>

      {/* Connect Wallet Button */}
      <button
        onClick={connectWallet}
        className="btn btn-warning btn-custom mb-3"
      >
        {account
          ? `Connected: ${account.substring(0, 6)}...${account.slice(-4)}`
          : "Connect Wallet"}
      </button>

      <form className="glassmorphism" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label text-white">Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-white">Age</label>
          <input
            type="number"
            className="form-control"
            name="age"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-white">Party</label>
          <input
            type="text"
            className="form-control"
            name="party"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-white">Wallet Address</label>
          <input
            type="text"
            className="form-control"
            name="address"
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-custom w-100"
          disabled={!account}
        >
          Register
        </button>
      </form>

      {/* Go to Home Button */}
      <div className="text-center mt-4">
        <button
          className="btn btn-secondary btn-lg btn-custom"
          onClick={() => navigate("/")}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default CandidateRegistration;
