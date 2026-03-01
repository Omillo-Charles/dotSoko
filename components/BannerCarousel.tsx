"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <section className="w-full py-12">
      <div className="w-full px-4 md:px-8">
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-8">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{slide.title}</h2>
                <p className="text-lg md:text-xl text-white/80 mb-8">{slide.subtitle}</p>
                <Link href={slide.href}>
                  <button className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all">
                    {slide.buttonText}
                  </button>
                </Link>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
