import * as React from "react";
import { ClubCard } from "./_components/club";
import { Sidebar } from "./proposal/_components/sidebar";
import { Card, CardContent } from "~~/components/core/card";

export default function Layout({ params, children }: { params: { id: number }; children: React.ReactNode }) {
  const { id } = params;
  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      <div className={`grid grid-cols-1 lg:grid-cols-6 px-6 lg:px-10 lg:gap-12 w-full max-w-7xl my-0`}>
        <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="col-span-1 flex flex-col">
            <Card>
              <CardContent>
                <Sidebar
                  items={[
                    {
                      title: "Proposals",
                      href: `/club/${id}`,
                    },
                    {
                      title: "Members",
                      href: `/club/${id}/members`,
                    },
                  ]}
                >
                  <ClubCard id={id} />
                </Sidebar>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
