"use client";

import * as React from "react";
import CastingVote from "./_components/casting-vote";
import { VotingSetup } from "./_components/voting-time-component";
import { BackButton } from "~~/app/blockexplorer/_components";
import { Card, CardContent, CardTitle } from "~~/components/core/card";
import { Map } from "~~/components/core/map";
import { Skeleton } from "~~/components/core/skeleton";
import { Address } from "~~/components/scaffold-eth";
import { useRole } from "~~/hooks/context/use-context-role";
import { useGetProposal } from "~~/hooks/services/use-get-proposal";
import { ChoiceRecord, ProposalStatus, VotingStatus } from "~~/types/proposal";

type PageProps = {
  params: { id: number; proposalId: number };
};

const ShowProposal = ({ params }: PageProps) => {
  const clubId = params?.id as number;
  const proposalId = params?.proposalId as number;

  const {
    contractName,
    isLoadingData,
    deployedContractData,
    payload: proposal,
    isSuccess,
  } = useGetProposal({ proposalId, clubId });

  const { role } = useRole();

  const totalVotes = React.useMemo(() => {
    if (!proposal || !proposal.choices) {
      return 0;
    }
    return proposal.choices.reduce((total, choice) => total + choice.votes, 0);
  }, [proposal]);
  if (isLoadingData || (isSuccess && !proposal) || !deployedContractData || proposal === null) {
    return (
      <div className="w-full max-w-6xl text-center mt-5 flex flex-col gap-3">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            <Skeleton className="h-[90px] w-full rounded-xl" />
            <Skeleton className="h-[20px] w-[200px] rounded-xl" />
            <Skeleton className="h-[20px] w-[200px] rounded-xl" />
            <Skeleton className="h-[50px] w-full rounded-xl" />
            <Skeleton className="h-[30px] w-[200px] rounded-xl" />
          </div>
          <div className="col-span-1 flex flex-col gap-2">
            <Skeleton className="h-[50px] w-full rounded-xl" />
            <Skeleton className="h-[20px] w-[200px] rounded-xl" />
            <Skeleton className="h-[20px] w-[100px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess && proposal === null) {
    return <p className="text-3xl mt-14">{`No record found by the name of "${contractName}"!`}</p>;
  }

  return (
    <div className="w-full max-w-6xl my-0">
      <BackButton />
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="z-10 gap-2 flex flex-col">
            <h1 className="font-bold text-3xl my-4 lg:block">{proposal.title}</h1>
            {VotingStatus[proposal.status as ProposalStatus]}
            <Address address={proposal.creator} />
            <span>{proposal.proposalId}</span>
            <p className="ml-2 mt-4 block mb-2 text-gray-900 dark:text-white">{proposal.description}</p>
          </div>
          {role &&
            ["ADMIN", "MODERATOR"].includes(role) &&
            (proposal.status as ProposalStatus) === ProposalStatus.Pending && (
              <VotingSetup clubId={clubId} proposalId={proposalId} />
            )}
          <CastingVote
            clubId={clubId}
            proposalId={proposalId}
            choices={proposal.choices}
            status={proposal.status as ProposalStatus}
          />
        </div>
        <div className="col-span-1 flex flex-col gap-2">
          <Card>
            <CardTitle>Information</CardTitle>
            <CardContent>
              <div className="text-gray-500 space-y-3 mt-3">
                <div>
                  <b>Voting system</b>
                  <span className="float-right text-skin-link">Single choice voting</span>
                </div>
                <div>
                  <b>Start Time</b>
                  <span className="float-right text-skin-link">{getDate(proposal.votingStartTime)}</span>
                </div>
                <div>
                  <b>End Time</b>
                  <span className="float-right text-skin-link">{getDate(proposal.votingEndTime)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardTitle>Current results</CardTitle>
            <CardContent>
              <div className="pt-3">
                <Map<ChoiceRecord>
                  items={proposal.choices.slice()}
                  renderItem={(choice, index) => (
                    <div key={index} className="space-y-3">
                      <div className="mb-1 flex justify-between text-skin-link">
                        <div className="flex overflow-hidden">
                          <span className="mr-1 truncate">{choice.description}</span>
                        </div>
                        <div className="flex justify-end">
                          <span>{formatPercentage(choice.votes, totalVotes)}</span>
                        </div>
                      </div>
                      <progress
                        className="progress relative flex h-2 overflow-hidden rounded-full"
                        value={totalVotes > 0 ? (choice.votes / totalVotes) * 100 : 0}
                        max="100"
                        aria-valuenow={totalVotes > 0 ? (choice.votes / totalVotes) * 100 : 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></progress>
                    </div>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const getDate = (date: bigint) => (Number(date) > 0 ? new Date(Number(date) * 1000).toLocaleString() : "N/A");

const formatPercentage = (votes: number, totalVotes: number): string => {
  if (totalVotes === 0) return "0%";
  const percentage = (votes / totalVotes) * 100;
  return Number.isInteger(percentage) ? `${percentage}%` : `${percentage.toFixed(2)}%`;
};

export default ShowProposal;
