"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Clean up images array: filter null/undefined and ensure valid URLs
  const validImages = images.filter(img => img && typeof img === 'string' && img.trim() !== "");
  
  // If no valid images, don't render anything
  if (validImages.length === 0) return null;

  // Track scrolling to update active dot
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    // Calculate which image is most visible based on scroll position
    const scrollPosition = scrollContainerRef.current.scrollLeft;
    const containerWidth = scrollContainerRef.current.clientWidth;
    const newIndex = Math.round(scrollPosition / containerWidth);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < validImages.length) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollTo = (index: number) => {
    if (!scrollContainerRef.current) return;
    const containerWidth = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: containerWidth * index,
      behavior: "smooth"
    });
    setCurrentIndex(index);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent clicking through to product page
    if (currentIndex < validImages.length - 1) {
      scrollTo(currentIndex + 1);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent clicking through to product page
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1);
    }
  };

  // Setup intersection observer for smoother dot tracking if desired (optional)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex, validImages.length]);

  return (
    <div className="relative w-full h-full group/carousel">
      {/* Scrollable Container */}
      <div 
        ref={scrollContainerRef}
        className={`w-full h-full flex ${validImages.length > 1 ? 'overflow-x-auto md:overflow-hidden snap-x snap-mandatory' : 'overflow-hidden'} no-scrollbar`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {validImages.map((src, index) => (
          <div 
            key={`${src}-${index}`} 
            className="w-full h-full flex-none snap-center snap-always relative"
          >
            <img 
              src={src} 
              alt={`${alt} - Image Background ${index + 1}`} 
              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-110 pointer-events-none" 
            />
            <img 
              src={src} 
              alt={`${alt} - Image ${index + 1}`} 
              className="relative w-full h-full object-contain z-10" 
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows (Desktop mostly) */}
      {validImages.length > 1 && (
        <>
          <button 
            onClick={prevImage}
            disabled={currentIndex === 0}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md shadow-md flex items-center justify-center text-foreground z-10 hover:bg-background transition-all md:opacity-0 md:-translate-x-2 md:group-hover/carousel:opacity-100 md:group-hover/carousel:translate-x-0 ${currentIndex === 0 ? 'hidden' : ''}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={nextImage}
            disabled={currentIndex === validImages.length - 1}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md shadow-md flex items-center justify-center text-foreground z-10 hover:bg-background transition-all md:opacity-0 md:translate-x-2 md:group-hover/carousel:opacity-100 md:group-hover/carousel:translate-x-0 ${currentIndex === validImages.length - 1 ? 'hidden' : ''}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-background/30 backdrop-blur-sm px-2 py-1 rounded-full pointer-events-none">
            {validImages.map((_, index) => (
              <div 
                key={index}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === index 
                    ? 'w-2 h-2 bg-primary' 
                    : 'w-1.5 h-1.5 bg-primary/40'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
