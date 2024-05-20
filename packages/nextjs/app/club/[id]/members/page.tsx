import React from "react";
import Members from "./_components/members";
import MembershipRequests from "./_components/membership-requests";
import { Tab, TabView } from "~~/components/core/tabs";

type PageProps = {
  params: { id: number };
};

const Page = ({ params }: PageProps) => {
  const clubId = params?.id as number;
  return (
    <div className="flex flex-col justify-center items-center">
      <Tab defaultTab={0}>
        <TabView label="Members">
          <Members clubId={clubId} />
        </TabView>
        <TabView label="Membership Requests">
          <MembershipRequests clubId={clubId} />
        </TabView>
      </Tab>
    </div>
  );
};

export default Page;
