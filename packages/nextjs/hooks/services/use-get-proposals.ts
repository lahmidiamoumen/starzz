"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { ProposalPresnter } from "~~/types/proposal";
import { PaginationState } from "~~/types/utils";

const contractName = "Proposal";

type Props = {
  clubId: number;
};

export const useGetProposals = ({ clubId }: Props) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const [pagination, setPagination] = React.useState<PaginationState>({
    currentPage: 1,
    pageSize: 4,
  });

  const [proposals, setProposals] = React.useState<ProposalPresnter[]>([]);

  const { refetch, error, isLoading, isFetching, isSuccess, data } = useScaffoldReadContract({
    functionName: "getProposals",
    contractName: contractName,
    args: [BigInt(clubId), BigInt(pagination.currentPage), BigInt(pagination.pageSize)],
  });

  const proposalsIds = React.useRef<Set<bigint>>(new Set());
  React.useEffect(() => {
    if (data !== undefined && data.length > 0) {
      const newClubs = data.filter(club => !proposalsIds.current.has(club.proposalId));

      if (newClubs.length > 0) {
        const newClubIds = new Set(proposalsIds.current);
        newClubs.forEach(club => newClubIds.add(club.proposalId));

        setProposals(prevClubs => [...prevClubs, ...newClubs]);
        proposalsIds.current = newClubIds;
      }
    }
  }, [data]);

  const handleLoadMore = () => {
    setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
  };

  return {
    error,
    refetch,
    deployedContractData,
    deployedContractLoading,
    handleLoadMore,
    noMoreResults: proposals.length > 0 && data?.length === 0,
    emptyResults: data?.length === 0 && proposals.length === 0,
    contractName,
    isFetching,
    isLoading,
    isSuccess,
    pagination,
    payload: proposals,
  };
};
