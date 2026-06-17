import { Link } from 'react-router-dom';
import { useGetOrderStats, useGetAllUsers, useGetProducts, useGetCategories, type OrderStatus } from '../../shared/api';
import { PageLoader } from '../../shared/components/LoadingSpinner';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetOrderStats();
  const { data: users } = useGetAllUsers();
  const { data: products } = useGetProducts({ limit: 1 });
  const { data: categories } = useGetCategories();

  if (statsLoading) return <PageLoader />;

  const revenue = stats?.revenue;
  const byStatus = stats?.byStatus ?? {} as Record<string, number>;

  const statCards = [
    { label: 'Total Revenue', value: `₹${(revenue?.total ?? 0).toLocaleString('en-IN')}`, sub: `${revenue?.deliveredOrders ?? 0} delivered orders`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
    { label: 'Avg Order Value', value: `₹${(revenue?.average ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: 'Per order average', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400' },
    { label: 'Total Users', value: String(users?.data?.length ?? 0), sub: 'Registered accounts', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400' },
    { label: 'Categories', value: String(categories?.data?.length ?? 0), sub: `${products?.pagination?.totalItems ?? 0} total products`, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400' },
  ];

  const orderStatusList: { status: OrderStatus; label: string; color: string }[] = [
    { status: 'PENDING', label: 'Pending', color: 'bg-amber-500' },
    { status: 'CONFIRMED', label: 'Confirmed', color: 'bg-blue-500' },
    { status: 'SHIPPED', label: 'Shipped', color: 'bg-purple-500' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'bg-indigo-500' },
    { status: 'DELIVERED', label: 'Delivered', color: 'bg-emerald-500' },
    { status: 'CANCELED', label: 'Canceled', color: 'bg-red-500' },
  ];

  const totalOrders: number = Object.values(byStatus).reduce((a: number, b) => a + (Number(b) || 0), 0);

  const adminLinks = [
    { path: '/admin/categories', label: 'Manage Categories', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', count: categories?.data?.length ?? 0, color: 'from-purple-600 to-indigo-600' },
    { path: '/admin/products', label: 'Manage Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', count: products?.pagination?.totalItems ?? 0, color: 'from-brand-600 to-purple-600' },
    { path: '/admin/orders', label: 'Manage Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', count: totalOrders, color: 'from-emerald-600 to-teal-600' },
    { path: '/admin/users', label: 'Manage Users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', count: users?.data?.length ?? 0, color: 'from-rose-600 to-orange-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Overview of your store performance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} mb-3`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
              </svg>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders by status */}
        <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {orderStatusList.map(s => {
              const count: number = Number(byStatus[s.status]) || 0;
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick nav */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {adminLinks.map(l => (
            <Link key={l.path} to={l.path}
              className={`flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br ${l.color} text-white hover-lift shadow-lg`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={l.icon} />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-black">{l.count}</p>
                <p className="text-sm font-medium text-white/80 mt-0.5">{l.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
