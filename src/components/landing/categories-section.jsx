"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import {
  Laptop,
  Shirt,
  Home,
  Car,
  Palette,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Gem,
  Package,
} from "lucide-react";

// Map icon names to components
const iconMap = {
  Laptop,
  Shirt,
  Home,
  Car,
  Palette,
  Dumbbell,
  BookOpen,
  Gamepad2,
  Gem,
  Package,
};

export function CategoriesSection() {
  return (
    <section className="py-24 bg-muted/30" id="categories">
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
            Explore Categories
          </h2>
          <p className="text-lg text-muted-foreground">
            From electronics to vintage collectibles, find or sell 
            items across a wide range of categories.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((category, index) => {
            const IconComponent = iconMap[category.icon] || Package;
            return (
              <motion.div
                key={category.value}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/listings?category=${category.value}`}>
                  <Card className="h-full hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        className="mb-3 flex justify-center"
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                      >
                        <IconComponent className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                      </motion.div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">
                        {category.label}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
