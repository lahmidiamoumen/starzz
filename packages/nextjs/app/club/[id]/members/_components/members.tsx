"use client";

import React from "react";
import { RevokMembership } from "./revok-membership";
import { MoreVertical } from "lucide-react";
import { Button } from "~~/components/core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~~/components/core/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/core/table";
import { Address } from "~~/components/scaffold-eth";
import { useGetMembers } from "~~/hooks/services/use-get-members";
import { getDate } from "~~/utils/scaffold-eth/common";

type PageProps = {
  clubId: number;
};

const Members = ({ clubId }: PageProps) => {
  const { payload: members } = useGetMembers({ clubId });

  return (
    <div className="bg-base-100 space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold">Members listing</h2>
          <p className="text-slate-500">Here&apos;s a list of all the Members</p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Requested On</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map(member => (
            <TableRow key={member.ceatedAt}>
              <TableCell>
                <Address address={member.member} />
              </TableCell>
              <TableCell>{getDate(member.ceatedAt)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghostC" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={(e: { preventDefault: () => any }) => e.preventDefault()}>
                      <RevokMembership clubId={clubId} address={member.member} />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-gray-500 text-center">
                No Members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Members;
