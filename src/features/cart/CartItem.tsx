import { useState } from 'react';
import { useUpdateCartItem, useRemoveCartItem, type CartItem as CartItemType } from '../../shared/api';
import { useToast } from '../../shared/context/ToastContext';

export default function CartItem({ item }: { item: CartItemType }) {
  const { toast } = useToast();
  const [qty, setQty] = useState(item.quantity);
  const updateQty = useUpdateCartItem(item.id);
  const remove = useRemoveCartItem(item.id);
  const image = item.product.images?.[0]?.imgUrl;

  const handleQty = (newQty: number) => {
    if (newQty < 1) return;
    if (newQty > item.product.availableQuantity) {
      toast.error(`Only ${item.product.availableQuantity} available`);
      return;
    }
    setQty(newQty);
    updateQty.mutate({ quantity: newQty }, {
      onError: () => setQty(item.quantity),
    });
  };

  const handleRemove = () => {
    remove.mutate(undefined, {
      onSuccess: () => toast.success('Item removed'),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 animate-fade-in">
      <div className="w-20 h-20 rounded-xl bg-gray-100 dark:bg-gray-900 flex-shrink-0 overflow-hidden">
        {image ? (
          <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.product.name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{item.product.availableQuantity} in stock</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            ₹{(item.product.price * qty).toLocaleString('en-IN')}
          </span>
          <div className="flex items-center gap-2">
            {/* Qty controls */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button onClick={() => handleQty(qty - 1)} disabled={qty <= 1 || updateQty.isPending}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-40 transition-all">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-7 text-center text-sm font-semibold text-gray-900 dark:text-white">{qty}</span>
              <button onClick={() => handleQty(qty + 1)} disabled={qty >= item.product.availableQuantity || updateQty.isPending}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-40 transition-all">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            {/* Remove */}
            <button onClick={handleRemove} disabled={remove.isPending}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
