"use client";

import { useSession, signOut } from "next-auth/react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared";
import { useSweetAlert } from "@/hooks";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { 
  LogOut, 
  Package, 
  Gavel, 
  MessageSquare, 
  PlusCircle,
  Home,
  User,
  CheckCircle
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { showConfirm } = useSweetAlert();

  const handleSignOut = async () => {
    const confirmed = await showConfirm(
      "Sign Out",
      "Are you sure you want to sign out?",
      "Sign Out"
    );
    if (confirmed) {
      signOut({ callbackUrl: "/" });
    }
  };

  const quickActions = [
    {
      title: "My Listings",
      description: "Manage your listed items",
      icon: Package,
      href: "/my-listings",
      color: "text-blue-500",
    },
    {
      title: "My Bids",
      description: "Track your placed bids",
      icon: Gavel,
      href: "/my-bids",
      color: "text-green-500",
    },
    {
      title: "Messages",
      description: "View conversations",
      icon: MessageSquare,
      href: "/messages",
      color: "text-purple-500",
    },
    {
      title: "Create Listing",
      description: "List a new item",
      icon: PlusCircle,
      href: "/create-listing",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold">🛒 BazaarFlow</h1>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/listings">
                <Home className="h-4 w-4 mr-2" />
                Browse
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="flex items-center gap-6 p-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session?.user?.image} />
                <AvatarFallback className="text-2xl">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">
                  Welcome back, {session?.user?.name?.split(" ")[0]}! 👋
                </h2>
                <p className="text-muted-foreground">{session?.user?.email}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
              >
                <Link href={action.href}>
                  <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                    <CardHeader className="pb-2">
                      <action.icon className={`h-8 w-8 ${action.color} group-hover:scale-110 transition-transform`} />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Auth Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                Step 2: Authentication Complete!
              </CardTitle>
              <CardDescription>
                You are successfully logged in. This confirms the auth system is working.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  NextAuth.js with credentials provider
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  User registration with bcrypt password hashing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Protected route middleware
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Session management with JWT
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Login/Register pages with animations
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
