// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.0 <0.9.0;

import "./Roles.sol";
import "./Club.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Proposal is Roles {
    using Counters for Counters.Counter;
    enum Status { Pending, Active, Passed, Rejected }

    Counters.Counter private _proposalIds;

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

    mapping(address => mapping (uint256 => bool)) hasVoted;
    mapping(uint256 => ProposalDetails) public proposals;

    event ProposalCreated(uint256 id, uint256 clubId, address creator);
    event VotingStarted(uint256 proposalId, uint256 startTime, uint256 endTime);
    event ProposalEnded(uint256 proposalId, Status status, uint256 endTime);
    event Voted(uint256 proposalId, address voter, uint256 choiceIndex);

    constructor(address owner) Roles(owner) {} // Inherit Roles constructor

    function createProposal(
        uint256 clubId,
        string memory _title,
        string memory _description,
        string[] memory _choices
    ) public onlyAdminOrModerator {
        // require(Club(address(this)).getClubModerator(clubId) == msg.sender, "Not a moderator of this club");
        require(_choices.length > 0 && _choices.length <= 10, "Invalid number of choices");

        uint256 proposalIds = _proposalIds.current();
        _proposalIds.increment();


        proposals[proposalIds].id = proposalIds;
        proposals[proposalIds].clubId = clubId;
        proposals[proposalIds].creator = msg.sender;
        proposals[proposalIds].title = _title;
        proposals[proposalIds].description = _description;
        proposals[proposalIds].status = Status.Pending;

        for (uint i = 0; i < _choices.length; i++) {
            proposals[proposalIds].choices.push(Choice(_choices[i], 0));
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

    function canVote(address _account, uint256 _proposalId, address clubAddress) public view returns (bool) {
        require(_proposalId < _proposalIds.current(), "Invalid proposal ID");
        ProposalDetails storage proposal = proposals[_proposalId];
        return Club(clubAddress).isMember(_account, proposal.clubId) && hasVoted[_account][proposal.clubId] && isActive(proposal);
    }

    function getProposalCount() public view returns (uint256) {
        return _proposalIds.current();
    }

    function startVoting(uint256 proposalId, uint256 duration) public onlyAdminOrModerator {
        require(duration > 500, "Duration must be positive");
        require(proposalId < _proposalIds.current(), "Invalid proposal ID");
        require(proposals[proposalId].status == Status.Pending, "Proposal not in pending state");
        proposals[proposalId].status = Status.Active;
        proposals[proposalId].votingStartTime = block.timestamp;
        proposals[proposalId].votingEndTime = block.timestamp + duration;
        emit VotingStarted(proposalId, proposals[proposalId].votingStartTime, proposals[proposalId].votingEndTime);
    }

    function startVoting(
        uint256 proposalId, 
        uint256 _votingStartTime,
        uint256 _votingEndTime
    ) public onlyAdminOrModerator {
        require(proposalId < _proposalIds.current(), "Invalid proposal ID");
        require(proposals[proposalId].status == Status.Pending, "Proposal not in pending state");
        require(_votingStartTime > block.timestamp, "Start time must be in the future");
        require(_votingEndTime > _votingStartTime, "End time must be after start time");
        proposals[proposalId].status = Status.Active;
        proposals[proposalId].votingStartTime = _votingStartTime;
        proposals[proposalId].votingEndTime = _votingEndTime;
        emit VotingStarted(proposalId, proposals[proposalId].votingStartTime, proposals[proposalId].votingEndTime);
    }

    function vote(uint256 proposalId, uint256 choiceIndex, address clubAddress) public {
        require(proposalId < _proposalIds.current(), "Invalid proposal ID");
        require(proposals[proposalId].status == Status.Active, "Proposal not in voting state");
        require(block.timestamp < proposals[proposalId].votingEndTime, "Voting has ended");
        require(Club(clubAddress).isMember(msg.sender, proposals[proposalId].clubId), "Not a member of this club");
        require(!hasVoted[msg.sender][proposals[proposalId].clubId], "Already voted on this proposal");

        proposals[proposalId].choices[choiceIndex].votes++;
        hasVoted[msg.sender][proposals[proposalId].clubId] = true;

        emit Voted(proposalId, msg.sender, choiceIndex);
    }

    function endVoting(uint256 proposalId) public onlyAdminOrModerator {
        require(proposalId < _proposalIds.current(), "Invalid proposal ID");
        require(proposals[proposalId].status == Status.Active, "Proposal not in voting state");
        require(block.timestamp >= proposals[proposalId].votingEndTime, "Voting has not ended yet");

        uint256 winningChoiceIndex = 0;
        for (uint256 i = 1; i < proposals[proposalId].choices.length; i++) {
            if (proposals[proposalId].choices[i].votes > proposals[proposalId].choices[winningChoiceIndex].votes) {
                winningChoiceIndex = i;
            }
        }

        proposals[proposalId].status = winningChoiceIndex > 0 ? Status.Passed : Status.Rejected;

        emit ProposalEnded(proposalId, proposals[proposalId].status, block.timestamp);
    }

    function getProposalsByClub(uint256 clubId) public view returns (ProposalDetails[] memory) {
        uint256 proposalCount = 0;
        for (uint256 i = 0; i < _proposalIds.current(); i++) {
            if (proposals[i].clubId == clubId) {
                proposalCount++;
            }
        }

        ProposalDetails[] memory clubProposals = new ProposalDetails[](proposalCount);
        uint256 j = 0;
        for (uint256 i = 0; i < _proposalIds.current(); i++) {
            if (proposals[i].clubId == clubId) {
                clubProposals[j] = proposals[i];
                j++;
            }
        }

        return clubProposals;
    }

    function getProposalsByPage(uint256 pageNumber, uint256 pageSize, uint256 lastProposalId) public view returns (ProposalDetails[] memory) {
        require(pageNumber >= 0, "Invalid page number (must be non-negative)");
        require(lastProposalId >= 0, "Invalid Last Proposal Id (must be non-negative)");
        require(pageSize > 0, "Invalid page size (must be positive)");

        uint256 startIndex = pageNumber * pageSize;
        uint256 endIndex = startIndex + pageSize;

        if (lastProposalId == 0) {
            lastProposalId = _proposalIds.current() > 0 ? proposals[_proposalIds.current() - 1].id : 0;
        }

        ProposalDetails[] memory pageProposals = new ProposalDetails[](endIndex < _proposalIds.current() ? endIndex - startIndex : _proposalIds.current() - startIndex);
        uint256 j = 0;

        for (uint256 i = startIndex; i < endIndex && i < _proposalIds.current(); i++) {
            if (proposals[i].id > lastProposalId) {
                lastProposalId = proposals[i].id;
            }
            pageProposals[j] = proposals[i];
            j++;
        }

        return pageProposals;
    }

    function getProposalsByModerator(address moderator) public view returns (ProposalDetails[] memory) {
        uint256 proposalCount = 0;
        for (uint256 i = 0; i < _proposalIds.current(); i++) {
            if (proposals[i].creator == moderator) {
                proposalCount++;
            }
        }

        ProposalDetails[] memory moderatorProposals = new ProposalDetails[](proposalCount);
        uint256 j = 0;
        for (uint256 i = 0; i < _proposalIds.current(); i++) {
            if (proposals[i].creator == moderator) {
                moderatorProposals[j] = proposals[i];
                j++;
            }
        }

        return moderatorProposals;
    }

    function getProposalDetails(uint256 proposalId) public view returns (ProposalDetails memory) {
        require(proposalId < _proposalIds.current(), "Invalid proposal ID");
        return proposals[proposalId];
    }
}