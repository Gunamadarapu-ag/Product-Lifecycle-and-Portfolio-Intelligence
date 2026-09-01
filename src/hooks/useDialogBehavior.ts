/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

/**
 * The behavioural half of a modal, without any markup.
 *
 * `ModalShell` covers overlays that are a centred dialog. Slide-out drawers
 * are a different shape — an `AnimatePresence` backdrop paired with a sibling
 * `motion.aside` that springs in from the edge — and wrapping those in a
 * centring shell would nest the panel inside the scrim and lose the exit
 * animation. They still need the same behaviour, so it lives here and both
 * paths share it.
 *
 * Provides: Escape-to-close, body scroll lock while open, and focus restored
 * to whatever was focused before the drawer opened.
 */
export function useDialogBehavior(isOpen: boolean, onClose: () => void, closeOnEscape = true) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);
}
