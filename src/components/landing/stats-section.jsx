"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Package, Award } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Active Users",
    description: "Trusted buyers and sellers",
  },
  {
    icon: Package,
    value: "50,000+",
    label: "Items Listed",
    description: "Across all categories",
  },
  {
    icon: TrendingUp,
    value: "$2M+",
    label: "Total Sales",
    description: "And growing every day",
  },
  {
    icon: Award,
    value: "98%",
    label: "Satisfaction Rate",
    description: "Happy customers",
  },
];

export function StatsSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-muted-foreground">
            Join a thriving community of buyers and sellers who 
            trust BazaarFlow for their online trading.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="text-center h-full">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-7 w-7 text-primary" />
                  </div>
                  <motion.p
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, delay: index * 0.1 + 0.2 }}
                    className="text-4xl font-bold mb-1"
                  >
                    {stat.value}
                  </motion.p>
                  <p className="font-medium mb-1">{stat.label}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
