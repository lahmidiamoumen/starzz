"use client";

import React from "react";
import { Admins } from "./_components/admins";
import { CsRoles } from "./_components/cs-roels";
import { Moderators } from "./_components/moderators";
import type { NextPage } from "next";
import { Tab, TabView } from "~~/components/core/tabs";

const Permission: NextPage = () => {
  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      <Tab defaultTab={0}>
        <TabView label="Moderators">
          <Moderators />
        </TabView>
        <TabView label="Admins">
          <Admins />
        </TabView>
        <TabView label="Community Stewards">
          <CsRoles />
        </TabView>
      </Tab>
    </div>
  );
};

export default Permission;
