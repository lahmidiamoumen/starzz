"use client";

import * as React from "react";
import { Proposals } from "./_components/Proposals";

type PageProps = {
  params: { id: number };
};

const ClubPage = ({ params }: PageProps) => {
  const id = params?.id as number;
  return <Proposals id={id} />;
};

export default ClubPage;
