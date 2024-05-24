// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./Roles.sol";
import "./IClub.sol";
import "./membership/MemberManager.sol";
import "./membership/MemberRecord.sol";

import "hardhat/console.sol";

contract Club is IClub {
	using Counters for Counters.Counter;
	Counters.Counter private _clubIds;

	using MemberManager for MemberManager.MemberData;
	MemberManager.MemberData private _members;
	MemberManager.MemberData private _membershipRequests;

	address private immutable _roles;

	mapping(address => uint256) public csToClub;

	event MembershipRequested(address indexed user, uint256 indexed clubId);
	event MembershipApproved(address indexed user, uint256 indexed clubId);
	event MembershipRejected(address indexed user, uint256 indexed clubId);

	struct ClubDetails {
		uint256 id;
		string name;
		address creator;
		uint256 createdOn;
	}

	struct CsRolePresenter {
		uint256 clubId;
		string clubName;
		address cs;
	}

	struct ClubPresenter {
		uint256 id;
		string name;
		address creator;
		uint256 createdOn;
		uint256 joinedOn;
		uint256 membershipRequestedOn;
	}

	mapping(uint256 => ClubDetails) public _clubs;
	event ClubCreated(uint256 clubId, string name, address moderator);
	event JoinedClub(address user, uint256 clubId);
	event LeftClub(address user, uint256 clubId);

	constructor(address rolesContract) {
		_roles = rolesContract;
	}

	modifier onlyMember(uint256 clubId) {
		require(_members.isMember(_msgSender(), clubId), "Caller is not a member");
		_;
	}

	modifier onlyAdminOrModerator() {
		require(
			IRoles(_roles).isAdminOrModerator(_msgSender()),
			"Roles: caller is not admin or moderator"
		);
		_;
	}

	modifier onlyCsRole(uint256 clubId) {
		require(
			IRoles(_roles).isAdminOrModerator(_msgSender()) ||
			IRoles(_roles).isCSOn(_msgSender(), clubId),
			"Roles: caller is not a staff"
		);
		_;
	}

	modifier onlyNoStaffPrivileges() {
		require(
			!IRoles(_roles).isStaff(_msgSender()),
			"Roles: caller must not be a staff"
		);
		_;
	}

	function getMemberID(
		address user,
		uint256 clubId
	) internal view returns (uint256) {
		return _members.getMemberID(user, clubId);
	}

	function getMembershipRequestID(
		address user,
		uint256 clubId
	) internal view returns (uint256) {
		return _membershipRequests.getMemberID(user, clubId);
	}
		function getMember(
		address user,
		uint256 clubId
	) internal view returns (MemberRecord memory) {
		return _members.getMember(user, clubId);
	}

	function getMembershipRequest(
		address user,
		uint256 clubId
	) internal view returns (MemberRecord memory) {
		return _membershipRequests.getMember(user, clubId);
	}

	function isMember(
		address user,
		uint256 clubId
	) external view returns (bool) {
		require(user != address(0), "Invalid address");
		require(clubId <= _clubIds.current(), "Invalid club ID");
		return _members.isMember(user, clubId);
	}

	function _msgSender() internal view returns (address) {
		return msg.sender;
	}

	function isValidClubId(uint256 clubId) external view returns (bool) {
		return clubId >= 0 && clubId <= _clubIds.current();
	}

	function createClub(string memory name) external onlyAdminOrModerator {
		uint size = getStringLength(name);
		require(size > 3 && 44 > size, "Invalid club name");
		uint256 clubId = _clubIds.current();
		_clubIds.increment();

		_clubs[clubId] = ClubDetails(
			clubId,
			name,
			_msgSender(),
			block.timestamp
		);
		emit ClubCreated(clubId, name, _msgSender());
	}

	function joinClub(uint256 clubId) external onlyNoStaffPrivileges {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		require(getMemberID(_msgSender(), clubId) == 0, "User already a member");
		require(
			getMembershipRequestID(_msgSender(), clubId) == 0,
			"Membership request already submitted"
		);

		_membershipRequests.grantMembership(_msgSender(), clubId);

		emit MembershipRequested(_msgSender(), clubId);
	}

	function approveMembership(
		address user,
		uint256 clubId
	) external onlyCsRole(clubId) {
		require(user != address(0), "Invalid address");
		require(clubId <= _clubIds.current(), "Invalid club ID");
		require(
			getMembershipRequestID(user, clubId) > 0,
			"User has not requested membership"
		);
		require(
			getMemberID(user, clubId) == 0,
			"User is already a member in the club"
		);

		_members.grantMembership(user, clubId);
		_membershipRequests.revokeMembership(user, clubId);

		emit MembershipApproved(user, clubId);
	}

	function rejectMembership(
		address user,
		uint256 clubId
	) external onlyCsRole(clubId) {
		require(user != address(0), "Invalid address");
		require(clubId <= _clubIds.current(), "Invalid club ID");
		require(
			getMembershipRequestID(user, clubId) > 0,
			"User has not requested membership"
		);

		_membershipRequests.revokeMembership(user, clubId);
		emit MembershipRejected(user, clubId);
	}

	function revokeMembership(
		address user,
		uint256 clubId
	) external onlyCsRole(clubId) {
		require(user != address(0), "Invalid address");
		require(clubId <= _clubIds.current(), "Invalid club ID");
		require(_members.getMemberID(user, clubId) > 0, "User is not member in the club");

		_members.revokeMembership(user, clubId);
		emit MembershipRejected(user, clubId);
	}

	function getClubDetails(
		uint256 clubId
	) external view returns (ClubPresenter memory) {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		ClubDetails memory club = _clubs[clubId];
		address user = _msgSender();
		MemberRecord memory memberJoinedOn = getMember(user, club.id);
		MemberRecord memory membershipRequestedAt = getMembershipRequest(user, club.id);
		return
			ClubPresenter({
				id: club.id,
				name: club.name,
				creator: club.creator,
				createdOn: club.createdOn,
				joinedOn: memberJoinedOn.ceatedAt,
				membershipRequestedOn: membershipRequestedAt.ceatedAt
			});
	}

	function hasRequestedMembership(
		address user,
		uint256 clubId
	) external view onlyCsRole(clubId) returns (bool) {
		require(user != address(0), "Invalid address");
		require(clubId <= _clubIds.current(), "Invalid club ID");
		return getMembershipRequestID(user, clubId) > 0;
	}

	function didIRequestedMembership(
		uint256 clubId
	) external view returns (bool) {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		return getMembershipRequestID(_msgSender(), clubId) > 0;
	}

	function getClubCreator(
		uint256 clubId
	) external view onlyAdminOrModerator returns (address) {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		return _clubs[clubId].creator;
	}

	function leaveClub(uint256 clubId) external {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		require(
			getMemberID(_msgSender(), clubId) > 0,
			"User is not member in the club"
		);

		_members.revokeMembership(_msgSender(), clubId);

		emit LeftClub(_msgSender(), clubId);
	}

	function getPageMemberCursor(
		uint256 page,
		uint256 pageSize,
		uint256 length
	) internal pure returns (uint256, uint256) {
		if (length < 1) {
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

	function getPageCursor(
		uint256 page,
		uint256 pageSize,
		uint256 length
	) internal pure returns (uint256, uint256) {
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

	function getMembers(
		uint256 clubId,
		uint256 page,
		uint256 pageSize
	) external view returns (MemberRecord[] memory) {
		(uint256 startItemIndex, uint256 endItemIndex) = getPageMemberCursor(
			page,
			pageSize,
			_members.current(clubId)
		);

		uint256 itemCount = startItemIndex - endItemIndex;
		if (itemCount < 1) {
			return new MemberRecord[](0);
		}

		MemberRecord[] memory pageClubs = new MemberRecord[](itemCount);
		uint256 j = itemCount - 1;
		for (uint256 i = endItemIndex; i < startItemIndex; ) {
			pageClubs[j] = _members.getMemberByIndex(i, clubId);
			unchecked {
				++i;
				--j;
			}
		}

		return pageClubs;
	}


	function getMembershipRequestsCount(
		uint256 clubId
	) external view returns (uint256) {
		return _membershipRequests.current(clubId);
	}

	function getMembersCount(
		uint256 clubId
	) external view returns (uint256) {
		return _members.current(clubId);
	}

	function getMembershipRequests(
		uint256 clubId,
		uint256 page,
		uint256 pageSize
	) external view returns (MemberRecord[] memory) {
		(uint256 startItemIndex, uint256 endItemIndex) = getPageMemberCursor(
			page,
			pageSize,
			_membershipRequests.current(clubId)
		);

		uint256 itemCount = startItemIndex - endItemIndex;
		if (itemCount < 1) {
			return new MemberRecord[](0);
		}

		MemberRecord[] memory pageClubs = new MemberRecord[](itemCount);
		uint256 j = itemCount - 1;
		for (uint256 i = endItemIndex; i < startItemIndex; ) {
			pageClubs[j] = _membershipRequests.getMemberByIndex(i, clubId);
			unchecked {
				++i;
				--j;
			}
		}

		return pageClubs;
	}

	function getCsRoles(
		uint256 page,
		uint256 pageSize
	) external view returns (CsRolePresenter[] memory) {
		(uint256 startItemIndex, uint256 endItemIndex) = getPageCursor(
			page,
			pageSize,
			_clubIds.current()
		);

		uint256 itemCount = startItemIndex - endItemIndex;
		if (itemCount < 1) {
			return new CsRolePresenter[](0);
		}

		CsRolePresenter[] memory pageClubs = new CsRolePresenter[](itemCount);
		uint256 j = itemCount - 1;
		for (uint256 i = endItemIndex; i < startItemIndex; ) {
			ClubDetails memory club = _clubs[i];

			pageClubs[j] = CsRolePresenter({
				clubId: club.id,
				clubName: club.name,
				cs: IRoles(_roles).getCsRole(club.id)
			});
			unchecked {
				++i;
				--j;
			}
		}

		return pageClubs;
	}

	function getClubs(
		uint256 page,
		uint256 pageSize
	) external view returns (ClubPresenter[] memory) {
		require(pageSize > 0 && pageSize <= 100, "Invalid page size number!");
		require(page > 0 , "Invalid page number!");
		(uint256 startItemIndex, uint256 endItemIndex) = getPageCursor(
			page,
			pageSize,
			_clubIds.current()
		);

		uint256 itemCount = startItemIndex - endItemIndex;
		if (itemCount < 1) {
			return new ClubPresenter[](0);
		}
		address user = _msgSender();

		ClubPresenter[] memory pageClubs = new ClubPresenter[](itemCount);
		uint256 j = itemCount - 1;
		for (uint256 i = endItemIndex; i < startItemIndex; ) {
			ClubDetails memory club = _clubs[i];
			uint256 memberJoinedOn = getMemberID(user, club.id);
			uint256 membershipRequestedAt = getMembershipRequestID(
				user,
				club.id
			);

			pageClubs[j] = ClubPresenter({
				id: club.id,
				name: club.name,
				creator: club.creator,
				createdOn: club.createdOn,
				joinedOn: memberJoinedOn,
				membershipRequestedOn: membershipRequestedAt
			});
			unchecked {
				++i;
				--j;
			}
		}

		return pageClubs;
	}

	function getStringLength(string memory _str) internal pure returns (uint) {
		bytes memory strBytes = bytes(_str);
		return strBytes.length;
	}
}
