import type { OrderStatus } from '../../shared/api';

const steps: { key: OrderStatus; label: string; icon: string }[] = [
  { key: 'PENDING',          label: 'Order Placed',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'CONFIRMED',        label: 'Confirmed',     icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'SHIPPED',          label: 'Shipped',       icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0' },
  { key: 'DELIVERED',        label: 'Delivered',     icon: 'M5 13l4 4L19 7' },
];

const statusOrder: Record<OrderStatus, number> = {
  PENDING: 0, CONFIRMED: 1, SHIPPED: 2, OUT_FOR_DELIVERY: 3, DELIVERED: 4, CANCELED: -1,
};

export default function OrderStatusTracker({ status }: { status: OrderStatus }) {
  if (status === 'CANCELED') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-red-600 dark:text-red-400">Order Canceled</p>
          <p className="text-xs text-red-500/80">This order has been canceled and stock has been restored.</p>
        </div>
      </div>
    );
  }

  const currentIdx = statusOrder[status];

  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="flex flex-col items-center flex-1 min-w-[80px]">
            {/* Connector line */}
            <div className="flex items-center w-full mb-3">
              {i > 0 && (
                <div className={`flex-1 h-0.5 transition-all duration-500 ${done ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                done
                  ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'
              } ${active ? 'ring-4 ring-brand-600/20' : ''}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d={step.icon} />
                </svg>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 transition-all duration-500 ${i < currentIdx ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
            <span className={`text-[10px] font-medium text-center leading-tight ${active ? 'text-brand-600 dark:text-brand-400 font-semibold' : done ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
