import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions, keepPreviousData } from '@tanstack/react-query';
import { api, ApiError } from './client';
export * from './client';

// ══════════════════════════════════════════════════════════
// CRUD HOOK HELPERS
// ══════════════════════════════════════════════════════════

export const useApiGET = <TData = any>(
  queryKey: string | any[],
  url: string,
  options?: Omit<UseQueryOptions<TData, ApiError, TData>, 'queryKey' | 'queryFn'>
) => {
  const keys = Array.isArray(queryKey) ? queryKey : [queryKey];
  return useQuery<TData, ApiError, TData>({
    queryKey: keys,
    queryFn: () => api.get<TData>(url),
    ...options,
  });
};

export const useApiPOST = <TData = any, TVariables = any>(
  url: string,
  invalidationKeys?: string | any[],
  options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) => api.post<TData>(url, variables),
    onSuccess: (...args) => {
      if (invalidationKeys) {
        const keys = Array.isArray(invalidationKeys) ? invalidationKeys : [invalidationKeys];
        keys.forEach(k => queryClient.invalidateQueries({ queryKey: Array.isArray(k) ? k : [k] }));
      }
      if (options?.onSuccess) options.onSuccess(...args);
    },
    ...options,
  });
};

export const useApiPUT = <TData = any, TVariables = any>(
  url: string,
  invalidationKeys?: string | any[],
  options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) => api.put<TData>(url, variables),
    onSuccess: (...args) => {
      if (invalidationKeys) {
        const keys = Array.isArray(invalidationKeys) ? invalidationKeys : [invalidationKeys];
        keys.forEach(k => queryClient.invalidateQueries({ queryKey: Array.isArray(k) ? k : [k] }));
      }
      if (options?.onSuccess) options.onSuccess(...args);
    },
    ...options,
  });
};

export const useApiPATCH = <TData = any, TVariables = any>(
  url: string,
  invalidationKeys?: string | any[],
  options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) => api.patch<TData>(url, variables),
    onSuccess: (...args) => {
      if (invalidationKeys) {
        const keys = Array.isArray(invalidationKeys) ? invalidationKeys : [invalidationKeys];
        keys.forEach(k => queryClient.invalidateQueries({ queryKey: Array.isArray(k) ? k : [k] }));
      }
      if (options?.onSuccess) options.onSuccess(...args);
    },
    ...options,
  });
};

export const useApiDELETE = <TData = any>(
  url: string,
  invalidationKeys?: string | any[],
  options?: Omit<UseMutationOptions<TData, ApiError, void>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  return useMutation<TData, ApiError, void>({
    mutationFn: () => api.delete<TData>(url),
    onSuccess: (...args) => {
      if (invalidationKeys) {
        const keys = Array.isArray(invalidationKeys) ? invalidationKeys : [invalidationKeys];
        keys.forEach(k => queryClient.invalidateQueries({ queryKey: Array.isArray(k) ? k : [k] }));
      }
      if (options?.onSuccess) options.onSuccess(...args);
    },
    ...options,
  });
};

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════

export type UserRole = 'USER' | 'SUPER_ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELED';

export interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: number;
  imgUrl: string;
}

export interface Category {
  id: number;
  name: string;
  image?: string;
  createdAt: string;
  userId?: number;
  _count?: { products: number };
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  availableQuantity: number;
  review: number; // average rating
  category: Category;
  images: ProductImage[];
  isInCart?: boolean;
  isInWishlist?: boolean;
}

export interface CartProduct {
  id: number;
  name: string;
  price: number;
  availableQuantity: number;
  images: ProductImage[];
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: CartProduct;
}

export interface CartResponse {
  success: boolean;
  totalItems: number;
  cartTotal: number;
  cartItems: CartItem[];
}

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  product: Product & { category: Category };
}

export interface WishlistResponse {
  success: boolean;
  totalItems: number;
  wishlistItems: WishlistItem[];
}

export interface Address {
  id: number;
  doorNumber: string;
  street: string;
  city: string;
  country: string;
  landmark?: string;
  isPrimary: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: number;
  orderNumber: string;
  totalPrice: number;
  status: OrderStatus;
  orderedAt: string;
  deliveredAt?: string;
  userId: number;
  addressId: number;
  orderItems: OrderItem[];
  user?: { id: number; name: string; email: string; mobile: string };
}

export interface OrdersResponse {
  total: number;
  page: number;
  totalPages: number;
  orders: Order[];
}

export interface OrderStats {
  byStatus: Record<OrderStatus, number>;
  revenue: {
    total: number;
    average: number;
    deliveredOrders: number;
  };
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  userId: number;
  productId: number;
  createdAt: string;
  updatedAt: string;
  user?: { id: number; name: string; username: string };
}

export interface ProductsResponse {
  status: string;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  count: number;
  data: Product[];
}

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'id' | 'price' | 'review' | 'name';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════

export const useLogin = () => useApiPOST<any, { username: string; password: string }>('/auth/login');
export const useRegister = () => useApiPOST<any, { name: string; email: string; mobile: string; username: string; password: string }>('/auth/register');
export const useLogout = () => useApiPOST<any, void>('/auth/logout', ['AUTH_PROFILE']);
export const useGetOtp = () => useApiPOST<any, { mobile: string }>('/auth/getotp');
export const useVerifyOtp = () => useApiPOST<any, { mobile: string; otp: string }>('/auth/verifyotp');
export const useGetMe = (options?: Omit<UseQueryOptions<any, ApiError, any>, 'queryKey' | 'queryFn'>) =>
  useApiGET<any>('AUTH_PROFILE', '/auth/me', options);

// ══════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════

export const useGetAllUsers = (options?: any) =>
  useApiGET<{ status: string; data: User[] }>('USERS', '/users/viewall', options);

export const useUpdateUser = (id: number, invalidateKeys?: any[]) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, any>({
    mutationFn: (data) => api.put(`/users/update/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['AUTH_PROFILE'] });
      queryClient.invalidateQueries({ queryKey: ['USERS'] });
      if (invalidateKeys) invalidateKeys.forEach(k => queryClient.invalidateQueries({ queryKey: [k] }));
    },
  });
};

export const useDeleteUser = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.delete(`/users/delete/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['AUTH_PROFILE'] });
      queryClient.invalidateQueries({ queryKey: ['USERS'] });
    },
  });
};

// ══════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════

export const useGetCategories = (options?: any) =>
  useApiGET<{ status: string; data: Category[] }>('CATEGORIES', '/category/getcategories', options);

export const useGetCategoryProducts = (id: number, options?: any) =>
  useApiGET<{ status: string; data: Category & { products: Product[] } }>(
    ['CATEGORY', id], `/category/${id}/products`, options
  );

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, FormData>({
    mutationFn: (data) => api.post('/category/create', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['CATEGORIES'] }),
  });
};

export const useUpdateCategory = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, FormData>({
    mutationFn: (data) => api.put(`/category/update/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['CATEGORIES'] }),
  });
};

export const useDeleteCategory = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.delete(`/category/delete/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['CATEGORIES'] }),
  });
};

// ══════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════

export const useGetProducts = (filters?: ProductFilters, options?: any) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
  }
  const qs = params.toString();
  return useApiGET<ProductsResponse>(
    ['PRODUCTS', filters],
    `/product${qs ? `?${qs}` : ''}`,
    {
      placeholderData: keepPreviousData,
      ...options,
    }
  );
};

export const useGetProduct = (id: number, options?: any) =>
  useApiGET<{ status: string; data: Product }>(['PRODUCT', id], `/product/${id}`, options);

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, FormData>({
    mutationFn: (data) => api.post('/product/create', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['PRODUCTS'] }),
  });
};

export const useUpdateProduct = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, FormData>({
    mutationFn: (data) => api.put(`/product/update/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['PRODUCTS'] });
      queryClient.invalidateQueries({ queryKey: ['PRODUCT', id] });
    },
  });
};

export const useDeleteProduct = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.delete(`/product/delete/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['PRODUCTS'] }),
  });
};

// ══════════════════════════════════════════════════════════
// CART
// ══════════════════════════════════════════════════════════

export const useGetCart = (options?: any) =>
  useApiGET<CartResponse>('CART', '/cart', options);

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { productId: number; quantity?: number }>({
    mutationFn: (data) => api.post('/cart', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['CART'] });
      queryClient.invalidateQueries({ queryKey: ['PRODUCTS'] });
    },
  });
};

export const useUpdateCartItem = (cartId: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { quantity: number }>({
    mutationFn: (data) => api.patch(`/cart/${cartId}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['CART'] }),
  });
};

export const useRemoveCartItem = (cartId: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.delete(`/cart/${cartId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['CART'] }),
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.delete('/cart'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['CART'] }),
  });
};

// ══════════════════════════════════════════════════════════
// WISHLIST
// ══════════════════════════════════════════════════════════

export const useGetWishlist = (options?: any) =>
  useApiGET<WishlistResponse>('WISHLIST', '/wishlist', options);

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { productId: number }>({
    mutationFn: (data) => api.post('/wishlist', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['WISHLIST'] });
      queryClient.invalidateQueries({ queryKey: ['PRODUCTS'] });
    },
  });
};

export const useRemoveFromWishlist = (wishlistId: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.delete(`/wishlist/${wishlistId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['WISHLIST'] });
      queryClient.invalidateQueries({ queryKey: ['PRODUCTS'] });
    },
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.delete('/wishlist'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['WISHLIST'] }),
  });
};

export const useMoveToCart = (wishlistId: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.post(`/wishlist/${wishlistId}/move-to-cart`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['WISHLIST'] });
      queryClient.invalidateQueries({ queryKey: ['CART'] });
    },
  });
};

// ══════════════════════════════════════════════════════════
// ADDRESSES
// ══════════════════════════════════════════════════════════

export const useGetAddresses = (options?: any) =>
  useApiGET<{ status: string; data: Address[] }>('ADDRESSES', '/addresses', options);

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, Partial<Address>>({
    mutationFn: (data) => api.post('/addresses', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ADDRESSES'] }),
  });
};

export const useUpdateAddress = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, Partial<Address>>({
    mutationFn: (data) => api.put(`/addresses/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ADDRESSES'] }),
  });
};

export const useDeleteAddress = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.delete(`/addresses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ADDRESSES'] }),
  });
};

// ══════════════════════════════════════════════════════════
// ORDERS
// ══════════════════════════════════════════════════════════

export interface OrderFilters {
  status?: OrderStatus;
  sortBy?: 'orderedAt' | 'totalPrice' | 'status';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const useGetOrders = (filters?: OrderFilters, options?: any) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
  }
  const qs = params.toString();
  return useApiGET<OrdersResponse>(
    ['ORDERS', filters],
    `/order${qs ? `?${qs}` : ''}`,
    options
  );
};

export const useGetOrder = (id: number, options?: any) =>
  useApiGET<{ order: Order }>(['ORDER', id], `/order/${id}`, options);

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { addressId: number; productId?: number; quantity?: number }>({
    mutationFn: (data) => api.post('/order', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ORDERS'] });
      queryClient.invalidateQueries({ queryKey: ['CART'] });
    },
  });
};

export const useUpdateOrderStatus = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { status: OrderStatus }>({
    mutationFn: (data) => api.patch(`/order/${id}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ORDERS'] });
      queryClient.invalidateQueries({ queryKey: ['ORDER', id] });
    },
  });
};

export const useCancelOrder = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.patch(`/order/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ORDERS'] });
      queryClient.invalidateQueries({ queryKey: ['ORDER', id] });
    },
  });
};

export const useDeleteOrder = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.delete(`/order/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ORDERS'] }),
  });
};

export const useGetOrderStats = (options?: any) =>
  useApiGET<OrderStats>('ORDER_STATS', '/order/stats', options);

// ══════════════════════════════════════════════════════════
// REVIEWS
// ══════════════════════════════════════════════════════════

export const useGetProductReviews = (productId: number, options?: any) =>
  useApiGET<{ status: string; data: Review[] }>(
    ['REVIEWS', productId], `/reviews/product/${productId}`, options
  );

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, { productId: number; rating: number; comment?: string }>({
    mutationFn: (data) => api.post('/reviews', data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['REVIEWS', vars.productId] });
      queryClient.invalidateQueries({ queryKey: ['PRODUCT', vars.productId] });
    },
  });
};

export const useDeleteReview = (id: number, productId?: number) => {
  const queryClient = useQueryClient();
  return useMutation<any, ApiError, void>({
    mutationFn: () => api.delete(`/reviews/${id}`),
    onSuccess: () => {
      if (productId) queryClient.invalidateQueries({ queryKey: ['REVIEWS', productId] });
    },
  });
};

// ══════════════════════════════════════════════════════════
// PAYMENTS
// ══════════════════════════════════════════════════════════

export const useCreateCheckoutSession = () =>
  useMutation<{ status: string; sessionId: string; url: string }, ApiError, { orderId: number }>({
    mutationFn: (data) => api.post('/payments/checkout-session', data),
  });