// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./Roles.sol";
import "./IClub.sol";

import "hardhat/console.sol";

contract Club is IClub {
	using Counters for Counters.Counter;
	address private immutable _roles;

	Counters.Counter private _clubIds;
	mapping(address => uint256) public csToClub;
	mapping(address => mapping(uint256 => uint256)) private _isMember;
	mapping(address => mapping(uint256 => uint256))
		private _membershipRequestedAt;

	event MembershipRequested(address indexed user, uint256 indexed clubId);
	event MembershipApproved(address indexed user, uint256 indexed clubId);
	event MembershipRejected(address indexed user, uint256 indexed clubId);

	struct ClubDetails {
		uint256 id;
		string name;
		address creator;
		uint256 createdOn;
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
		require(_isMember[_msgSender()][clubId] > 0, "Caller is not a member");
		_;
	}

	modifier onlyAdminOrModerator() {
		require(
			IRoles(_roles).isAdminOrModerator(_msgSender()),
			"Roles: caller is not admin or moderator"
		);
		_;
	}

	modifier onlyStaffPrivileges() {
		require(
			IRoles(_roles).isStaff(_msgSender()),
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

	function getMember(
		address user,
		uint256 clubId
	) internal view returns (uint256) {
		return _isMember[user][clubId];
	}

	function getMembershipRequestDate(
		address user,
		uint256 clubId
	) internal view returns (uint256) {
		return _membershipRequestedAt[user][clubId];
	}

	function isMember(
		address user,
		uint256 clubId
	) external view returns (bool) {
		return getMember(user, clubId) > 0;
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
		require(_isMember[_msgSender()][clubId] == 0, "User already a member");
		require(
			getMembershipRequestDate(_msgSender(), clubId) == 0,
			"Membership request already submitted"
		);

		_membershipRequestedAt[_msgSender()][clubId] = block.timestamp;
		emit MembershipRequested(_msgSender(), clubId);
	}

	function approveMembership(
		address user,
		uint256 clubId
	) external onlyStaffPrivileges {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		require(
			getMembershipRequestDate(user, clubId) > 0,
			"User has not requested membership"
		);
		require(
			getMember(user, clubId) == 0,
			"User is already a member in the club"
		);

		_isMember[user][clubId] = block.timestamp;
		_membershipRequestedAt[user][clubId] = 0;
		emit MembershipApproved(user, clubId);
	}

	function rejectMembership(
		address user,
		uint256 clubId
	) external onlyStaffPrivileges {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		require(
			getMembershipRequestDate(user, clubId) > 0,
			"User has not requested membership"
		);

		_membershipRequestedAt[user][clubId] = 0;
		emit MembershipRejected(user, clubId);
	}

	function revokMembership(
		address user,
		uint256 clubId
	) external onlyStaffPrivileges {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		require(getMember(user, clubId) > 0, "User is not member in the club");

		_isMember[user][clubId] = 0;
		emit MembershipRejected(user, clubId);
	}

	function getClubDetails(
		uint256 clubId
	) external view returns (ClubPresenter memory) {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		ClubDetails memory club = _clubs[clubId];
		address user = _msgSender();
		uint256 memberJoinedOn = getMember(user, club.id);
		uint256 membershipRequestedAt = getMembershipRequestDate(user, club.id);
		return
			ClubPresenter({
				id: club.id,
				name: club.name,
				creator: club.creator,
				createdOn: club.createdOn,
				joinedOn: memberJoinedOn,
				membershipRequestedOn: membershipRequestedAt
			});
	}

	function hasRequestedMembership(
		address user,
		uint256 clubId
	) external view onlyStaffPrivileges returns (bool) {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		return getMembershipRequestDate(user, clubId) > 0;
	}

	function didIRequestedMembership(
		uint256 clubId
	) external view returns (bool) {
		require(clubId <= _clubIds.current(), "Invalid club ID");
		return getMembershipRequestDate(_msgSender(), clubId) > 0;
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
			getMember(_msgSender(), clubId) > 0,
			"User is not member in the club"
		);
		_isMember[_msgSender()][clubId] = 0;
		emit LeftClub(_msgSender(), clubId);
	}

	function getPageCursor(
		uint256 page,
		uint256 pageSize
	) internal view returns (uint256, uint256) {
		uint256 length = _clubIds.current();

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

	function getClubs(
		uint256 page,
		uint256 pageSize
	) external view returns (ClubPresenter[] memory) {
		require(pageSize > 0 && pageSize <= 100, "Invalid page size number!");
		require(page > 0 , "Invalid page number!");
		(uint256 startItemIndex, uint256 endItemIndex) = getPageCursor(
			page,
			pageSize
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
			uint256 memberJoinedOn = getMember(user, club.id);
			uint256 membershipRequestedAt = getMembershipRequestDate(
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
