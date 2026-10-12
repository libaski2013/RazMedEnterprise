import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaleTotals, validatePayments } from '../src/utils/saleTotals.js';

test('calculates discounted taxable totals using currency rounding', () => {
  assert.deepEqual(calculateSaleTotals([{ price: 100, qty: 2 }, { price: 50, qty: 1 }], 25, 0.15), {
    subtotalBeforeDiscount: 250, subtotal: 225, tax: 33.75, total: 258.75, discount: 25, taxRate: 0.15,
  });
});

test('rejects discounts above the subtotal and invalid tax rates', () => {
  assert.throws(() => calculateSaleTotals([{ price: 100, qty: 1 }], 101, 0.15), /Discount cannot exceed/);
  assert.throws(() => calculateSaleTotals([{ price: 100, qty: 1 }], 0, 1.1), /Tax rate/);
});

test('requires payments to balance exactly to the sale total', () => {
  assert.equal(validatePayments([{ method: 'Cash', amount: 100 }, { method: 'Mobile Money', amount: 25 }], 125), 125);
  assert.throws(() => validatePayments([{ method: 'Cash', amount: 124 }], 125), /Payment total/);
  assert.throws(() => validatePayments([{ method: 'Cash', amount: -1 }], -1), /valid method and amount/);
});
