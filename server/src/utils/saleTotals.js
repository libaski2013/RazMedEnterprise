export const money = value => Math.round(Number(value || 0) * 100) / 100;

export function calculateSaleTotals(items, discount = 0, taxRate = 0.15) {
  if (!Array.isArray(items) || !items.length) throw new Error('items are required');
  const normalizedDiscount = Number(discount);
  const normalizedTaxRate = Number(taxRate);
  if (!Number.isFinite(normalizedDiscount) || normalizedDiscount < 0) throw new Error('Discount cannot be negative');
  if (!Number.isFinite(normalizedTaxRate) || normalizedTaxRate < 0 || normalizedTaxRate > 1) throw new Error('Tax rate must be between 0 and 1');
  const subtotalBeforeDiscount = money(items.reduce((sum, item) => {
    const price = Number(item.price); const qty = Number(item.qty);
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(qty) || qty <= 0) throw new Error('Each sale item must have a valid price and quantity');
    return sum + price * qty;
  }, 0));
  if (normalizedDiscount > subtotalBeforeDiscount) throw new Error('Discount cannot exceed the sale subtotal');
  const subtotal = money(subtotalBeforeDiscount - normalizedDiscount);
  const tax = money(subtotal * normalizedTaxRate);
  return { subtotalBeforeDiscount, subtotal, tax, total: money(subtotal + tax), discount: money(normalizedDiscount), taxRate: normalizedTaxRate };
}

export function validatePayments(payments, total) {
  if (!Array.isArray(payments) || !payments.length) throw new Error('At least one payment is required');
  if (payments.some(payment => !String(payment.method || '').trim() || !Number.isFinite(Number(payment.amount)) || Number(payment.amount) < 0)) throw new Error('Each payment must have a valid method and amount');
  const paid = money(payments.reduce((sum, payment) => sum + Number(payment.amount), 0));
  if (Math.abs(paid - Number(total)) > 0.01) throw new Error('Payment total must equal the sale total');
  return paid;
}
