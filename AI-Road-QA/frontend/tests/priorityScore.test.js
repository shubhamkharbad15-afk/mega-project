import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePriorityScore } from '../src/priorityScore.js';

test('priority score is bounded and factor totals reconcile', () => {
  const result = calculatePriorityScore({ severity: 'high', upvotes: 3, status: 'confirmed', latitude: 18.5, longitude: 73.8 });
  assert.equal(result.score, 86); // 60 severity + 6 community + 15 workflow + 5 location
  assert.equal(result.factors.reduce((sum, factor) => sum + factor.points, 0), result.score);
});

test('unknown severity is treated conservatively as low and missing location adds no points', () => {
  const result = calculatePriorityScore({ severity: 'unknown', status: 'resolved' });
  assert.equal(result.score, 15);
  assert.equal(result.factors.find(factor => factor.label === 'Location available').points, 0);
});

test('community points are capped and negative upvotes do not reduce score', () => {
  const many = calculatePriorityScore({ severity: 'high', upvotes: 100, status: 'confirmed' });
  const negative = calculatePriorityScore({ severity: 'low', upvotes: -5, status: 'confirmed' });
  assert.equal(many.factors.find(factor => factor.label === 'Community confirmations').points, 20);
  assert.equal(negative.factors.find(factor => factor.label === 'Community confirmations').points, 0);
  assert.ok(many.score <= 100);
});
