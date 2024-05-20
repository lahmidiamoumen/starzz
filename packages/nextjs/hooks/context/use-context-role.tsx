"use client";

import React from "react";
import { useGetRole } from "~~/hooks/services/use-get-role";
import { RoleRecord } from "~~/types/role";

interface RoleContextType {
  role: RoleRecord | undefined;
  isLoading: boolean;
}

const RoleContext = React.createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: React.ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const { payload: role, isLoading } = useGetRole();

  return <RoleContext.Provider value={{ role, isLoading }}>{children}</RoleContext.Provider>;
};

export const useRole = (): RoleContextType => {
  const context = React.useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
