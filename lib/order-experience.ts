export type OrderStatusTone = 'neutral' | 'active' | 'positive' | 'negative';

export type OrderStatusMeta = {
  label: string;
  tone: OrderStatusTone;
  description: string;
};

export type OrderLifecycleStep = {
  key: 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered';
  title: string;
  description: string;
};

const LIFECYCLE: OrderLifecycleStep[] = [
  { key: 'pending_payment', title: 'Order placed', description: 'Your order is saved and waiting for payment.' },
  { key: 'paid', title: 'Payment confirmed', description: 'Payment has been confirmed for this order.' },
  { key: 'processing', title: 'Preparing your order', description: 'Your pieces are being prepared for dispatch.' },
  { key: 'shipped', title: 'On the way', description: 'Your order has been handed over for delivery.' },
  { key: 'delivered', title: 'Delivered', description: 'Your order has been marked as delivered.' },
];

const STATUS_META: Record<string, OrderStatusMeta> = {
  draft: { label: 'Draft', tone: 'neutral', description: 'This order has not entered the active delivery flow.' },
  pending_payment: { label: 'Payment pending', tone: 'neutral', description: 'Your order is saved and waiting for payment.' },
  paid: { label: 'Payment confirmed', tone: 'active', description: 'Payment has been confirmed.' },
  processing: { label: 'Preparing order', tone: 'active', description: 'Your pieces are being prepared for dispatch.' },
  shipped: { label: 'On the way', tone: 'active', description: 'Your order is with the delivery carrier.' },
  delivered: { label: 'Delivered', tone: 'positive', description: 'Your order has been delivered.' },
  cancelled: { label: 'Cancelled', tone: 'negative', description: 'This order has been cancelled.' },
  refunded: { label: 'Refunded', tone: 'positive', description: 'This order has been refunded.' },
};

export function getOrderStatusMeta(status: string): OrderStatusMeta {
  return STATUS_META[status] ?? {
    label: status.replaceAll('_', ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
    tone: 'neutral',
    description: 'Order status is being updated.',
  };
}

export function getOrderLifecycle(status: string): OrderLifecycleStep[] {
  if (status === 'draft' || status === 'cancelled' || status === 'refunded') return [];
  return LIFECYCLE;
}

export function getOrderLifecycleIndex(status: string) {
  const index = LIFECYCLE.findIndex((step) => step.key === status);
  return index < 0 ? 0 : index;
}

export function canReorderOrder(status: string, itemCount: number) {
  return status === 'delivered' && itemCount > 0;
}

export function matchesOrderFilter(status: string, filter: 'all' | 'active' | 'delivered' | 'cancelled') {
  if (filter === 'all') return true;
  if (filter === 'active') return ['pending_payment', 'paid', 'processing', 'shipped'].includes(status);
  if (filter === 'delivered') return status === 'delivered';
  return ['cancelled', 'refunded'].includes(status);
}
