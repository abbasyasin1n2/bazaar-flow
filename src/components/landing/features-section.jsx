"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Gavel, 
  Shield, 
  MessageSquare, 
  Zap, 
  Eye, 
  CreditCard 
} from "lucide-react";

const features = [
  {
    icon: Gavel,
    title: "Seller's Choice Auctions",
    description: "Unlike traditional auctions, you decide which bid to accept. Pick based on price, buyer reputation, or your preference.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Every transaction is protected. Buyer and seller information stays private until you choose to connect.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: MessageSquare,
    title: "Private Messaging",
    description: "Communicate directly with potential buyers. Ask questions, negotiate, and build trust before accepting a bid.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "Instant Buy Now",
    description: "Set a 'Buy Now' price for buyers who want to skip the bidding and purchase immediately.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "See all bids on your listings. Compare offers, check bidder profiles, and make informed decisions.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: CreditCard,
    title: "No Hidden Fees",
    description: "Simple, transparent pricing. List items for free and only pay a small fee when you successfully sell.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30" id="features">
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
            Why Choose BazaarFlow?
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;ve reimagined online marketplaces to give sellers complete control 
            while keeping the experience seamless for buyers.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
