const test = require('node:test');
const assert = require('node:assert/strict');

const { formatSeconds } = require('../../src/lib/utils');

test('formatSeconds: 0 -> 0:00:00', () => {
  assert.equal(formatSeconds(0), '0:00:00');
});

test('formatSeconds: 1 -> 0:00:01', () => {
  assert.equal(formatSeconds(1), '0:00:01');
});

test('formatSeconds: 59 -> 0:00:59', () => {
  assert.equal(formatSeconds(59), '0:00:59');
});

test('formatSeconds: 60 -> 0:01:00', () => {
  assert.equal(formatSeconds(60), '0:01:00');
});

test('formatSeconds: 3661 -> 1:01:01', () => {
  assert.equal(formatSeconds(3661), '1:01:01');
});

