// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./IRoles.sol";

contract Roles is IRoles, AccessControlEnumerable {
	bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
	bytes32 private constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
	bytes32 private constant FAN_ROLE = keccak256("FAN_ROLE");
	bytes32 private constant CS_ROLE = keccak256("CS_ROLE");
	mapping(uint256 => address) private clubIdToCs;

	address private immutable owner;

	event ModeratorRoleGranted(address indexed account);
	event ModeratorRoleRevoked(address indexed account);

	event AdminRoleGranted(address indexed account);
	event AdminRoleRevoked(address indexed account);

	event CSRoleGranted(address indexed account);
	event CSRoleRevoked(address indexed account);

	constructor(address _owner) {
		_setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
		_setRoleAdmin(MODERATOR_ROLE, ADMIN_ROLE);
		_setRoleAdmin(FAN_ROLE, ADMIN_ROLE);
		_setRoleAdmin(CS_ROLE, MODERATOR_ROLE);
		_setRoleAdmin(CS_ROLE, ADMIN_ROLE);
		_setRoleAdmin(FAN_ROLE, CS_ROLE);

		_setupRole(ADMIN_ROLE, _owner);
		owner = _owner;
	}

	function getCsRole(uint256 clubId) external view returns (address) {
		return clubIdToCs[clubId];
	}

	modifier onlyAdmin() {
		require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not an admin");
		_;
	}

	modifier onlyCS(uint256 clubId) {
		require(
			hasRole(CS_ROLE, _msgSender()) && clubIdToCs[clubId] == _msgSender(),
			"Caller is not a CS for any club"
		);
		_;
	}

	modifier onlyAdminOrModerator() {
		require(
			hasRole(ADMIN_ROLE, _msgSender()) ||
				hasRole(MODERATOR_ROLE, _msgSender()),
			"Caller is not admin or moderator"
		);
		_;
	}

	modifier onlyModerator() {
		require(
			hasRole(MODERATOR_ROLE, _msgSender()),
			"Caller is not a moderator for this club"
		);
		_;
	}

	modifier onlyFan() {
		require(
			hasRole(FAN_ROLE, _msgSender()),
			"Caller is not a fan of any club"
		);
		_;
	}

	function grantModeratorRole(address account) public onlyAdminOrModerator() {
		require(account != address(0), "Invalid account address");
		require(
			!hasRole(MODERATOR_ROLE, account),
			"User is already a moderator"
		);
		grantRole(MODERATOR_ROLE, account);
		emit ModeratorRoleGranted(account);
	}

	function getRole(address account) external view returns (string memory) {
		require(account != address(0), "Invalid account address");
		if (hasRole(ADMIN_ROLE, account)) {
			return "ADMIN";
		} else if (hasRole(MODERATOR_ROLE, account)) {
			return "MODERATOR";
		} else if (hasRole(CS_ROLE, account)) {
			return "CS";
		} else {
			return "FAN";
		}
	}

	function grantAdminRole(address account) public onlyAdmin {
		require(account != address(0), "Invalid account address");
		require(!hasRole(ADMIN_ROLE, account), "User is already an admin");
		grantRole(ADMIN_ROLE, account);
		emit AdminRoleGranted(account);
	}

	function revokeModeratorRole(address account) external onlyAdmin {
		require(account != address(0), "Invalid account address");
		require(hasRole(MODERATOR_ROLE, account), "User is not a moderator");
		revokeRole(MODERATOR_ROLE, account);
		emit ModeratorRoleRevoked(account);
	}

	function revokeAdminRole(address account) external onlyAdmin {
		require(account != address(0), "Invalid account address");
		require(hasRole(ADMIN_ROLE, account), "User is not an Admin");
		require(account != owner, "User is Supper Admin");

		revokeRole(ADMIN_ROLE, account);
		emit AdminRoleRevoked(account);
	}

	function grantCSRole(address account, uint256 clubId) external onlyAdminOrModerator {
		require(account != address(0), "Invalid account address");
		require(
			!hasRole(CS_ROLE, account),
			"User is already a Community Steward for this club"
		);
		grantRole(CS_ROLE, account);
		clubIdToCs[clubId] = account;
		emit CSRoleGranted(account);
	}

	function revokeCSRole(address account) external onlyAdminOrModerator {
		require(
			hasRole(CS_ROLE, account),
			"User does not have a CS role for this club"
		);

		revokeRole(CS_ROLE, account);
		emit CSRoleRevoked(account);
	}

	function isCSOn(address account, uint256 clubId) external view returns (bool) {
		return hasRole(CS_ROLE, account) && clubIdToCs[clubId] == address(account);
	}

	function isAdminOrModerator(address account) external view returns (bool) {
		return hasRole(ADMIN_ROLE, account) || hasRole(MODERATOR_ROLE, account);
	}

	function getModerators(
		uint256 page,
		uint256 pageSize
	) public view returns (address[] memory) {
		return getMembers(page, pageSize, MODERATOR_ROLE);
	}

	function getAdmins(
		uint256 page,
		uint256 pageSize
	) public view returns (address[] memory) {
		return getMembers(page, pageSize, ADMIN_ROLE);
	}

	function getCSs(
		uint256 page,
		uint256 pageSize
	) public view returns (address[] memory) {
		return getMembers(page, pageSize, CS_ROLE);
	}

  function getAdminsCount() public view returns (uint256) {
    return getRoleMemberCount(ADMIN_ROLE);
  }

  function getModeratorsCount() public view returns (uint256) {
    return getRoleMemberCount(MODERATOR_ROLE);
  }

	function getPageCursor(
		uint256 page,
		uint256 pageSize,
		bytes32 role
	) private view returns (uint256, uint256) {
		uint256 length = getRoleMemberCount(role);
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
		uint256 page,
		uint256 pageSize,
		bytes32 role
	) private view returns (address[] memory) {
    require(pageSize > 0 && pageSize <= 100, "Invalid page size number!");
		require(page > 0, "Invalid page number!");
		(uint256 startItemIndex, uint256 endItemIndex) = getPageCursor(
			page,
			pageSize,
			role
		);

		uint256 count = startItemIndex - endItemIndex;

		if (count < 1) {
			return new address[](0);
		}
		address[] memory members = new address[](count);

		uint256 j = count - 1;
		for (uint256 i = endItemIndex; i < startItemIndex; ) {
			members[j] = getRoleMember(role, i);

			unchecked {
				++i;
				--j;
			}
		}

		return members;
	}

	function isStaff(address account) external view returns (bool) {
		return
			hasRole(ADMIN_ROLE, account) ||
			hasRole(MODERATOR_ROLE, account) ||
			hasRole(CS_ROLE, account);
	}

	function isCS(address account) external view returns (bool) {
		return hasRole(CS_ROLE, account);
	}

	function isModerator(address account) external view returns (bool) {
		return hasRole(MODERATOR_ROLE, account);
	}

	function isAdmin(address account) external view returns (bool) {
		return hasRole(ADMIN_ROLE, account);
	}

	function isFan(address account) external view returns (bool) {
		return hasRole(FAN_ROLE, account);
	}
}
