// SPDX-License-Identifier: MIT 
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./IRoles.sol";

interface IRoles {

    function isAdminOrModerator(address account) external view returns (bool);

    function isStaff(address account) external view returns (bool);

    function isCS(address account) external view returns (bool);

    function isModerator(address account) external view returns (bool);

    function isAdmin(address account) external view returns (bool);

    function isFan(address account) external view returns (bool);

    function getCsRole(uint256 clubId) external view returns (address);
}