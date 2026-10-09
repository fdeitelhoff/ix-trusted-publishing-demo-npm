/** Convert milliseconds into a human-readable whole-second duration. */
export function durationLabel(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError('milliseconds must be a non-negative finite number');
  }
  return `${Math.floor(milliseconds / 1000)} s`;
}
