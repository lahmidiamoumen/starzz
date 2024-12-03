"use client";

import { TimePickerDemo } from "./time-picker-demo";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "~~/components/core/button";
import { Calendar } from "~~/components/core/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~~/components/core/form";
import { Popover, PopoverContent, PopoverTrigger } from "~~/components/core/popover";
import { usePostSchedule } from "~~/hooks/services/use-post-schedule";
import { clsx as cn } from "~~/utils/scaffold-eth/clsx";

interface Props {
  clubId: number;
  proposalId: number;
}

export function DateTimePickerForm(props: Props) {
  const { clubId, proposalId } = props;
  const { form, handleSubmit } = usePostSchedule({ clubId, proposalId });

  return (
    <Form {...form}>
      <form className="mt-10 gap-4 flex flex-col items-end" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-5">
          <FormField
            control={form.control}
            name="startingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-left">Starting Time</FormLabel>
                <Popover>
                  <FormControl>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP HH:mm:ss") : <span>Pick a starting date</span>}
                      </Button>
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    <div className="p-3 border-t border-border">
                      <TimePickerDemo className="!w-[52px]" setDate={field.onChange} date={field.value} />
                    </div>
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-left">Ending Time</FormLabel>
                <Popover>
                  <FormControl>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP HH:mm:ss") : <span>Pick an ending date</span>}
                      </Button>
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    <div className="p-3 border-t border-border">
                      <TimePickerDemo className="!w-[52px]" setDate={field.onChange} date={field.value} />
                    </div>
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Start Vote</Button>
      </form>
    </Form>
  );
}
