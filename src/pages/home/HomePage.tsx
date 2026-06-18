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
    Promise.resolve().then(() => {
      setSearchInput(q);
      setFilters(f => ({ ...f, search: q || undefined, page: 1 }));
    });
  }, [searchParams]);

  const applyFilter = (patch: Partial<ProductFilters>) =>
    setFilters(f => ({ ...f, ...patch, page: 1 }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter({ search: searchInput.trim() || undefined });
  };

  return (
    <div className="page-container">
    <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl shadow-brand-600/20">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e0545] via-[#3b0f8c] to-[#6d28d9]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(167,139,250,0.35)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(124,58,237,0.4)_0%,_transparent_60%)]" />

        {/* Animated floating orbs */}
        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-purple-400/20 blur-3xl animate-hero-orb1" />
        <div className="absolute top-1/2 right-1/4 w-40 h-40 rounded-full bg-violet-300/15 blur-2xl animate-hero-orb2" />
        <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl animate-hero-orb1" />

        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 px-8 md:px-12 py-10 md:py-14">
          <div className="flex-1 text-white">
            {/* Offer Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              <span className="text-xs font-semibold text-brand-200 tracking-wide uppercase">Free delivery on orders ₹999+</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-pink-200">Premium</span><br />
              Products for You
            </h1>
            <p className="text-white/65 text-sm md:text-base leading-relaxed mb-7 max-w-md">
              Thousands of curated products across all categories, delivered right to your door with the best prices guaranteed.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search products…"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
                />
              </div>
              <button type="submit" className="px-5 py-3 bg-white text-brand-700 rounded-xl font-bold text-sm hover:bg-brand-50 active:scale-95 transition-all shadow-lg shadow-black/20 whitespace-nowrap">
                Search
              </button>
            </form>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                { label: 'Products', value: `${(data?.pagination?.totalItems ?? 0).toLocaleString()}+` },
                { label: 'Categories', value: `${categories.length}` },
                { label: 'Happy Customers', value: '10k+' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5">
                  <span className="text-white font-bold text-sm">{s.value}</span>
                  <span className="text-white/50 text-xs">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side decorative floating cards */}
          <div className="hidden md:flex flex-col gap-3 shrink-0">
            {[
              {
                icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                color: 'from-violet-500 to-purple-600',
                title: 'Lightning Fast',
                sub: 'Same-day dispatch',
              },
              {
                icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
                color: 'from-emerald-500 to-teal-600',
                title: 'Secure Checkout',
                sub: '256-bit encryption',
              },
              {
                icon: <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
                color: 'from-orange-500 to-amber-600',
                title: 'Easy Returns',
                sub: '7-day no questions',
              },
            ].map((c, i) => (
              <div
                key={c.title}
                className="flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 w-56 hover:bg-white/15 transition-all"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0 shadow-lg`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{c.title}</p>
                  <p className="text-white/50 text-[11px]">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Free Shipping', sub: 'On orders ₹999+', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', from: 'from-violet-500', to: 'to-purple-600' },
          { label: 'Secure Payment', sub: '100% protected', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', from: 'from-emerald-500', to: 'to-teal-600' },
          { label: 'Easy Returns', sub: '7-day policy', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', from: 'from-orange-500', to: 'to-amber-600' },
          { label: '24/7 Support', sub: 'Always here to help', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', from: 'from-pink-500', to: 'to-rose-600' },
        ].map(b => (
          <div key={b.label} className="glass-card p-4 flex items-center gap-3 hover-lift group">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.from} ${b.to} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      {/* Category Selection */}
      <div className="flex gap-4 overflow-x-auto pt-2 pb-4 mb-8 scrollbar-hide">
        <button
          onClick={() => applyFilter({ categoryId: undefined })}
          className="flex flex-col items-center gap-2 min-w-[72px] transition-all group outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
            !filters.categoryId 
              ? 'border-brand-600 bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 shadow-md scale-105' 
              : 'border-gray-200 dark:border-gray-800/80 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 group-hover:border-brand-500/50'
          }`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <span className={`text-xs font-semibold whitespace-nowrap transition-colors ${
            !filters.categoryId ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-brand-500'
          }`}>
            All Products
          </span>
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => applyFilter({ categoryId: cat.id })}
            className="flex flex-col items-center gap-2 min-w-[72px] transition-all group outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
          >
            <div className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center bg-white dark:bg-gray-900 ${
              filters.categoryId === cat.id 
                ? 'border-brand-600 shadow-md scale-105' 
                : 'border-gray-200 dark:border-gray-800/80 group-hover:border-brand-500/50'
            }`}>
              {cat.image ? (
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                />
              ) : (
                <span className="text-xs font-bold text-gray-400">{cat.name.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <span className={`text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
              filters.categoryId === cat.id ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 group-hover:text-brand-500'
            }`}>
              {cat.name}
              <span className="text-[9px] opacity-60">({cat._count?.products ?? 0})</span>
            </span>
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
