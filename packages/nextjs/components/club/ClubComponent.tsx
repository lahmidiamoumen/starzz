import * as React from "react";
import Link from "next/link";
import JoinButton from "../JoinClub";
import { Card } from "../core/card";
import { ProposalComponent } from "../proposal";
import { Address } from "../scaffold-eth";
import { useGetClub } from "~~/hooks/services/use-get-club";

export const ClubComponent = ({ id }: { id: number }) => {
  const {
    contractName,
    deployedContractLoading,
    deployedContractData,
    payload: club,
    isLoading,
    isSuccess,
  } = useGetClub({ id });

  if (deployedContractLoading || isLoading || (isSuccess && !club)) {
    return (
      <div className="mt-14">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!deployedContractData) {
    return <p className="text-3xl mt-14">{`No contract found by the name of "${contractName}"!`}</p>;
  }

  if (club === undefined) {
    return <p className="text-3xl mt-14">{`No record found by the name of "${contractName}"!`}</p>;
  }
  const joinedOn = Number(club.joinedOn) > 0 ? new Date(Number(club.joinedOn) * 1000).toLocaleString() : "N/A";
  const requestedOn =
    Number(club.membershipRequestedOn) > 0
      ? new Date(Number(club.membershipRequestedOn) * 1000).toLocaleString()
      : "N/A";

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-6 px-6 lg:px-10 lg:gap-12 w-full max-w-7xl my-0`}>
      <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <Card>
            <div className="flex">
              <div className="flex flex-col gap-1">
                <span className="">#{club.id.toString()}</span>
                <span className="font-bold">{club.name}</span>
                <Address address={club.creator} />
                <div className="flex gap-1 items-center mt-2">
                  <span className="text-sm">Joined On:</span>
                  <small className="px-0">{joinedOn}</small>
                </div>
                <div className="flex gap-1 items-center pb-3">
                  <span className="text-sm">Requested On:</span>
                  <small className="px-0">{requestedOn}</small>
                </div>
                <JoinButton
                  status={
                    club.membershipRequestedOn !== BigInt(0)
                      ? "requested"
                      : club.joinedOn !== BigInt(0)
                      ? "member"
                      : "nan"
                  }
                  clubId={club.id}
                />
              </div>
            </div>
          </Card>
        </div>
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-3">
          <div className="z-10">
            <h1 className="font-bold text-3xl mb-4 lg:block">Proposals</h1>
            <Card>
              <CreateProposal id={club.id.toString()} />
            </Card>
          </div>
          <div className="z-10">
            <ProposalComponent id={id} />
          </div>
        </div>
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
