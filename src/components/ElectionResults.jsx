import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const ElectionResults = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  const fetchResults = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      const candidates = await contract.getAllCandidates();
      const formattedData = candidates.map((candidate) => ({
        name: candidate.party, // ✅ Display Party Name
        votes: Number(candidate.votes),
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching election results:", error);
    }
  };

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 5000); // Refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #1E3A8A, #4CAF50)",
        flexDirection: "column",
        textAlign: "center",
        color: "white",
      }}
    >
      <h2 style={{ marginBottom: "20px", fontSize: "2rem" }}>
        Real time Analysis
      </h2>
      <div
        style={{
          width: "80%",
          height: "60vh",
          background: "rgba(255, 255, 255, 0.2)",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip
              contentStyle={{ backgroundColor: "#333", color: "#fff" }}
            />
            <Bar dataKey="votes" fill="#FFD700" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
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
};

export default ElectionResults;
