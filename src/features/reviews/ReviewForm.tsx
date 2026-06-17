import { useState } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { useSubmitReview } from '../../shared/api';
import { useToast } from '../../shared/context/ToastContext';
import StarRating from '../../shared/components/StarRating';

export default function ReviewForm({ productId, onSubmitted }: { productId: number; onSubmitted?: () => void }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const submit = useSubmitReview();

  if (!isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) { toast.error('Please select a rating'); return; }
    submit.mutate({ productId, rating, comment: comment.trim() || undefined }, {
      onSuccess: () => {
        toast.success('Review submitted!');
        setRating(0);
        setComment('');
        onSubmitted?.();
      },
      onError: (err) => toast.error(err.message || 'Failed to submit review'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
      <div className="mb-4">
        <label className="form-label">Your Rating</label>
        <StarRating rating={rating} interactive onChange={setRating} size="lg" />
      </div>
      <div className="mb-4">
        <label className="form-label">Comment (optional)</label>
        <textarea
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your thoughts about this product…"
          className="form-input resize-none"
        />
      </div>
      <button type="submit" disabled={submit.isPending || !rating} className="btn-primary w-full">
        {submit.isPending ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
