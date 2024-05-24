import * as React from "react";
import { clsx as cn } from "~~/utils/scaffold-eth/clsx";

export type SearchProps = React.InputHTMLAttributes<HTMLInputElement>;
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Search = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "h-[44px] flex items-center rounded-3xl border border-skin-border px-3 text-sm focus-within:border-zinc-800",
        className,
      )}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 opacity-70">
        <path
          fillRule="evenodd"
          d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
          clipRule="evenodd"
        />
      </svg>
      <input
        {...props}
        type="search"
        ref={ref}
        className="w-full p-2 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
});

Search.displayName = "Search";

export { Search };
