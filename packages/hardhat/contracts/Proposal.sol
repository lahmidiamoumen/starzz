// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./Roles.sol";
import "./IRoles.sol";
import "./Club.sol";
import "./IClub.sol";
import "hardhat/console.sol";

contract Proposal {
	using Counters for Counters.Counter;
	enum Status {
		Pending,
		Active,
		Passed,
		Rejected
	}

	address private immutable _roles;
	address private immutable _clubs;

	struct Choice {
		string description;
		uint8 votes;
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

		struct ProposalPresnter {
			uint256 proposalId;
			address creator;
			string title;
			string description;
			Choice[] choices;
			Status status;
			uint256 votingStartTime;
			uint256 votingEndTime;
		}

	mapping(address => mapping(uint256 => uint256)) private hasVoted;
	mapping(uint256 => mapping(uint256 => ProposalRecord)) private _proposals;
	mapping(uint256 => Counters.Counter) private _proposalIds;

	event ProposalCreated(uint256 id, uint256 clubId, address creator);
	event VotingStarted(uint256 proposalId, uint256 startTime, uint256 endTime);
	event ProposalEnded(uint256 proposalId, Status status, uint256 endTime);
	event Voted(uint256 proposalId, address voter, uint256 choiceIndex);

	constructor(address rolesContract, address clubAddress) {
		_roles = rolesContract;
		_clubs = clubAddress;
	}

	modifier onlyAdminOrModerator() {
		require(
			IRoles(_roles).isAdminOrModerator(_msgSender()),
			"Roles: caller is not admin or moderator"
		);
		_;
	}

	function _msgSender() internal view returns (address) {
		return msg.sender;
	}

	function createProposal(
		uint256 clubId,
		string memory _title,
		string memory _description,
		string[] memory _choicesContent
	) external onlyAdminOrModerator {
		require(IClub(_clubs).isValidClubId(clubId), "Invalid club ID");
		require(
			_choicesContent.length > 1 && _choicesContent.length <= 10,
			"Invalid number of choices"
		);

		uint256 proposalId = _proposalIds[clubId].current();
		_proposalIds[clubId].increment();

		ProposalRecord storage newProposal = _proposals[clubId][proposalId];
		newProposal.creator = _msgSender();
		newProposal.title = _title;
		newProposal.description = _description;
		newProposal.status = Status.Pending;

		for (uint256 i; i < _choicesContent.length; ) {
			newProposal.choices.push(Choice(_choicesContent[i], 0));
			unchecked {
				++i;
			}
		}

		emit ProposalCreated(proposalId, clubId, newProposal.creator);
	}

	function isActive(
		ProposalRecord memory proposal
	) internal view returns (bool) {
		return
			proposal.status == Status.Active &&
			block.timestamp >= proposal.votingStartTime &&
			block.timestamp <= proposal.votingEndTime;
	}

	function canVote(
		address account,
		uint256 proposalId,
		uint256 clubId
	) external view returns (bool) {
		require(IClub(_clubs).isValidClubId(clubId), "Invalid club ID");
		require(
			proposalId <= _proposalIds[clubId].current(),
			"Invalid proposal ID"
		);

		ProposalRecord memory proposal = _proposals[clubId][proposalId];
		require(isActive(proposal), "Proposal is not active for voting!");

		return IClub(_clubs).isMember(account, clubId);
	}

	function getProposalCount(uint256 clubId) external view returns (uint256) {
		return _proposalIds[clubId].current();
	}

	function startVoting(
		uint256 proposalId,
		uint256 clubId,
		uint256 duration
	) external onlyAdminOrModerator {
		require(duration > 500, "Duration must be positive");
		require(IClub(_clubs).isValidClubId(clubId), "Invalid club ID");
		require(
			proposalId <= _proposalIds[clubId].current(),
			"Invalid proposal ID"
		);
		ProposalRecord storage proposal = _proposals[clubId][proposalId];
		require(
			proposal.status == Status.Pending,
			"Proposal not in pending state"
		);
		proposal.status = Status.Active;
		proposal.votingStartTime = block.timestamp;
		uint256 newDuration;
		unchecked {
			newDuration = block.timestamp + duration;
		}
		proposal.votingEndTime = newDuration;
		emit VotingStarted(
			proposalId,
			proposal.votingStartTime,
			proposal.votingEndTime
		);
	}

	function startVoting(
		uint256 proposalId,
		uint256 clubId,
		uint256 _votingStartTime,
		uint256 _votingEndTime
	) external onlyAdminOrModerator {
		require(IClub(_clubs).isValidClubId(clubId), "Invalid club ID");
		require(
			proposalId < _proposalIds[clubId].current(),
			"Invalid proposal ID"
		);
		require(
			_votingStartTime >= block.timestamp,
			"Start time must be in the future"
		);
		require(
			_votingEndTime > _votingStartTime,
			"End time must be after start time"
		);
		ProposalRecord storage proposal = _proposals[clubId][proposalId];
		require(
			proposal.status == Status.Pending,
			"Proposal not in pending state"
		);
		proposal.status = Status.Active;
		proposal.votingStartTime = _votingStartTime;
		proposal.votingEndTime = _votingEndTime;

		emit VotingStarted(
			proposalId,
			proposal.votingStartTime,
			proposal.votingEndTime
		);
	}

	function vote(
		uint256 proposalId,
		uint256 clubId,
		uint256 choiceIndex
	) external {
		require(IClub(_clubs).isValidClubId(clubId), "Invalid club ID");
		require(
			proposalId < _proposalIds[clubId].current(),
			"Invalid proposal ID"
		);
		ProposalRecord storage proposal = _proposals[clubId][proposalId];
		require(
			proposal.status == Status.Active,
			"Proposal not in voting state"
		);
		require(block.timestamp < proposal.votingEndTime, "Voting has ended");
		require(
			IClub(_clubs).isMember(msg.sender, clubId),
			"Not a member of this club"
		);
		require(
			hasVoted[msg.sender][clubId] == 0,
			"Already voted on this proposal"
		);

		unchecked {
			proposal.choices[choiceIndex].votes++;
		}
		hasVoted[msg.sender][clubId] = block.timestamp;

		emit Voted(proposalId, msg.sender, choiceIndex);
	}

	function endVoting(
		uint256 proposalId,
		uint256 clubId
	) external onlyAdminOrModerator {
		require(IClub(_clubs).isValidClubId(clubId), "Invalid club ID");
		require(
			proposalId < _proposalIds[clubId].current(),
			"Invalid proposal ID"
		);
		ProposalRecord storage proposal = _proposals[clubId][proposalId];
		require(
			proposal.status == Status.Active,
			"Proposal not in voting state"
		);

		uint256 winningChoiceIndex;
		for (uint256 i = 1; i < proposal.choices.length; ) {
			if (
				proposal.choices[i].votes >
				proposal.choices[winningChoiceIndex].votes
			) {
				winningChoiceIndex = i;
			}
			unchecked {
				++i;
			}
		}

		proposal.status = winningChoiceIndex > 0
			? Status.Passed
			: Status.Rejected;

		emit ProposalEnded(proposalId, proposal.status, block.timestamp);
	}

	function getPageCursor(
		uint256 page,
		uint256 pageSize,
		uint256 clubId
	) internal view returns (uint256, uint256) {
		uint256 length = _proposalIds[clubId].current();
		if (length == 0) {
			return (0, 0);
		}
		
		uint256 totalPages = length / pageSize;
		if (length % pageSize != 0) {
			unchecked {
				++totalPages;
			}
		}

		if (page > totalPages) {
			return (0, 0);
		}

		uint256 startItemIndex;
		uint256 endItemIndex;

		if (((page - 1) * pageSize) < length) {
			unchecked {
				startItemIndex = length - ((page - 1) * pageSize);
			}
		} else {
			startItemIndex = length;
		}

		if (startItemIndex > pageSize) {
			endItemIndex = startItemIndex - pageSize;
		}

		return (startItemIndex, endItemIndex);
	}

	function getProposals(
		uint256 clubId,
		uint256 page,
		uint256 pageSize
	) external view returns (ProposalPresnter[] memory) {
		require(pageSize > 0 && pageSize <= 100, "Invalid page size number!");
		require(page > 0 , "Invalid page number!");
		require(IClub(_clubs).isValidClubId(clubId), "Invalid club ID");
		(uint256 startItemIndex, uint256 endItemIndex) = getPageCursor(
			page,
			pageSize,
			clubId
		);

		uint256 itemCount = startItemIndex - endItemIndex;

		if (itemCount < 1) {
			return new ProposalPresnter[](0);
		}

		console.log(
			startItemIndex,
			endItemIndex,
			itemCount
		);

		ProposalPresnter[] memory pageProposals = new ProposalPresnter[](itemCount);
		uint256 j = itemCount - 1;
		for (uint256 i = endItemIndex; i < startItemIndex; ) {
			ProposalRecord memory proposal = _proposals[clubId][i];
			pageProposals[j] = ProposalPresnter({
				creator: proposal.creator,
				title: proposal.title,
				description: proposal.description,
				choices: proposal.choices,
				status: proposal.status,
				votingStartTime: proposal.votingStartTime,
				votingEndTime: proposal.votingEndTime,
				proposalId: i
			});

			unchecked {
				++i;
				--j;
			}
		}

		return pageProposals;
	}

	function getProposalDetails(
		uint256 proposalId,
		uint256 clubId
	) external view returns (ProposalPresnter memory) {
		require(IClub(_clubs).isValidClubId(clubId), "Invalid club ID");
		require(
			proposalId < _proposalIds[clubId].current(),
			"Invalid proposal ID"
		);
		ProposalRecord memory proposal = _proposals[clubId][proposalId];
		return ProposalPresnter({
			creator: proposal.creator,
			title: proposal.title,
			description: proposal.description,
			choices: proposal.choices,
			status: proposal.status,
			votingStartTime: proposal.votingStartTime,
			votingEndTime: proposal.votingEndTime,
			proposalId: proposalId
		});
	}
}
