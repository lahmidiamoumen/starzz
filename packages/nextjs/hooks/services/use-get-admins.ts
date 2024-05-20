"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { PaginationState } from "~~/types/utils";
import { ContractName } from "~~/utils/scaffold-eth/contract";

const contractName: ContractName = "Roles";

export const useGetAdmins = () => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const [pagination, setPagination] = React.useState<PaginationState>({
    currentPage: 1,
    pageSize: 4,
  });

  const [admins, setAdmins] = React.useState<string[]>([]);

  const { refetch, error, isLoading, isFetching, isSuccess, data } = useScaffoldReadContract({
    functionName: "getAdmins",
    contractName: contractName,
    args: [BigInt(pagination.currentPage), BigInt(pagination.pageSize)],
  });

  React.useEffect(() => {
    if (data !== undefined && data.length > 0) {
      setAdmins(prv => [...prv, ...data]);
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
    noMoreResults: admins.length > 0 && data?.length === 0,
    emptyResults: data?.length === 0 && admins.length === 0,
    contractName,
    isFetching,
    isLoading,
    isSuccess,
    pagination,
    payload: admins,
  };
};
