// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;


interface IUser {
    function hasRole(address user, UserManagement.Role role) external view returns (bool);
}

contract UserManagement is IUser {
    enum Role { Admin, Moderator, Fan }
    mapping(address => UserRecord) private _users;

    struct UserRecord {
        string name;
        Role role;
    }

    event UserRegistered(address indexed account, string name);

    modifier onlyUnregisteredUser(address account) {
        require(!_isUserRegistered(account), "UserManagement: user already registered");
        _;
    }

    modifier onlyAdmin() {
        require(_users[msg.sender].role == Role.Admin, "UserManagement: only Admin can call this function");
        _;
    }

    function hasRole(address user, Role role) external view override returns (bool) {
        return _users[user].role == role;
    }

    function addModerator(address user) public onlyAdmin {
        _users[user].role = Role.Moderator;
    }

    function setUserAsFan(address user) public onlyAdmin {
        _users[user].role = Role.Fan;
    }

    function addAdmin(address user) public onlyAdmin {
        _users[user].role = Role.Admin;
    }

    function registerUser(address account, string calldata name) external onlyUnregisteredUser(account) {
        require(bytes(name).length > 0, "UserManagement: name cannot be empty");
        _users[account] = UserRecord(name, Role.Fan);
        emit UserRegistered(account, name);
    }

    function getUser(address account) external view returns (string memory) {
        return _users[account].name;
    }

    function isUserRegistered(address account) external view returns (bool) {
        return _isUserRegistered(account);
    }

    function _isUserRegistered(address account) internal view returns (bool) {
        return bytes(_users[account].name).length > 0;
    }
}
