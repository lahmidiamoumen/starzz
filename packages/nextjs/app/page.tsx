"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Button } from "~~/components/core/button";
import { Card, CardContent } from "~~/components/core/card";
import { Search } from "~~/components/core/search";
import ClubsList from "~~/components/home/read-clubs";
import { Address } from "~~/components/scaffold-eth";
import { useRole } from "~~/hooks/context/use-context-role";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { role, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl mt-14">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-[1012px] px-4 mb-4">
      <div className="flex flex-col lg:gap-8 gap-4 mt-4">
        <Card>
          <CardContent>
            <h1 className="text-center">
              <span className="block text-2xl mb-2">Welcome to</span>
              <span className="block text-4xl font-bold">BrightGov x Starzz</span>
            </h1>
            <div className="flex justify-center items-center space-x-2">
              <p className="my-2 font-medium">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
          </CardContent>
        </Card>

        {role && ["ADMIN", "MODERATOR"].includes(role) && <CreateClub />}
        <ClubsList />
      </div>
    </div>
  );
};

export default Home;

const CreateClub = (): React.JSX.Element => {
  return (
    <div className="max-w-[1012px] w-full mb-4 flex flex-wrap justify-between xs:flex-row md:flex-nowrap">
      <div className="w-full md:max-w-[520px]">
        <Search type="text" placeholder="Search" />
      </div>
      <Link className="inline-block h-full text-left mt-2 xs:w-auto sm:mr-2 md:ml-2 md:mt-0" href="/club/create-club">
        <Button>Create Club</Button>
      </Link>
    </div>
  );
};
