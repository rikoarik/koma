'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/scrollcraft/HeroSection';
import StoryActs from '@/components/scrollcraft/StoryActs';
import CollageInteractive from '@/components/scrollcraft/CollageInteractive';
import FeedContainer from '@/components/feed/FeedContainer';
import ComposerModal from '@/components/feed/ComposerModal';
import DonationModal from '@/components/donation/DonationModal';
import Footer from '@/components/layout/Footer';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export default function HomePage() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [composerInitialText, setComposerInitialText] = useState('');
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll specifically on Home page (as requested)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.1,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pause Lenis scrolling when modals are open
  useEffect(() => {
    if (!lenisRef.current) return;
    if (isComposerOpen || isDonationOpen) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }
  }, [isComposerOpen, isDonationOpen]);

  const handleOpenComposer = () => {
    setIsComposerOpen(true);
  };

  const handleOpenDonation = () => {
    setIsDonationOpen(true);
  };

  const handleExploreFeed = () => {
    const el = document.getElementById('komunitas');
    if (el) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(el, { offset: -70 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePostCreated = async (postData: any): Promise<{ success: boolean; state?: 'published' | 'held_for_review' | 'removed'; error?: string }> => {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      const json = await res.json();
      if (json.success) {
        // Celebrate only content actually visible to the community.
        if (json.moderation?.state === 'published') {
          import('canvas-confetti').then(({ default: confetti }) => {
            confetti({
              particleCount: 25,
              spread: 40,
              origin: { y: 0.8 },
              colors: ['#5A46D6', '#1D1B18', '#DCCDBB'],
            });
          }).catch(() => {});
        }

        // Store author delete secret
        if (json.authorSecret && json.post?.id) {
          localStorage.setItem(`author_secret_${json.post.id}`, json.authorSecret);
        }

        // Reset composer states
        setComposerInitialText('');

        // Scroll to community feed
        const el = document.getElementById('komunitas');
        if (el) {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(el, { offset: -70 });
          } else {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
        return { success: true, state: json.moderation?.state };
      }
      return { success: false, error: json.error };
    } catch (e) {
      console.error('Failed to create post:', e);
      return { success: false, error: 'Koneksi gagal. Coba lagi.' };
    }
  };

  return (
    <main className="relative min-h-screen bg-paper text-ink selection:bg-koma-purple selection:text-paper overflow-x-hidden">
      {/* 1. Global Navigation */}
      <Navbar
        onOpenComposer={handleOpenComposer}
        onOpenDonation={handleOpenDonation}
      />

      {/* 2. Hero Section */}
      <HeroSection
        onExploreFeed={handleExploreFeed}
        onOpenComposer={handleOpenComposer}
      />

      {/* 3. Story Acts (Babak 1 - 3 Narrative Flow) */}
      <StoryActs onOpenComposer={handleOpenComposer} />

      {/* 4. Interactive Live Sticky Notes Collage */}
      <CollageInteractive />

      {/* 5. Live Community Feed (The Core Product) */}
      <FeedContainer onOpenComposer={handleOpenComposer} />

      {/* 6. Anti-Slop Colophon Footer */}
      <Footer />

      {/* Modal: Write New Post */}
      <ComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmitPost={handlePostCreated}
        initialContent={composerInitialText}
      />

      {/* Modal: Traktir Kopi / QRIS Donation */}
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />
    </main>
  );
}
