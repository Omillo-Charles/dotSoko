"use client";

import React from "react";
import Carousel from "../media/Carousel";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt }) => {
  // Clean up images array: filter null/undefined and ensure valid URLs
  const validImages = images.filter(img => img && typeof img === 'string' && img.trim() !== "");
  
  // If no valid images, don't render anything
  if (validImages.length === 0) return null;

  // Render single image as direct img tag for natural aspect ratio (like X.com)
  if (validImages.length === 1) {
    return (
      <img
        src={validImages[0]}
        alt={alt}
        className="max-w-full max-h-[600px] rounded-[1.25rem] border border-border object-cover"
        loading="lazy"
      />
    );
  }

  // Render carousel for multiple images
  return (
    <div className="relative inline-block max-w-full rounded-[1.25rem] border border-border overflow-hidden group/carousel bg-background">
      {/* Invisible spacer to give the container natural intrinsic height/width based on the first image */}
      <img
        src={validImages[0]}
        alt="spacer"
        className="max-w-full max-h-[600px] object-cover opacity-0 pointer-events-none block"
        aria-hidden="true"
      />
      
      {/* Absolute Carousel that fills the dimensions explicitly set by the spacer */}
      <div className="absolute inset-0 w-full h-full">
        <Carousel
          items={validImages}
          aspectRatio="h-full"
          variant="slide"
          showArrows={true}
          showDots={true}
          className="w-full h-full"
          renderItem={(src, index) => (
            <img 
              src={src} 
              alt={`${alt} - Image ${index + 1}`} 
              className="w-full h-full object-cover" 
              loading="lazy"
            />
          )}
        />
      </div>
    </div>
  );
};
