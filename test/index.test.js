import assert from 'node:assert/strict';
import test from 'node:test';
import { durationLabel } from '../src/index.js';

test('formats whole seconds without rounding up', () => {
  assert.equal(durationLabel(0), '0 s');
  assert.equal(durationLabel(1999), '1 s');
  assert.equal(durationLabel(42000), '42 s');
});

test('rejects invalid durations', () => {
  for (const value of [-1, NaN, Infinity, '1000']) {
    assert.throws(() => durationLabel(value), RangeError);
  }
});
