"use client";

import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";

type Props = {
  proposalId: number;
  clubId: number;
};
const contractName = "Proposal";

export const useHasVoted = ({ proposalId, clubId }: Props) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const { refetch, error, isLoading, isFetching, isSuccess, isFetched, data } = useScaffoldReadContract({
    functionName: "hasUserVoted",
    contractName,
    args: [BigInt(proposalId), BigInt(clubId)],
  });

  const isLoadingData = isLoading || deployedContractLoading;

  return {
    error,
    refetch,
    deployedContractData,
    isLoadingData,
    contractName,
    isFetching,
    isFetched,
    isSuccess,
    payload: data ?? null,
  };
};
