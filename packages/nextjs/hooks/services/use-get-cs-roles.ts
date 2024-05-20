"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { CsRecord } from "~~/types/role";
import { PaginationState } from "~~/types/utils";

const contractName = "Club";

export const useGetCsRoles = () => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const [pagination, setPagination] = React.useState<PaginationState>({
    currentPage: 1,
    pageSize: 4,
  });
  const [clubs, setClubs] = React.useState<CsRecord[]>([]);
  const { refetch, error, isLoading, isFetching, isSuccess, data } = useScaffoldReadContract({
    functionName: "getCsRoles",
    contractName: "Club",
    args: [BigInt(pagination.currentPage), BigInt(pagination.pageSize)],
  });

  React.useEffect(() => {
    if (data !== undefined && data.length > 0) {
      setClubs(prv => [...prv, ...data]);
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
