"use client";

import * as React from "react";
import { useScaffoldWriteContract } from "../scaffold-eth";

type Props = {
  clubId: number;
  proposalId: number;
};

export const usePostingTime = ({ clubId, proposalId }: Props) => {
  const [date, setDate] = React.useState<Date>();
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const { isPending, writeContractAsync } = useScaffoldWriteContract("Proposal");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    if (date === undefined) {
      setStatusMessage("Choise a voting duration first.");
      return;
    }

    const duration = getSecondsFromMidnight(date);

    if (duration < 500) {
      setStatusMessage("The voting time is very short.");
      return;
    }

    try {
      await writeContractAsync(
        {
          functionName: "startVoting",
          args: [BigInt(proposalId), BigInt(clubId), BigInt(duration)],
        },
        {
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
    statusMessage,
    isPending,
    date,
    setDate,
  };
};

function getSecondsFromMidnight(date: Date): number {
  const midnight = new Date(1970, 0, 1, 0, 0, 0, 0);

  const diffInMilliseconds = date.getTime() - midnight.getTime();

  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

  return diffInSeconds;
}
