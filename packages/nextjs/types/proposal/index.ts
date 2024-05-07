export interface ProposalRecord {
  id: bigint;
  clubId: bigint;
  creator: string;
  title: string;
  description: string;
  choices: readonly ChoiceRecord[];
  status: number;
  votingStartTime: bigint;
  votingEndTime: bigint;
}

export interface ChoiceRecord {
  description: string;
  votes: number;
}

export const VotingStatus = {
  0: "Pending",
  1: "Active",
  2: "Passed",
  3: "Rejected",
};
