import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetOrders, useCancelOrder, type OrderFilters, type OrderStatus } from '../../shared/api';
import OrderStatusBadge from '../../features/orders/OrderStatusBadge';
import Pagination from '../../shared/components/Pagination';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/context/ToastContext';

const STATUS_OPTIONS: { label: string; value: OrderStatus | '' }[] = [
  { label: 'All Orders', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Canceled', value: 'CANCELED' },
];

export default function OrdersPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<OrderFilters>({ page: 1, limit: 10, sortBy: 'orderedAt', order: 'desc' });

  const { data, isLoading } = useGetOrders(filters);
  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isLoading && !data) return <PageLoader />;

  return (
    <div className="page-container">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">My Orders</h1>

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilters(f => ({ ...f, status: opt.value || undefined, page: 1 }))}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              (filters.status ?? '') === opt.value
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-700 dark:text-gray-300">No orders found</h2>
          <p className="text-sm text-gray-400 mt-1">Your orders will appear here once you place them.</p>
          <Link to="/" className="btn-primary mt-6">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderRow key={order.id} order={order} onCanceled={() => toast.success('Order canceled')} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={filters.page ?? 1}
        totalPages={totalPages}
        onPageChange={p => setFilters(f => ({ ...f, page: p }))}
      />
    </div>
  );
}

function OrderRow({ order, onCanceled }: { order: any; onCanceled: () => void }) {
  const { toast } = useToast();
  const cancel = useCancelOrder(order.id);
  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';

  return (
    <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:border-brand-500/30 transition-all animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">#{order.orderNumber}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.orderedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-gray-900 dark:text-white">
            ₹{order.totalPrice.toLocaleString('en-IN')}
          </span>
          <Link to={`/orders/${order.id}`} className="btn-secondary text-xs py-1.5 px-3">
            View Details
          </Link>
          {canCancel && (
            <button
              onClick={() => {
                if (!confirm('Cancel this order?')) return;
                cancel.mutate(undefined, {
                  onSuccess: onCanceled,
                  onError: (err) => toast.error(err.message),
                });
              }}
              disabled={cancel.isPending}
              className="btn-danger text-xs py-1.5 px-3"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {order.orderItems?.slice(0, 3).map((item: any) => (
          <div key={item.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl px-3 py-1.5">
            <span className="text-xs text-gray-600 dark:text-gray-400">{item.product?.name ?? `Product #${item.productId}`}</span>
            <span className="text-xs text-gray-400">× {item.quantity}</span>
          </div>
        ))}
        {order.orderItems?.length > 3 && (
          <span className="text-xs text-gray-400 px-3 py-1.5">+{order.orderItems.length - 3} more</span>
        )}
      </div>
    </div>
  );
}
