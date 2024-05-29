"use client";

import * as React from "react";
import { useScaffoldWriteContract } from "../scaffold-eth";

type Props = {
  clubId: number;
};

export type Option = {
  id: number;
  text: string;
};

export const useCreateProposal = ({ clubId }: Props) => {
  const formRef = React.useRef<HTMLFormElement>(null);

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

    if (options.find(op => op.text === "")) {
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
          onSuccess: () => {
            if (formRef.current) {
              formRef.current.reset();
            }
            setOptions([
              { id: 1, text: "" },
              { id: 2, text: "" },
            ]);
          },
          onBlockConfirmation: txnReceipt => {
            console.log("📦 Transaction blockHash", txnReceipt.blockHash);
          },
        },
      );
    } catch (e) {
      console.error("Error Joining Club: ", e);
    }
  };

  return {
    isPending,
    formRef,
    options,
    setOptions,
    addOption,
    handleChange,
    removeOption,
    onSubmit,
  };
};
