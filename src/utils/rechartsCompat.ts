/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Small compatibility helpers for Recharts v3 event payloads.
 */

/**
 * Recharts passes click/hover handlers a geometry object (`BarRectangleItem`,
 * pie sector, etc.) whose typed surface does not expose the underlying row's
 * own fields — the original datum lives on `.payload`.
 *
 * Several call sites read the field straight off the item, which only worked
 * while Recharts happened to spread the payload onto it. This reads `.payload`
 * first and falls back to the item itself, so both shapes keep working, and
 * gives the caller a typed view of the row.
 */
export function chartDatum<T>(data: unknown): Partial<T> {
  const d = data as Record<string, unknown> | null | undefined;
  if (d && typeof d === 'object' && 'payload' in d && d.payload) {
    return d.payload as Partial<T>;
  }
  return (d ?? {}) as Partial<T>;
}
