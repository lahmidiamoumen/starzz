"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { ClubDetails } from "~~/types/club";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const contractName = "Club";
const retryCount = 3;
const retryDelay = 1000;

export const useGetClub = ({ id }: { id: number }) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const [data, setData] = React.useState<ClubDetails | null>(null);
  const { refetch, error, isLoading, isFetching, isSuccess, isFetched } = useScaffoldReadContract({
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

  React.useEffect(() => {
    let retries = 0;
    const fetchDataWithRetry = async () => {
      try {
        const { data } = await refetch();
        setData(data ?? null);
      } catch (error) {
        handleError(error as Error);
        if (retries < retryCount) {
          retries++;
          const timeoutId = setTimeout(() => {
            fetchDataWithRetry();
          }, retryDelay * retries);

          return () => clearTimeout(timeoutId);
        }
      }
    };

    fetchDataWithRetry();
  }, [refetch]);

  return {
    deployedContractData,
    contractName,
    isLoading: isLoadingData,
    isFetching,
    isFetched,
    isSuccess,
    payload: data,
  };
};
