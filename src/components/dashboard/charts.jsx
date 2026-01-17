"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

export function EarningsChart({ data }) {
  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
      background: "transparent",
      sparkline: { enabled: false },
    },
    colors: ["#3b82f6", "#10b981"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "hsl(var(--border))",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: data?.categories || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      labels: {
        style: {
          colors: "hsl(var(--muted-foreground))",
          fontSize: "12px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: "hsl(var(--muted-foreground))",
          fontSize: "12px",
        },
        formatter: (value) => "৳" + value.toLocaleString(),
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (value) => "৳" + value.toLocaleString(),
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "hsl(var(--foreground))",
      },
    },
  };

  const series = data?.series || [
    {
      name: "Sales",
      data: [12000, 19000, 15000, 21000, 18000, 24000],
    },
    {
      name: "Purchases",
      data: [8000, 11000, 9000, 13000, 10000, 15000],
    },
  ];

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Earnings Overview</CardTitle>
        <CardDescription>Your sales and purchases over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="area" height={300} />
      </CardContent>
    </Card>
  );
}

export function BidActivityChart({ data }) {
  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      background: "transparent",
    },
    colors: ["#8b5cf6", "#f59e0b"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: "hsl(var(--border))",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: data?.categories || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: {
        style: {
          colors: "hsl(var(--muted-foreground))",
          fontSize: "12px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: "hsl(var(--muted-foreground))",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      theme: "dark",
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: "hsl(var(--foreground))",
      },
    },
  };

  const series = data?.series || [
    {
      name: "Bids Placed",
      data: [4, 7, 3, 8, 5, 2, 6],
    },
    {
      name: "Bids Received",
      data: [2, 5, 4, 6, 3, 1, 4],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bid Activity</CardTitle>
        <CardDescription>Weekly bidding overview</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="bar" height={300} />
      </CardContent>
    </Card>
  );
}

export function CategoryPieChart({ data }) {
  const options = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
      background: "transparent",
    },
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"],
    labels: data?.labels || ["Electronics", "Fashion", "Home", "Vehicles", "Collectibles", "Other"],
    legend: {
      position: "bottom",
      labels: {
        colors: "hsl(var(--foreground))",
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              color: "hsl(var(--foreground))",
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 700,
              color: "hsl(var(--foreground))",
            },
            total: {
              show: true,
              label: "Total",
              color: "hsl(var(--muted-foreground))",
              fontSize: "12px",
              fontWeight: 400,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "dark",
    },
    stroke: {
      show: false,
    },
  };

  const series = data?.series || [35, 25, 15, 10, 10, 5];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listings by Category</CardTitle>
        <CardDescription>Distribution of your active listings</CardDescription>
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="donut" height={300} />
      </CardContent>
    </Card>
  );
}
