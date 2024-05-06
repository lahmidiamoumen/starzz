"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { ClubDetails } from "~~/types/club";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type Props = {
  id: number;
};
const contractName = "Club";

export const useGetClub = ({ id }: Props) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);

  const [data, setData] = React.useState<ClubDetails>();

  const { refetch, error, isLoading, isFetching, isSuccess, isFetched } = useScaffoldReadContract({
    functionName: "getClubDetails",
    contractName,
    args: [BigInt(id)],
  });

  React.useEffect(() => {
    if (isFetching && error) {
      notification.error(getParsedError(error));
    }
  }, [error, isFetching]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const { data: result } = await refetch();
        if (result) {
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching clubs:", error);
        notification.error(getParsedError(error));
      }
    };
    load();
  }, [refetch]);

  return {
    deployedContractData,
    deployedContractLoading,
    contractName,
    isFetching,
    isLoading,
    isFetched,
    isSuccess,
    payload: data,
  };
};
