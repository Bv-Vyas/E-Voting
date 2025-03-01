// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract EVoting {
    struct Candidate {
        string name;
        uint256 age;
        string party;
        address candidateAddress;
        bool approved;
        uint256 votes;
    }

    address public admin;
    Candidate[] public candidates;
    mapping(address => bool) public registeredCandidates;
    mapping(address => bool) public hasVoted;

    event CandidateRegistered(string name, string party, address indexed candidateAddress);
    event CandidateApproved(address indexed candidateAddress);
    event VoteCast(address indexed voter, uint256 candidateIndex);
    event AllCandidatesDeleted();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerCandidate(
        string memory _name,
        uint256 _age,
        string memory _party,
        address _candidateAddress
    ) public {
        require(!registeredCandidates[_candidateAddress], "Candidate already registered");

        candidates.push(Candidate(_name, _age, _party, _candidateAddress, false, 0));
        registeredCandidates[_candidateAddress] = true;

        emit CandidateRegistered(_name, _party, _candidateAddress);
    }

    function approveCandidate(uint256 _index) public onlyAdmin {
        require(_index < candidates.length, "Invalid candidate index");
        candidates[_index].approved = true;

        emit CandidateApproved(candidates[_index].candidateAddress);
    }

    function vote(uint256 _index) public {
        require(_index < candidates.length, "Invalid candidate index");
        require(!hasVoted[msg.sender], "You have already voted");
        require(candidates[_index].approved, "Candidate not approved yet");

        candidates[_index].votes += 1;
        hasVoted[msg.sender] = true;

        emit VoteCast(msg.sender, _index);
    }

    function getCandidates() public view returns (
        string[] memory, uint256[] memory, string[] memory, address[] memory, bool[] memory, uint256[] memory
    ) {
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

    function getWinner() public view returns (string memory, string memory, uint256) {
        require(candidates.length > 0, "No candidates registered yet");

        uint256 winningVoteCount = 0;
        uint256 winnerIndex = 0;
        
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].votes > winningVoteCount) {
                winningVoteCount = candidates[i].votes;
                winnerIndex = i;
            }
        }

        return (candidates[winnerIndex].name, candidates[winnerIndex].party, candidates[winnerIndex].votes);
    }

    // **Function to Delete All Candidates**
    function deleteAllCandidates() public onlyAdmin {
        delete candidates;

        // Reset candidate registration mapping
        for (uint256 i = 0; i < candidates.length; i++) {
            registeredCandidates[candidates[i].candidateAddress] = false;
        }

        emit AllCandidatesDeleted();
    }
}
