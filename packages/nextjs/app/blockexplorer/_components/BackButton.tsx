"use client";

import { useRouter } from "next/navigation";
import { Button } from "~~/components/core/button";

export const BackButton = () => {
  const router = useRouter();
  return (
    <Button variant={"outline"} onClick={() => router.back()}>
      <svg
        className="h-6 w-6 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"></path>
      </svg>
      <span>Back</span>
    </Button>
  );
};
