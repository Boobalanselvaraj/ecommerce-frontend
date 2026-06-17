import { useNavigate } from 'react-router-dom';
import { useGetCart, useClearCart } from '../../shared/api';
import CartItemComponent from '../../features/cart/CartItem';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/context/ToastContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: cart, isLoading } = useGetCart();
  const clearCart = useClearCart();

  if (isLoading) return <PageLoader />;

  const items = cart?.cartItems ?? [];
  const total = cart?.cartTotal ?? 0;

  const handleClear = () => {
    if (!confirm('Clear your entire cart?')) return;
    clearCart.mutate(undefined, {
      onSuccess: () => toast.success('Cart cleared'),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Shopping Cart</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{cart?.totalItems ?? 0} item{(cart?.totalItems ?? 0) !== 1 ? 's' : ''}</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClear} disabled={clearCart.isPending} className="btn-danger text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-6">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h2>
          <p className="text-sm text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Start Shopping</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => <CartItemComponent key={item.id} item={item} />)}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-20">
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="truncate max-w-[140px]">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium text-gray-900 dark:text-white ml-2 shrink-0">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-500 dark:text-gray-400">Delivery</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{total > 999 ? 'FREE' : '₹49'}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-black text-lg text-gray-900 dark:text-white">
                  ₹{(total > 999 ? total : total + 49).toLocaleString('en-IN')}
                </span>
              </div>
              {total > 999 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 text-center">🎉 You qualify for free delivery!</p>
              )}
              <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-4 py-3">
                Proceed to Checkout
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button onClick={() => navigate('/')} className="btn-secondary w-full mt-2 py-2.5 text-xs">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
