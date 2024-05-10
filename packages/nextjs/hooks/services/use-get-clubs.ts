"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { ClubDetails } from "~~/types/club";
import { PaginationState } from "~~/types/utils";
import { getParsedError, notification } from "~~/utils/scaffold-eth";
import { debounce, isEqual } from "~~/utils/scaffold-eth/common";

const contractName = "Club";

export const useGetClubs = () => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const [pagination, setPagination] = React.useState<PaginationState>({
    currentPage: 1,
    pageSize: 4,
  });
  const [data, setData] = React.useState<ClubDetails[]>([]);
  const [noMoreResults, toggleNoMoreResults] = React.useReducer(prv => !prv, false);
  const [emptyResults, toogleEmptyResults] = React.useReducer(prv => !prv, false);
  const [prevPagination, setPrevPagination] = React.useState<PaginationState | null>(null);

  const { refetch, error, isLoading, isFetching, isSuccess } = useScaffoldReadContract({
    functionName: "getClubs",
    contractName: "Club",
    args: [BigInt(pagination.currentPage), BigInt(pagination.pageSize)],
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

  const debouncedLoad = debounce(load, 100);

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

  // React.useEffect(() => {
  //   if (isFetching && error) {
  //     notification.error(getParsedError(error));
  //   }
  // }, [error, isFetching]);

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
