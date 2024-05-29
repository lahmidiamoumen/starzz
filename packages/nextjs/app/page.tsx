"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Button } from "~~/components/core/button";
import { Card, CardContent } from "~~/components/core/card";
import { Search } from "~~/components/core/search";
import { Separator } from "~~/components/core/separator";
import { Skeleton } from "~~/components/core/skeleton";
import ClubsList from "~~/components/home/read-clubs";
import { Address, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useRole } from "~~/hooks/context/use-context-role";

const Home: NextPage = () => {
  const { address: connectedAddress, isDisconnected } = useAccount();
  const { role, isLoading } = useRole();

  if (isLoading) {
    return <SkeletonCard />;
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
            {!isDisconnected && (
              <div className="flex justify-center items-center space-x-2">
                <p className="my-2 font-medium">Connected Address:</p>
                <Address address={connectedAddress} />
              </div>
            )}
            {isDisconnected && (
              <div className="w-full text-center pt-5">
                <RainbowKitCustomConnectButton />
              </div>
            )}
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
    <>
      <div className="max-w-[1012px] w-full flex flex-wrap justify-between xs:flex-row md:flex-nowrap">
        <div className="w-full md:max-w-[520px]">
          <Search type="text" placeholder="Search" />
        </div>
        <Link className="inline-block h-full text-left mt-2 xs:w-auto sm:mr-2 md:ml-2 md:mt-0" href="/club/create-club">
          <Button>Create Club</Button>
        </Link>
      </div>
      <Separator />
    </>
  );
};

function SkeletonCard() {
  return (
    <div className="w-full mx-auto max-w-[1012px] gap-8">
      <Skeleton className="mt-4 h-[150px] w-full rounded-xl" />
      <div className="space-y-2 mt-16">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 mt-16 lg:grid-cols-4 gap-8">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
