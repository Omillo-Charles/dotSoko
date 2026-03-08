"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useUser } from '@/hooks/useUser';
import { CreateUpdateModal } from './CreateUpdateModal';
import { formatDistanceToNow } from '@/lib/formatters';

// Remove static mock data
// We will replace this with real data fetched from the API

export const StoryItem = React.memo(({ avatar, username, variant, onClick }: { avatar: string; username: string; variant: 'add' | 'viewed' | 'unviewed'; onClick?: () => void }) => {
  if (variant === 'add') {
    return (
      <div 
        className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
        onClick={onClick}
      >
        <button className="relative w-16 h-16 p-1 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors">
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
    <div 
      className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
      onClick={onClick}
    >
      <div className={`relative w-16 h-16 p-1 ${ringColor} rounded-full transition-transform group-hover:scale-105`}>
        <div className="p-0.5 bg-background rounded-full h-full">
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
});
export const Updates = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { user, refreshUser } = useUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Real Data State
  const [storiesData, setStoriesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    try {
      const response = await api.get('/stories');
      const result = response.data;
      if (result.success) {
        setStoriesData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stories", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    // If logged in but no shop info locally, refresh to see if one was just created
    if (typeof window !== 'undefined' && localStorage.getItem('accessToken') && !user?.shop && user?.accountType !== 'seller') {
      refreshUser();
    }
  }, [refreshUser, user?.shop, user?.accountType]);

  const isSeller = user?.accountType === 'seller' || !!user?.shop;

  // Story Viewer State
  const [activeStoryGroupIndex, setActiveStoryGroupIndex] = useState<number | null>(null);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeGroup = activeStoryGroupIndex !== null ? storiesData[activeStoryGroupIndex] : null;
  const activeItem = activeGroup ? activeGroup.items[activeItemIndex] : null;

  // Cleanup effect to prevent body scroll when modal opens
  useEffect(() => {
    if (activeStoryGroupIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeStoryGroupIndex]);

  // Next/Prev Logic for stories
  const nextStory = useCallback(() => {
    setProgress(0);
    if (!activeGroup) return;

    if (activeItemIndex < activeGroup.items.length - 1) {
      // Next item in current shop's story
      setActiveItemIndex(prev => prev + 1);
    } else if (activeStoryGroupIndex !== null && activeStoryGroupIndex < storiesData.length - 1) {
      // Next shop's story
      setActiveStoryGroupIndex(activeStoryGroupIndex + 1);
      setActiveItemIndex(0);
    } else {
      // End of all stories
      closeStory();
    }
  }, [activeGroup, activeItemIndex, activeStoryGroupIndex]);

  const prevStory = useCallback(() => {
    setProgress(0);
    if (!activeGroup) return;

    if (activeItemIndex > 0) {
      // Prev item in current shop's story
      setActiveItemIndex(prev => prev - 1);
    } else if (activeStoryGroupIndex !== null && activeStoryGroupIndex > 0) {
      // Prev shop's story (go to its last item)
      const prevGroup = storiesData[activeStoryGroupIndex - 1];
      setActiveStoryGroupIndex(activeStoryGroupIndex - 1);
      setActiveItemIndex(prevGroup.items.length - 1);
    } else {
      // Cannot go back further than first item of first shop
      setProgress(0);
    }
  }, [activeGroup, activeItemIndex, activeStoryGroupIndex]);

  // Mark as viewed
  const markAsViewed = useCallback(async (updateId: string) => {
    try {
      if (!user) return; // Only track for logged in users
      await api.patch(`/stories/${updateId}/view`);
    } catch (error) {
      console.error("Failed to mark story as viewed", error);
    }
  }, [user]);

  // Story Progress Timer
  useEffect(() => {
    if (activeStoryGroupIndex === null || isPaused || !activeItem) return;

    // Mark current item as viewed if not already
    if (!activeItem.viewed) {
      markAsViewed(activeItem.id);
    }

    const duration = activeItem.duration || 5000;
    const intervalTime = 50; // Update progress every 50ms
    const step = (100 / duration) * intervalTime;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev + step >= 100) {
          nextStory();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeStoryGroupIndex, activeItemIndex, isPaused, activeItem, nextStory, markAsViewed]);


  const openStory = (index: number) => {
    setActiveStoryGroupIndex(index);
    setActiveItemIndex(0);
    setProgress(0);
    setIsPaused(false);
    
    // Mark the first item as viewed immediately
    const group = storiesData[index];
    if (group && group.items[0] && !group.items[0].viewed) {
      markAsViewed(group.items[0].id);
    }
  };

  const closeStory = () => {
    setActiveStoryGroupIndex(null);
    setActiveItemIndex(0);
    setProgress(0);
    // Refresh stories to update border colors when modal closes
    fetchStories();
  };

  const handleAddUpdate = () => {
    setIsCreateOpen(true);
  };

  // Horizontal Feed Scroll Logic
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
    <>
      {/* Horizontal Feed on Home Page */}
      <div className="relative w-full py-4">
        <div className="w-full px-4 md:px-8">
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-4 overflow-x-auto scroll-smooth no-scrollbar py-2"
          >
            {isSeller && (
              <StoryItem variant="add" avatar="" username="" onClick={handleAddUpdate} />
            )}
            {loading ? (
              <div className="flex gap-4">
                 <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                 <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                 <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
              </div>
            ) : storiesData.map((story, index) => (
              <StoryItem 
                key={story.id} 
                avatar={story.avatar} 
                username={story.username} 
                variant={story.allViewed ? 'viewed' : 'unviewed'}
                onClick={() => openStory(index)}
              />
            ))}
          </div>
        </div>
        
        {/* Carousel Desktop Navigation Arrows */}
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

      {/* Full-Screen Instagram-Style Story Modal */}
      {activeStoryGroupIndex !== null && activeGroup && activeItem && (
        <div className="fixed inset-0 z-[200] bg-black sm:bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
          
          {/* Main Story Container - Phone constraint on desktop */}
          <div className="relative w-full h-full sm:w-[450px] sm:h-[90vh] sm:rounded-[2.5rem] bg-zinc-900 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Background Image with Blur (Fill container) */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110" 
              style={{ backgroundImage: `url('${activeItem.url}')` }}
            />

            {/* Actual Content Layer */}
            <div className="relative w-full h-full flex flex-col z-10">
              
              {/* Top Progress Bars */}
              <div className="flex gap-1.5 px-3 pt-4 sm:pt-6 z-20">
                {activeGroup.items.map((item: any, idx: number) => (
                  <div key={item.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                    <div 
                      className={`h-full bg-white transition-all duration-75`}
                      style={{ 
                        width: idx < activeItemIndex ? '100%' : idx === activeItemIndex ? `${progress}%` : '0%',
                        transitionTimingFunction: 'linear'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Header: Avatar, Username, Time, Controls */}
              <div className="flex items-center justify-between px-4 py-3 z-20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                    <img src={activeGroup.avatar} alt={activeGroup.username} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-2 drop-shadow-md">
                    <span className="text-white text-sm font-bold">{activeGroup.username}</span>
                    <span className="text-white/60 text-xs font-semibold">
                      {activeItem.createdAt ? formatDistanceToNow(activeItem.createdAt) : 'just now'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-white/80 hover:text-white transition-colors drop-shadow-md">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={closeStory} 
                    className="p-2 text-white/80 hover:text-white transition-colors drop-shadow-md"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Main Media Area (Tap targets) */}
              <div className="flex-1 relative flex items-center justify-center">
                
                {/* Media */}
                {activeItem.type === 'video' ? (
                  <video 
                    src={activeItem.url} 
                    className="w-full h-auto max-h-full object-contain pointer-events-none drop-shadow-2xl"
                    autoPlay
                    muted
                    loop
                  />
                ) : (
                  <img 
                    src={activeItem.url} 
                    alt="Story content" 
                    className="w-full h-auto max-h-full object-contain pointer-events-none drop-shadow-2xl"
                  />
                )}

                {/* Left Tap Target (Prev) */}
                <div 
                  className="absolute left-0 top-0 w-[40%] h-full z-20 cursor-pointer"
                  onClick={prevStory}
                  onMouseDown={() => setIsPaused(true)}
                  onMouseUp={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                />

                {/* Right Tap Target (Next) */}
                <div 
                  className="absolute right-0 top-0 w-[60%] h-full z-20 cursor-pointer"
                  onClick={nextStory}
                  onMouseDown={() => setIsPaused(true)}
                  onMouseUp={() => setIsPaused(false)}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                />

                {/* Text Overlay (Bottom) */}
                {activeItem.text && (
                  <div className="absolute bottom-16 left-0 w-full px-6 z-10 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-3xl mx-auto w-fit max-w-[90%] shadow-xl">
                      <p className="text-white text-center font-bold text-[15px] leading-snug drop-shadow-md">
                        {activeItem.text}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Reply Action (Optional, visual only for now) */}
              <div className="px-4 pb-6 sm:pb-8 pt-4 z-20 flex gap-3">
                <input 
                  type="text" 
                  placeholder="Reply to dotSoko..." 
                  className="flex-1 bg-transparent border border-white/30 rounded-full px-5 py-3 text-white text-sm placeholder:text-white/60 focus:outline-none focus:border-white focus:bg-white/10 transition-all backdrop-blur-sm"
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                />
              </div>

            </div>
          </div>
        </div>
      )}
      <CreateUpdateModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onCreated={() => fetchStories()}
      />
    </>
  );
};