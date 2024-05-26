import Link from "next/link";
import { Card, CardContent } from "../core/card";
import { Map } from "../core/map";
import { Address } from "../scaffold-eth";
import { useGetProposals } from "~~/hooks/services/use-get-proposals";
import { ProposalPresnter, VotingStatus } from "~~/types/proposal";

enum ProposalStatus {
  Pending = 0,
  Active = 1,
  Passed = 2,
  Rejected = 3,
}

export const ProposalComponent = ({ id }: { id: number }) => {
  const {
    contractName: proposalContract,
    deployedContractLoading,
    deployedContractData,
    payload: proposals,
    isLoading,
    pagination,
    noMoreResults,
    emptyResults,
    handleLoadMore,
  } = useGetProposals({ clubId: id });

  const getDate = (date: bigint) => (Number(date) > 0 ? new Date(Number(date) * 1000).toLocaleString() : "N/A");

  if (deployedContractLoading) {
    return (
      <div className="text-center mt-14">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!deployedContractData) {
    return (
      <div className="text-center">
        <p className="text-1xl mt-14">{`No contract found by the name of "${proposalContract}"!`}</p>
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

  if (!proposalContract) {
    return <p className="text-3xl mt-14 text-gray-500">No contract found by the name of Propoasl on chain!</p>;
  }

  return (
    <div>
      <Map<ProposalPresnter>
        items={proposals}
        renderItem={(proposal, index) => (
          <div key={index} className="z-10">
            <Card>
              <CardContent>
                <div className="divide-y divide-base-300">
                  <div className="flex justify-between">
                    <Address address={proposal.creator} />
                    <span className="bg-gray-100 text-gray-800 text-sm font-medium me-2 px-3 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">
                      {VotingStatus.hasOwnProperty(proposal.status)
                        ? VotingStatus[proposal.status as ProposalStatus]
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <Link href={`/club/${id}/proposal/${proposal.proposalId}`}>
                    <span className="mt-2 font-bold text-2xl relative break-words pr-[80px] leading-[32px]">
                      {proposal.title}
                    </span>
                    <p className="line-clamp-2 break-words text-md font-semibold">{proposal.description}</p>
                  </Link>
                  <span>Ends In {getDate(proposal.votingStartTime)}</span>
                  {/* <div>
                    <Map<ChoiceRecord>
                      items={proposal.choices as unknown as ChoiceRecord[]}
                      renderItem={choice => <div className="">{choice.description}</div>}
                    />
                  </div> */}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      />
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
    </div>
  );
};
