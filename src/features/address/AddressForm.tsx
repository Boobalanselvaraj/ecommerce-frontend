import { useState } from 'react';
import { useCreateAddress, useUpdateAddress, type Address } from '../../shared/api';
import { useToast } from '../../shared/context/ToastContext';

interface AddressFormProps {
  existing?: Address;
  onDone?: () => void;
  onCancel?: () => void;
}

const emptyForm = { doorNumber: '', street: '', city: '', country: '', landmark: '', isPrimary: false };

export default function AddressForm({ existing, onDone, onCancel }: AddressFormProps) {
  const { toast } = useToast();
  const [form, setForm] = useState(existing ? {
    doorNumber: existing.doorNumber,
    street: existing.street,
    city: existing.city,
    country: existing.country,
    landmark: existing.landmark ?? '',
    isPrimary: existing.isPrimary,
  } : emptyForm);

  const create = useCreateAddress();
  const update = useUpdateAddress(existing?.id ?? 0);
  const isPending = create.isPending || update.isPending;

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { doorNumber, street, city, country } = form;
    if (!doorNumber || !street || !city || !country) {
      toast.error('Please fill all required fields');
      return;
    }
    const payload = { ...form, landmark: form.landmark || undefined };
    const mutation = existing ? update : create;
    (mutation.mutate as any)(payload, {
      onSuccess: () => {
        toast.success(existing ? 'Address updated!' : 'Address added!');
        onDone?.();
      },
      onError: (err: any) => toast.error(err.message || 'Failed'),
    });
  };

  const fields = [
    { key: 'doorNumber', label: 'Door / Flat No.', placeholder: '42B', required: true },
    { key: 'street',     label: 'Street / Area',   placeholder: 'MG Road', required: true },
    { key: 'city',       label: 'City',             placeholder: 'Mumbai', required: true },
    { key: 'country',    label: 'Country',          placeholder: 'India', required: true },
    { key: 'landmark',   label: 'Landmark',         placeholder: 'Near Central Park', required: false },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className={f.key === 'street' || f.key === 'landmark' ? 'sm:col-span-2' : ''}>
            <label className="form-label">{f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}</label>
            <input
              type="text"
              value={(form as any)[f.key]}
              onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              required={f.required}
              className="form-input"
            />
          </div>
        ))}
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => set('isPrimary', !form.isPrimary)}
          className={`w-10 h-6 rounded-full border-2 border-transparent transition-colors ${form.isPrimary ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isPrimary ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Set as primary address</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending} className="btn-primary flex-1">
          {isPending ? 'Saving…' : existing ? 'Update Address' : 'Save Address'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        )}
      </div>
    </form>
  );
}
