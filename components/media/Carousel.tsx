"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
  aspectRatio?: string; // e.g., "aspect-square", "aspect-video", "h-[400px]"
  variant?: "fade" | "slide";
}

const Carousel = <T,>({
  items,
  renderItem,
  autoPlay = false,
  interval = 5000,
  showArrows = true,
  showDots = true,
  className = "",
  aspectRatio = "aspect-square",
  variant = "slide",
}: CarouselProps<T>) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, next, items.length]);

  if (!items || items.length === 0) return null;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const fadeVariants = {
    enter: { opacity: 0 },
    center: { zIndex: 1, opacity: 1 },
    exit: { zIndex: 0, opacity: 0 },
  };

  const activeVariants = variant === "slide" ? slideVariants : fadeVariants;

  return (
    <div className={`relative w-full overflow-hidden group/carousel ${aspectRatio} ${className}`}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={activeVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipeThreshold = 50;
            const velocityThreshold = 500;
            
            if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
              next();
            } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
              prev();
            }
          }}
          whileDrag={{ scale: 0.99 }}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-pan-y select-none"
        >
          {renderItem(items[currentIndex], currentIndex)}
        </motion.div>
      </AnimatePresence>

      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/20 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-background/40"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/20 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-background/40"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {showDots && items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
