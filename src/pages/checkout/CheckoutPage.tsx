import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetCart, useGetAddresses, usePlaceOrder, useCreateCheckoutSession, useGetProduct } from '../../shared/api';
import AddressCard from '../../features/address/AddressCard';
import AddressForm from '../../features/address/AddressForm';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/context/ToastContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [payWithStripe, setPayWithStripe] = useState(false);

  const location = useLocation();
  const buyNowState = location.state as { productId?: number; quantity?: number } | null;
  const isBuyNow = !!buyNowState?.productId;

  const { data: cart, isLoading: cartLoading } = useGetCart({ enabled: !isBuyNow });
  const { data: buyNowData, isLoading: buyNowLoading } = useGetProduct(buyNowState?.productId ?? 0, { enabled: isBuyNow });
  const { data: addrData, isLoading: addrLoading } = useGetAddresses();
  const placeOrder = usePlaceOrder();
  const createSession = useCreateCheckoutSession();

  const addresses = addrData?.data ?? [];
  const buyNowProduct = buyNowData?.data;

  const cartItems = isBuyNow && buyNowProduct
    ? [{
        id: -1,
        quantity: buyNowState?.quantity ?? 1,
        product: {
          id: buyNowProduct.id,
          name: buyNowProduct.name,
          price: buyNowProduct.price,
          availableQuantity: buyNowProduct.availableQuantity,
          images: buyNowProduct.images,
        }
      }]
    : cart?.cartItems ?? [];

  const cartTotal = isBuyNow && buyNowProduct
    ? buyNowProduct.price * (buyNowState?.quantity ?? 1)
    : cart?.cartTotal ?? 0;

  // Auto-select primary address
  if (!selectedAddress && addresses.length > 0) {
    const primary = addresses.find(a => a.isPrimary) ?? addresses[0];
    setSelectedAddress(primary.id);
  }

  if ((isBuyNow ? buyNowLoading : cartLoading) || addrLoading) return <PageLoader />;

  if (cartItems.length === 0) {
    return (
      <div className="page-container flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="btn-primary">Continue Shopping</button>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    
    const payload = isBuyNow && buyNowState?.productId
      ? { addressId: selectedAddress, productId: buyNowState.productId, quantity: buyNowState.quantity }
      : { addressId: selectedAddress };

    placeOrder.mutate(payload, {
      onSuccess: (data) => {
        const orderId = data?.order?.id;
        if (payWithStripe && orderId) {
          createSession.mutate({ orderId }, {
            onSuccess: (session) => {
              if (session.url) window.location.href = session.url;
            },
            onError: (err) => toast.error(err.message || 'Payment setup failed'),
          });
        } else {
          toast.success('Order placed successfully! 🎉');
          navigate(`/orders/${orderId}`);
        }
      },
      onError: (err) => toast.error(err.message || 'Failed to place order'),
    });
  };

  return (
    <div className="page-container">
      <button onClick={() => navigate(isBuyNow ? `/products/${buyNowState?.productId}` : '/cart')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors group">
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Cart
      </button>

      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Address */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Delivery Address</h2>
              <button onClick={() => setShowAddForm(v => !v)} className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                {showAddForm ? 'Cancel' : '+ Add New'}
              </button>
            </div>

            {showAddForm && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                <AddressForm onDone={() => setShowAddForm(false)} onCancel={() => setShowAddForm(false)} />
              </div>
            )}

            {addresses.length === 0 && !showAddForm ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No addresses saved. Add one to continue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map(addr => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    selected={selectedAddress === addr.id}
                    onSelect={() => setSelectedAddress(addr.id)}
                    showActions={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[
                { value: false, label: 'Cash on Delivery', sub: 'Pay when your order arrives', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
                { value: true, label: 'Pay Online (Stripe)', sub: 'Secure card payment via Stripe', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
              ].map(opt => (
                <label key={String(opt.value)} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payWithStripe === opt.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                  <input type="radio" name="payment" checked={payWithStripe === opt.value} onChange={() => setPayWithStripe(opt.value)} className="accent-brand-600" />
                  <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={opt.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-20">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span className="truncate max-w-[140px]">{item.product.name} × {item.quantity}</span>
                  <span className="font-medium text-gray-900 dark:text-white ml-2 shrink-0">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Delivery</span>
                <span className="text-emerald-600">{cartTotal > 999 ? 'FREE' : '₹49'}</span>
              </div>
              {payWithStripe && (
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Payment gateway</span>
                  <span>Stripe Secure</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 mt-3 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span className="text-lg">₹{(cartTotal > 999 ? cartTotal : cartTotal + 49).toLocaleString('en-IN')}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placeOrder.isPending || createSession.isPending || !selectedAddress}
              className="btn-primary w-full mt-5 py-3"
            >
              {placeOrder.isPending || createSession.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Processing…
                </>
              ) : payWithStripe ? 'Pay with Stripe' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
