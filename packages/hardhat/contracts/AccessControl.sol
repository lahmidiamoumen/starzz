// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "./IRoles.sol";

contract AccessControl is IRoles {

    struct UserRecord {
        uint256 userId;
        string username;
        Role role;
    }

    mapping(address => UserRecord) private _users;
    mapping(uint256 => address) private _addressesById;
    uint256 private _userCount;

    event RoleAssigned(address indexed account, uint256 userId, Role role);
    event UserRegistered(address indexed account, string username);

    modifier onlyUnregisteredUser(address account) {
        require(!_isUserRegistered(account), "UserManagement: user already registered");
        _;
    }

    modifier onlyRole(Role role) {
        require(getRole(msg.sender) == role, "AccessControl: caller does not have the required role");
        _;
    }

    function assignRole(address account, uint256 userId, string calldata username, Role role) external onlyRole(Role.Admin) {
        require(role != Role.Admin, "AccessControl: cannot assign Sysadmin role");
        require(_users[account].userId == 0, "AccessControl: user already registered");
        
        _userCount++;
        _users[account] = UserRecord(userId, username, role);
        _addressesById[userId] = account;
        emit RoleAssigned(account, userId, role);
    }

    function getRole(address account) public view returns (Role) {
        return _users[account].role;
    }

    function getUserId(address account) external view returns (uint256) {
        return _users[account].userId;
    }

    function getAddressById(uint256 userId) external view returns (address) {
        return _addressesById[userId];
    }

    function isAdmin(address account) external view returns (bool) {
        return getRole(account) == Role.Admin;
    }

    function isModerator(address account) external view returns (bool) {
        return getRole(account) == Role.Moderator;
    }

    function isFan(address account) external view returns (bool) {
        return getRole(account) == Role.Fan;
    }

    function hasRole(Role role) external view returns (bool) {
        return getRole(msg.sender) == role;
    }

    function hasRole(address user, Role role) external view returns (bool) {
        return _users[user].role == role;
    }


    function addModerator(address user) public onlyRole(Role.Admin) {
        _users[user].role = Role.Moderator;
    }

    function setUserAsFan(address user) public onlyRole(Role.Admin) {
        _users[user].role = Role.Fan;
    }

    function addAdmin(address user) public onlyRole(Role.Admin) {
        _users[user].role = Role.Admin;
    }

    function registerUser(address account, uint256 userId, string calldata username) external onlyUnregisteredUser(account) {
        require(bytes(username).length > 0, "UserManagement: username cannot be empty");
        _users[account] = UserRecord(userId, username, Role.Fan);
        emit UserRegistered(account, username);
    }

    function getUser(address account) external view returns (string memory) {
        return _users[account].username;
    }

    function isUserRegistered(address account) external view returns (bool) {
        return _isUserRegistered(account);
    }

    function _isUserRegistered(address account) internal view returns (bool) {
        return bytes(_users[account].username).length > 0;
    }
}
