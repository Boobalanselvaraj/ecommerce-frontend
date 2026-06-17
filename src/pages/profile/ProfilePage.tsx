import { useState } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { useGetAddresses, useUpdateUser, useDeleteUser } from '../../shared/api';
import AddressCard from '../../features/address/AddressCard';
import AddressForm from '../../features/address/AddressForm';
import Modal from '../../shared/components/Modal';
import { PageLoader } from '../../shared/components/LoadingSpinner';
import { useToast } from '../../shared/context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, logout, refreshUser, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [editingAddr, setEditingAddr] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', mobile: user?.mobile ?? '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirm: '' });

  const { data: addrData } = useGetAddresses();
  const updateUser = useUpdateUser(user?.id ?? 0);
  const deleteUser = useDeleteUser(user?.id ?? 0);
  const addresses = addrData?.data ?? [];

  if (isLoading || !user) return <PageLoader />;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) { toast.error('Mobile must be 10 digits'); return; }
    updateUser.mutate({ name: form.name, email: form.email, mobile: form.mobile }, {
      onSuccess: () => { toast.success('Profile updated!'); refreshUser(); setEditMode(false); },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (passwordForm.password !== passwordForm.confirm) { toast.error('Passwords do not match'); return; }
    updateUser.mutate({ password: passwordForm.password }, {
      onSuccess: () => { toast.success('Password updated!'); setPasswordForm({ password: '', confirm: '' }); },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDeleteAccount = () => {
    deleteUser.mutate(undefined, {
      onSuccess: async () => {
        toast.success('Account deleted');
        await logout();
        navigate('/');
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { key: 'addresses', label: 'Addresses', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { key: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  ];

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-brand-600/30">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{user.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
          {user.role === 'SUPER_ADMIN' && (
            <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/20">
              Super Admin
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-brand-600 text-brand-700 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Personal Information</h2>
            <button onClick={() => setEditMode(v => !v)} className={editMode ? 'btn-secondary text-xs' : 'btn-primary text-xs'}>
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          {editMode ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                { key: 'email', label: 'Email Address', type: 'email', placeholder: 'john@example.com' },
                { key: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: '10-digit number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="form-input"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={updateUser.isPending} className="btn-primary flex-1">
                  {updateUser.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: user.name, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { label: 'Username', value: `@${user.username}`, icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z' },
                { label: 'Email', value: user.email, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                { label: 'Mobile', value: user.mobile, icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
                { label: 'Member Since', value: new Date(user.createdAt ?? '').toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{f.label}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Addresses Tab */}
      {activeTab === 'addresses' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
            <button onClick={() => { setShowAddAddr(true); setEditingAddr(null); }} className="btn-primary text-xs">
              + Add Address
            </button>
          </div>
          {addresses.length === 0 ? (
            <div className="py-16 text-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <p className="text-sm">No addresses saved yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map(addr => (
                <AddressCard key={addr.id} address={addr} onEdit={() => { setEditingAddr(addr); setShowAddAddr(true); }} />
              ))}
            </div>
          )}
          <Modal isOpen={showAddAddr} onClose={() => { setShowAddAddr(false); setEditingAddr(null); }} title={editingAddr ? 'Edit Address' : 'Add New Address'} size="md">
            <AddressForm existing={editingAddr} onDone={() => { setShowAddAddr(false); setEditingAddr(null); }} onCancel={() => { setShowAddAddr(false); setEditingAddr(null); }} />
          </Modal>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-[#13141c] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { key: 'password', label: 'New Password', placeholder: 'Min 6 characters' },
                { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input
                    type="password"
                    value={(passwordForm as any)[f.key]}
                    onChange={e => setPasswordForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="form-input"
                  />
                </div>
              ))}
              <button type="submit" disabled={updateUser.isPending} className="btn-primary w-full">
                {updateUser.isPending ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800/50 p-6">
            <h2 className="text-base font-bold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger">Delete My Account</button>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Account" size="sm"
        footer={
          <>
            <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleDeleteAccount} disabled={deleteUser.isPending} className="btn-danger">
              {deleteUser.isPending ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to permanently delete your account? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
