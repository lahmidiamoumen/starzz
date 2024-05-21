"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { ClubDetails } from "~~/types/club";
import { PaginationState } from "~~/types/utils";

const contractName = "Club";

export const useGetClubs = () => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const [pagination, setPagination] = React.useState<PaginationState>({
    currentPage: 1,
    pageSize: 4,
  });

  const [clubs, setClubs] = React.useState<ClubDetails[]>([]);
  const { refetch, error, isLoading, isFetching, isSuccess, data } = useScaffoldReadContract({
    functionName: "getClubs",
    contractName: "Club",
    args: [BigInt(pagination.currentPage), BigInt(pagination.pageSize)],
  });

  const clubIds = React.useRef<Set<bigint>>(new Set());
  React.useEffect(() => {
    if (data !== undefined && data.length > 0) {
      const newClubs = data.filter(club => !clubIds.current.has(club.id));

      if (newClubs.length > 0) {
        const newClubIds = new Set(clubIds.current);
        newClubs.forEach(club => newClubIds.add(club.id));

        setClubs(prevClubs => [...prevClubs, ...newClubs]);
        clubIds.current = newClubIds;
      }
    }
  }, [data]);

  const handleLoadMore = () => {
    setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
  };

  return {
    deployedContractData,
    handleLoadMore,
    refetch,
    error,
    deployedContractLoading,
    noMoreResults: clubs.length > 0 && data?.length === 0,
    emptyResults: data?.length === 0 && clubs.length === 0,
    contractName,
    isFetching,
    isLoading,
    isSuccess,
    pagination,
    payload: clubs,
  };
};
