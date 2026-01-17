"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Gavel,
  MessageSquare,
  Heart,
  Settings,
  LogOut,
  PlusCircle,
  Menu,
  X,
  ChevronRight,
  User,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const sidebarLinks = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Listings",
    href: "/dashboard/my-listings",
    icon: Package,
    badge: null,
  },
  {
    title: "Create Listing",
    href: "/dashboard/create-listing",
    icon: PlusCircle,
  },
  {
    title: "My Bids",
    href: "/dashboard/bids",
    icon: Gavel,
    badge: null,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    badge: 3,
  },
  {
    title: "Wishlist",
    href: "/dashboard/wishlist",
    icon: Heart,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

function SidebarContent({ pathname, onLinkClick }) {
  const { data: session } = useSession();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2" onClick={onLinkClick}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">B</span>
          </div>
          <span className="font-bold text-xl">BazaarFlow</span>
        </Link>
      </div>

      {/* Create Listing Button */}
      <div className="p-4">
        <Button asChild className="w-full" size="lg">
          <Link href="/dashboard/create-listing" onClick={onLinkClick}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Listing
          </Link>
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== "/dashboard" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="flex-1">{link.title}</span>
              {link.badge && (
                <Badge 
                  variant={isActive ? "secondary" : "default"} 
                  className="h-5 min-w-5 flex items-center justify-center text-xs"
                >
                  {link.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session?.user?.image} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get current page title
  const currentPage = sidebarLinks.find(
    (link) => pathname === link.href || 
    (link.href !== "/dashboard" && pathname.startsWith(link.href))
  );
  const pageTitle = currentPage?.title || "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile Menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent 
            pathname={pathname} 
            onLinkClick={() => setMobileOpen(false)} 
          />
        </SheetContent>
      </Sheet>

      {/* Page Title */}
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
            2
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image} />
                <AvatarFallback>
                  {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function DashboardSidebar({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r bg-card">
        <SidebarContent pathname={pathname} onLinkClick={() => {}} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-72">
        <DashboardHeader />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
