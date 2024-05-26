"use client";

import * as React from "react";
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
import { Address } from "~~/components/scaffold-eth";
import { useUpdateMembership } from "~~/hooks/services/use-update-membership";

type Props = {
  address: string;
  clubId: number;
  onSuccess: () => void;
};

export function GrantMembership({ address, clubId, onSuccess }: Props) {
  const { isOpen, setIsOpen, isPending, handleSubmit } = useUpdateMembership({ address, clubId, onSuccess });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span>Grant Membership</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Approve Membership</DialogTitle>
          <DialogDescription>
            <Address address={address} /> has request to join #{clubId}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={isPending} onClick={handleSubmit}>
            Approve Membership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
