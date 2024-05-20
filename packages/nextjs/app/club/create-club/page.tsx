"use client";

import * as React from "react";
import { BackButton } from "~~/app/blockexplorer/_components";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const CreateClub = () => {
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const title = formData.get("title")?.toString().trim();

    if (!title) {
      return;
    }

    await handleSubmit(title);
  }

  const { isPending, writeContractAsync } = useScaffoldWriteContract("Club");

  const handleSubmit = async (title: string) => {
    try {
      await writeContractAsync(
        {
          functionName: "createClub",
          args: [title],
        },
        {
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error Joining Club: ", e);
    }
  };

  return (
    <div className="w-full max-w-6xl my-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="z-10">
            <BackButton />
            <h1 className="font-bold text-3xl my-4 lg:block">Create new club</h1>
            <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col relative">
              <div className="p-5 divide-y divide-base-300">
                <form onSubmit={onSubmit}>
                  <label htmlFor="title" className="ml-2 text-gray-900 dark:text-white">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    required
                    minLength={6}
                    type="text"
                    className="text-gray-900 w-full block my-2 text-sm input input-bordered focus:outline-none"
                  />
                  <button type="submit" className="mt-5 btn btn-secondary w-full btn-sm ">
                    {isPending && <span className="loading loading-spinner loading-sm"></span>}
                    {!isPending && <span>Submit</span>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1 flex flex-col">
          <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <span className="">Empty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClub;
