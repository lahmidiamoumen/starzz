"use client";

import * as React from "react";
import Link from "next/link";
import { Address } from "../scaffold-eth";
// Use useMemo for optimized pagination calculations
import type { NextPage } from "next";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useGetClubs } from "~~/hooks/services/use-get-clubs";

const ClubsList: NextPage = () => {
  const {
    deployedContractData: ClubContract,
    deployedContractLoading: ClubContractLoading,
    handleLoadMore,
    payload: clubs,
    isSuccess,
    isLoading,
    pagination,
  } = useGetClubs();

  if (ClubContractLoading || (isSuccess && clubs.length === 0)) {
    return (
      <div className="mt-14">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!ClubContract) {
    return <p className="text-3xl mt-14">{`No contract found by the name of Club on chain!`}</p>;
  }

  return (
    <>
      {clubs.length > 0 && (
        <div className="scroll-smooth">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {clubs.map((item, index) => (
              <div
                key={index}
                className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4"
              >
                <div className="flex">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1 items-center">
                      <div className="flex items-center justify-center gap-1 truncate">
                        <h2 className="mb-0 mt-0 !h-[30px] overflow-hidden pb-0 text-[22px]">
                          <Link href={`/club/${item.id}`}>
                            <span className="font-bold">{item.name}</span>
                          </Link>
                        </h2>
                      </div>
                    </div>
                    <Address address={item.creator} />
                    <p className="my-0 text-sm text-center mb-4">
                      <span>ID: {item.id.toString()}</span>
                    </p>
                    {item.membershipRequestedOn !== BigInt(0) && (
                      <button className="btn btn-secondary btn-sm" disabled={true}>
                        Requested{" "}
                      </button>
                    )}
                    {item.joinedOn !== BigInt(0) && (
                      <button className="btn btn-secondary btn-sm" disabled={true}>
                        Joined{" "}
                      </button>
                    )}
                    {item.joinedOn === BigInt(0) && item.membershipRequestedOn === BigInt(0) && (
                      <JoinButton clubId={item.id} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            {clubs.length % pagination.pageSize === 0 && (
              <button
                disabled={isLoading}
                onClick={handleLoadMore}
                className="btn btn-secondary btn-sm tune-button w-full"
              >
                {isLoading && <span className="loading loading-spinner loading-sm"></span>}
                Load More
              </button>
            )}
            {clubs.length % pagination.pageSize !== 0 && <p className="text-center text-gray-500">All clubs loaded.</p>}
          </div>
        </div>
      )}
      {clubs.length === 0 && <span className="tune-button mt-4 w-full">No Clubs Created!</span>}
    </>
  );
};

const JoinButton = ({ clubId }: { clubId: bigint }): React.ReactNode => {
  const { isSuccess, isPending, writeContractAsync } = useScaffoldWriteContract("Club");

  const handleJoin = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "joinClub",
          args: [clubId],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error setting greeting", e);
      // notification.error(getParsedError(e));
    }
  };

  // React.useEffect(() => {
  //   if (error) {
  //     notification.error(getParsedError(error));
  //   }
  // }, [error]);

  return (
    <button disabled={isPending || isSuccess} onClick={handleJoin} type="button" className="btn btn-secondary btn-sm">
      {isPending && <span className="loading loading-spinner loading-sm"></span>}
      {isSuccess && !isPending && <span>Requested</span>}
      {!isSuccess && !isPending && <span>Join</span>}
    </button>
  );
};

export default ClubsList;
