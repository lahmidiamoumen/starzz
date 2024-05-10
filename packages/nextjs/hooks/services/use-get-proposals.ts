"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { ProposalPresnter } from "~~/types/proposal";
import { PaginationState } from "~~/types/utils";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { debounce, isEqual } from "~~/utils/scaffold-eth/common";

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

  const [data, setData] = React.useState<ProposalPresnter[]>([]);
  const [noMoreResults, toggleNoMoreResults] = React.useReducer(prv => !prv, false);
  const [emptyResults, toogleEmptyResults] = React.useReducer(prv => !prv, false);
  const [prevPagination, setPrevPagination] = React.useState<PaginationState | null>(null);

  const { refetch, error, isLoading, isFetching, isSuccess } = useScaffoldReadContract({
    functionName: "getProposals",
    contractName: contractName,
    args: [BigInt(clubId), BigInt(pagination.currentPage), BigInt(pagination.pageSize)],
  });

  const load = React.useCallback(async () => {
    try {
      const { data: result, error } = await refetch();
      if (error) {
        throw error;
      } else if (result == undefined) {
        throw "unknown error";
      } else if (data.length > 0 && result.length === 0) {
        toggleNoMoreResults();
      } else if (data.length === 0 && result.length === 0) {
        toogleEmptyResults();
      } else {
        setData(prv => [...prv, ...result]);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
      notification.error(getParsedError(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length, setData]);

  const debouncedLoad = debounce(load, 400);

  React.useEffect(() => {
    if (!isLoading && error === null && !isEqual(pagination, prevPagination)) {
      if (!prevPagination) {
        debouncedLoad();
      } else {
        load();
      }
      setPrevPagination(pagination);
    }
  }, [pagination, isLoading, error, prevPagination, debouncedLoad, load]);

  const handleLoadMore = () => {
    setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
  };

  return {
    deployedContractData,
    deployedContractLoading,
    handleLoadMore,
    noMoreResults,
    emptyResults,
    contractName,
    isFetching,
    isLoading,
    isSuccess,
    pagination,
    payload: data,
  };
};
