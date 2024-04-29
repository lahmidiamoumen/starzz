// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./Roles.sol";
import "./IRoles.sol";
import "./Club.sol";
import "./IClub.sol";

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
	Counters.Counter private _proposalIds;

	struct Choice {
		string description;
		uint8 votes;
	}

	struct ProposalDetails {
		uint256 id;
		uint256 clubId;
		address creator;
		string title;
		string description;
		Choice[] choices;
		Status status;
		uint256 votingStartTime;
		uint256 votingEndTime;
	}

	mapping(address => mapping(uint256 => uint256)) private hasVoted;
	mapping(uint256 => ProposalDetails) private proposals;

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
		// require(IClub(_clubs).getClubModerator(clubId) == _msgSender(), "Not a moderator of this club");
		require(
			_choicesContent.length > 1 && _choicesContent.length <= 10,
			"Invalid number of choices"
		);

		uint256 proposalIds = _proposalIds.current();
		_proposalIds.increment();

		ProposalDetails storage newProposal = proposals[proposalIds];

		newProposal.id = proposalIds;
		newProposal.clubId = clubId;
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

		emit ProposalCreated(
			newProposal.id,
			newProposal.clubId,
			newProposal.creator
		);
	}

	function isActive(
		ProposalDetails memory proposal
	) internal view returns (bool) {
		return
			proposal.status == Status.Active &&
			block.timestamp >= proposal.votingStartTime &&
			block.timestamp <= proposal.votingEndTime;
	}

	function canVote(
		address _account,
		uint256 _proposalId
	) external view returns (bool) {
		require(_proposalId <= _proposalIds.current(), "Invalid proposal ID");
		ProposalDetails memory proposal = proposals[_proposalId];
		require(isActive(proposal), "Proposal is not active for voting!");

		return IClub(_clubs).isMember(_account, proposal.clubId);
	}

	function getProposalCount() external view returns (uint256) {
		return _proposalIds.current();
	}

	function startVoting(
		uint256 proposalId,
		uint256 duration
	) external onlyAdminOrModerator {
		ProposalDetails storage proposal = proposals[proposalId];
		require(duration > 500, "Duration must be positive");
		require(proposalId < _proposalIds.current(), "Invalid proposal ID");
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
		uint256 _votingStartTime,
		uint256 _votingEndTime
	) external onlyAdminOrModerator {
		ProposalDetails storage proposal = proposals[proposalId];
		require(proposalId < _proposalIds.current(), "Invalid proposal ID");
		require(
			proposal.status == Status.Pending,
			"Proposal not in pending state"
		);
		require(
			_votingStartTime > block.timestamp,
			"Start time must be in the future"
		);
		require(
			_votingEndTime > _votingStartTime,
			"End time must be after start time"
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

	function vote(uint256 proposalId, uint256 choiceIndex) external {
		ProposalDetails storage proposal = proposals[proposalId];
		require(proposalId < _proposalIds.current(), "Invalid proposal ID");
		require(
			proposal.status == Status.Active,
			"Proposal not in voting state"
		);
		require(block.timestamp < proposal.votingEndTime, "Voting has ended");
		require(
			IClub(_clubs).isMember(msg.sender, proposal.clubId),
			"Not a member of this club"
		);
		require(
			hasVoted[msg.sender][proposal.clubId] == 0,
			"Already voted on this proposal"
		);

		unchecked {
			proposal.choices[choiceIndex].votes++;
		}
		hasVoted[msg.sender][proposal.clubId] = block.timestamp;

		emit Voted(proposalId, msg.sender, choiceIndex);
	}

	function endVoting(uint256 proposalId) external onlyAdminOrModerator {
		ProposalDetails storage proposal = proposals[proposalId];
		require(proposalId < _proposalIds.current(), "Invalid proposal ID");
		require(
			proposal.status == Status.Active,
			"Proposal not in voting state"
		);
		require(
			block.timestamp >= proposal.votingEndTime,
			"Voting has not ended yet"
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

	function getProposalsByClub(
		uint256 clubId
	) external view returns (ProposalDetails[] memory) {
		uint proposalCount;
		uint pageSize = 100;
		uint endIndex;
		if (_proposalIds.current() > pageSize) {
			unchecked {
				endIndex = _proposalIds.current() - pageSize;
			}
		}
		for (uint i = _proposalIds.current(); i >= endIndex; ) {
			if (proposals[i].clubId == clubId) {
				unchecked {
					proposalCount++;
				}
			}
			unchecked {
				--i;
			}
		}

		ProposalDetails[] memory clubProposals = new ProposalDetails[](
			proposalCount
		);
		uint j;
		for (uint i = _proposalIds.current(); i >= endIndex; ) {
			if (proposals[i].clubId == clubId) {
				clubProposals[j] = proposals[i];
				unchecked {
					--j;
				}
			}
			unchecked {
				--i;
			}
		}

		return clubProposals;
	}

    function getPageCursor(uint256 page, uint256 pageSize) internal view returns (uint256, uint256) {
        require(pageSize > 0 && pageSize <= 100, "Invalid page size number!");
        uint256 length = _proposalIds.current() - 1;

        uint256 totalPages = length / pageSize;
        if (length % pageSize != 0) {
            unchecked {
                ++totalPages;
            }
        }

        require(page > 0 && page <= totalPages, "Invalid page number!");
        // Calculate the starting and ending indices of items for the specified page
        uint256 startItemIndex;
        uint256 endItemIndex;

        if (((page - 1)  * pageSize) < length) {
            unchecked {
              startItemIndex =  length -  ((page - 1)  * pageSize);
            }
        } else {
            startItemIndex = length;
        }

        if (startItemIndex > pageSize) {
            endItemIndex  = startItemIndex - pageSize + 1;
        }

        return (startItemIndex, endItemIndex);
    }

	function getProposals(
		uint256 page,
		uint256 pageSize
	) external view returns (ProposalDetails[] memory) {
        (uint256 startItemIndex, uint256 endItemIndex) = getPageCursor(page, pageSize);
        
        uint256 itemCount = startItemIndex - endItemIndex + 1;

        ProposalDetails[] memory pageProposals = new ProposalDetails[](itemCount);
        uint256 j = itemCount - 1;
        for (uint256 i = endItemIndex; i <= startItemIndex;) {
            pageProposals[j] = proposals[i];
            unchecked {
                ++i;
                --j;
            }
        }

        return pageProposals;
	}

	function getProposalsByPage(
		uint256 pageNumber,
		uint256 pageSize,
		uint256 lastProposalId
	) external view returns (ProposalDetails[] memory) {
		require(pageNumber >= 0, "Invalid page number (must be non-negative)");
		require(
			lastProposalId >= 0,
			"Invalid Last Proposal Id (must be non-negative)"
		);
		require(pageSize > 0 && pageSize < 100, "Invalid page size");
		uint startIndex = pageNumber * pageSize;
		require(startIndex < _proposalIds.current(), "Invalid page size");

		uint endIndex;
		unchecked {
			endIndex = startIndex + pageSize;
		}

		uint length;
		if (endIndex <= _proposalIds.current()) {
			unchecked {
				length = endIndex - startIndex;
			}
		} else {
			unchecked {
				length = _proposalIds.current() - startIndex;
			}
		}

		if (lastProposalId == 0) {
			if (_proposalIds.current() > 0) {
				unchecked {
					lastProposalId = proposals[_proposalIds.current() - 1].id;
				}
			}
		}

		ProposalDetails[] memory pageProposals = new ProposalDetails[](length);
		uint j;

		for (uint i = startIndex; i < length; ) {
			if (proposals[i].id > lastProposalId) {
				lastProposalId = proposals[i].id;
			}
			pageProposals[j] = proposals[i];
			unchecked {
				++j;
			}
			unchecked {
				++i;
			}
		}

		return pageProposals;
	}

	function getProposalsByModerator(
		address moderator
	) external view returns (ProposalDetails[] memory) {
		uint256 proposalCount;
		for (uint256 i; i <= _proposalIds.current(); ) {
			if (proposals[i].creator == moderator) {
				unchecked {
					proposalCount++;
				}
			}
			unchecked {
				++i;
			}
		}

		ProposalDetails[] memory moderatorProposals = new ProposalDetails[](
			proposalCount
		);
		uint256 j;
		for (uint256 i; i <= _proposalIds.current(); ) {
			if (proposals[i].creator == moderator) {
				moderatorProposals[j] = proposals[i];
				unchecked {
					j++;
				}
			}
			unchecked {
				++i;
			}
		}

		return moderatorProposals;
	}

	function getProposalDetails(
		uint256 proposalId
	) external view returns (ProposalDetails memory) {
		require(proposalId < _proposalIds.current(), "Invalid proposal ID");
		return proposals[proposalId];
	}
}
