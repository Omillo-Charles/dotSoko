"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const stories = [
  { id: 1, username: 'dotSoko', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dotSoko' },
  { id: 2, username: 'creativestudio', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creativestudio' },
  { id: 3, username: 'fashionhub', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fashionhub' },
  { id: 4, username: 'techtrends', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techtrends' },
  { id: 5, username: 'foodie', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=foodie' },
  { id: 6, username: 'travelbug', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=travelbug' },
  { id: 7, username: 'artisan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artisan' },
  { id: 8, username: 'gamerz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gamerz' },
  { id: 9, username: 'fitlife', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fitlife' },
  { id: 10, username: 'musica', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musica' },
  { id: 11, username: 'bookworm', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bookworm' },
  { id: 12, username: 'petpals', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=petpals' },
  { id: 13, username: 'diycrafts', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=diycrafts' },
  { id: 14, username: 'homedecor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=homedecor' },
  { id: 15, username: 'gadgetguru', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gadgetguru' },
  { id: 16, username: 'cozyhome', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cozyhome' },
  { id: 17, username: 'plantlover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=plantlover' },
  { id: 18, username: 'moviebuff', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=moviebuff' },
  { id: 19, username: 'wanderlust', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wanderlust' },
  { id: 20, username: 'techie', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techie' },
  { id: 21, username: 'styleicon', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=styleicon' },
  { id: 22, username: 'healthnut', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=healthnut' },
  { id: 23, username: 'musiclover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=musiclover' },
  { id: 24, username: 'artlover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=artlover' },
  { id: 25, username: 'booklover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=booklover' },
];

const StoryItem = ({ avatar, username, variant }: { avatar: string; username: string; variant: 'add' | 'viewed' | 'unviewed' }) => {
  if (variant === 'add') {
    return (
      <div className="flex-shrink-0 flex flex-col items-center gap-2">
        <button className="relative w-16 h-16 p-1 bg-muted rounded-full flex items-center justify-center">
          <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
        </button>
        <p className="text-xs font-medium text-foreground truncate w-16 text-center">Add Update</p>
      </div>
    );
  }

  const ringColor = variant === 'viewed' ? 'bg-slate-300 dark:bg-slate-700' : 'bg-primary';

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-2">
      <div className={`relative w-16 h-16 p-1 ${ringColor} rounded-full`}>
        <div className="p-0.5 bg-background rounded-full">
          <img
            src={avatar}
            alt={username}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
      <p className="text-xs font-medium text-foreground truncate w-16 text-center">{username}</p>
    </div>
  );
};

export const Updates = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkForScrollPosition = () => {
    const { current } = scrollContainerRef;
    if (current) {
      const { scrollLeft, scrollWidth, clientWidth } = current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    const { current } = scrollContainerRef;
    if (current) {
      checkForScrollPosition();
      current.addEventListener('scroll', checkForScrollPosition);
    }

    return () => {
      if (current) {
        current.removeEventListener('scroll', checkForScrollPosition);
      }
    };
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full py-4">
      <div className="w-full px-4 md:px-8">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 overflow-x-auto scroll-smooth no-scrollbar"
        >
          <StoryItem variant="add" avatar="" username="" />
          {stories.map((story, index) => {
            const variant = index < 4 ? 'viewed' : 'unviewed';
            return <StoryItem key={story.id} avatar={story.avatar} username={story.username} variant={variant} />
          })}
        </div>
      </div>
      <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 w-full justify-between px-2 pointer-events-none">
        {canScrollLeft ? (
          <button
            onClick={() => scroll('left')}
            className="pointer-events-auto bg-background/50 backdrop-blur-sm border border-border rounded-full p-1.5 shadow-md hover:bg-muted transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        ) : <div />}
        {canScrollRight ? (
          <button
            onClick={() => scroll('right')}
            className="pointer-events-auto bg-background/50 backdrop-blur-sm border border-border rounded-full p-1.5 shadow-md hover:bg-muted transition-all"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        ) : <div />}
      </div>
    </div>
  );
};