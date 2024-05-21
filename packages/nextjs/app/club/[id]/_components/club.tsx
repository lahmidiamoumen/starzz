"use client";

import * as React from "react";
import JoinButton from "~~/components/JoinClub";
import { Skeleton } from "~~/components/core/skeleton";
import { Address } from "~~/components/scaffold-eth";
import { useRole } from "~~/hooks/context/use-context-role";
import { useGetClub } from "~~/hooks/services/use-get-club";

export const ClubCard = ({ id }: { id: number }) => {
  const { contractName, payload: club, isLoading, isSuccess } = useGetClub({ id });

  const { role } = useRole();

  if (isLoading || (isSuccess && !club)) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (club === null) {
    return <p className="text-3xl mt-14">{`No record found by the name of "${contractName}"!`}</p>;
  }
  const joinedOn = Number(club.joinedOn) > 0 ? new Date(Number(club.joinedOn) * 1000).toLocaleString() : "N/A";
  const requestedOn =
    Number(club.membershipRequestedOn) > 0
      ? new Date(Number(club.membershipRequestedOn) * 1000).toLocaleString()
      : "N/A";

  return (
    <div className="gap-1 flex flex-col">
      <span>#{club.id.toString()}</span>
      <span className="font-bold">{club.name}</span>
      <Address address={club.creator} />
      {role && !["ADMIN", "MODERATOR", "CS"].includes(role) && (
        <>
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
              club.membershipRequestedOn !== BigInt(0) ? "requested" : club.joinedOn !== BigInt(0) ? "member" : "nan"
            }
            clubId={club.id}
          />
        </>
      )}
    </div>
  );
};
