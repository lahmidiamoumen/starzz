// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./Roles.sol";

contract Club is Roles {
    using Counters for Counters.Counter;

    Counters.Counter private _clubIds;
    mapping(uint256 => address) public moderators;
    mapping(address => uint256) public clubsByModerator; // Maps moderator to club ID
    mapping(address => bool) public members; // Maps user address to club membership

    struct ClubDetails {
        uint256 id;
        string name;
        address creator;
    }

    mapping(uint256 => ClubDetails) public clubDetails;
    event ClubCreated(uint256 clubId, string name, address moderator);
    event JoinedClub(address user, uint256 clubId);
    event LeftClub(address user, uint256 clubId);

    constructor(address owner) Roles(owner) {} // Inherit Roles constructor

    function createClub(string memory name) public onlyAdminOrModerator {
        uint256 clubId = _clubIds.current();
        _clubIds.increment();
        moderators[clubId] = msg.sender;
        clubsByModerator[msg.sender] = clubId;
        clubDetails[clubId] = ClubDetails(clubId, name, msg.sender);
        emit ClubCreated(clubId, name, msg.sender);
    }

    function getClubDetails(uint256 clubId) public view returns (ClubDetails memory) {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        return clubDetails[clubId];
    }

    function joinClub(uint256 clubId) public {
        require(!members[msg.sender], "Already a member of this club");
        members[msg.sender] = true;
        emit JoinedClub(msg.sender, clubId);
    }

    function leaveClub(uint256 clubId) public {
        require(members[msg.sender], "Not a member of this club");
        members[msg.sender] = false;
        emit LeftClub(msg.sender, clubId);
    }

    function getClubModerator(uint256 clubId) public view returns (address) {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        return moderators[clubId];
    }

    function isMember(address user, uint256 clubId) public view returns (bool) {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        return members[user];
    }
}
