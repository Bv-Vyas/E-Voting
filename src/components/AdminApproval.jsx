import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { useNavigate } from "react-router-dom";

function AdminApproval() {
  const [candidates, setCandidates] = useState([]);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeContract();
  }, []);

  const initializeContract = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected! Please install it.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setContract(contractInstance);

      // Get admin address from contract
      const adminAddress = await contractInstance.admin();
      setAdmin(adminAddress);

      fetchCandidates(contractInstance);
    } catch (error) {
      console.error("Error initializing contract:", error);
      alert("Failed to connect with the smart contract.");
    }
  };

  const fetchCandidates = async (contractInstance) => {
    try {
      const [names, ages, parties, wallets, approvals, votes] =
        await contractInstance.getCandidates();

      const formattedCandidates = names.map((_, index) => ({
        index,
        name: names[index],
        age: ages[index].toString(),
        party: parties[index],
        wallet: wallets[index],
        isVerified: approvals[index],
        voteCount: votes[index].toString(),
      }));

      setCandidates(formattedCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      alert("Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  };

  const approveCandidate = async (index) => {
    if (!contract) {
      alert("Smart contract not loaded.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Check if the user is admin
      if (userAddress.toLowerCase() !== admin.toLowerCase()) {
        alert("Only admin can approve candidates!");
        return;
      }

      const tx = await contract.approveCandidate(index);
      await tx.wait();

      alert("Candidate approved successfully!");
      fetchCandidates(contract); // Refresh candidate list
    } catch (error) {
      console.error("Approval error:", error);
      alert("Approval failed! Ensure MetaMask is connected.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Admin Approval Panel</h2>

      {loading ? (
        <p className="text-center">Loading candidates...</p>
      ) : candidates.length === 0 ? (
        <p className="text-center">No candidates registered yet.</p>
      ) : (
        <table className="table table-striped mt-4">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Party</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <tr key={index}>
                <td>{candidate.name}</td>
                <td>{candidate.age}</td>
                <td>{candidate.party}</td>
                <td>
                  {candidate.wallet.slice(0, 6)}...{candidate.wallet.slice(-4)}
                </td>
                <td>
                  {candidate.isVerified ? "✅ Approved" : "❌ Not Approved"}
                </td>
                <td>
                  {!candidate.isVerified ? (
                    <button
                      className="btn btn-success"
                      onClick={() => approveCandidate(candidate.index)}
                    >
                      Approve
                    </button>
                  ) : (
                    <button className="btn btn-secondary" disabled>
                      Approved
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="text-center mt-4">
        <button className="btn btn-danger btn-lg" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default AdminApproval;
