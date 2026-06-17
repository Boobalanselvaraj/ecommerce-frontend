import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetOrder, useCancelOrder, useCreateCheckoutSession } from '../../shared/api';
import OrderStatusBadge from '../../features/orders/OrderStatusBadge';
import OrderStatusTracker from '../../features/orders/OrderStatusTracker';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/context/ToastContext';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading } = useGetOrder(Number(id));
  const cancel = useCancelOrder(Number(id));
  const createSession = useCreateCheckoutSession();

  if (isLoading) return <PageLoader />;
  const order = data?.order;
  if (!order) return (
    <div className="page-container flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Order not found</h2>
      <button onClick={() => navigate('/orders')} className="btn-primary mt-4">Back to Orders</button>
    </div>
  );

  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED';
  const canPay = order.status === 'PENDING';

  const handleCancel = () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    cancel.mutate(undefined, {
      onSuccess: () => toast.success('Order canceled. Stock restored.'),
      onError: (err) => toast.error(err.message),
    });
  };

  const handlePay = () => {
    createSession.mutate({ orderId: order.id }, {
      onSuccess: (session) => {
        if (session.url) window.location.href = session.url;
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="page-container">
      <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors group">
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Orders
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Order #{order.orderNumber}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Placed on {new Date(order.orderedAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canPay && (
            <button onClick={handlePay} disabled={createSession.isPending} className="btn-primary">
              {createSession.isPending ? 'Setting up…' : 'Pay Now (Stripe)'}
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} disabled={cancel.isPending} className="btn-danger">
              {cancel.isPending ? 'Canceling…' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Status Tracker */}
      <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-5">Tracking</h2>
        <OrderStatusTracker status={order.status} />
        {order.deliveredAt && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-4 text-center">
            Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Items Ordered</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {order.orderItems.map((item: any) => {
              const img = item.product?.images?.[0]?.imgUrl;
              return (
                <div key={item.id} className="flex gap-4 p-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0">
                    {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.product?.name ?? `Product #${item.productId}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} · ₹{item.price.toLocaleString('en-IN')} each</p>
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
            <span className="font-bold text-gray-900 dark:text-white">Total</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">₹{order.totalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Sidebar: Delivery + User */}
        <div className="space-y-4">
          {/* Delivery Address */}
          {order.addressId && (
            <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Delivery Address</h3>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Address #{order.addressId}</p>
              </div>
            </div>
          )}

          {/* Customer Info */}
          {order.user && (
            <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Customer</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="font-semibold text-gray-900 dark:text-white">{order.user.name}</p>
                <p>{order.user.email}</p>
                <p>{order.user.mobile}</p>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-gradient-to-br from-brand-600 to-purple-700 rounded-2xl p-4 text-white">
            <p className="text-sm font-semibold mb-3">Need help with your order?</p>
            <Link to="/" className="block w-full py-2 text-center bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
