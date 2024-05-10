"use client";

import * as React from "react";
import { BackButton } from "~~/app/blockexplorer/_components";
import { Map } from "~~/components/core/map";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type PageProps = {
  params: { id: number };
};

type Option = {
  id: number;
  text: string;
};

const CreateProsal = ({ params }: PageProps) => {
  const clubId = params?.id as number;

  const [options, setOptions] = React.useState<Option[]>([
    { id: 1, text: "" },
    { id: 2, text: "" },
  ]);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, { id: Date.now(), text: "" }]);
    }
  };

  const removeOption = (id: number) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const handleChange = (id: number, text: string) => {
    setOptions(options.map(option => (option.id === id ? { ...option, text } : option)));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim();

    if (!title) {
      return;
    }

    if (!description) {
      return;
    }

    await handleSubmit(title, description);
  }

  const { isPending, writeContractAsync } = useScaffoldWriteContract("Proposal");

  const handleSubmit = async (title: string, description: string) => {
    try {
      await writeContractAsync(
        {
          functionName: "createProposal",
          args: [BigInt(clubId), title, description, options.map(op => op.text)],
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
            <h1 className="font-bold text-3xl my-4 lg:block">Create new proposal</h1>
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
                    minLength={10}
                    type="text"
                    className="text-gray-900 w-full block my-2 text-sm input input-bordered focus:outline-none"
                  />
                  <label htmlFor="message" className="ml-2 mt-4 block mb-2 text-gray-900 dark:text-white">
                    Description
                  </label>
                  <textarea
                    id="message"
                    minLength={20}
                    required
                    name="description"
                    rows={12}
                    className="block p-2.5 w-full text-sm h-48 input input-bordered text-gray-900 focus:outline-none rounded-[1rem]"
                    placeholder="Leave a description..."
                  ></textarea>
                  <div className="my-4">
                    <div className="my-4 flex justify-between">
                      <h2>Options</h2>
                      {options.length < 10 && (
                        <button onClick={addOption} className="btn btn-sm btn-outline">
                          Add Option
                        </button>
                      )}
                    </div>
                    <Map<Option>
                      items={options}
                      renderItem={(option, index) => (
                        <div key={option.id} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={option.text}
                            onChange={e => handleChange(option.id, e.target.value)}
                            className="text-gray-900 mr-2 w-full input input-bordered px-4 py-1 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder={`Enter option ${index + 1}`}
                          />
                          {options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(option.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      )}
                    />
                  </div>
                  <button type="submit" className="mt-5 btn btn-primary w-full btn-sm ">
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

export default CreateProsal;
