"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Package, Gavel, DollarSign, Eye, PlusCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import {
  StatsCard,
  EarningsChart,
  BidActivityChart,
  CategoryPieChart,
  RecentListingsTable,
  RecentBidsTable,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants";

function EmptyState({ title, description, actionLabel, actionHref }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 max-w-sm">{description}</p>
        {actionLabel && actionHref && (
          <Button asChild>
            <Link href={actionHref}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {actionLabel}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();
        if (data.success) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalEarnings: 0,
    activeListings: 0,
    totalBidsReceived: 0,
    totalBidsPlaced: 0,
  };

  const hasListings = stats.totalListings > 0;
  const hasBids = stats.totalBidsPlaced > 0;
  const hasActivity = hasListings || hasBids;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0] || "User"}! 👋
        </h2>
        <p className="text-muted-foreground">
          {hasActivity 
            ? "Here's what's happening with your marketplace activity."
            : "Get started by creating your first listing or browsing the marketplace."}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(stats.totalEarnings)}
          icon={DollarSign}
          trend={stats.totalEarnings > 0 ? "up" : "neutral"}
          description={stats.totalEarnings > 0 ? "from sales" : "no sales yet"}
        />
        <StatsCard
          title="Active Listings"
          value={stats.activeListings}
          icon={Package}
          trend={stats.activeListings > 0 ? "up" : "neutral"}
          description={stats.activeListings > 0 ? "live now" : "create your first"}
        />
        <StatsCard
          title="Bids Received"
          value={stats.totalBidsReceived}
          icon={Gavel}
          trend={stats.totalBidsReceived > 0 ? "up" : "neutral"}
          description="on your listings"
        />
        <StatsCard
          title="Bids Placed"
          value={stats.totalBidsPlaced}
          icon={Eye}
          trend={stats.totalBidsPlaced > 0 ? "up" : "neutral"}
          description="on other items"
        />
      </motion.div>

      {/* Empty State or Charts */}
      {!hasActivity ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 md:grid-cols-2"
        >
          <EmptyState
            title="No Listings Yet"
            description="Start selling by creating your first listing. It only takes a few minutes!"
            actionLabel="Create Listing"
            actionHref="/dashboard/create-listing"
          />
          <EmptyState
            title="No Bids Yet"
            description="Browse the marketplace and place bids on items you're interested in."
            actionLabel="Browse Listings"
            actionHref="/listings"
          />
        </motion.div>
      ) : (
        <>
          {/* Charts Row */}
          {hasListings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-4 lg:grid-cols-3"
            >
              <EarningsChart />
              <CategoryPieChart 
                data={dashboardData?.categoryStats ? {
                  labels: Object.keys(dashboardData.categoryStats),
                  series: Object.values(dashboardData.categoryStats),
                } : undefined}
              />
            </motion.div>
          )}

          {/* Bid Activity Chart */}
          {(stats.totalBidsReceived > 0 || stats.totalBidsPlaced > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <BidActivityChart />
            </motion.div>
          )}

          {/* Tables Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid gap-4 lg:grid-cols-2"
          >
            {hasListings ? (
              <RecentListingsTable listings={dashboardData?.recentListings || []} />
            ) : (
              <EmptyState
                title="No Listings Yet"
                description="Create your first listing to start selling!"
                actionLabel="Create Listing"
                actionHref="/dashboard/create-listing"
              />
            )}
            {hasBids ? (
              <RecentBidsTable bids={dashboardData?.recentBids || []} />
            ) : (
              <EmptyState
                title="No Bids Yet"
                description="Browse listings and place bids on items you want!"
                actionLabel="Browse Listings"
                actionHref="/listings"
              />
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
