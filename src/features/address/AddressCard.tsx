import { useDeleteAddress, type Address } from '../../shared/api';
import { useToast } from '../../shared/context/ToastContext';

interface AddressCardProps {
  address: Address;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export default function AddressCard({ address, selected, onSelect, onEdit, showActions = true }: AddressCardProps) {
  const { toast } = useToast();
  const del = useDeleteAddress(address.id);

  const handleDelete = () => {
    if (!confirm('Delete this address?')) return;
    del.mutate(undefined, {
      onSuccess: () => toast.success('Address deleted'),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-2xl border-2 transition-all ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#13141c] hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      {address.isPrimary && (
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Primary
        </span>
      )}
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {address.doorNumber}, {address.street}
          </p>
          {address.landmark && (
            <p className="text-xs text-gray-400 mt-0.5">Near {address.landmark}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {address.city}, {address.country}
          </p>
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            className="flex-1 text-xs font-medium py-1.5 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
            Edit
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={del.isPending}
            className="flex-1 text-xs font-medium py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
