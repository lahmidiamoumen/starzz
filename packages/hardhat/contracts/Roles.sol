// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract Roles is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant FAN_ROLE = keccak256("FAN_ROLE");

    event ModeratorRoleGranted(address indexed account);
    event ModeratorRoleRevoked(address indexed account);

    constructor() {
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Roles: caller is not an admin");
        _;
    }

    modifier onlyAdminOrModerator() {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(MODERATOR_ROLE, msg.sender), "Roles: caller is not admin or moderator");
        _;
    }

    modifier onlyModerator() {
        require(hasRole(MODERATOR_ROLE, msg.sender) && isModerator(msg.sender), "Roles: caller is not a moderator for this club");
        _;
    }

    modifier onlyFan(address club) {
        require(hasRole(FAN_ROLE, msg.sender), "Roles: caller is not a fan of this club");
        _;
    }

    function grantModeratorRole(address account) public onlyAdmin {
        require(!hasRole(MODERATOR_ROLE, account), "User is already a moderator");
        grantRole(MODERATOR_ROLE, account);
        emit ModeratorRoleGranted(account);
    }

    function revokeModeratorRole(address account) public onlyAdmin {
        require(hasRole(MODERATOR_ROLE, account), "User is not a moderator");
        revokeRole(MODERATOR_ROLE, account);
        emit ModeratorRoleRevoked(account);
    }

    function isModerator(address account) public view returns (bool) {
        return hasRole(MODERATOR_ROLE, account);
    }

}
