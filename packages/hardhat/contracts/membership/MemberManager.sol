// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./MemberRecord.sol";

library MemberManager {
	using Counters for Counters.Counter;

	struct MemberData {
		mapping(uint256 => mapping(uint256 => MemberRecord)) members;
		mapping(address => mapping(uint256 => uint256)) indexByAddress;
		mapping(uint256 => uint256) indexOf;
		mapping(uint256 => Counters.Counter) memberIds;
		mapping(uint256 => uint256[]) keys;
	}

	function current(
		MemberData storage data,
		uint256 clubId
	) internal view returns (uint256) {
		return data.keys[clubId].length;
	}

	function grantMembership(
		MemberData storage data,
		address user,
		uint256 clubId
	) internal {
		require(
			data.indexByAddress[user][clubId] == 0,
			"Membership request already submitted"
		);
		data.memberIds[clubId].increment();
		uint256 memberId = data.memberIds[clubId].current();

    data.indexOf[memberId] = data.keys[clubId].length;
		data.keys[clubId].push(memberId);
		data.indexByAddress[user][clubId] = memberId;
		data.members[clubId][memberId] = MemberRecord(user, block.timestamp);
	}

	function revokeMembership(
		MemberData storage data,
		address user,
		uint256 clubId
	) internal {
		uint256 memberId = data.indexByAddress[user][clubId];
		require(
			memberId != 0,
			"Membership has not requested"
		);
		delete data.members[clubId][memberId];
		delete data.indexByAddress[user][clubId];

		uint256 index = data.indexOf[memberId];
		uint256 lastKey = data.keys[clubId][data.keys[clubId].length - 1];

		data.indexOf[lastKey] = index;
		delete data.indexOf[memberId];

		data.keys[clubId][index] = lastKey;
		data.keys[clubId].pop();
	}

	function getMember(
		MemberData storage data,
		address user,
		uint256 clubId
	) internal view returns (MemberRecord memory) {
		uint256 memberId = data.indexByAddress[user][clubId];
		return data.members[clubId][memberId];
	}

	function getMemberByIndex(
		MemberData storage data,
		uint256 index,
		uint256 clubId
	) internal view returns (MemberRecord memory) {
		uint256 memberId = data.keys[clubId][index];
		return data.members[clubId][memberId];
	}

	function isMember(
		MemberData storage data,
		address user,
		uint256 clubId
	) internal view returns (bool) {
		return data.indexByAddress[user][clubId] != 0;
	}

	function getMemberID(
		MemberData storage data,
		address user,
		uint256 clubId
	) internal view returns (uint256) {
		return data.indexByAddress[user][clubId];
	}

}
