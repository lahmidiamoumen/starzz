"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { MemberRecord } from "~~/types/members";
import { PaginationState } from "~~/types/utils";
import { ContractName } from "~~/utils/scaffold-eth/contract";

const contractName: ContractName = "Club";

type Props = {
  clubId: number;
};

export const useGetMembers = ({ clubId }: Props) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const [pagination, setPagination] = React.useState<PaginationState>({
    currentPage: 1,
    pageSize: 4,
  });

  const [membershipRequests, setMembershipRequests] = React.useState<MemberRecord[]>([]);

  const { refetch, error, isLoading, isFetching, isSuccess, data } = useScaffoldReadContract({
    functionName: "getMembers",
    contractName: contractName,
    args: [BigInt(clubId), BigInt(pagination.currentPage), BigInt(pagination.pageSize)],
  });

  React.useEffect(() => {
    if (data !== undefined && data.length > 0) {
      setMembershipRequests(prv => [...prv, ...data]);
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
    noMoreResults: membershipRequests.length > 0 && data?.length === 0,
    emptyResults: data?.length === 0 && membershipRequests.length === 0,
    contractName,
    isFetching,
    isLoading,
    isSuccess,
    pagination,
    payload: membershipRequests,
  };
};
