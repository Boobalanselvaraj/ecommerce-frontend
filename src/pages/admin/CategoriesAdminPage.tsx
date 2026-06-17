import { useState, useRef } from 'react';
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../shared/api';
import Modal from '../../shared/components/Modal';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/context/ToastContext';
import type { Category } from '../../shared/api';

export default function CategoriesAdminPage() {
  const { toast } = useToast();
  const { data, isLoading } = useGetCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory(editing?.id ?? 0);

  const categories = data?.data ?? [];
  if (isLoading) return <PageLoader />;

  const openCreate = () => { setEditing(null); setName(''); setImageFile(null); setPreview(null); setModalOpen(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setName(cat.name); setImageFile(null); setPreview(cat.image ?? null); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setName(''); setImageFile(null); setPreview(null); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Category name is required'); return; }
    const fd = new FormData();
    fd.append('name', name.trim());
    if (imageFile) fd.append('image', imageFile);

    if (editing) {
      updateCat.mutate(fd, {
        onSuccess: () => { toast.success('Category updated!'); closeModal(); },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createCat.mutate(fd, {
        onSuccess: () => { toast.success('Category created!'); closeModal(); },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Products</th>
              <th>Created</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <CategoryRow key={cat.id} cat={cat} onEdit={() => openEdit(cat)} onSuccess={(msg) => toast.success(msg)} onError={(msg) => toast.error(msg)} />
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">No categories yet. Create your first one!</p>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Category' : 'New Category'} size="sm"
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button form="cat-form" type="submit" disabled={createCat.isPending || updateCat.isPending} className="btn-primary">
              {createCat.isPending || updateCat.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
            </button>
          </>
        }
      >
        <form id="cat-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Name <span className="text-red-400">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Electronics" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Category Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative mt-1 flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-400 cursor-pointer transition-colors overflow-hidden"
            >
              {preview ? (
                <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-400">Click to upload image</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG · max 5MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

function CategoryRow({ cat, onEdit, onSuccess, onError }: { cat: Category; onEdit: () => void; onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const del = useDeleteCategory(cat.id);
  const handleDelete = () => {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    del.mutate(undefined, {
      onSuccess: () => onSuccess('Category deleted'),
      onError: (err) => onError(err.message),
    });
  };
  return (
    <tr>
      <td>
        {cat.image ? (
          <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" /></svg>
          </div>
        )}
      </td>
      <td className="font-semibold text-gray-900 dark:text-white">{cat.name}</td>
      <td><span className="text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-semibold">{cat._count?.products ?? 0}</span></td>
      <td>{new Date(cat.createdAt).toLocaleDateString('en-IN')}</td>
      <td className="text-right">
        <div className="flex items-center justify-end gap-2">
          <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button onClick={handleDelete} disabled={del.isPending} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
