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
import { useRejectMembership } from "~~/hooks/services/use-reject-membership";

type Props = {
  address: string;
  clubId: number;
  onSuccess: () => void;
};

export function RejectMembership({ address, clubId, onSuccess }: Props) {
  const { isOpen, setIsOpen, isPending, handleSubmit } = useRejectMembership({ address, clubId, onSuccess });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span>Reject Membership</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reject Membership</DialogTitle>
          <DialogDescription>
            <Address address={address} /> has request to join #{clubId}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={isPending} onClick={handleSubmit}>
            Reject Membership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
