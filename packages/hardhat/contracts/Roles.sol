// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IRoles.sol";

contract Roles is IRoles, AccessControl {
	bytes32 private constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
	bytes32 private constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
	bytes32 private constant FAN_ROLE = keccak256("FAN_ROLE");
	bytes32 private constant CS_ROLE = keccak256("CS_ROLE");

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
		_setRoleAdmin(CS_ROLE, ADMIN_ROLE);
		_setRoleAdmin(FAN_ROLE, MODERATOR_ROLE);
		_setRoleAdmin(CS_ROLE, MODERATOR_ROLE);
		_setRoleAdmin(FAN_ROLE, CS_ROLE);

		_setupRole(ADMIN_ROLE, _owner);
		owner = _owner;
	}

	modifier onlyAdmin() {
		require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not an admin");
		_;
	}

	modifier onlyCS() {
		require(
			hasRole(CS_ROLE, _msgSender()),
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

	function grantModeratorRole(address account) public onlyAdmin {
		require(
			!hasRole(MODERATOR_ROLE, account),
			"User is already a moderator"
		);
		grantRole(MODERATOR_ROLE, account);
		emit ModeratorRoleGranted(account);
	}

	function grantAdminRole(address account) public onlyAdmin {
		require(!hasRole(ADMIN_ROLE, account), "User is already an admin");
		grantRole(ADMIN_ROLE, account);
		emit AdminRoleGranted(account);
	}

	function revokeModeratorRole(address account) public onlyAdmin {
		require(hasRole(MODERATOR_ROLE, account), "User is not a moderator");
		revokeRole(MODERATOR_ROLE, account);
		emit ModeratorRoleRevoked(account);
	}

	function revokeAdminRole(address account) public onlyAdmin {
		require(hasRole(ADMIN_ROLE, account), "User is not an Admin");
		require(account != owner, "User is Supper Admin");

		revokeRole(ADMIN_ROLE, account);
		emit AdminRoleRevoked(account);
	}

	function grantCSRole(address account) public onlyAdminOrModerator {
		require(
			!hasRole(CS_ROLE, account),
			"User is not CS role for this club"
		);

		grantRole(CS_ROLE, account);
		emit CSRoleGranted(account);
	}

	function revokeCSRole(address account) public onlyAdminOrModerator {
		require(
			hasRole(CS_ROLE, account),
			"User does not have a CS role for this club"
		);

		revokeRole(CS_ROLE, account);
		emit CSRoleRevoked(account);
	}

	function isAdminOrModerator(address account) external view returns (bool) {
		return hasRole(ADMIN_ROLE, account) || hasRole(MODERATOR_ROLE, account);
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
