"use client";

import React from "react";
import { GrantCsRoles } from "./grantCsRole";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/core/table";
import { Address } from "~~/components/scaffold-eth";
import { useGetCsRoles } from "~~/hooks/services/use-get-cs-roles";

const emptyAddress = "0x0000000000000000000000000000000000000000";
export const CsRoles = () => {
  const { payload: csRoles } = useGetCsRoles();

  const [selectedRow, setSelectedRow] = React.useState<bigint | null>(null);

  const handleRowClick = (clubId: bigint) => {
    setSelectedRow(clubId === selectedRow ? null : clubId);
  };

  return (
    <div className="bg-base-100 space-y-8 p-8">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Grant Community steward Role</h2>
        <GrantCsRoles clubId={selectedRow} />
        <div data-orientation="horizontal" role="none" className="shrink-0 bg-border h-[1px] w-full"></div>
      </div>
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold">Community steward listing</h2>
          <p className="text-slate-500">Here&apos;s a list of all the csRoles</p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Club Id</TableHead>
            <TableHead>Club Name</TableHead>
            <TableHead>Community steward</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {csRoles.map(cs => (
            <TableRow
              className={selectedRow === cs.clubId ? "bg-muted" : ""}
              onClick={() => handleRowClick(cs.clubId)}
              key={cs.clubId.toString()}
            >
              <TableCell>{cs.clubId.toString()}</TableCell>
              <TableCell>{cs.clubName}</TableCell>
              <TableCell>{cs.cs !== emptyAddress ? <Address address={cs.cs} /> : "N/A"}</TableCell>
              <TableCell className="text-right">
                {cs.cs !== emptyAddress && (
                  <button
                    onClick={() => console.log("feature is not imlimented yet!")}
                    className="btn btn-sm font-normal gap-1"
                  >
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {csRoles.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-gray-500 text-center">
                `` No Community steward found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
