"use client";

import React from 'react';
import Link from 'next/link';
import Carousel from "../media/Carousel";

const slides = [
  {
    image: '/bottom banner/clothing.png',
    title: 'Latest Fashion Trends',
    subtitle: 'Discover the new arrivals',
    buttonText: 'Shop Now',
    href: '/shop?cat=clothing-apparel',
  },
  {
    image: '/bottom banner/gym.jfif',
    title: 'Achieve Your Fitness Goals',
    subtitle: 'Top-quality gym and fitness equipment',
    buttonText: 'Get Fit',
    href: '/shop?cat=sports-fitness',
  },
  {
    image: '/bottom banner/jbl.png',
    title: 'Crystal Clear Sound',
    subtitle: 'Experience music like never before',
    buttonText: 'Explore Audio',
    href: '/shop?cat=electronics',
  },
  {
    image: '/bottom banner/ps.png',
    title: 'Next-Gen Gaming',
    subtitle: 'Power your dreams',
    buttonText: 'Discover Games',
    href: '/shop?cat=toys-games',
  },
];

export const BannerCarousel = () => {
  return (
    <section className="w-full py-12">
      <div className="w-full px-4 md:px-8">
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-muted">
          <Carousel
            items={slides}
            autoPlay={true}
            interval={5000}
            variant="fade"
            aspectRatio="h-full"
            renderItem={(slide) => (
              <div className="relative w-full h-full">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-8">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {slide.title}
                  </h2>
                  <p className="text-lg md:text-xl text-white/80 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {slide.subtitle}
                  </p>
                  <Link href={slide.href}>
                    <button className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all">
                      {slide.buttonText}
                    </button>
                  </Link>
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
};
