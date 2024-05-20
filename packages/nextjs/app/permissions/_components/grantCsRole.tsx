"use client";

import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Input } from "~~/components/core/input";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { AddressType } from "~~/types/abitype/abi";

export const GrantCsRoles = () => {
  const { isPending, writeContractAsync } = useScaffoldWriteContract("Roles");
  const [inputAddress, setInputAddress] = useState<AddressType>("");
  const [clubId, setClubId] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    if (!clubId.trim() || !inputAddress) {
      setStatusMessage("Both Club Id and User Address are required.");
      return;
    }

    try {
      await writeContractAsync(
        {
          functionName: "grantCSRole",
          args: [inputAddress, BigInt(clubId.trim())],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
            setStatusMessage("Transaction successful!");
            clearInputs();
          },
        },
      );
    } catch (e) {
      console.error("Error Granting Role: ", e);
      setStatusMessage("Transaction failed. Please try again.");
    }
  };

  const clearInputs = () => {
    setInputAddress("");
    setClubId("");
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <Input
            className="flex-1"
            name="clubId"
            value={clubId}
            onChange={e => setClubId(e.target.value)}
            placeholder="Club Id"
          />
          <AddressInput
            className="flex-1"
            name="userAddress"
            value={inputAddress}
            onChange={setInputAddress}
            placeholder="User Address"
          />
        </div>
        <button className="btn btn-sm font-normal gap-1" type="submit" disabled={isPending}>
          {!isPending ? <PlusIcon className="h-4 w-4" /> : <span className="loading loading-spinner loading-sm"></span>}
          <span>Grant</span>
        </button>
      </form>
      {statusMessage && (
        <div className="mt-3 text-center">
          <p className={statusMessage.includes("successful") ? "text-green-600" : "text-red-600"}>{statusMessage}</p>
        </div>
      )}
    </div>
  );
};
