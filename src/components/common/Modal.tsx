/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { LAYER, LayerName } from '../../constants/layers';

const SIZE_CLASS = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-[95vw]',
} as const;

const BLUR_CLASS = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
} as const;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Title text or a full node. Omit to render a bare panel with no header. */
  title?: React.ReactNode;
  /** Icon rendered to the left of the title, e.g. `<Calendar size={15} />`. */
  icon?: React.ReactNode;
  /** Accent colour for the icon + title row. */
  accentClassName?: string;
  size?: keyof typeof SIZE_CLASS;
  blur?: keyof typeof BLUR_CLASS;
  /** Stacking intent — see `constants/layers.ts`. */
  layer?: LayerName;
  /** Backdrop opacity tier. */
  scrimClassName?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  /** Extra classes for the panel itself. */
  panelClassName?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  'aria-label'?: string;
}

/**
 * Shared centred-dialog shell.
 *
 * Replaces the hand-rolled `fixed inset-0 …` overlay that had been copied
 * into 30+ components. Beyond deduplication it adds the behaviour none of
 * those copies had: Escape-to-close, backdrop click-to-close, body scroll
 * lock, focus restore on close, and `role="dialog"` / `aria-modal`.
 *
 * Rendered through a portal to `document.body` so a dialog opened from deep
 * inside a transformed/animated subtree is not clipped by an ancestor.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  accentClassName = 'text-acies-yellow',
  size = 'md',
  blur = 'md',
  layer = 'panel',
  scrimClassName = 'bg-black/60',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  panelClassName = '',
  footer,
  children,
  'aria-label': ariaLabel,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Escape to close.
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll while open, and restore focus to the trigger on close.
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdrop && e.target === e.currentTarget) onClose();
    },
    [closeOnBackdrop, onClose],
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 ${scrimClassName} ${BLUR_CLASS[blur]} flex items-center justify-center p-4 animate-fadeIn`}
      style={{ zIndex: LAYER[layer] }}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        tabIndex={-1}
        className={`w-full ${SIZE_CLASS[size]} bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/15 p-6 rounded shadow-2xl flex flex-col gap-4 text-xs max-h-[90vh] overflow-y-auto outline-none ${panelClassName}`}
      >
        {title && (
          <div className="flex justify-between items-center border-b border-black/15 dark:border-white/15 pb-2">
            <div className={`flex items-center gap-1.5 ${accentClassName}`}>
              {icon}
              <span className="text-[14px] font-display font-bold text-zinc-800 dark:text-zinc-100">
                {title}
              </span>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer border-none bg-transparent"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {children}

        {footer && <div className="pt-2 border-t border-black/10 dark:border-white/10">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};
