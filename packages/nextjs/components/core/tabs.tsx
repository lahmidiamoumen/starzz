"use client";

import React, { ReactNode } from "react";
import { clsx } from "~~/utils/scaffold-eth/clsx";

interface TabProps {
  defaultTab?: number;
  children: ReactNode;
}

const Tab: React.FC<TabProps> = ({ defaultTab = 0, children }) => {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  return (
    <>
      <div className="w-full gap-2 flex">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          {children &&
            React.Children.map(children, (child, index) => {
              if (React.isValidElement(child)) {
                const { label } = child.props;
                return (
                  <button
                    onClick={() => handleTabClick(index)}
                    className={clsx(
                      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                      index === activeTab && "bg-background text-foreground shadow-sm",
                    )}
                  >
                    {label}
                  </button>
                );
              }
              return null;
            })}
        </div>
      </div>
      <div className="w-full">
        {React.Children.map(children, (child, index) => (
          <div key={index} className={clsx(activeTab !== index && "hidden")}>
            {child}
          </div>
        ))}
      </div>
    </>
  );
};

interface TabViewProps {
  label: string;
  children: ReactNode;
}

const TabView: React.FC<TabViewProps> = ({ children }) => {
  return <>{children}</>;
};

export { Tab, TabView };
