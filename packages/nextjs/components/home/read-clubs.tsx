"use client";

import * as React from "react";
import Link from "next/link";
import JoinButton from "../JoinClub";
import { Card, CardContent } from "../core/card";
import { Map } from "../core/map";
import { Skeleton } from "../core/skeleton";
import { Address } from "../scaffold-eth";
import type { NextPage } from "next";
import { useRole } from "~~/hooks/context/use-context-role";
import { useGetClubs } from "~~/hooks/services/use-get-clubs";
import { ClubDetails } from "~~/types/club";

const ClubsList: NextPage = () => {
  const {
    deployedContractData: ClubContract,
    deployedContractLoading: ClubContractLoading,
    handleLoadMore,
    noMoreResults,
    emptyResults,
    payload: clubs,
    pagination,
    isLoading,
  } = useGetClubs();

  const { role } = useRole();

  if (ClubContractLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (emptyResults) {
    return (
      <div className="text-center text-gray-500">
        <p className="text-1xl mt-14">No record found!</p>
      </div>
    );
  }

  if (!ClubContract) {
    return <p className="text-3xl text-gray-500 text-center mt-14">No contract found by the name of Club on chain!</p>;
  }

  return (
    <>
      <div className="flex flex-col space-y-1">
        <h3 className="font-semibold leading-none tracking-tight">Club Listing</h3>
        <p className="text-sm text-muted-foreground">Join your favouriate clubs.</p>
      </div>
      {clubs.length > 0 && (
        <div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Map<ClubDetails>
              items={clubs}
              renderItem={(item, index) => (
                <Card key={index}>
                  <CardContent>
                    <div className="flex flex-col items-center text-ellipsis overflow-hidden">
                      <div className="flex items-start justify-start gap-1 truncate">
                        <h2 className="m-0 !h-[30px] p-0 text-[22px]">
                          <Link href={`/club/${item.id}`}>
                            <span className="font-bold">{item.name}</span>
                          </Link>
                        </h2>
                      </div>
                      <Address address={item.creator} />
                      <p className="my-0 text-sm mb-4">
                        ID: <b>#{item.id.toString()}</b>{" "}
                      </p>
                      {role && !["ADMIN", "MODERATOR", "CS"].includes(role) && (
                        <JoinButton
                          status={
                            item.membershipRequestedOn !== BigInt(0)
                              ? "requested"
                              : item.joinedOn !== BigInt(0)
                              ? "member"
                              : "nan"
                          }
                          clubId={item.id}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            />
          </div>
          <div className="flex justify-center mt-4">
            {!noMoreResults && clubs.length !== 0 && clubs.length % pagination.pageSize === 0 && (
              <button
                disabled={isLoading}
                onClick={handleLoadMore}
                className="btn btn-secondary btn-sm tune-button w-full"
              >
                {isLoading && <span className="loading loading-spinner loading-sm"></span>}
                Load More
              </button>
            )}
            {noMoreResults ||
              (clubs.length % pagination.pageSize !== 0 && (
                <p className="text-center text-gray-500">All clubs loaded.</p>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ClubsList;
