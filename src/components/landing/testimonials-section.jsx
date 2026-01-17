"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Vintage Collector",
    avatar: "/avatars/sarah.jpg",
    content: "I've sold over 50 vintage items on BazaarFlow. The ability to choose my buyer means I always sell to people who truly appreciate my pieces.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Electronics Seller",
    avatar: "/avatars/michael.jpg",
    content: "The messaging feature is a game-changer. I can answer questions and negotiate directly. Much better than traditional auction sites.",
    rating: 5,
  },
  {
    name: "Emma Williams",
    role: "Fashion Enthusiast",
    avatar: "/avatars/emma.jpg",
    content: "As a buyer, I love that I can make a compelling case for why the seller should pick me. It's more personal than just bidding highest.",
    rating: 5,
  },
  {
    name: "David Rodriguez",
    role: "Small Business Owner",
    avatar: "/avatars/david.jpg",
    content: "BazaarFlow helped me launch my side business selling handmade crafts. The no-pressure selling environment is perfect for artisans.",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    role: "Regular Buyer",
    avatar: "/avatars/lisa.jpg",
    content: "Found amazing deals on furniture for my new apartment. The sellers were friendly and the whole process felt more human.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Car Parts Dealer",
    avatar: "/avatars/james.jpg",
    content: "Sold specialized auto parts to the right buyers who knew what they were getting. Quality over quantity - that's what BazaarFlow offers.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-muted/30">
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
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground">
            Don&apos;t just take our word for it. Here&apos;s what real 
            users have to say about their BazaarFlow experience.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground mb-6 italic">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>
                        {testimonial.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
