"use client";

import * as React from "react";
import CastingVote from "./_components/casting-vote";
import { VotingSetup } from "./_components/voting-time-component";
import { BackButton } from "~~/app/blockexplorer/_components";
import { Card, CardContent, CardTitle } from "~~/components/core/card";
import { Map } from "~~/components/core/map";
import { Address } from "~~/components/scaffold-eth";
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

  if (isLoadingData || (isSuccess && !proposal)) {
    return (
      <div className="mt-14">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!deployedContractData) {
    return <p className="text-3xl mt-14">{`No contract found by the name of "${contractName}"!`}</p>;
  }

  if (proposal === null) {
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
          {(proposal.status as ProposalStatus) === ProposalStatus.Pending && (
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
                  <b>Start Date</b>
                  <span className="float-right text-skin-link">Not set</span>
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
                          <span>{26}%</span>
                        </div>
                      </div>
                      <progress
                        className="progress relative flex h-2 overflow-hidden rounded-full"
                        value={40}
                        max="100"
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

export default ShowProposal;
