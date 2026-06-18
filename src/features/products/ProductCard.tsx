import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useAddToCart, useAddToWishlist, type Product } from '../../shared/api';
import { useToast } from '../../shared/context/ToastContext';
import StarRating from '../../shared/components/StarRating';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();

  const imageUrl = product.images?.[0]?.imgUrl;
  const isOutOfStock = product.availableQuantity === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to add to cart'); return; }
    addToCart.mutate({ productId: product.id, quantity: 1 }, {
      onSuccess: () => toast.success(`${product.name} added to cart!`),
      onError: (err) => toast.error(err.message || 'Failed to add to cart'),
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to use wishlist'); return; }
    if (product.isInWishlist) {
      toast.info('Go to your wishlist to remove this item');
    } else {
      addToWishlist.mutate({ productId: product.id }, {
        onSuccess: () => toast.success('Added to wishlist!'),
        onError: (err) => toast.error(err.message || 'Failed'),
      });
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="group flex flex-col h-full">
      <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800/60 overflow-hidden hover-lift transition-theme flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-black/80 text-white text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
            </div>
          )}
          {/* Wishlist button */}
          {!isAdmin && (
            <button
              onClick={handleWishlist}
              className={`absolute top-2 right-2 p-2 rounded-xl backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 ${
                product.isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-red-500'
              }`}
            >
              <svg className="w-4 h-4" fill={product.isInWishlist ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          {/* Category badge */}
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded-lg backdrop-blur-sm">
            {product.category?.name}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mb-3">
            <StarRating rating={product.review ?? 0} size="sm" />
            <span className="text-xs text-gray-400">({(product.review ?? 0).toFixed(1)})</span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
            {product.description}
          </p>

          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addToCart.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-600/20"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                {isOutOfStock ? 'Sold Out' : 'Add'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
