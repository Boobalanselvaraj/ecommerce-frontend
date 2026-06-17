import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetProducts, useGetCategories, type ProductFilters } from '../../shared/api';
import ProductCard from '../../features/products/ProductCard';
import Pagination from '../../shared/components/Pagination';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import Select from '../../shared/components/Select';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') ?? '',
    categoryId: searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: (searchParams.get('sortBy') as any) ?? 'id',
    order: (searchParams.get('order') as any) ?? 'desc',
    page: 1,
    limit: 12,
  });
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  const { data, isLoading, isFetching } = useGetProducts(filters);
  const { data: catData } = useGetCategories();

  const categories = catData?.data ?? [];
  const products = data?.data ?? [];
  const pagination = data?.pagination;

  // Sync search param from URL
  useEffect(() => {
    const q = searchParams.get('search') ?? '';
    setSearchInput(q);
    setFilters(f => ({ ...f, search: q || undefined, page: 1 }));
  }, [searchParams]);

  const applyFilter = (patch: Partial<ProductFilters>) =>
    setFilters(f => ({ ...f, ...patch, page: 1 }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter({ search: searchInput.trim() || undefined });
  };

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="relative mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-purple-700 p-8 md:p-12 text-white shadow-2xl shadow-brand-600/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-purple-300 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="text-brand-200 text-sm font-semibold uppercase tracking-widest mb-2">New Season Arrivals</p>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
            Shop the Latest <br />
            <span className="text-brand-200">Premium Picks</span>
          </h1>
          <p className="text-white/70 text-sm leading-relaxed mb-6">Discover thousands of curated products across all categories. Free delivery on orders above ₹999.</p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products…"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <button type="submit" className="px-4 py-2.5 bg-white text-brand-700 rounded-xl font-semibold text-sm hover:bg-brand-50 transition-all">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Free Shipping', sub: 'On orders ₹999+', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
          { label: 'Secure Payment', sub: '100% protected', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
          { label: 'Easy Returns', sub: '7-day policy', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
          { label: '24/7 Support', sub: 'Always here to help', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
        ].map(b => (
          <div key={b.label} className="glass-card p-4 flex items-start gap-3 hover-lift">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.icon} />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{b.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{b.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        <button
          onClick={() => applyFilter({ categoryId: undefined })}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            !filters.categoryId ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-brand-500/50'
          }`}
        >
          All Products
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => applyFilter({ categoryId: cat.id })}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filters.categoryId === cat.id ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-brand-500/50'
            }`}
          >
            {cat.image && <img src={cat.image} alt={cat.name} className="w-4 h-4 rounded-full object-cover" />}
            {cat.name}
            <span className="text-[10px] opacity-60">({cat._count?.products ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Filters + Sort bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters:
        </div>
        {/* Price range */}
        <div className="flex items-center gap-1.5">
          <input type="number" placeholder="Min ₹" min={0}
            value={filters.minPrice ?? ''}
            onChange={e => applyFilter({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-24 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <span className="text-gray-400 text-xs">–</span>
          <input type="number" placeholder="Max ₹" min={0}
            value={filters.maxPrice ?? ''}
            onChange={e => applyFilter({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-24 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        {/* Sort */}
        <Select
          value={`${filters.sortBy}-${filters.order}`}
          onChange={val => {
            const [sortBy, order] = val.split('-');
            applyFilter({ sortBy: sortBy as any, order: order as any });
          }}
          options={[
            { value: 'id-desc', label: 'Newest First' },
            { value: 'id-asc', label: 'Oldest First' },
            { value: 'price-asc', label: 'Price: Low to High' },
            { value: 'price-desc', label: 'Price: High to Low' },
            { value: 'review-desc', label: 'Top Rated' },
            { value: 'name-asc', label: 'Name: A–Z' },
          ]}
          className="min-w-[180px]"
        />

        {/* Active filters indicator */}
        {(filters.search || filters.categoryId || filters.minPrice || filters.maxPrice) && (
          <button
            onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: undefined, categoryId: undefined, minPrice: undefined, maxPrice: undefined, page: 1 })); setSearchParams({}); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        )}

        {/* Count */}
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
          {isFetching ? 'Loading…' : `${pagination?.totalItems ?? 0} products`}
        </span>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-700 mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No products found</h2>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-300 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
            />
          )}
        </>
      )}
    </div>
  );
}
