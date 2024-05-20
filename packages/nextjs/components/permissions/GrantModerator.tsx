"use client";

import { useState } from "react";
import { Address as AddressType } from "viem";
import { BanknotesIcon, PlusIcon } from "@heroicons/react/24/outline";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const GrantModerator = () => {
  const [inputAddress, setInputAddress] = useState<AddressType>();

  const { isPending, writeContractAsync } = useScaffoldWriteContract("Roles");

  const handleSubmit = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "grantModeratorRole",
          args: [inputAddress],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
      setInputAddress(undefined);
    } catch (e) {
      console.error("Error Joining Club: ", e);
    }
  };

  return (
    <div>
      <label htmlFor="grant-modertaor-modal" className="btn btn-sm font-normal gap-1">
        <PlusIcon className="h-4 w-4" />
        Grant
      </label>
      <input type="checkbox" id="grant-modertaor-modal" className="modal-toggle" />
      <label htmlFor="grant-modertaor-modal" className="modal cursor-pointer">
        <label className="modal-box relative">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-3">Grant Moderator Role</h3>
          <label htmlFor="grant-modertaor-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col space-y-3">
              <AddressInput
                placeholder="Destination Address"
                value={inputAddress ?? ""}
                onChange={value => setInputAddress(value as AddressType)}
              />
              <button
                className="h-10 btn btn-primary btn-sm px-2 rounded-full"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {!isPending ? (
                  <BanknotesIcon className="h-6 w-6" />
                ) : (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                <span>Apply</span>
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
};
