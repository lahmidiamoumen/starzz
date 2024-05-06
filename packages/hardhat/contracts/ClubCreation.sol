// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "@openzeppelin/contracts/utils/Counters.sol";

// contract ClubCreation {
//     using Counters for Counters.Counter;

//     Counters.Counter private _clubIds;
//     mapping(uint256 => ClubDetails) public clubs;

//     event ClubCreated(uint256 clubId, string name, address creator);

//     struct ClubDetails {
//         uint256 id;
//         string name;
//         address creator;
//         uint256 createdOn;
//     }

//     function createClub(string memory name) external onlyAdminOrModerator {
//         require(getStringLength(name) > 3 && getStringLength(name) < 44, "Invalid club name");
//         uint256 clubId = _clubIds.current();
//         _clubIds.increment();

//         clubs[clubId] = ClubDetails(clubId, name, msg.sender, block.timestamp);
//         emit ClubCreated(clubId, name, msg.sender);
//     }

//     function isValidClubId(uint256 clubId) external view returns (bool) {
//         return clubId > 0 && clubId <= _clubIds.current();
//     }

//     function getClubCreator(uint256 clubId) external view returns (address) {
//         return clubs[clubId].creator;
//     }

//     function getStringLength(string memory _str) internal pure returns (uint) {
//         bytes memory strBytes = bytes(_str);
//         return strBytes.length;
//     }
// }
