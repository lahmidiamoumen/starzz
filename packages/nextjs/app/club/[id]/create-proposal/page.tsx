"use client";

import * as React from "react";
import { PlusIcon, Trash2 } from "lucide-react";
import { useAccount } from "wagmi";
import { BackButton } from "~~/app/blockexplorer/_components";
import { Button } from "~~/components/core/button";
import { Map } from "~~/components/core/map";
import { Address, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { Option, useCreateProposal } from "~~/hooks/services/use-create-proposal";

type PageProps = {
  params: { id: number };
};

const CreateProsal = ({ params }: PageProps) => {
  const clubId = params?.id as number;
  const { address: connectedAddress, isDisconnected } = useAccount();

  const { isPending, formRef, options, addOption, handleChange, removeOption, onSubmit } = useCreateProposal({
    clubId,
  });

  return (
    <div className="my-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="">
            <BackButton />
            {/* <h1 className="font-bold text-3xl my-4 lg:block">Create new proposal</h1> */}
            <div className="flex flex-col relative font-medium">
              <div className="p-5 divide-y divide-base-300">
                <form ref={formRef} onSubmit={onSubmit}>
                  <label htmlFor="title" className="ml-2">
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    required
                    minLength={10}
                    type="text"
                    className="font-medium text-gray-900 w-full block my-1 text-sm input input-bordered focus-within:outline-none focus-within:border-zinc-700"
                  />
                  <label htmlFor="message" className="ml-2 mt-4 block mb-1 ">
                    Description
                  </label>
                  <textarea
                    id="message"
                    minLength={20}
                    required
                    name="description"
                    rows={12}
                    className="block p-2.5 px-4 font-medium w-full text-sm h-48 input input-bordered text-gray-900 focus:outline-none focus-within:border-zinc-700 rounded-[1rem]"
                    placeholder="Leave a description..."
                  ></textarea>
                  <div className="my-4 font-medium">
                    <div className="mt-5 mb-2 flex justify-between items-baseline">
                      <h2>Options</h2>
                      {options.length < 10 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addOption}
                          size="sm"
                          className="h-8 border-dashed"
                        >
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Add Option
                        </Button>
                      )}
                    </div>
                    <Map<Option>
                      items={options}
                      renderItem={(option, index) => (
                        <div key={option.id} className="flex items-center mb-2">
                          <input
                            type="text"
                            required
                            value={option.text}
                            onChange={e => handleChange(option.id, e.target.value)}
                            className="font-medium text-gray-900 mr-2 w-full input input-bordered px-4 py-1 focus:outline-none focus-within:border-zinc-700 focus:ring-primary-500 focus:border-primary-500"
                            placeholder={`Enter option ${index + 1}`}
                          />
                          {options.length > 2 && (
                            <Button onClick={() => removeOption(option.id)} variant="ghostC" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Move to trash</span>
                            </Button>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  <Button className="float-end" type="submit">
                    {isPending && <span className="loading loading-spinner loading-sm"></span>}
                    {!isPending && <span>Submit</span>}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1 flex flex-col">
          <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
            <div className="flex">
              <div className="">
                {!isDisconnected && (
                  <div className="flex w-full justify-between space-x-2">
                    <p className="my-2 font-medium">Connected: </p>
                    <Address address={connectedAddress} />
                  </div>
                )}
                {isDisconnected && (
                  <div className="w-full text-center pt-5">
                    <RainbowKitCustomConnectButton className="btn-md btn-wide" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProsal;
