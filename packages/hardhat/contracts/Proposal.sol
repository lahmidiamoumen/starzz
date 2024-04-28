// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./Roles.sol";
import "./IRoles.sol";
import "./Club.sol";
import "./IClub.sol";

contract Proposal {
    using Counters for Counters.Counter;
    enum Status { Pending, Active, Passed, Rejected }

    address public _roles;
    address public _clubs;
    Counters.Counter private _proposalIds;
    address private _rolesContract;

    struct Choice {
        string description;
        uint256 votes;
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

    mapping(address => mapping (uint256 => uint256)) private hasVoted;
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
        require(IRoles(_roles).isAdminOrModerator(_msgSender()), "Roles: caller is not admin or moderator");
        _;
    }

    function _msgSender() internal view returns (address) {
        return msg.sender;
    }

    function createProposal(
        uint256 clubId,
        string memory _title,
        string memory _description,
        string[] memory _choices
    ) public onlyAdminOrModerator {
        // require(IClub(_clubs).getClubModerator(clubId) == _msgSender(), "Not a moderator of this club");
        require(_choices.length > 1 && _choices.length <= 10, "Invalid number of choices");

        uint256 proposalIds = _proposalIds.current();
        _proposalIds.increment();

        proposals[proposalIds].id = proposalIds;
        proposals[proposalIds].clubId = clubId;
        proposals[proposalIds].creator = _msgSender();
        proposals[proposalIds].title = _title;
        proposals[proposalIds].description = _description;
        proposals[proposalIds].status = Status.Pending;

        for (uint i; i < _choices.length;) {
            proposals[proposalIds].choices.push(Choice(_choices[i], 0));
            unchecked{ ++i; }
        }

        emit ProposalCreated(
            proposals[proposalIds].id,
            proposals[proposalIds].clubId,
            proposals[proposalIds].creator);
    }

    function isActive(ProposalDetails storage proposal) internal view returns (bool) {
        return proposal.status == Status.Active &&
               block.timestamp >= proposal.votingStartTime &&
               block.timestamp <= proposal.votingEndTime;
    }

    function canVote(address _account, uint256 _proposalId) public view returns (bool) {
        require(_proposalId <= _proposalIds.current(), "Invalid proposal ID");
        ProposalDetails storage proposal = proposals[_proposalId];
        require(isActive(proposal), "Proposal is not active for voting!");
    
        return IClub(_clubs).isMember(_account, proposal.clubId);
    }

    function getProposalCount() external view returns (uint256) {
        return _proposalIds.current();
    }

    function startVoting(uint256 proposalId, uint256 duration) public onlyAdminOrModerator {
        require(duration > 500, "Duration must be positive");
        require(proposalId <= _proposalIds.current(), "Invalid proposal ID");
        require(proposals[proposalId].status == Status.Pending, "Proposal not in pending state");
        proposals[proposalId].status = Status.Active;
        proposals[proposalId].votingStartTime = block.timestamp;
        uint256 newDuration;
        unchecked{ newDuration = block.timestamp + duration; }
        proposals[proposalId].votingEndTime = newDuration;
        emit VotingStarted(proposalId, proposals[proposalId].votingStartTime, proposals[proposalId].votingEndTime);
    }

    function startVoting(
        uint256 proposalId, 
        uint256 _votingStartTime,
        uint256 _votingEndTime
    ) public onlyAdminOrModerator {
        require(proposalId <= _proposalIds.current(), "Invalid proposal ID");
        require(proposals[proposalId].status == Status.Pending, "Proposal not in pending state");
        require(_votingStartTime > block.timestamp, "Start time must be in the future");
        require(_votingEndTime > _votingStartTime, "End time must be after start time");
        proposals[proposalId].status = Status.Active;
        proposals[proposalId].votingStartTime = _votingStartTime;
        proposals[proposalId].votingEndTime = _votingEndTime;
        emit VotingStarted(proposalId, proposals[proposalId].votingStartTime, proposals[proposalId].votingEndTime);
    }

    function vote(uint256 proposalId, uint256 choiceIndex) public {
        require(proposalId <= _proposalIds.current(), "Invalid proposal ID");
        require(proposals[proposalId].status == Status.Active, "Proposal not in voting state");
        require(block.timestamp < proposals[proposalId].votingEndTime, "Voting has ended");
        require(IClub(_clubs).isMember(msg.sender, proposals[proposalId].clubId), "Not a member of this club");
        require(hasVoted[msg.sender][proposals[proposalId].clubId] == 0, "Already voted on this proposal");

        unchecked{ proposals[proposalId].choices[choiceIndex].votes++; }
        hasVoted[msg.sender][proposals[proposalId].clubId] = block.timestamp;

        emit Voted(proposalId, msg.sender, choiceIndex);
    }

    function endVoting(uint256 proposalId) public onlyAdminOrModerator {
        require(proposalId <= _proposalIds.current(), "Invalid proposal ID");
        require(proposals[proposalId].status == Status.Active, "Proposal not in voting state");
        require(block.timestamp >= proposals[proposalId].votingEndTime, "Voting has not ended yet");

        uint256 winningChoiceIndex;
        for (uint256 i = 1; i < proposals[proposalId].choices.length;) {
            if (proposals[proposalId].choices[i].votes > proposals[proposalId].choices[winningChoiceIndex].votes) {
                winningChoiceIndex = i;
            }
            unchecked{ ++i; }
        }

        proposals[proposalId].status = winningChoiceIndex > 0 ? Status.Passed : Status.Rejected;

        emit ProposalEnded(proposalId, proposals[proposalId].status, block.timestamp);
    }

    function getProposalsByClub(uint256 clubId) public view returns (ProposalDetails[] memory) {
        uint proposalCount;
        uint pageSize = 100;
        uint endIndex;
        if (_proposalIds.current() > pageSize)  unchecked {
            endIndex = _proposalIds.current() - pageSize 
        }; 
        for (uint i = _proposalIds.current(); i >= endIndex;) {
            if (proposals[i].clubId == clubId) {
                unchecked{ proposalCount++; }
            }
            unchecked{ --i; }
        }

        ProposalDetails[] memory clubProposals = new ProposalDetails[](proposalCount);
        uint j;
        for (uint i = _proposalIds.current(); i >= endIndex;) {
            if (proposals[i].clubId == clubId) {
                clubProposals[j] = proposals[i];
                unchecked{ --j; }
            }
            unchecked{ --i; }
        }

        return clubProposals;
    }

    function getProposalsByPage(uint256 pageNumber, uint256 pageSize, uint256 lastProposalId) public view returns (ProposalDetails[] memory) {
        require(pageNumber >= 0, "Invalid page number (must be non-negative)");
        require(lastProposalId >= 0, "Invalid Last Proposal Id (must be non-negative)");
        require(pageSize > 0 && pageSize < 100, "Invalid page size");
        uint startIndex = pageNumber * pageSize;
        require(startIndex < _proposalIds.current() , "Invalid page size");

        uint endIndex;
        unchecked{ endIndex = startIndex + pageSize; }

        uint length;
        if (endIndex <= _proposalIds.current()) unchecked {
            length = endIndex - startIndex;
        } else unchecked {
            length = _proposalIds.current() - startIndex;
        }

        if (lastProposalId == 0) {
            if (_proposalIds.current() > 0) unchecked {
                lastProposalId = proposals[_proposalIds.current() - 1].id
            }
        }

        ProposalDetails[] memory pageProposals = new ProposalDetails[](length);
        uint j;

        for (uint i = startIndex; i < length;) {
            if (proposals[i].id > lastProposalId) {
                lastProposalId = proposals[i].id;
            }
            pageProposals[j] = proposals[i];
            unchecked{ ++j; }
            unchecked{ ++i; }
        }

        return pageProposals;
    }

    function getProposalsByModerator(address moderator) public view returns (ProposalDetails[] memory) {
        uint256 proposalCount;
        for (uint256 i; i <= _proposalIds.current(); ) {
            if (proposals[i].creator == moderator) {
                unchecked{ proposalCount++; }
            }
            unchecked{ ++i; }
        }

        ProposalDetails[] memory moderatorProposals = new ProposalDetails[](proposalCount);
        uint256 j;
        for (uint256 i; i <= _proposalIds.current(); ) {
            if (proposals[i].creator == moderator) {
                moderatorProposals[j] = proposals[i];
                unchecked{ j++; }
            }
            unchecked{ ++i; }
        }

        return moderatorProposals;
    }

    function getProposalDetails(uint256 proposalId) public view returns (ProposalDetails memory) {
        require(proposalId <= _proposalIds.current(), "Invalid proposal ID");
        return proposals[proposalId];
    }
}