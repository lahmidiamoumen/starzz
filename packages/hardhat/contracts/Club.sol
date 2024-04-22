// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "./AccessControl.sol";
import "./Proposal.sol";
import "./UserManagement.sol";

contract Club {
    uint256 id;
    string name;
    address creator;
    AccessControl private _accessControl;

    mapping(address => bool) private _membershipRequests;
    mapping(address => bool) private _members;

    event MembershipRequested(address indexed user);
    event MembershipApproved(address indexed user);
    event MembershipRejected(address indexed user);
    event ClubLeft(address indexed user);


    constructor(address accessControlAddress, uint256 clubId, string memory clubName) {
        _accessControl = AccessControl(accessControlAddress);
        id = clubId;
        name = clubName;
        creator = msg.sender;
    }

    modifier onlyMember() {
        require(_members[msg.sender], "Club: caller is not a member");
        _;
    }

    modifier onlyModerator() {
        require(_accessControl.hasRole(AccessControl.Role.Moderator), "Proposal: caller must be a Moderator");
        _;
    }

    modifier onlyFans() {
        require(_accessControl.hasRole(AccessControl.Role.Fan), "Proposal: caller must be a Fan");
        _;
    }

    function requestMembership() external onlyFans {
        require(!_members[msg.sender], "User already a member");
        require(!_membershipRequests[msg.sender], "Membership request already submitted");

        _membershipRequests[msg.sender] = true;
        emit MembershipRequested(msg.sender);
    }

    function approveMembership(address user) external onlyModerator {
        require(!_members[msg.sender], "User already a member");
        require(_membershipRequests[user], "User has not requested membership");
        _membershipRequests[user] = false;
        _members[user] = true;
        emit MembershipApproved(user);
    }

    function rejectMembership(address user) external onlyModerator {
        require(_membershipRequests[user], "User has not requested membership");
        _membershipRequests[user] = false;
        emit MembershipRejected(user);
    }

    function leaveClub() external onlyMember {
        _members[msg.sender] = false;
        emit ClubLeft(msg.sender);
    }

    function isMember(address user) external view returns (bool) {
        return _members[user];
    }

    function hasRequestedMembership(address user) external view returns (bool) {
        return _membershipRequests[user];
    }
}
