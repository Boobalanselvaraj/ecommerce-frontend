import type { OrderStatus } from '../../shared/api';

const config: Record<OrderStatus, { label: string; color: string }> = {
  PENDING:          { label: 'Pending',          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  CONFIRMED:        { label: 'Confirmed',        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  SHIPPED:          { label: 'Shipped',          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  DELIVERED:        { label: 'Delivered',        color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  CANCELED:         { label: 'Canceled',         color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, color } = config[status] ?? config.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  );
}
