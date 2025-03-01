import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

function ResultCalculation() {
  const navigate = useNavigate();
  const [winner, setWinner] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected! Please install it.");
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Fetch the winner
      const winnerData = await contract.getWinner();
      if (winnerData[0] === "") {
        setError(
          "❌ No winner yet. Voting might not have started or no votes cast."
        );
        setLoading(false);
        return;
      }

      setWinner({
        name: winnerData[0],
        party: winnerData[1],
        voteCount: winnerData[2].toString(),
      });

      // Fetch all candidates and sort them by votes
      const [names, ages, parties, wallets, approvals, votes] =
        await contract.getCandidates();
      const formattedCandidates = names.map((_, index) => ({
        name: names[index],
        age: ages[index].toString(),
        party: parties[index],
        wallet: wallets[index],
        isVerified: approvals[index],
        voteCount: votes[index].toString(),
      }));

      // Sort candidates by vote count in descending order
      const sortedCandidates = formattedCandidates.sort(
        (a, b) => b.voteCount - a.voteCount
      );
      setCandidates(sortedCandidates);
    } catch (error) {
      console.error("Error fetching results:", error);
      setError("Failed to fetch election results. OR No Election Is Done Yet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100 text-white"
      style={{
        background: "linear-gradient(135deg, #1e3c72, #2a5298, #00c6ff)",
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
          }

          .btn-custom {
            transition: all 0.3s ease-in-out;
          }

          .btn-custom:hover {
            transform: scale(1.05);
            box-shadow: 0px 5px 15px rgba(255, 255, 255, 0.3);
          }

          .table-hover tbody tr:hover {
            background-color: rgba(255, 255, 255, 0.2);
            transition: background 0.3s ease-in-out;
          }
        `}
      </style>

      <h2 className="mb-4">Election Results</h2>

      {loading && <p className="text-center">Loading results...</p>}
      {error && (
        <div className="alert alert-danger glassmorphism text-center">
          {error}
        </div>
      )}

      {winner && (
        <div className="glassmorphism text-center mb-4">
          <h4 className="card-title">🏆 Winner: {winner.name}</h4>
          <p className="card-text">
            <strong>Party:</strong> {winner.party} <br />
            <strong>Votes:</strong> {winner.voteCount}
          </p>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="table-responsive">
          <h4 className="text-center">📜 Other Candidates</h4>
          <table className="table table-hover table-dark mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Party</th>
                <th>Votes</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <tr
                  key={index}
                  className={
                    candidate.name === winner?.name ? "table-success" : ""
                  }
                >
                  <td>{index + 1}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.party}</td>
                  <td>{candidate.voteCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        className="btn btn-light btn-custom mt-4"
        onClick={() => navigate("/")}
      >
        Go to Home
      </button>
    </div>
  );
}

export default ResultCalculation;
