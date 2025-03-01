import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

function VotingDashboard() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [contract, setContract] = useState(null);
  const [userHasVoted, setUserHasVoted] = useState(false);

  useEffect(() => {
    initializeContract();
  }, []);

  const initializeContract = async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected! Please install it.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const votingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(votingContract);

      fetchCandidates(votingContract);
      checkUserVoteStatus(votingContract);
    } catch (error) {
      console.error("Error initializing contract:", error);
      setError("Failed to connect with the smart contract.");
    }
  };

  const fetchCandidates = async (contractInstance) => {
    if (!contractInstance) return;

    try {
      const [names, ages, parties, wallets, approvals, votes] =
        await contractInstance.getCandidates();

      const formattedCandidates = names.map((_, index) => ({
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
      setError("Failed to load candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkUserVoteStatus = async (contractInstance) => {
    try {
      const signer = await new ethers.BrowserProvider(
        window.ethereum
      ).getSigner();
      const userAddress = await signer.getAddress();
      const hasVoted = await contractInstance.hasVoted(userAddress);

      setUserHasVoted(hasVoted);
    } catch (error) {
      console.error("Error checking vote status:", error);
    }
  };

  const castVote = async (candidateIndex) => {
    if (!contract) {
      setError("Smart contract not initialized.");
      return;
    }
    if (userHasVoted) {
      setMessage("❌ You have already voted.");
      return;
    }

    try {
      setMessage("Casting vote... Please confirm in MetaMask.");
      const tx = await contract.vote(candidateIndex);
      await tx.wait();

      setMessage("✅ Vote cast successfully!");
      setUserHasVoted(true);

      // Redirect to Voter Dashboard after voting
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error casting vote:", error);
      setMessage("❌ Voting failed! You may have already voted.");
    }
  };

  return (
    <div
      className="container mt-4"
      style={{
        background: "linear-gradient(135deg, #1E3A8A, #4CAF50)",
        minHeight: "100vh",
        padding: "20px",
        borderRadius: "15px",
      }}
    >
      <h2 className="text-center text-white mb-4">Voting Dashboard</h2>

      {error && <div className="alert alert-danger text-center">{error}</div>}
      {message && <div className="alert alert-info text-center">{message}</div>}

      {loading ? (
        <p className="text-center text-white">Loading candidates...</p>
      ) : candidates.length === 0 ? (
        <p className="text-center text-white">No candidates registered yet.</p>
      ) : (
        <div className="row">
          {candidates.map((candidate, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card shadow-lg border-0 rounded-lg text-center">
                <div className="card-body">
                  <h5 className="card-title fw-bold text-primary">
                    {candidate.name}
                  </h5>
                  <p className="card-text">
                    <strong>Age:</strong> {candidate.age} <br />
                    <strong>Party:</strong> {candidate.party} <br />
                    <strong>Wallet:</strong> {candidate.wallet.slice(0, 6)}...
                    {candidate.wallet.slice(-4)} <br />
                    <strong>Verified:</strong>{" "}
                    {candidate.isVerified ? "✅ Yes" : "❌ No"} <br />
                    <strong>Votes:</strong> {candidate.voteCount}
                  </p>
                  <button
                    className="btn btn-success w-100 mt-2 fw-bold"
                    disabled={!candidate.isVerified || userHasVoted}
                    onClick={() => castVote(index)}
                  >
                    {candidate.isVerified
                      ? userHasVoted
                        ? "Voted"
                        : "Vote"
                      : "Pending Approval"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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

export default VotingDashboard;
