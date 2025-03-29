import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  const [candidates, setCandidates] = useState([]);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [electionName, setElectionName] = useState("");
  const [electionStatus, setElectionStatus] = useState({
    name: "",
    isActive: false,
    hasEnded: false,
  });
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

      const adminAddress = await contractInstance.admin();
      setAdmin(adminAddress);

      fetchCandidates(contractInstance);
      fetchElectionStatus(contractInstance);
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

  const fetchElectionStatus = async (contractInstance) => {
    try {
      const [name, isActive, hasEnded] =
        await contractInstance.getElectionStatus();
      setElectionStatus({ name, isActive, hasEnded });
    } catch (error) {
      console.error("Error fetching election status:", error);
      alert("Failed to load election status.");
    }
  };

  const createElection = async () => {
    if (!contract || electionName.trim() === "") {
      alert("Please enter an election name.");
      return;
    }

    try {
      const tx = await contract.createElection(electionName);
      await tx.wait();
      alert("Election created successfully!");
      fetchElectionStatus(contract);
    } catch (error) {
      console.error("Error creating election:", error);
      alert("Failed to create election.");
    }
  };

  const startElection = async () => {
    if (!contract) return;
    try {
      const tx = await contract.startElection();
      await tx.wait();
      alert("Election started successfully!");
      fetchElectionStatus(contract);
    } catch (error) {
      console.error("Error starting election:", error);
      alert("Failed to start election.");
    }
  };

  const endElection = async () => {
    if (!contract) return;
    try {
      const tx = await contract.endElection();
      await tx.wait();
      alert("Election ended successfully!");
      fetchElectionStatus(contract);
    } catch (error) {
      console.error("Error ending election:", error);
      alert("Failed to end election.");
    }
  };

  const deleteElection = async () => {
    if (!contract) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      if (userAddress.toLowerCase() !== admin.toLowerCase()) {
        alert("Only the admin can delete the election!");
        return;
      }

      if (!electionStatus.hasEnded) {
        alert("You can only delete an election after it has ended.");
        return;
      }

      const tx = await contract.deleteElection();
      await tx.wait();
      alert("Election deleted successfully!");
      fetchElectionStatus(contract);
    } catch (error) {
      console.error("Error deleting election:", error);
      alert("Failed to delete election.");
    }
  };

  const approveCandidate = async (index) => {
    if (!contract) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      if (userAddress.toLowerCase() !== admin.toLowerCase()) {
        alert("Only the admin can approve candidates!");
        return;
      }

      const tx = await contract.approveCandidate(index);
      await tx.wait();
      alert("Candidate approved successfully!");
      fetchCandidates(contract); // Refresh candidate list
    } catch (error) {
      console.error("Error approving candidate:", error);
      alert("Failed to approve candidate.");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center bg-secondary">Admin Panel</h2>

      <div className="mt-4">
        <h3 className="text-center">Election Management</h3>
        <p>Current Election: {electionStatus.name || "No election created"}</p>
        <p>
          Status:{" "}
          {electionStatus.isActive
            ? "Active"
            : electionStatus.hasEnded
            ? "Ended"
            : "Not Started"}
        </p>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Enter Election Name"
          required
          value={electionName}
          onChange={(e) => setElectionName(e.target.value)}
        />
        <button className="btn btn-primary m-2" onClick={createElection}>
          Create Election
        </button>
        <button className="btn btn-success m-2" onClick={startElection}>
          Start Election
        </button>
        <button className="btn btn-danger m-2" onClick={endElection}>
          End Election
        </button>
        <button
          className="btn btn-warning m-2"
          onClick={deleteElection}
          disabled={!electionStatus.hasEnded}
        >
          Delete Election
        </button>
      </div>

      <h3 className="mt-4 text-center">Candidate Approval</h3>
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
        <button
          className="btn btn-light btn-lg fw-bold"
          onClick={() => navigate("/")}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
