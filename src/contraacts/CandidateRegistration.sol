// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract EVoting {
    struct Candidate {
        // Candidate Structure
        string name;
        uint256 age;
        string party;
        address candidateAddress;
        bool approved;
        uint256 votes;
    }

    struct Election {
        // Election Structure
        string name;
        bool isActive;
        bool hasEnded;
    }

    address public admin;
    Candidate[] public candidates;
    mapping(address => bool) public registeredCandidates;
    mapping(address => bool) public hasVoted;
    Election public election;

    // Events for Different functions
    event CandidateRegistered(
        string name,
        string party,
        address indexed candidateAddress
    );
    event CandidateApproved(address indexed candidateAddress);
    event VoteCast(address indexed voter, uint256 candidateIndex);
    event AllCandidatesDeleted();

    // **New Events for Election Management**
    event ElectionCreated(string name);
    event ElectionStarted();
    event ElectionEnded();
    event ElectionDeleted();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function approveCandidate(uint256 _index) public onlyAdmin {
        require(_index < candidates.length, "Invalid candidate index");
        candidates[_index].approved = true;
        emit CandidateApproved(candidates[_index].candidateAddress);
    }

    function deleteAllCandidates() public onlyAdmin {
        for (uint256 i = 0; i < candidates.length; i++) {
            registeredCandidates[candidates[i].candidateAddress] = false;
        }
        delete candidates;
        emit AllCandidatesDeleted();
    }

    function registerCandidate(
        string memory _name,
        uint256 _age,
        string memory _party,
        address _candidateAddress
    ) public {
        require(
            !registeredCandidates[_candidateAddress],
            "Candidate already registered"
        );
        candidates.push(
            Candidate(_name, _age, _party, _candidateAddress, false, 0)
        );
        registeredCandidates[_candidateAddress] = true;
        emit CandidateRegistered(_name, _party, _candidateAddress);
    }

    function getCandidates()
        public
        view
        returns (
            string[] memory,
            uint256[] memory,
            string[] memory,
            address[] memory,
            bool[] memory,
            uint256[] memory
        )
    {
        uint256 length = candidates.length;
        string[] memory names = new string[](length);
        uint256[] memory ages = new uint256[](length);
        string[] memory parties = new string[](length);
        address[] memory addresses = new address[](length);
        bool[] memory approvals = new bool[](length);
        uint256[] memory votes = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            Candidate memory candidate = candidates[i];
            names[i] = candidate.name;
            ages[i] = candidate.age;
            parties[i] = candidate.party;
            addresses[i] = candidate.candidateAddress;
            approvals[i] = candidate.approved;
            votes[i] = candidate.votes;
        }
        return (names, ages, parties, addresses, approvals, votes);
    }

    function getWinners()
        public
        view
        returns (string[] memory, string[] memory, uint256)
    {
        require(election.hasEnded, "Election has not ended yet");
        require(candidates.length > 0, "No candidates registered yet");
        uint256 winningVoteCount = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].votes > winningVoteCount) {
                winningVoteCount = candidates[i].votes;
            }
        }
        uint256 winnerCount = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].votes == winningVoteCount) {
                winnerCount++;
            }
        }
        string[] memory winnerNames = new string[](winnerCount);
        string[] memory winnerParties = new string[](winnerCount);
        uint256 index = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].votes == winningVoteCount) {
                winnerNames[index] = candidates[i].name;
                winnerParties[index] = candidates[i].party;
                index++;
            }
        }
        return (winnerNames, winnerParties, winningVoteCount);
    }

    function vote(uint256 _index) public {
        require(election.isActive, "Election is not active");
        require(_index < candidates.length, "Invalid candidate index");
        require(!hasVoted[msg.sender], "You have already voted");
        require(candidates[_index].approved, "Candidate not approved yet");
        candidates[_index].votes += 1;
        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, _index);
    }

    function createElection(string memory _name) public onlyAdmin {
        delete election; // Reset the election state
        for (uint256 i = 0; i < candidates.length; i++) {
            candidates[i].votes = 0;
        }
        for (uint256 i = 0; i < candidates.length; i++) {
            hasVoted[candidates[i].candidateAddress] = false;
        }
        election = Election(_name, false, false);
        emit ElectionCreated(_name);
    }

    function startElection() public onlyAdmin {
        require(bytes(election.name).length > 0, "No election created yet");
        election.isActive = true;
        election.hasEnded = false;
        emit ElectionStarted();
    }

    function endElection() public onlyAdmin {
        require(election.isActive, "Election not started yet");
        election.isActive = false;
        election.hasEnded = true;
        emit ElectionEnded();
    }

    function deleteElection() public onlyAdmin {
        require(election.hasEnded, "Cannot delete an active election");
        delete election;
        emit ElectionDeleted();
    }

    function getElectionStatus()
        public
        view
        returns (string memory, bool, bool)
    {
        return (election.name, election.isActive, election.hasEnded);
    }

    function getCandidateVotes(uint256 _index) public view returns (uint256) {
        require(_index < candidates.length, "Invalid candidate index");
        return candidates[_index].votes;
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }
}
