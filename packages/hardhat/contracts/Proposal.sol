// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "./IRoles.sol";
import "./IProposals.sol";
import "./AccessControl.sol";

contract Proposal is IProposals, IRoles {
    AccessControl private _accessControl;

    struct ProposalData {
        uint256 proposalId;
        string title;
        string description;
        address owner;
        address proposer;
        uint48 voteStart;
        uint32 voteDuration;
        bool executed;
        bool canceled;
        uint256 yesVotes;
        uint256 noVotes;
        string details;
        Choice[] choices;
        ProposalState status;
    }

    struct Choice {
        string label;
        uint256 votes;
    }

    ProposalData[] private _proposals;
    mapping(address => bool) voters;

    constructor(address accessControlAddress) {
        _accessControl = AccessControl(accessControlAddress);
    }

    modifier onlyModerator() {
        require(_accessControl.getRole(msg.sender) == Role.Moderator, "Proposal: caller must be a Moderator");
        _;
    }

    modifier onlyFan() {
        require(_accessControl.getRole(msg.sender) == Role.Fan, "Proposal: caller must be a Fan");
        _;
    }

    function createProposal(address owner, string calldata details) external onlyModerator {
      ProposalData storage newProposal = _proposals.push();
      newProposal.owner = owner;
      newProposal.proposer = msg.sender;
      newProposal.status = ProposalState.Pending;
      newProposal.details = details;
    }

    function vote(uint256 proposalIndex, bool support) external onlyFan {
        ProposalData storage proposal = _proposals[proposalIndex];
        require(proposal.status == ProposalState.Pending, "Proposal: proposal is not pending");

        if (support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }

        proposal.voters[msg.sender] = true;
    }

    function getProposalDetails(uint256 proposalIndex) external view returns (string memory) {
        return _proposals[proposalIndex].details;
    }

    function getProposalStatus(uint256 proposalIndex) external view returns (ProposalState) {
        return _proposals[proposalIndex].status;
    }
}
