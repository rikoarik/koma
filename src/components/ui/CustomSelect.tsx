'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import Image from 'next/image';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  description?: string;
  badge?: string;
  icon?: React.ReactNode;
  imageUrl?: string;
}

export interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  direction?: 'down' | 'up' | 'auto';
  'aria-label'?: string;
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Pilih salah satu...',
  className = '',
  disabled = false,
  direction = 'down',
  'aria-label': ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  const selectedOption = options.find((opt) => opt.value === value);

  // Auto-detect open direction if requested
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      if (direction === 'up') {
        setOpenUpward(true);
      } else if (direction === 'down') {
        setOpenUpward(false);
      } else {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        setOpenUpward(spaceBelow < 200 && spaceAbove > spaceBelow);
      }
      // When opening, keep highlightedIndex at -1 so natural high-contrast colors are shown
      setHighlightedIndex(-1);
    }
  }, [isOpen, direction]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Scroll highlighted item into view if navigating with keyboard
  useEffect(() => {
    if (isOpen && listboxRef.current && highlightedIndex >= 0) {
      const item = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            onChange(options[highlightedIndex].value);
            setIsOpen(false);
            triggerRef.current?.focus();
          }
        } else {
          setIsOpen(true);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
        }
        break;
    }
  };

  const handleSelectOption = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${isOpen ? 'z-50' : 'z-10'} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 text-xs font-mono font-medium text-ink bg-white border-2 rounded-sm flex items-center justify-between gap-2 transition-all text-left outline-none ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-stone-100 border-ink/20'
            : isOpen
            ? 'border-sela-purple ring-2 ring-sela-purple/20 shadow-xs'
            : 'border-ink/20 hover:border-ink/40 focus:border-sela-purple'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.imageUrl ? (
            <div className="relative w-4 h-4 flex-shrink-0 rounded-xs overflow-hidden border border-ink/20">
              <Image
                src={selectedOption.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="16px"
              />
            </div>
          ) : (
            selectedOption?.icon && (
              <span className="flex-shrink-0 text-sela-purple">
                {selectedOption.icon}
              </span>
            )
          )}

          <span className="truncate text-ink font-bold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.sublabel && (
            <span className="hidden sm:inline text-[10px] text-ink-muted truncate font-sans">
              ({selectedOption.sublabel})
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-sela-purple' : 'text-ink/60'
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={selectId}
          className={`absolute left-0 right-0 z-50 max-h-56 overflow-y-auto bg-[#FAF8F5] border-2 border-ink rounded-sm py-1 divide-y divide-ink/10 shadow-[4px_4px_0px_#1D1B18] animate-in fade-in zoom-in-95 duration-100 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === highlightedIndex;

            return (
              <li
                key={option.value || `opt-${idx}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectOption(option.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onMouseLeave={() => setHighlightedIndex(-1)}
                className={`group px-3.5 py-2.5 text-xs font-mono cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                  isHighlighted
                    ? 'bg-sela-purple text-white'
                    : isSelected
                    ? 'bg-sela-purple/10 text-ink font-bold border-l-4 border-sela-purple'
                    : 'text-ink bg-transparent hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {option.imageUrl ? (
                    <div className="relative w-8 h-8 flex-shrink-0 rounded-xs overflow-hidden border border-ink/20">
                      <Image
                        src={option.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : option.icon ? (
                    <span
                      className={`flex-shrink-0 ${
                        isHighlighted
                          ? 'text-white'
                          : isSelected
                          ? 'text-sela-purple'
                          : 'text-ink-muted'
                      }`}
                    >
                      {option.icon}
                    </span>
                  ) : null}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-bold truncate ${isHighlighted ? 'text-white' : 'text-ink'}`}>
                        {option.label}
                      </span>
                      {option.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-xs font-mono font-bold uppercase tracking-wider border ${
                            isHighlighted
                              ? 'border-white/40 bg-white/20 text-white'
                              : isSelected
                              ? 'border-sela-purple/40 bg-sela-purple/15 text-sela-purpleDark'
                              : 'border-ink/20 bg-paper text-ink'
                          }`}
                        >
                          {option.badge}
                        </span>
                      )}
                    </div>

                    {option.description && (
                      <p
                        className={`text-[10px] font-sans mt-0.5 leading-snug line-clamp-1 ${
                          isHighlighted ? 'text-white/90' : 'text-ink-muted'
                        }`}
                      >
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check
                    className={`w-4 h-4 flex-shrink-0 ${
                      isHighlighted ? 'text-white' : 'text-sela-purple'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
