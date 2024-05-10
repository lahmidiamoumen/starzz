"use client";

import * as React from "react";
import { useDeployedContractInfo, useScaffoldReadContract } from "../scaffold-eth";
import { ProposalPresnter } from "~~/types/proposal";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type Props = {
  proposalId: number;
  clubId: number;
};
const contractName = "Proposal";

export const useGetProposal = ({ proposalId, clubId }: Props) => {
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);

  const [data, setData] = React.useState<ProposalPresnter>();

  const { refetch, error, isLoading, isFetching, isSuccess, isFetched } = useScaffoldReadContract({
    functionName: "getProposalDetails",
    contractName,
    args: [BigInt(proposalId), BigInt(clubId)],
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
        console.error("Error fetching proposals:", error);
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
