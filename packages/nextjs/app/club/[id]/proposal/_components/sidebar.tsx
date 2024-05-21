"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "~~/components/core/button";
import { clsx as cn } from "~~/utils/scaffold-eth/clsx";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  items: {
    href: string;
    title: string;
  }[];
}

export function Sidebar({ className, children, items, ...props }: SidebarProps) {
  const pathname = usePathname();
  return (
    <div className={cn("pb-4", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {children}
          <div className="mt-5 space-y-1 pt-4">
            <nav className={cn("grid gap-1 group-[[data-collapsed=true]]:justify-start", className)} {...props}>
              {items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: pathname === item.href ? "default" : "ghost", size: "sm" }),
                    pathname !== item.href && "hover:bg-accent hover:text-accent-foreground btn-ghost",
                    "h-9 flex flex-row !justify-start",
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-file mr-2 h-4 w-4"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                  </svg>
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
