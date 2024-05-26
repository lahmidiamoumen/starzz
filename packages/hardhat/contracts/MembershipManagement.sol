// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "@openzeppelin/contracts/utils/Counters.sol";
// import "./IClub.sol";

// contract MembershipManagement is IClub {
//     using Counters for Counters.Counter;

//     Counters.Counter private _clubIds;
//     mapping(address => uint256) public csToClub;
//     mapping(address => mapping(uint256 => uint256)) private _isMember;
//     mapping(address => mapping(uint256 => uint256)) private _membershipRequestedAt;

//     event MembershipRequested(address indexed user, uint256 indexed clubId);
//     event MembershipApproved(address indexed user, uint256 indexed clubId);
//     event MembershipRejected(address indexed user, uint256 indexed clubId);

//     function joinClub(uint256 clubId) external {
//         require(clubId <= _clubIds.current(), "Invalid club ID");
//         require(_isMember[msg.sender][clubId] == 0, "User already a member");
//         require(
//             _membershipRequestedAt[msg.sender][clubId] == 0,
//             "Membership request already submitted"
//         );

//         _membershipRequestedAt[msg.sender][clubId] = block.timestamp;
//         emit MembershipRequested(msg.sender, clubId);
//     }

//     function approveMembership(address user, uint256 clubId) external {
//         require(clubId <= _clubIds.current(), "Invalid club ID");
//         require(
//             _membershipRequestedAt[user][clubId] > 0,
//             "User has not requested membership"
//         );
//         require(
//             _isMember[user][clubId] == 0,
//             "User is already a member in the club"
//         );

//         _isMember[user][clubId] = block.timestamp;
//         _membershipRequestedAt[user][clubId] = 0;
//         emit MembershipApproved(user, clubId);
//     }

//     function rejectMembership(address user, uint256 clubId) external {
//         require(clubId <= _clubIds.current(), "Invalid club ID");
//         require(
//             _membershipRequestedAt[user][clubId] > 0,
//             "User has not requested membership"
//         );

//         _membershipRequestedAt[user][clubId] = 0;
//         emit MembershipRejected(user, clubId);
//     }

//     function revokeMembership(address user, uint256 clubId) external {
//         require(clubId <= _clubIds.current(), "Invalid club ID");
//         require(_isMember[user][clubId] > 0, "User is not member in the club");

//         _isMember[user][clubId] = 0;
//         emit MembershipRejected(user, clubId);
//     }

//     function getMember(address user, uint256 clubId) external view returns (uint256) {
//         return _isMember[user][clubId];
//     }

//     function getMembershipRequestDate(address user, uint256 clubId) external view returns (uint256) {
//         return _membershipRequestedAt[user][clubId];
//     }
// }
