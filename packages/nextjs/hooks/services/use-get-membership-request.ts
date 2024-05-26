"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { MembershipRequestRecord } from "~~/types/members";
import { PaginationState } from "~~/types/utils";
import { ContractName } from "~~/utils/scaffold-eth/contract";

const contractName: ContractName = "Club";

type Props = {
  clubId: number;
};

export const useGetMembershipRequests = ({ clubId }: Props) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const [pagination, setPagination] = React.useState<PaginationState>({
    currentPage: 1,
    pageSize: 4,
  });

  const [membershipRequests, setMembershipRequests] = React.useState<MembershipRequestRecord[]>([]);

  const { refetch, error, isLoading, isFetching, isSuccess, data } = useScaffoldReadContract({
    functionName: "getMembershipRequests",
    contractName: contractName,
    args: [BigInt(clubId), BigInt(pagination.currentPage), BigInt(pagination.pageSize)],
  });

  const refresh = () => {
    setMembershipRequests([]);
    refetch();
  };

  const membersIds = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (data !== undefined && data.length > 0) {
      const newRequests = data.filter(request => !membersIds.current.has(request.member));

      const deletedRequests = membershipRequests.filter(
        request => !data.some(newRequest => newRequest.member === request.member),
      );

      if (newRequests.length > 0 || deletedRequests.length > 0) {
        const newMembersSet = new Set(membersIds.current);
        newRequests.forEach(request => newMembersSet.add(request.member));
        deletedRequests.forEach(request => newMembersSet.delete(request.member));

        setMembershipRequests([
          ...membershipRequests.filter(request => !deletedRequests.includes(request)),
          ...newRequests,
        ]);
        membersIds.current = newMembersSet;
      }
    }
  }, [data, membershipRequests]);

  const handleLoadMore = () => {
    setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
  };

  return {
    error,
    refetch: refresh,
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
