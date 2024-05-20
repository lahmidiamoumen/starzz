import React from "react";

const ClubLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-col gap-y-6 lg:gap-y-8 py-8 lg:py-12 justify-center items-center">{children}</div>;
};

export default ClubLayout;
