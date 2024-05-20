"use client";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Button } from "~~/components/core/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~~/components/core/dialog";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type Props = {
  address: string;
  clubId: number;
};

export function GrantMembership({ address, clubId }: Props) {
  const { isPending, writeContractAsync } = useScaffoldWriteContract("Club");

  const handleSubmit = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "approveMembership",
          args: [address, BigInt(clubId)],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error Joining Club: ", e);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* <Button variant="outline">Approve Membership</Button> */}
        <EllipsisHorizontalIcon className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Approve Membership</DialogTitle>
          <DialogDescription>
            Approve membership of {address} to club #{clubId}.
          </DialogDescription>
        </DialogHeader>
        {/* <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            Approve membership of {address} to club #{clubId}
          </div>
        </div> */}
        <DialogFooter>
          <Button disabled={isPending} onClick={handleSubmit}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
