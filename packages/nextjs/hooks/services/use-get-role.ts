"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { useAccount } from "wagmi";
import { RoleRecord } from "~~/types/role";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const contractName = "Roles";

export const useGetRole = () => {
  const { address } = useAccount();

  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const [data, setData] = React.useState<RoleRecord | undefined>();

  const { refetch, error, isLoading } = useScaffoldReadContract({
    functionName: "getRole",
    contractName,
    args: [address],
  });

  const isLoadingData = isLoading || deployedContractLoading;

  React.useEffect(() => {
    if (error) {
      notification.error(getParsedError(error));
    }
  }, [error]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const { data: result } = await refetch();
        if (result) {
          setData(result as RoleRecord);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
        notification.error(getParsedError(error));
      }
    };

    if (address !== undefined) {
      load();
    }
  }, [address, refetch]);

  return {
    deployedContractData,
    isLoading: isLoadingData,
    contractName,
    payload: data,
  };
};
