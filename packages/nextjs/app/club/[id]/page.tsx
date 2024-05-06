"use client";

import * as React from "react";
import { ClubComponent } from "~~/components/club/ClubComponent";

type PageProps = {
  params: { id: number };
};

const ClubPage = ({ params }: PageProps) => {
  const id = params?.id as number;
  return (
    <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">
      <ClubComponent id={id} />
    </div>
  );
};

export default ClubPage;
