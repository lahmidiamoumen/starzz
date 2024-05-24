"use client";

import * as React from "react";
import { Button } from "~~/components/core/button";
import { Card, CardContent } from "~~/components/core/card";
import { Map } from "~~/components/core/map";
import { usePostingVote } from "~~/hooks/services/use-post-vote";
import { ChoiceRecord, ProposalStatus } from "~~/types/proposal";

type Props = {
  choices: readonly {
    description: string;
    votes: number;
  }[];
  status: ProposalStatus;
  clubId: number;
  proposalId: number;
};

const CastingVote = ({ choices, status, clubId, proposalId }: Props) => {
  const { selectedChoice, setSelectedChoice, handleSubmit } = usePostingVote({ clubId, proposalId });

  return (
    <Card className="mt-10">
      <CardContent>
        <h3 className="font-bold text-2xl mb-4 lg:block">Cast your vote</h3>
        <div className="form-control">
          <Map<ChoiceRecord>
            items={choices.slice()}
            renderItem={(choice, index) => (
              <label key={index} className="label cursor-pointer border border-base-300 rounded-xl p-2 px-4 my-1">
                <span className="label-text">{choice.description}</span>
                <input
                  disabled={status !== ProposalStatus.Active}
                  type="checkbox"
                  checked={index === selectedChoice}
                  onChange={() => setSelectedChoice(index)}
                  className="checkbox checkbox-primary"
                />
              </label>
            )}
          />
        </div>
        {status === ProposalStatus.Active && (
          <div className="flex items-end">
            <Button
              disabled={selectedChoice === null}
              onClick={handleSubmit}
              size="sm"
              className="mt-3 btn btn-sm ml-auto"
            >
              Vote
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CastingVote;
