import { Map } from "../core/map";
import { Address } from "../scaffold-eth";
import { useGetProposals } from "~~/hooks/services/use-get-proposals";
import { ProposalRecord, VotingStatus } from "~~/types/proposal";

enum ProposalStatus {
  Pending = 0,
  Active = 1,
  Passed = 2,
  Rejected = 3,
}

export const ProposalComponent = ({ id }: { id: number }) => {
  id;

  const {
    // contractName,
    // deployedContractLoading,
    // deployedContractData,
    payload: proposals,
    // isLoading,
    // isSuccess,
  } = useGetProposals();
  const getDate = (date: bigint) => (Number(date) > 0 ? new Date(Number(date) * 1000).toLocaleString() : "N/A");

  return (
    <Map<ProposalRecord>
      items={proposals}
      renderItem={proposal => (
        <div className="z-10">
          <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-2 relative">
            <div className="p-5 divide-y divide-base-300">
              <div className="flex justify-between">
                <Address address={proposal.creator} />
                <span className="bg-gray-100 text-gray-800 text-sm font-medium me-2 px-3 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  {VotingStatus.hasOwnProperty(proposal.status)
                    ? VotingStatus[proposal.status as ProposalStatus]
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="px-16 sm:p-4">
              <h2 className="font-bold text-2xl">{proposal.title}</h2>
              <p>{proposal.description}</p>
              <p>{getDate(proposal.votingStartTime)}</p>
              {/* <div>
                <Map<ChoiceRecord>
                  items={proposal.choices as unknown as ChoiceRecord[]}
                  renderItem={choice => <div className="">{choice.description}</div>}
                />
              </div> */}
            </div>
          </div>
        </div>
      )}
    />
  );
};
