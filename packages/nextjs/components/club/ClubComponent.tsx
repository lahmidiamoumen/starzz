import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "../core/card";
import { ProposalsList } from "~~/app/club/[id]/_components/proposal-list";

export const Proposals = ({ id }: { id: number }) => {
  return (
    <div className="col-span-1 lg:col-span-2 flex flex-col gap-3">
      <div className="z-10">
        <h1 className="font-bold text-3xl mb-4 lg:block">Proposals</h1>
        <Card>
          <CardContent>
            <CreateProposal id={id.toString()} />
          </CardContent>
        </Card>
      </div>
      <div className="z-10">
        <ProposalsList clubId={id} />
      </div>
    </div>
  );
};

const CreateProposal = ({ id }: { id: string }): React.JSX.Element => {
  return (
    <div className="flex flex-col justify-between gap-x-3 gap-y-[10px] sm:flex-row ">
      <div className="w-full pr-0 md:max-w-[340px]">
        <label className="input input-bordered flex items-center gap-2">
          <input type="text" className="grow focus:outline-none" placeholder="Search" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </label>
      </div>
      <Link href={`/club/${id}/create-proposal`}>
        <span className="bg-transparent border input-bordered hover:border-transparent rounded-full btn btn-outlin">
          Create Proposal
        </span>
      </Link>
    </div>
  );
};
