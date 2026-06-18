import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './shared/components/Header';
import MobileNav from './shared/components/MobileNav';
import ToastContainer from './shared/components/ToastContainer';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminLayout from './shared/components/AdminLayout';
import { PageLoader } from './shared/components/LoadingSpinner';

// Pages
import HomePage from './pages/home/HomePage';
import AuthPage from './pages/auth/AuthPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import WishlistPage from './pages/wishlist/WishlistPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoriesAdminPage from './pages/admin/CategoriesAdminPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import OrdersAdminPage from './pages/admin/OrdersAdminPage';
import UsersAdminPage from './pages/admin/UsersAdminPage';
import Footer from './shared/components/Footer';
import { useAuth } from './shared/context/AuthContext';
import type { User } from './shared/api';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); }, [pathname]);
  return null;
}

function getPostLoginPath(user: User | null, from?: string) {
  if (user?.role === 'SUPER_ADMIN') {
    return from?.startsWith('/admin') ? from : '/admin';
  }
  if (from && from !== '/auth') return from;
  return '/';
}

function AuthRoute() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;

  const handleSuccess = (loggedInUser: User | null) => {
    navigate(getPostLoginPath(loggedInUser, from), { replace: true });
  };

  if (isLoading) return <PageLoader />;

  if (isAuthenticated) {
    return <Navigate to={getPostLoginPath(user, from)} replace />;
  }

  return <AuthPage onSuccess={handleSuccess} />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/auth" element={<AuthRoute />} />

      {/* Auth Required */}
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Admin Only */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><CategoriesAdminPage /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><ProductsAdminPage /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><OrdersAdminPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UsersAdminPage /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen mesh-gradient flex flex-col font-sans transition-theme pb-16 md:pb-0">
        <Header />
        <main className="flex-1">
          <ScrollToTop />
          <AppRoutes />
        </main>
        <MobileNav />
        <Footer />
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}
