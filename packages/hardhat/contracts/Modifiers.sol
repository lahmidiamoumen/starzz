// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.0;

import "./IRoles.sol";

contract Modifiers is IRoles {
  modifier onlyRole(Role allowedRole) {
    require(hasRole(msg.sender, allowedRole), "Unauthorized action");
    _;
  }

  function hasRole(address user, Role role) internal view returns (bool) {
    User userContract = User(user);
    return userContract.hasRole(role);
  }
}
