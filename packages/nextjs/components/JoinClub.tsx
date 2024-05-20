"use client";

import * as React from "react";
import { Button } from "./core/button";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type Status = "requested" | "member" | "nan";

type Props = {
  clubId: bigint;
  status?: Status;
};

const action = {
  requested: <button className="btn btn-outlin btn-sm no-animation">Requested</button>,
  member: <button className="btn btn-outline btn-secondary btn-sm">Joined</button>,
  nan: undefined,
};

const JoinButton = ({ clubId, status = "nan" }: Props): React.ReactNode => {
  const { isSuccess, isPending, writeContractAsync } = useScaffoldWriteContract("Club");

  const handleJoin = async () => {
    try {
      await writeContractAsync(
        {
          functionName: "joinClub",
          args: [clubId],
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
    action[status] ?? (
      <Button
        className="btn-sm w-full"
        variant={"outline"}
        size={"sm"}
        disabled={isPending || isSuccess}
        onClick={handleJoin}
      >
        {isPending && <span className="loading loading-spinner loading-sm"></span>}
        {isSuccess && !isPending && <span>Requested</span>}
        {!isSuccess && !isPending && <span>Join</span>}
      </Button>
      // <button
      //   disabled={isPending || isSuccess}
      //   onClick={handleJoin}
      //   type="button"
      //   className="w-full btn btn-secondary btn-sm"
      // >
      // </button>
    )
  );
};

export default JoinButton;
