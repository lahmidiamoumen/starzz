// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./Roles.sol";
import "./IClub.sol";

contract Club is IClub {
    using Counters for Counters.Counter;
    address public _roles;

    Counters.Counter private _clubIds;
    mapping(address => uint256) public csToClub;
    mapping(address => mapping(uint256 => uint256)) private _isMember;
    mapping(address => mapping(uint256 => uint256)) private _membershipRequestedAt;

    event MembershipRequested(address indexed user, uint256 indexed clubId);
    event MembershipApproved(address indexed user, uint256 indexed clubId);
    event MembershipRejected(address indexed user, uint256 indexed clubId);
   
    struct ClubDetails {
        uint256 id;
        string name;
        address creator;
    }

    mapping(uint256 => ClubDetails) public _clubDetails;
    event ClubCreated(uint256 clubId, string name, address moderator);
    event JoinedClub(address user, uint256 clubId);
    event LeftClub(address user, uint256 clubId);

    constructor(address rolesContract) {
        _roles = rolesContract;
    }

    modifier onlyMember(uint256 clubId) {
        require(isMember(_msgSender(), clubId), "Caller is not a member");
        _;
    }

    modifier onlyAdminOrModerator() {
        require(IRoles(_roles).isAdminOrModerator(_msgSender()), "Roles: caller is not admin or moderator");
        _;
    }

    modifier onlyStaffPrivileges() {
        require(IRoles(_roles).isStaff(_msgSender()), "Roles: caller is not admin or moderator");
        _;
    }

    function _msgSender() internal view returns (address) {
        return msg.sender;
    }

    function createClub(string memory name) external onlyAdminOrModerator {
        uint256 clubId = _clubIds.current();
        _clubIds.increment();

        _clubDetails[clubId] = ClubDetails(clubId, name, _msgSender());
        emit ClubCreated(clubId, name, _msgSender());
    }

    function joinClub(uint256 clubId) external {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        require(_isMember[_msgSender()][clubId] == 0, "User already a member");
        require(_membershipRequestedAt[_msgSender()][clubId] == 0, "Membership request already submitted");

        _membershipRequestedAt[_msgSender()][clubId] = block.timestamp;
        emit MembershipRequested(_msgSender(), clubId);
    }

    function approveMembership(address user, uint256 clubId) external onlyStaffPrivileges {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        require(_membershipRequestedAt[user][clubId] > 0, "User has not requested membership");
        require(_isMember[user][clubId] == 0, "User is already a member in the club");

        _isMember[user][clubId] = block.timestamp;
        _membershipRequestedAt[user][clubId] = 0;
        emit MembershipApproved(user, clubId);
    }

    function rejectMembership(address user, uint256 clubId) external onlyStaffPrivileges {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        require(_membershipRequestedAt[user][clubId] > 0, "User has not requested membership");

        _membershipRequestedAt[user][clubId] = 0;
        emit MembershipRejected(user, clubId);
    }

    function revokMembership(address user, uint256 clubId) external onlyStaffPrivileges {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        require(_isMember[user][clubId] > 0, "User is not member in the club");

        _isMember[user][clubId] = 0;
        emit MembershipRejected(user, clubId);
    }

    function getClubDetails(uint256 clubId) external view returns (ClubDetails memory) {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        return _clubDetails[clubId];
    }

    function hasRequestedMembership(address user, uint256 clubId) external view onlyStaffPrivileges returns (bool) {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        return _membershipRequestedAt[user][clubId] > 0;
    }

    function hasRequestedMembership(uint256 clubId) external view returns (bool) {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        return _membershipRequestedAt[msg.sender][clubId] > 0;
    }

    function getClubCreator(uint256 clubId) external view onlyAdminOrModerator returns (address) {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        return _clubDetails[clubId].creator;
    }

    function leaveClub(uint256 clubId) external {
        require(clubId <= _clubIds.current(), "Invalid club ID");
        require(_isMember[_msgSender()][clubId] > 0, "User is not member in the club");
        _isMember[_msgSender()][clubId] = 0;
        emit LeftClub(_msgSender(), clubId);
    }

    function isMember(address user, uint256 clubId) external view returns (bool) {
        return _isMember[user][clubId] > 0;
    }
}
