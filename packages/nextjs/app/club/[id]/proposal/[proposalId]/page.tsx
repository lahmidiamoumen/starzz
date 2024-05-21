"use client";

import * as React from "react";
import { BackButton } from "~~/app/blockexplorer/_components";
import { Button } from "~~/components/core/button";
import { Card, CardContent, CardTitle } from "~~/components/core/card";
import { Map } from "~~/components/core/map";
import { Address } from "~~/components/scaffold-eth";
import { useGetProposal } from "~~/hooks/services/use-get-proposal";
import { ChoiceRecord } from "~~/types/proposal";

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

  const [selectedChoice, setSelectedChoice] = React.useState<number | null>(null);

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
            <Card>
              <CardContent>
                <h1 className="font-bold text-3xl my-4 lg:block">{proposal.title}</h1>
                <Address address={proposal.creator} />
                <p className="ml-2 mt-4 block mb-2 text-gray-900 dark:text-white">{proposal.description}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <h3 className="font-bold text-2xl mb-4 lg:block">Cast your vote</h3>
                <div className="form-control">
                  <Map<ChoiceRecord>
                    items={proposal.choices.slice()}
                    renderItem={(choice, index) => (
                      <label
                        key={index}
                        className="label cursor-pointer border border-base-300 rounded-xl p-2 px-4 my-1"
                      >
                        <span className="label-text">{choice.description}</span>
                        <input
                          type="checkbox"
                          checked={index === selectedChoice}
                          onChange={() => setSelectedChoice(index)}
                          className="checkbox checkbox-primary"
                        />
                      </label>
                    )}
                  />
                </div>
                <div className="flex items-end">
                  {/* <Label htmlFor="mute" className="flex items-center gap-2 text-xs font-normal">
                    <Switch id="mute" aria-label="Mute thread" /> Mute this thread
                  </Label> */}
                  <Button
                    disabled={selectedChoice === null}
                    onClick={e => e.preventDefault()}
                    size="sm"
                    className="mt-3 btn btn-sm ml-auto"
                  >
                    Vote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
                  <span className="float-right text-skin-link">Single choice voting</span>
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
