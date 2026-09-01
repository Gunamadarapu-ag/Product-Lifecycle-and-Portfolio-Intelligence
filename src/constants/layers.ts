/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Central z-index scale.
 *
 * Before this existed, overlays hard-coded 13 different z values between
 * `z-50` and `z-[1000]` with no shared ordering, so a modal opened from
 * another modal could land underneath its own parent. The names below
 * describe *stacking intent*; the numbers preserve the ordering the
 * previous ad-hoc values already implied.
 */
export const LAYER = {
  /** Inline overlays and slide-out drawers rendered within a tab. */
  base: 50,
  /** The default centred dialog. */
  panel: 60,
  /** Confirmation / feedback shown on top of a dialog. */
  elevated: 80,
  /** Global audit drawer. */
  drawer: 100,
  /** A dialog opened from inside another dialog. */
  nested: 120,
  /** Third-level detail dialog. */
  detail: 140,
  /** Email / message composer — sits above the content stack. */
  composer: 150,
  /** Floating executive cart. */
  cart: 400,
  /** Full-screen takeover. */
  critical: 1000,
} as const;

export type LayerName = keyof typeof LAYER;
