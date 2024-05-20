// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Choice {
  string description;
  uint8 votes;
}

enum Status {
  Pending,
  Active,
  Passed,
  Rejected
}

struct ProposalRecord {
  address creator;
  string title;
  string description;
  Choice[] choices;
  Status status;
  uint256 votingStartTime;
  uint256 votingEndTime;
}

