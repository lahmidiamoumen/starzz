import React from "react";
import { DateTimePickerForm } from "./date-time-picker-form";
import { Timer } from "./timer-picker";
import { Card, CardContent } from "~~/components/core/card";
import { Tab, TabView } from "~~/components/core/tabs";

type Props = {
  clubId: number;
  proposalId: number;
};

export function VotingSetup({ clubId, proposalId }: Props) {
  return (
    <Card className="mt-10">
      <CardContent>
        <h3 className="font-bold text-2xl mb-4 lg:block">Setup - Voting Time</h3>
        <div className="flex flex-col justify-center items-center">
          <Tab>
            <TabView label="Timer">
              <Timer clubId={clubId} proposalId={proposalId} />
            </TabView>
            <TabView label="Schedule">
              <DateTimePickerForm clubId={clubId} proposalId={proposalId} />
            </TabView>
          </Tab>
        </div>
      </CardContent>
    </Card>
  );
}
