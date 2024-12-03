"use client";

import * as React from "react";
import { useScaffoldWriteContract } from "../scaffold-eth";

type Props = {
  clubId: number;
  address: string;
  onSuccess?: () => void;
};

export const useDeleteMembership = ({ address, clubId, onSuccess }: Props) => {
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const { isPending, writeContractAsync } = useScaffoldWriteContract("Club");

  const handleSubmit = async () => {
    setStatusMessage(null);
    try {
      await writeContractAsync(
        {
          functionName: "revokeMembership",
          args: [address, BigInt(clubId)],
        },
        {
          onSuccess: () => {
            setStatusMessage("Transaction is being mined!");
            setIsOpen(false);
            if (onSuccess) {
              onSuccess();
            }
          },
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
            setStatusMessage("Membership Revoked!");
          },
        },
      );
    } catch (e) {
      setStatusMessage("Error revoking membership");
      console.error("Error Joining Club: ", e);
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
