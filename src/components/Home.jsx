import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center justify-content-center vh-100"
      style={{
        background: "radial-gradient(circle at top, #4CAF50, #1E3A8A, #000000)",
        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.5)", // Inner depth effect
        color: "white",
      }}
    >
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
          className="btn btn-info btn-lg custom-btn"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>

      {/* Add Custom Styles */}
      <style>
        {`
          .custom-btn {
            box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.5); /* Soft 3D Effect */
            transition: all 0.3s ease-in-out;
          }

          .custom-btn:hover {
            transform: translateY(-3px);
            box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.7);
          }

          .text-shadow-lg {
            text-shadow: 2px 2px 10px rgba(255, 255, 255, 0.7); /* Glow Effect */
          }
        `}
      </style>
    </div>
  );
}

export default Home;
