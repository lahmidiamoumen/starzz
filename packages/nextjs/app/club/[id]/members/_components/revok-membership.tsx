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
import { useDeleteMembership } from "~~/hooks/services/use-delete-membership";

type Props = {
  address: string;
  clubId: number;
  onSuccess?: () => void;
};

export function RevokMembership({ address, clubId, onSuccess }: Props) {
  const { isOpen, setIsOpen, isPending, handleSubmit } = useDeleteMembership({ address, clubId, onSuccess });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button>Revok Membership</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Revok Membership</DialogTitle>
          <DialogDescription>
            <Address address={address} /> has request to join #{clubId}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button disabled={isPending} onClick={handleSubmit}>
            Revok Membership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
