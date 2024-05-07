"use client";

import * as React from "react";
import { ClubComponent } from "~~/components/club/ClubComponent";

type PageProps = {
  params: { id: number };
};

const ClubPage = ({ params }: PageProps) => {
  const id = params?.id as number;
  return <ClubComponent id={id} />;
};

export default ClubPage;
