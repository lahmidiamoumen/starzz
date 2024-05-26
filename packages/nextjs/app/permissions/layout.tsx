import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Roles & Permissions",
  description: "Manage roles and permissions for moderators and community stewards",
});

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full mx-auto max-w-[1012px] px-4 mb-4">{children}</div>;
};

export default Layout;
