"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: string; // yyyy-MM-dd format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value + "T12:00:00") : undefined;

  const handleSelect = React.useCallback(
    (d: Date | undefined) => {
      if (d) {
        onChange(format(d, "yyyy-MM-dd"));
        setOpen(false);
      }
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          data-empty={!date}
          className={cn(
            "w-[180px] justify-between text-left font-normal border-border bg-background hover:bg-accent/50 hover:text-accent-foreground",
            "data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          {date ? format(date, "MMM d, yyyy") : <span>{placeholder}</span>}
          <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          defaultMonth={date}
          captionLayout="dropdown"
          startMonth={new Date(2020, 0)}
          endMonth={new Date()}
          disabled={(d) => d > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
