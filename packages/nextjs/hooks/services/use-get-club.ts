"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const contractName = "Club";

export const useGetClub = ({ id }: { id: number }) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const { refetch, error, isLoading, isFetching, isSuccess, isFetched, data } = useScaffoldReadContract({
    functionName: "getClubDetails",
    contractName,
    args: [BigInt(id)],
  });

  const isLoadingData = isLoading || deployedContractLoading;

  const handleError = (error: Error) => {
    console.error("Error fetching club details:", error);
    notification.error(getParsedError(error));
  };

  React.useEffect(() => {
    if (isFetching && error) {
      handleError(error);
    }
  }, [error, isFetching]);

  return {
    refetch,
    deployedContractData,
    contractName,
    isLoading: isLoadingData,
    isFetching,
    isFetched,
    isSuccess,
    payload: data ?? null,
  };
};
