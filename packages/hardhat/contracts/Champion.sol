// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "./AccessControl.sol";

contract Champion {
    AccessControl private _accessControl;

    uint256 id;
    string name;
    address creator;
    mapping(address => bool) private _followers;


    event ChampionFollowed(address indexed user);
    event ChampionUnfollowed(address indexed user);

    constructor(address accessControlAddress) {
        _accessControl = AccessControl(accessControlAddress);
    }

    modifier onlyFollower() {
        require(_followers[msg.sender], "Champion: caller is not a follower");
        _;
    }

    function followChampion() external {
        require(_accessControl.getRole(msg.sender) == AccessControl.Role.Fan, "Champion: caller must be a Fan");
        _followers[msg.sender] = true;
        emit ChampionFollowed(msg.sender);
    }

    function unfollowChampion() external onlyFollower {
        _followers[msg.sender] = false;
        emit ChampionUnfollowed(msg.sender);
    }

    function isFollower(address user) external view returns (bool) {
        return _followers[user];
    }
}