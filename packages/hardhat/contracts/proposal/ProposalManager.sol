// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

struct Choice {
	string description;
	uint8 votes;
}

enum Status {
	Pending,
	Active,
	Passed,
	Rejected
}

struct ProposalRecord {
	address creator;
	string title;
	string description;
	Choice[] choices;
	Status status;
	uint256 votingStartTime;
	uint256 votingEndTime;
}

library ProposalManager {
	using Counters for Counters.Counter;

	struct ProposalData {
		mapping(uint256 => mapping(uint256 => ProposalRecord)) proposals;
		mapping(uint256 => Counters.Counter) proposalIds;
    mapping(address => mapping(uint256 => uint256)) hasVoted;
	}

  function isActive(
		ProposalRecord memory proposal
	) internal view returns (bool) {
		return
			proposal.status == Status.Active &&
			block.timestamp >= proposal.votingStartTime &&
			block.timestamp <= proposal.votingEndTime;
	}


	function createProposal(
		ProposalData storage data,
		uint256 entityId,
		address proposer,
		string memory title,
		string memory description,
		string[] memory _choicesContent
	) public returns (uint256) {
		data.proposalIds[entityId].increment();
		uint256 proposalId = data.proposalIds[entityId].current();
		ProposalRecord storage newProposal = data.proposals[entityId][
			proposalId
		];
		newProposal.creator = proposer;
		newProposal.title = title;
		newProposal.description = description;
		newProposal.status = Status.Pending;

		for (uint256 i; i < _choicesContent.length; ) {
			newProposal.choices.push(Choice(_choicesContent[i], 0));
			unchecked {
				++i;
			}
		}
		return proposalId;
	}

	function getProposal(
		ProposalData storage data,
		uint256 entityId,
		uint256 proposalId
	) public view returns (ProposalRecord memory) {
		return data.proposals[entityId][proposalId];
	}

	function getProposalCount(
		ProposalData storage data,
		uint256 entityId
	) public view returns (uint256) {
		return data.proposalIds[entityId].current();
	}

  function canVote(
    ProposalData storage data,
		uint256 proposalId,
		uint256 clubId
	) external view returns (bool) {
		ProposalRecord memory proposal = data.proposals[clubId][proposalId];
		return isActive(proposal);
	}
}
