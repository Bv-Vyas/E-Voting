import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CandidateRegistration from "./components/CandidateRegistration";
import VoterRegistration from "./components/VoterRegistration";
import VotingDashboard from "./components/VotingDashboard";
import AdminPanel from "./components/AdminPanel";
import VoterLogin from "./components/VoterLogin";
import VoterDashboard from "./components/VoterDashboard";
import ResultCalculation from "./components/ResultCalculation";
import PendingVerification from "./components/PendingVerification";
import ElectionResults from "./components/ElectionResults";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/candidate-registration"
          element={<CandidateRegistration />}
        />
        <Route path="/voter-registration" element={<VoterRegistration />} />
        <Route path="/voting-dashboard" element={<VotingDashboard />} />
        <Route path="/admin-approval" element={<AdminPanel />} />
        <Route path="/login" element={<VoterLogin />} />
        <Route path="/dashboard" element={<VoterDashboard />} />
        <Route path="/pending-verification" element={<PendingVerification />} />
        <Route path="/admin-approval" element={<AdminPanel />} />
        <Route path="/result-calculation" element={<ResultCalculation />} />
        <Route path="/analyze-election" element={<ElectionResults />} />
      </Routes>
    </Router>
  );
}

export default App;
