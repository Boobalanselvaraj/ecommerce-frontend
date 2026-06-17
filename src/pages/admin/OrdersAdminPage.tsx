import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetOrders, useUpdateOrderStatus, useDeleteOrder, type OrderFilters, type OrderStatus } from '../../shared/api';
import OrderStatusBadge from '../../features/orders/OrderStatusBadge';
import Pagination from '../../shared/components/Pagination';
import Modal from '../../shared/components/Modal';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/context/ToastContext';

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:          ['CONFIRMED', 'CANCELED'],
  CONFIRMED:        ['SHIPPED', 'CANCELED'],
  SHIPPED:          ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED:        [],
  CANCELED:         [],
};

export default function OrdersAdminPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<OrderFilters>({ page: 1, limit: 10, sortBy: 'orderedAt', order: 'desc' });
  const [statusModal, setStatusModal] = useState<{ orderId: number; current: OrderStatus } | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');

  const { data, isLoading } = useGetOrders(filters);
  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isLoading && !data) return <PageLoader />;

  const statusOptions: { label: string; value: OrderStatus | '' }[] = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Out for Delivery', value: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Canceled', value: 'CANCELED' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.total ?? 0} total orders</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {statusOptions.map(opt => (
          <button key={opt.value}
            onClick={() => setFilters(f => ({ ...f, status: opt.value || undefined, page: 1 }))}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              (filters.status ?? '') === opt.value ? 'bg-brand-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-brand-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/orders/${order.id}`} className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                      #{order.orderNumber}
                    </Link>
                  </td>
                  <td className="text-sm">{order.user?.name ?? `User #${order.userId}`}</td>
                  <td><span className="text-xs text-gray-500">{order.orderItems?.length ?? 0} item(s)</span></td>
                  <td className="font-semibold">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                  <td><OrderStatusBadge status={order.status} /></td>
                  <td className="text-xs text-gray-400">{new Date(order.orderedAt).toLocaleDateString('en-IN')}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {TRANSITIONS[order.status]?.length > 0 && (
                        <button
                          onClick={() => { setStatusModal({ orderId: order.id, current: order.status }); setNewStatus(''); }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-all"
                        >
                          Update Status
                        </button>
                      )}
                      {order.status === 'CANCELED' && <DeleteOrderBtn orderId={order.id} onSuccess={() => toast.success('Order deleted')} onError={msg => toast.error(msg)} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="py-12 text-center text-sm text-gray-400">No orders found.</div>}
        </div>
      </div>

      <Pagination currentPage={filters.page ?? 1} totalPages={totalPages} onPageChange={p => setFilters(f => ({ ...f, page: p }))} />

      {/* Status update modal */}
      {statusModal && (
        <StatusUpdateModal
          orderId={statusModal.orderId}
          current={statusModal.current}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          onClose={() => setStatusModal(null)}
          onSuccess={() => { toast.success('Order status updated!'); setStatusModal(null); }}
          onError={(msg) => toast.error(msg)}
        />
      )}
    </div>
  );
}

interface StatusUpdateModalProps {
  orderId: number;
  current: OrderStatus;
  newStatus: OrderStatus | '';
  setNewStatus: (s: OrderStatus) => void;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function StatusUpdateModal({ orderId, current, newStatus, setNewStatus, onClose, onSuccess, onError }: StatusUpdateModalProps) {
  const update = useUpdateOrderStatus(orderId);
  const options = TRANSITIONS[current] ?? [];

  const handleSubmit = () => {
    if (!newStatus) { onError('Select a status'); return; }
    update.mutate({ status: newStatus as OrderStatus }, { onSuccess, onError: (err: any) => onError(err.message) });
  };

  return (
    <Modal isOpen onClose={onClose} title="Update Order Status" size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={update.isPending || !newStatus} className="btn-primary">
            {update.isPending ? 'Updating…' : 'Confirm'}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Current status: <OrderStatusBadge status={current} /></p>
      <div className="space-y-2">
        {options.map(s => (
          <label key={s} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${newStatus === s ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
            <input type="radio" name="newStatus" value={s} checked={newStatus === s} onChange={() => setNewStatus(s)} className="accent-brand-600" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{s.replace(/_/g, ' ')}</span>
          </label>
        ))}
      </div>
    </Modal>
  );
}

function DeleteOrderBtn({ orderId, onSuccess, onError }: { orderId: number; onSuccess: () => void; onError: (m: string) => void }) {
  const del = useDeleteOrder(orderId);
  return (
    <button onClick={() => { if (!confirm('Permanently delete this order?')) return; del.mutate(undefined, { onSuccess, onError: (err) => onError(err.message) }); }}
      disabled={del.isPending}
      className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all disabled:opacity-40">
      Delete
    </button>
  );
}
