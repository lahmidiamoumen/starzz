"use client";

import React from "react";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~~/components/core/table";
import { GrantAdmin } from "~~/components/permissions/GrantAdmin";
import { Address } from "~~/components/scaffold-eth";
import { useGetAdmins } from "~~/hooks/services/use-get-admins";

export const Admins = () => {
  const { payload: admins } = useGetAdmins();

  return (
    <div className="bg-base-100 space-y-8 p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold">Admins listing</h2>
          <p className="text-slate-500">Here&apos;s a list of all the admins</p>
        </div>
        <div className="flex items-center space-x-2">
          <GrantAdmin />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map(moderator => (
            <TableRow key={moderator}>
              <TableCell>
                <Address address={moderator} />
              </TableCell>
              <TableCell className="text-right">
                <button
                  onClick={() => console.log("feature is not imlimented yet!")}
                  className="btn btn-sm font-normal gap-1"
                >
                  <EllipsisHorizontalIcon className="h-4 w-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {admins.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-gray-500 text-center">
                No admins found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
