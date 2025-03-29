// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract VoterRegistration {
    struct Voter {
        string name;
        uint256 age;
        address wallet;
        bool isRegistered;
        bool isLoggedIn; // Track login status
        bool hasVoted; // Track voting status
    }

    mapping(address => Voter) public voters;
    address[] public registeredVoters;
    address public admin; // Contract owner

    event VoterRegistered(string name, uint256 age, address wallet);
    event VoterLoggedIn(address wallet);
    event VoterLoggedOut(address wallet);
    event AllVotersDeleted();
    event VoterCastedVote(address wallet);
    //--------------------------------------------------------------------------------------------
    // Module 1 - Admin Portal
    // Modifier for admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Constructor to assign the msg.sender address as the Admin Address
    constructor() {
        admin = msg.sender; // Set deployer as admin
    }

    // function to delete all voters
    function deleteAllVoters() public onlyAdmin {
        for (uint i = 0; i < registeredVoters.length; i++) {
            delete voters[registeredVoters[i]];
        }
        delete registeredVoters; // Reset array
        emit AllVotersDeleted();
    }

    //--------------------------------------------------------------------------------------------
    // Module 2 - VoterRegistration and Reterival of Voter detail
    // function to register voter
    function registerVoter(
        string memory _name,
        uint256 _age,
        address _wallet
    ) public {
        require(!voters[_wallet].isRegistered, "Voter is already registered");
        require(_age >= 18, "Voter must be at least 18 years old");

        voters[_wallet] = Voter(_name, _age, _wallet, true, false, false);
        registeredVoters.push(_wallet);

        emit VoterRegistered(_name, _age, _wallet);
    }

    // function to get voter details
    function getVoterDetails(
        address _wallet
    ) public view returns (string memory, uint256, address) {
        require(
            voters[_wallet].isLoggedIn,
            "Voter must be logged in to view details"
        );
        Voter memory voter = voters[_wallet];
        return (voter.name, voter.age, voter.wallet);
    }

    // function to return registered voter
    function getRegisteredVoters() public view returns (address[] memory) {
        return registeredVoters;
    }

    //---------------------------------------------------------------------------------------------------
    // Module 3 - Voter Authentication
    // function to login voter
    function loginVoter(string memory _name, address _wallet) public {
        require(voters[_wallet].isRegistered, "Voter is not registered");
        require(!voters[_wallet].isLoggedIn, "Voter is already logged in");
        require(
            keccak256(abi.encodePacked(voters[_wallet].name)) ==
                keccak256(abi.encodePacked(_name)),
            "Incorrect voter name"
        );

        voters[_wallet].isLoggedIn = true;
        emit VoterLoggedIn(_wallet);
    }

    // function to logout voter
    function logoutVoter(address _wallet) public {
        require(voters[_wallet].isLoggedIn, "Voter is not logged in");

        voters[_wallet].isLoggedIn = false;
        emit VoterLoggedOut(_wallet);
    }

    // function to authenticate login status of voter
    function isVoterLoggedIn(address _wallet) public view returns (bool) {
        return voters[_wallet].isLoggedIn;
    }

    //------------------------------------------------------------------------------------------------
    // Module 4 - Cast voting and check vote Status
    // function to check voting Status
    // New function to check if a voter has voted
    function hasVoted(address _wallet) public view returns (bool) {
        return voters[_wallet].hasVoted;
    }

    // New function to cast a vote
    function castVote() public {
        require(voters[msg.sender].isRegistered, "Voter is not registered");
        require(voters[msg.sender].isLoggedIn, "Voter must be logged in");
        require(!voters[msg.sender].hasVoted, "Voter has already voted");

        Voter storage voter = voters[msg.sender]; // Get storage reference
        voter.hasVoted = true; // Now update persists

        emit VoterCastedVote(msg.sender);
    }
}
