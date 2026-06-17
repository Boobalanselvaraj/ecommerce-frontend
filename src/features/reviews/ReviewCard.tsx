import type { Review } from '../../shared/api';
import { useAuth } from '../../shared/context/AuthContext';
import { useDeleteReview } from '../../shared/api';
import { useToast } from '../../shared/context/ToastContext';
import StarRating from '../../shared/components/StarRating';

export default function ReviewCard({ review, productId }: { review: Review; productId: number }) {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const del = useDeleteReview(review.id, productId);
  const canDelete = isAdmin || user?.id === review.userId;

  const handleDelete = () => {
    if (!confirm('Delete this review?')) return;
    del.mutate(undefined, {
      onSuccess: () => toast.success('Review deleted'),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 animate-fade-in">
      <div className="w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm flex-shrink-0">
        {review.user?.name?.charAt(0).toUpperCase() ?? 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{review.user?.name ?? 'User'}</span>
            <span className="ml-2 text-xs text-gray-400">@{review.user?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size="sm" />
            {canDelete && (
              <button onClick={handleDelete} disabled={del.isPending}
                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {review.comment && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
      </div>
    </div>
  );
}
