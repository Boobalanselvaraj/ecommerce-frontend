import { useNavigate } from 'react-router-dom';
import { useGetWishlist, useClearWishlist, useRemoveFromWishlist, useMoveToCart } from '../../shared/api';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/context/ToastContext';
import StarRating from '../../shared/components/StarRating';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: wishlist, isLoading } = useGetWishlist();
  const clearWishlist = useClearWishlist();

  if (isLoading) return <PageLoader />;

  const items = wishlist?.wishlistItems ?? [];

  const handleClear = () => {
    if (!confirm('Clear your entire wishlist?')) return;
    clearWishlist.mutate(undefined, {
      onSuccess: () => toast.success('Wishlist cleared'),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">My Wishlist</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClear} disabled={clearWishlist.isPending} className="btn-danger text-xs">
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-6">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-gray-400 mb-6">Save items you love to buy them later.</p>
          <button onClick={() => navigate('/')} className="btn-primary">Explore Products</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistItemCard({ item }: { item: any }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const remove = useRemoveFromWishlist(item.id);
  const moveToCart = useMoveToCart(item.id);
  const image = item.product.images?.[0]?.imgUrl;
  const isOutOfStock = item.product.availableQuantity === 0;

  return (
    <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden group hover-lift flex flex-col">
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {image ? (
          <img src={image} alt={item.product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
            onClick={() => navigate(`/products/${item.product.id}`)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-black/80 text-white text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        <button
          onClick={() => remove.mutate(undefined, { onSuccess: () => toast.success('Removed from wishlist') })}
          disabled={remove.isPending}
          className="absolute top-2 right-2 p-1.5 rounded-xl bg-white/90 dark:bg-gray-900/90 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all opacity-0 group-hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
          {item.product.category?.name}
        </span>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          onClick={() => navigate(`/products/${item.product.id}`)}>
          {item.product.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={item.product.review ?? 0} size="sm" />
        </div>
        <p className="text-base font-bold text-gray-900 dark:text-white mb-3">
          ₹{item.product.price.toLocaleString('en-IN')}
        </p>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <button
            onClick={() => moveToCart.mutate(undefined, {
              onSuccess: () => toast.success('Moved to cart!'),
              onError: (err: any) => toast.error(err.message),
            })}
            disabled={isOutOfStock || moveToCart.isPending}
            className="btn-primary text-xs py-2 disabled:opacity-50"
          >
            {isOutOfStock ? 'Sold Out' : 'Move to Cart'}
          </button>
          <button onClick={() => navigate(`/products/${item.product.id}`)} className="btn-secondary text-xs py-2">
            View
          </button>
        </div>
      </div>
    </div>
  );
}
