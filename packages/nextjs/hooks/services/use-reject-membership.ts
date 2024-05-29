"use client";

import * as React from "react";
import { useScaffoldWriteContract } from "../scaffold-eth";

type Props = {
  clubId: number;
  address: string;
  onSuccess: () => void;
};

export const useRejectMembership = ({ address, clubId, onSuccess }: Props) => {
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const { isPending, writeContractAsync } = useScaffoldWriteContract("Club");

  const handleSubmit = async () => {
    setStatusMessage(null);
    try {
      await writeContractAsync(
        {
          functionName: "rejectMembership",
          args: [address, BigInt(clubId)],
        },
        {
          onSuccess: () => {
            setStatusMessage("Transaction is being mined!");
            setIsOpen(false);
            onSuccess();
          },
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
            setStatusMessage("Membership Rejected!");
          },
        },
      );
    } catch (e) {
      setStatusMessage("Error rejecting membership");
      console.error("Error rejecting membership: ", e);
    }
  };

  return {
    statusMessage,
    isPending,
    isOpen,
    setIsOpen,
    handleSubmit,
  };
};
