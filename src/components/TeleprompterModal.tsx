import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Type, FastForward, FlipHorizontal } from 'lucide-react';
import { ContentPost } from '../types';

interface TeleprompterModalProps {
  post: ContentPost;
  onClose: () => void;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({ post, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [fontSize, setFontSize] = useState(36);
  const [isMirrored, setIsMirrored] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll loop
  useEffect(() => {
    let animationFrameId: number;
    const scrollStep = () => {
      if (isPlaying && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += scrollSpeed * 0.5;
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, scrollSpeed]);

  // Spacebar to toggle play/pause, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleReset = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col text-white font-sans">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-stone-950/80 border-b border-stone-800 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-black text-sm px-2.5 py-1 bg-stone-800 rounded-lg">
            DAY {post.day} PROMPTER
          </span>
          <span className="text-stone-300 font-bold text-sm hidden sm:inline truncate max-w-xs">
            {post.title}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-black text-sm transition-all ${
              isPlaying
                ? 'bg-amber-400 text-stone-950 hover:bg-amber-300'
                : 'bg-creator-green text-white hover:bg-creator-green-dark'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Start (Space)'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            title="Reset to top"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed slider */}
          <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
            <FastForward className="w-3.5 h-3.5" />
            <span>Speed: {scrollSpeed}x</span>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Font size */}
          <div className="flex items-center gap-2 text-xs text-stone-400 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
            <Type className="w-3.5 h-3.5" />
            <button
              onClick={() => setFontSize((s) => Math.max(20, s - 4))}
              className="px-1 hover:text-white"
            >
              -
            </button>
            <span>{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(64, s + 4))}
              className="px-1 hover:text-white"
            >
              +
            </button>
          </div>

          {/* Mirror toggle */}
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-2 rounded-lg border transition-all ${
              isMirrored
                ? 'bg-amber-400 text-black border-amber-400'
                : 'border-stone-800 text-stone-400 hover:text-white'
            }`}
            title="Mirror for glass prompter rigs"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Prompter Text Scroll Area */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto px-8 sm:px-20 py-32 text-center select-none ${
          isMirrored ? 'scale-x-[-1]' : ''
        }`}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Spoken Hook Highlight */}
          {post.spokenHook && (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-6 mb-8 text-amber-200">
              <span className="text-xs uppercase font-black tracking-widest text-amber-400 block mb-2">
                ⚡ SPOKEN HOOK (FIRST 3 SECONDS)
              </span>
              <p
                style={{ fontSize: `${fontSize * 1.15}px`, lineHeight: 1.3 }}
                className="font-black text-amber-100"
              >
                "{post.spokenHook}"
              </p>
            </div>
          )}

          {/* Full Script */}
          <div
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.5 }}
            className="font-bold text-stone-100 whitespace-pre-wrap leading-relaxed tracking-wide"
          >
            {post.script || 'No script written yet for this day. Click Back and add your script!'}
          </div>

          {/* CTA Highlight */}
          {post.cta && (
            <div className="pt-16 pb-32">
              <span className="text-xs uppercase font-black tracking-widest text-green-400 block mb-2">
                🚀 CALL TO ACTION (OUTRO)
              </span>
              <p
                style={{ fontSize: `${fontSize * 1.1}px` }}
                className="font-black text-green-300"
              >
                {post.cta}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subtle Focus Reading Marker Bar in the Center */}
      <div className="pointer-events-none fixed top-1/2 left-0 right-0 h-24 -translate-y-1/2 border-y border-amber-400/20 bg-amber-400/[0.03]" />
    </div>
  );
};
