import * as React from "react";
import { Address } from "../scaffold-eth";
import { BackButton } from "~~/app/blockexplorer/_components";
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
          <div className="flex justify-start mb-5">
            <BackButton />
          </div>
          <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <span className="font-bold">{club.name}</span>
                <Address address={club.creator} />
                <div className="flex gap-1 items-center mt-2">
                  <span className="text-sm">Joined On:</span>
                  <small className="px-0">{joinedOn}</small>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-sm">Requested On:</span>
                  <small className="px-0">{requestedOn}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="z-10">
            <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-10 relative">
              <div className="p-5 divide-y divide-base-300">
                {/* <ContractReadMethods deployedContractData={deployedContractData} /> */}
                Create proposal placholder
              </div>
            </div>
          </div>
          <div className="z-10">
            <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-2 relative">
              <div className="p-5 divide-y divide-base-300">
                {/* <ContractWriteMethods
                    deployedContractData={deployedContractData}
                    onChange={triggerRefreshDisplayVariables}
                  /> */}
                Proposals placholder
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
