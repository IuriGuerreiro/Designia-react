// Legacy barrel for backwards compatibility. Prefer importing from feature modules directly.

import {
  cartService,
  categoryService,
  favoriteService,
  orderService,
  productService,
  reviewService,
  CartService,
  CategoryService,
  FavoriteService,
  OrderService,
  ProductService,
  ReviewService,
} from '../features/marketplace/api';
import { paymentService } from '../features/payments/api';
import { userService, UserService } from '../features/users/api';

export {
  cartService,
  categoryService,
  favoriteService,
  orderService,
  productService,
  reviewService,
  CartService,
  CategoryService,
  FavoriteService,
  OrderService,
  ProductService,
  ReviewService,
  paymentService,
  userService,
  UserService,
};

export * from '@/features/marketplace/model';

export const marketplaceService = {
  categories: categoryService,
  products: productService,
  favorites: favoriteService,
  cart: cartService,
  orders: orderService,
  reviews: reviewService,
};

export default marketplaceService;
