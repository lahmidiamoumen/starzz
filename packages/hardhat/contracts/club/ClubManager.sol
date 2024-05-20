// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./ClubRecord.sol";


library ClubManager {
	using Counters for Counters.Counter;

	struct ClubData {
		mapping(uint256 => mapping(uint256 => ClubRecord)) clubs;
		mapping(uint256 => Counters.Counter) clubsIds;
	}

}
