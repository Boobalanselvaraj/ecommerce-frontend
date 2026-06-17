import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProduct, useGetProductReviews, useAddToCart, useAddToWishlist } from '../../shared/api';
import { useAuth } from '../../shared/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import StarRating from '../../shared/components/StarRating';
import ReviewForm from '../../features/reviews/ReviewForm';
import ReviewCard from '../../features/reviews/ReviewCard';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);

  const { data: productData, isLoading } = useGetProduct(Number(id));
  const { data: reviewData } = useGetProductReviews(Number(id));
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  const product = productData?.data;
  const reviews = reviewData?.data ?? [];

  if (isLoading) return <PageLoader />;
  if (!product) return (
    <div className="page-container flex flex-col items-center justify-center py-24 text-center">
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Product not found</h2>
      <button onClick={() => navigate('/')} className="btn-primary mt-4">Back to Shop</button>
    </div>
  );

  const images = product.images ?? [];
  const isOutOfStock = product.availableQuantity === 0;

  const handleAddToCart = () => {
    if (!isAuthenticated) { toast.error('Please sign in to add to cart'); navigate('/auth'); return; }
    addToCart.mutate({ productId: product.id, quantity: qty }, {
      onSuccess: () => toast.success('Added to cart!'),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { toast.error('Please sign in'); navigate('/auth'); return; }
    addToWishlist.mutate({ productId: product.id }, {
      onSuccess: () => toast.success('Added to wishlist!'),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { toast.error('Please sign in to buy'); navigate('/auth'); return; }
    navigate('/checkout', { state: { productId: product.id, quantity: qty } });
  };

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors group">
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-3xl bg-gray-100 dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-800">
            {images.length > 0 ? (
              <img src={images[selectedImg]?.imgUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                <svg className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-brand-500 shadow-md shadow-brand-500/30' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                >
                  <img src={img.imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-full w-fit mb-3">
            {product.category?.name}
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.review ?? 0} size="md" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {(product.review ?? 0).toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            ₹{product.price.toLocaleString('en-IN')}
          </div>
          <p className={`text-xs font-semibold mb-5 ${isOutOfStock ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isOutOfStock ? '✕ Out of Stock' : `✓ In Stock · ${product.availableQuantity} left`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Quantity selector */}
          {!isOutOfStock && !isAdmin && (
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Qty:</span>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                </button>
                <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.availableQuantity, q + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          {!isAdmin ? (
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button onClick={handleAddToCart} disabled={isOutOfStock || addToCart.isPending} className="btn-secondary flex-1 py-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </button>
              <button onClick={handleBuyNow} disabled={isOutOfStock} className="btn-primary flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md shadow-orange-500/20 border-none transition-all duration-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </button>
              <button
                onClick={handleWishlist}
                className={`btn-secondary py-3 px-4 ${product.isInWishlist ? '!text-red-500 !border-red-200 dark:!border-red-800' : ''}`}
              >
                <svg className="w-4 h-4" fill={product.isInWishlist ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="mt-auto p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/50 text-center">
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                Purchases are disabled for Super Admin.
              </p>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            {[
              { icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', label: 'Free Returns' },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Secure Payment' },
              { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label: '24/7 Support' },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.icon} />
                  </svg>
                </div>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 px-5 divide-y divide-gray-100 dark:divide-gray-800">
              {reviews.map(r => <ReviewCard key={r.id} review={r} productId={product.id} />)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Review</h2>
          {!isAdmin ? (
            <ReviewForm productId={product.id} />
          ) : (
            <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#13141c] text-center text-sm text-gray-400">
              Only customers can write reviews.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
