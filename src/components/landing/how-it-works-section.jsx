"use client";

import { motion } from "motion/react";
import { 
  Upload, 
  Users, 
  CheckCircle, 
  PartyPopper 
} from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "List Your Item",
    description: "Upload photos, write a description, set your starting price and optional 'Buy Now' price.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    step: "02",
    title: "Receive Bids",
    description: "Interested buyers place their bids. You can see all offers and bidder profiles in real-time.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Choose Your Buyer",
    description: "Review all bids, message bidders if needed, and accept the offer that works best for you.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: PartyPopper,
    step: "04",
    title: "Complete the Sale",
    description: "Connect with the winning bidder, arrange payment and delivery. Congratulations on your sale!",
    color: "from-green-500 to-emerald-500",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24" id="how-it-works">
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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Selling on BazaarFlow is simple. Follow these four steps 
            and you&apos;ll be making sales in no time.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="relative inline-block mb-6">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-background border-2 rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
