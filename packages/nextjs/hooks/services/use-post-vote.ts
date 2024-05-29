"use client";

import * as React from "react";
import { useScaffoldWriteContract } from "../scaffold-eth";

type Props = {
  clubId: number;
  proposalId: number;
};

export const usePostingVote = ({ clubId, proposalId }: Props) => {
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = React.useState<number | null>(null);

  const { isPending, writeContractAsync } = useScaffoldWriteContract("Proposal");

  const handleSubmit = async () => {
    setStatusMessage(null);

    if (selectedChoice === null) {
      setStatusMessage("The voting choice is wrong!");
      return;
    }

    if (selectedChoice < 0 && selectedChoice > 10) {
      setStatusMessage("The voting choice is wrong!");
      return;
    }

    try {
      await writeContractAsync(
        {
          functionName: "vote",
          args: [BigInt(proposalId), BigInt(clubId), BigInt(selectedChoice)],
        },
        {
          onSuccess: () => {
            setStatusMessage("Transaction is being mined!");
          },
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
            setStatusMessage("Transaction successful!");
          },
        },
      );
    } catch (e) {
      console.error("Error Granting Role: ", e);
      setStatusMessage("Transaction failed. Please try again.");
    }
  };

  return {
    handleSubmit,
    selectedChoice,
    setSelectedChoice,
    statusMessage,
    isPending,
  };
};
