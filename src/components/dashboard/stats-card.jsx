"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
}) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-500";
    if (trend === "down") return "text-red-500";
    return "text-muted-foreground";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {(description || trendValue) && (
              <div className="flex items-center gap-2">
                {trendValue && (
                  <span className={cn("flex items-center gap-1 text-sm font-medium", getTrendColor())}>
                    {getTrendIcon()}
                    {trendValue}
                  </span>
                )}
                {description && (
                  <span className="text-sm text-muted-foreground">{description}</span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
