import { useState, useRef } from 'react';
import { useGetProducts, useGetCategories, useCreateProduct, useUpdateProduct, useDeleteProduct, type Product, type ProductFilters } from '../../shared/api';
import Modal from '../../shared/components/Modal';
import Pagination from '../../shared/components/Pagination';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/context/ToastContext';
import Select from '../../shared/components/Select';

interface ProductForm {
  name: string; price: string; description: string;
  availableQuantity: string; categoryId: string;
}

const emptyForm: ProductForm = { name: '', price: '', description: '', availableQuantity: '', categoryId: '' };

export default function ProductsAdminPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: 10, sortBy: 'id', order: 'desc' });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useGetProducts({ ...filters, search: search || undefined });
  const { data: catData } = useGetCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(editing?.id ?? 0);

  const products = data?.data ?? [];
  const pagination = data?.pagination;
  const categories = catData?.data ?? [];

  if (isLoading && !data) return <PageLoader />;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setImageFiles([]); setModalOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), description: p.description, availableQuantity: String(p.availableQuantity), categoryId: String(p.category?.id ?? '') });
    setImageFiles([]);
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(emptyForm); setImageFiles([]); };

  const set = (k: keyof ProductForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.description || !form.availableQuantity || !form.categoryId) {
      toast.error('All fields are required'); return;
    }
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('price', form.price);
    fd.append('description', form.description);
    fd.append('availableQuantity', form.availableQuantity);
    fd.append('categoryId', form.categoryId);
    imageFiles.forEach(f => fd.append('images', f));

    if (editing) {
      updateProduct.mutate(fd, { onSuccess: () => { toast.success('Product updated!'); closeModal(); }, onError: (err) => toast.error(err.message) });
    } else {
      createProduct.mutate(fd, { onSuccess: () => { toast.success('Product created!'); closeModal(); }, onError: (err) => toast.error(err.message) });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{pagination?.totalItems ?? 0} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      {/* Search + Category filter */}
      <div className="flex gap-3 mb-4">
        <input
          type="search" placeholder="Search products…" value={search}
          onChange={e => { setSearch(e.target.value); setFilters(f => ({ ...f, page: 1 })); }}
          className="form-input max-w-xs"
        />
        <Select
          value={filters.categoryId ?? ''}
          onChange={val => setFilters(f => ({ ...f, categoryId: val ? Number(val) : undefined, page: 1 }))}
          options={[
            { value: '', label: 'All Categories' },
            ...categories.map(c => ({ value: c.id, label: c.name }))
          ]}
          className="min-w-[180px]"
        />
      </div>

      <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <ProductRow key={p.id} product={p} onEdit={() => openEdit(p)}
                  onSuccess={msg => toast.success(msg)} onError={msg => toast.error(msg)} />
              ))}
            </tbody>
          </table>
          {products.length === 0 && <div className="py-12 text-center text-sm text-gray-400">No products found.</div>}
        </div>
      </div>

      {pagination && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages}
          onPageChange={p => setFilters(f => ({ ...f, page: p }))} />
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Product' : 'New Product'} size="lg"
        footer={
          <>
            <button onClick={closeModal} className="btn-secondary">Cancel</button>
            <button form="prod-form" type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="btn-primary">
              {createProduct.isPending || updateProduct.isPending ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
            </button>
          </>
        }
      >
        <form id="prod-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Product Name *</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Premium Headphones" className="form-input" required />
            </div>
            <div>
              <label className="form-label">Price (₹) *</label>
              <input type="number" min="0.01" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="299.99" className="form-input" required />
            </div>
            <div>
              <label className="form-label">Stock Quantity *</label>
              <input type="number" min="0" value={form.availableQuantity} onChange={e => set('availableQuantity', e.target.value)} placeholder="50" className="form-input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Category *</label>
              <Select
                value={form.categoryId}
                onChange={val => set('categoryId', String(val))}
                options={[
                  { value: '', label: 'Select a category' },
                  ...categories.map(c => ({ value: c.id, label: c.name }))
                ]}
                className="w-full"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Description *</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Product description…" className="form-input resize-none" required />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Images (up to 5)</label>
              <div onClick={() => fileRef.current?.click()} className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-400 cursor-pointer transition-colors">
                <svg className="w-6 h-6 text-gray-300 dark:text-gray-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" /></svg>
                <p className="text-xs text-gray-400">{imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Click to upload images'}</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => { const files = Array.from(e.target.files ?? []).slice(0, 5); setImageFiles(files); }} />
              {imageFiles.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {imageFiles.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ProductRow({ product, onEdit, onSuccess, onError }: { product: Product; onEdit: () => void; onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const del = useDeleteProduct(product.id);
  const img = product.images?.[0]?.imgUrl;
  const handleDelete = () => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    del.mutate(undefined, { onSuccess: () => onSuccess('Product deleted'), onError: (err) => onError(err.message) });
  };
  return (
    <tr>
      <td>
        {img ? (
          <img src={img} alt={product.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" /></svg>
          </div>
        )}
      </td>
      <td className="font-semibold text-gray-900 dark:text-white max-w-[180px] truncate">{product.name}</td>
      <td><span className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-semibold">{product.category?.name}</span></td>
      <td className="font-semibold">₹{product.price.toLocaleString('en-IN')}</td>
      <td>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${product.availableQuantity === 0 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
          {product.availableQuantity}
        </span>
      </td>
      <td className="text-amber-500 font-semibold">★ {(product.review ?? 0).toFixed(1)}</td>
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
