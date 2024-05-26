"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "~~/components/core/button";
import { Label } from "~~/components/core/label";
import { TimePickerInput } from "~~/components/core/time-picker-input";
import { usePostingTime } from "~~/hooks/services/use-post-timing";

interface TimePickerDemoProps {
  className?: string;
  clubId: number;
  proposalId: number;
}

export function Timer({ className, clubId, proposalId }: TimePickerDemoProps) {
  const { date, setDate, handleSubmit, statusMessage } = usePostingTime({ clubId, proposalId });

  const dayRef = React.useRef<HTMLInputElement>(null);
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {statusMessage && (
        <div className="mt-3 text-center">
          <p className={statusMessage.includes("successful") ? "text-green-600" : "text-red-600"}>{statusMessage}</p>
        </div>
      )}
      <div className="mt-5 flex items-end gap-2">
        <div className="grid gap-1 text-center">
          <Label htmlFor="days" className="text-xs">
            Days
          </Label>
          <TimePickerInput
            picker="days"
            className={className}
            date={date}
            setDate={setDate}
            ref={dayRef}
            onRightFocus={() => dayRef.current?.focus()}
          />
        </div>
        <div className="grid gap-1 text-center">
          <Label htmlFor="hours" className="text-xs">
            Hours
          </Label>
          <TimePickerInput
            picker="hours"
            className={className}
            date={date}
            setDate={setDate}
            ref={hourRef}
            onRightFocus={() => minuteRef.current?.focus()}
          />
        </div>
        <div className="grid gap-1 text-center">
          <Label htmlFor="minutes" className="text-xs">
            Minutes
          </Label>
          <TimePickerInput
            picker="minutes"
            date={date}
            className={className}
            setDate={setDate}
            ref={minuteRef}
            onLeftFocus={() => hourRef.current?.focus()}
            onRightFocus={() => secondRef.current?.focus()}
          />
        </div>
        <div className="grid gap-1 text-center">
          <Label htmlFor="seconds" className="text-xs">
            Seconds
          </Label>
          <TimePickerInput
            picker="seconds"
            date={date}
            className={className}
            setDate={setDate}
            ref={secondRef}
            onLeftFocus={() => minuteRef.current?.focus()}
          />
        </div>
        <div className="flex h-10 items-center">
          <Clock className="ml-2 h-4 w-4" />
        </div>
      </div>
      <Button type="submit">Start Vote</Button>
    </form>
  );
}
