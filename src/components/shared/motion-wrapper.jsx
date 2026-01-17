"use client";

import { motion } from "motion/react";

export function MotionDiv({ children, className, ...props }) {
  return (
    <motion.div className={className} {...props}>
      {children}
    </motion.div>
  );
}

// Fade in from bottom animation
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Fade in animation
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 },
};

// Scale up animation
export const scaleUp = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 },
};

// Slide in from left
export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 },
};

// Slide in from right
export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 },
};

// Stagger children animation
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Hover scale effect
export const hoverScale = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
};

// Card hover effect
export const cardHover = {
  whileHover: { y: -5, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" },
  transition: { type: "spring", stiffness: 400, damping: 17 },
};
