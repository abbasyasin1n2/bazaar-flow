import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard";

export const metadata = {
  title: "Dashboard | BazaarFlow",
  description: "Manage your listings, bids, and messages",
};

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <DashboardSidebar>{children}</DashboardSidebar>;
}
