import { useNavigate } from "react-router-dom";

function PendingVerification() {
  const navigate = useNavigate();

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #1E3A8A, #4CAF50)",
        color: "white",
        borderRadius: "15px",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        className="shadow-lg p-5 rounded"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "15px",
          maxWidth: "500px",
        }}
      >
        <h2 className="mb-4 fw-bold">Registration Submitted</h2>
        <p className="text-white">
          Your registration has been successfully submitted. Please wait for the
          admin to verify and approve your details. You will be notified once
          your registration is approved.
        </p>
        <button
          className="btn btn-light fw-bold mt-3"
          onClick={() => navigate("/")}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default PendingVerification;
