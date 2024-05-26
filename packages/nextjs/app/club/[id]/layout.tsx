"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ClubCard } from "./_components/club";
import { Sidebar } from "./proposal/_components/sidebar";
import { Card, CardContent } from "~~/components/core/card";
import { useRole } from "~~/hooks/context/use-context-role";

export default function Layout({ params, children }: { params: { id: number }; children: React.ReactNode }) {
  const { id } = params;
  const { role } = useRole();
  const currentPath = usePathname();

  const items = [
    {
      title: "Proposals",
      href: `/club/${id}`,
    },
    {
      title: "Members",
      href: `/club/${id}/members`,
    },
  ];

  const showSidebar = items.some(item => currentPath === item.href);

  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      <div className={`grid grid-cols-1 lg:grid-cols-3 px-6 lg:px-10 lg:gap-12 w-full max-w-6xl my-0`}>
        <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {showSidebar && (
            <>
              <div className="col-span-1 flex flex-col">
                <Card>
                  <CardContent>
                    {role && ["ADMIN", "MODERATOR", "CS"].includes(role) && (
                      <Sidebar items={items}>
                        <ClubCard id={id} />
                      </Sidebar>
                    )}
                    {(role === undefined || !["ADMIN", "MODERATOR", "CS"].includes(role)) && <ClubCard id={id} />}
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-1 lg:col-span-2 flex flex-col gap-3">{children}</div>
            </>
          )}
          {!showSidebar && <div className="col-span-3 flex flex-col gap-3"> {children} </div>}
        </div>
      </div>
    </div>
  );
}
