import { ComponentProps } from "react";
import Link from "next/link";
import { Badge } from "~~/components/core/badge";
import { Map } from "~~/components/core/map";
import { Skeleton } from "~~/components/core/skeleton";
import { Address } from "~~/components/scaffold-eth";
import { useGetProposals } from "~~/hooks/services/use-get-proposals";
import { ProposalPresnter, VotingStatus } from "~~/types/proposal";
import { clsx as cn } from "~~/utils/scaffold-eth/clsx";

interface ProposalsListProps {
  clubId: number;
}

enum ProposalStatus {
  Pending = 0,
  Active = 1,
  Passed = 2,
  Rejected = 3,
}

export function ProposalsList({ clubId }: ProposalsListProps) {
  const {
    deployedContractLoading,
    payload: proposals,
    isLoading,
    pagination,
    noMoreResults,
    emptyResults,
    handleLoadMore,
  } = useGetProposals({ clubId });

  const getDate = (date: bigint) => (Number(date) > 0 ? new Date(Number(date) * 1000).toLocaleString() : "N/A");

  if (deployedContractLoading) {
    return (
      <div className="text-center mt-5 flex flex-col gap-3">
        <Skeleton className="h-[140px] w-full rounded-xl" />
        <Skeleton className="h-[140px] w-full rounded-xl" />
        <Skeleton className="h-[140px] w-full rounded-xl" />
      </div>
    );
  }

  if (emptyResults) {
    return (
      <div className="text-center text-base-content">
        <p className="text-1xl mt-14">{`No record found!`}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2 pt-0">
        <Map<ProposalPresnter>
          items={proposals}
          renderItem={(proposal, index) => (
            <div key={index} className="z-10">
              <Link
                href={`/club/${clubId}/proposal/${proposal.proposalId}`}
                key={proposal.proposalId}
                className="flex flex-col items-start gap-2 rounded-lg border p-5 text-left text-base transition-all hover:bg-accent"
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{proposal.title}</div>
                      {/* {!item.read && <span className="flex h-2 w-2 rounded-full bg-blue-600" />} */}
                    </div>
                    <div className={cn("ml-auto text-base")}>{getDate(proposal.votingStartTime)}</div>
                  </div>
                  <div className="text-base font-medium">
                    <Address address={proposal.creator} />
                  </div>
                </div>
                <div className="line-clamp-2 text-base text-muted-foreground">
                  {proposal.description.substring(0, 300)}
                </div>
                {VotingStatus.hasOwnProperty(proposal.status) && (
                  <Badge variant={getBadgeVariantFromLabel(VotingStatus[proposal.status as ProposalStatus])}>
                    {VotingStatus[proposal.status as ProposalStatus]}
                  </Badge>
                )}
              </Link>
            </div>
          )}
        />
      </div>
      <div className=" mt-4">
        {!noMoreResults && proposals.length !== 0 && proposals.length % pagination.pageSize === 0 && (
          <button disabled={isLoading} onClick={handleLoadMore} className="btn btn-secondary btn-sm tune-button w-full">
            {isLoading && <span className="loading loading-spinner loading-sm"></span>}
            Load More
          </button>
        )}
        {noMoreResults ||
          (proposals.length % pagination.pageSize !== 0 && (
            <p className="text-center text-gray-500">All Proposals loaded.</p>
          ))}
      </div>
    </>
  );
}

function getBadgeVariantFromLabel(label: string): ComponentProps<typeof Badge>["variant"] {
  switch (label) {
    case "Active":
      return "default";
    case "Pending":
      return "secondary";
    case "Passed":
      return "outline";
    case "Rejected":
      return "destructive";
    default:
      return "secondary";
  }
}
