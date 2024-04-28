// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

contract IClub {
    function isMember(address user, uint256 clubId) external view returns (bool);
}