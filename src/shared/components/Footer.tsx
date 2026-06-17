import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-[#0b0c10]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-sm">
                N
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Nexus<span className="text-brand-500">Shop</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your trusted destination for premium products. Fast delivery, secure checkout, and great prices.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">All Products</Link></li>
              <li><Link to="/cart" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">My Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Wishlist</Link></li>
              <li><Link to="/orders" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Order History</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">Account</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/profile" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">My Profile</Link></li>
              <li><Link to="/auth" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-3">Why NexusShop?</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Free delivery above ₹999
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Secure payments
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Easy returns
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-800/60 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} NexusShop. All rights reserved.</span>
          <span className="font-medium">Developed by <span className="text-brand-600 dark:text-brand-400 font-semibold">Boobalan</span></span>
        </div>
      </div>
    </footer>
  );
}
