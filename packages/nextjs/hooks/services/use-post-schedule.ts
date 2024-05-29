"use client";

import * as React from "react";
import { useScaffoldWriteContract } from "../scaffold-eth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const formScheduleSchema = z.object({
  startingDate: z.date(),
  endingDate: z.date(),
});

export type FormScheduleSchemaType = z.infer<typeof formScheduleSchema>;

type Props = {
  clubId: number;
  proposalId: number;
};

export const usePostSchedule = ({ clubId, proposalId }: Props) => {
  const form = useForm<FormScheduleSchemaType>({
    resolver: zodResolver(formScheduleSchema),
  });

  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const { isPending, writeContractAsync } = useScaffoldWriteContract("Proposal");

  const handleSubmit = async (data: FormScheduleSchemaType) => {
    const startingDate = Math.floor(data.startingDate.getTime() / 1000);
    const endingDate = Math.floor(data.endingDate.getTime() / 1000);

    if (endingDate < startingDate) {
      setStatusMessage("The ending time must be greater than the starting time.");
      return;
    }

    try {
      setStatusMessage("Submitting transaction...");
      await writeContractAsync(
        {
          functionName: "startVotingSchedule",
          args: [BigInt(proposalId), BigInt(clubId), BigInt(startingDate), BigInt(endingDate)],
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
    statusMessage,
    isPending,
    form,
  };
};
