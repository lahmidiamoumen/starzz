// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserManagement.sol";

contract ClubMember {

    mapping(address => mapping(address => bool)) private _isMember; // Mapping of user to club and membership status
    mapping(address => mapping(address => uint256)) private _membershipRequestedAt; // Mapping of user to club and request timestamp

    event MembershipRequested(address indexed user, address indexed clubAddress);
    event MembershipApproved(address indexed user, address indexed clubAddress);
    event MembershipRejected(address indexed user, address indexed clubAddress);
    event ClubLeft(address indexed user, address indexed clubAddress);

    modifier onlyMember(address clubAddress) {
        require(_isMember[msg.sender][clubAddress], "ClubMember: caller is not a member");
        _;
    }

    function joinClub(address user, address clubAddress) public {
        require(!_isMember[user][clubAddress], "User already a member");
        require(_membershipRequestedAt[user][clubAddress] == 0, "Membership request already submitted");

        _membershipRequestedAt[user][clubAddress] = block.timestamp;
        emit MembershipRequested(user, clubAddress);
    }

    function approveMembership(address user, address clubAddress) public onlyMember(clubAddress) {
        require(_membershipRequestedAt[user][clubAddress] > 0, "User has not requested membership");

        _isMember[user][clubAddress] = true;
        _membershipRequestedAt[user][clubAddress] = 0;
        emit MembershipApproved(user, clubAddress);
    }

    function rejectMembership(address user, address clubAddress) public onlyMember(clubAddress) {
        require(_membershipRequestedAt[user][clubAddress] > 0, "User has not requested membership");

        _membershipRequestedAt[user][clubAddress] = 0;
        emit MembershipRejected(user, clubAddress);
    }

    function leaveClub(address user, address clubAddress) public onlyMember(clubAddress) {
        _isMember[user][clubAddress] = false;
        emit ClubLeft(user, clubAddress);
    }

    function isMember(address user, address clubAddress) public view returns (bool) {
        return _isMember[user][clubAddress];
    }

    function hasRequestedMembership(address user, address clubAddress) public view returns (bool) {
        return _membershipRequestedAt[user][clubAddress] > 0;
    }
}
