import { useGetAllUsers, type User } from '../../shared/api';
import { PageLoader } from '../../shared/components/LoadingSpinner';

export default function UsersAdminPage() {
  const { data, isLoading } = useGetAllUsers();
  const users: User[] = data?.data ?? [];

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Users</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{users.length} registered accounts</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Users', value: users.length, color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20 dark:text-brand-400' },
          { label: 'Admins', value: users.filter(u => u.role === 'SUPER_ADMIN').length, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400' },
          { label: 'Regular Users', value: users.filter(u => u.role !== 'SUPER_ADMIN').length, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${s.color}`}>{s.value}</div>
            <span className="text-sm text-gray-600 dark:text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-500 dark:text-gray-400 text-xs">@{u.username}</td>
                  <td className="text-xs">{u.email}</td>
                  <td className="text-xs font-mono">{u.mobile}</td>
                  <td>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      u.role === 'SUPER_ADMIN'
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-brand-500/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}>
                      {u.role === 'SUPER_ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="py-12 text-center text-sm text-gray-400">No users found.</div>}
        </div>
      </div>
    </div>
  );
}
