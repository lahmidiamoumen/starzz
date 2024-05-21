"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { PaginationState } from "~~/types/utils";
import { ContractName } from "~~/utils/scaffold-eth/contract";

const contractName: ContractName = "Roles";

export const useGetModerators = () => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const [pagination, setPagination] = React.useState<PaginationState>({
    currentPage: 1,
    pageSize: 4,
  });

  const [moderators, setModerators] = React.useState<string[]>([]);

  const { refetch, error, isLoading, isFetching, isSuccess, data } = useScaffoldReadContract({
    functionName: "getModerators",
    contractName: contractName,
    args: [BigInt(pagination.currentPage), BigInt(pagination.pageSize)],
  });

  const moderatorSet = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    if (data !== undefined && data.length > 0) {
      const newClubs = data.filter(moderator => !moderatorSet.current.has(moderator));

      if (newClubs.length > 0) {
        const newClubIds = new Set(moderatorSet.current);
        newClubs.forEach(moderator => newClubIds.add(moderator));

        setModerators(prevClubs => [...prevClubs, ...newClubs]);
        moderatorSet.current = newClubIds;
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
    noMoreResults: moderators.length > 0 && data?.length === 0,
    emptyResults: data?.length === 0 && moderators.length === 0,
    contractName,
    isFetching,
    isLoading,
    isSuccess,
    pagination,
    payload: moderators,
  };
};
