// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "./Roles.sol";

contract Voting {
  mapping(address => bool) public hasVoted; // Mapping of users who voted on a proposal

  // Function for fans to vote on a proposal within their joined clubs
  function vote(address proposalAddress) public {
    Proposal proposal = Proposal(proposalAddress);
    Club club = Club(proposal.club);

    require(hasRole(msg.sender, Roles.Fan), "Only fans can vote");
    require(club.joinedClubs[msg.sender], "Can only vote on proposals from joined clubs");
    require(!hasVoted[msg.sender], "User already voted on this proposal");

    // Logic to record the vote (implementation depends on your voting system)
    hasVoted[msg.sender] = true;
  }

  // Helper function to check user roles (assuming this function exists elsewhere)
  function hasRole(address user, Roles.Role role) public view returns (bool) {
    // Implement logic to check user's role (can call User.hasRole)
  }
}
