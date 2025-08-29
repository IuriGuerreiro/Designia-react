// Main services export file
// Import all individual services

import { categoryService } from './CategoryService';
import { productService } from './ProductService';
import { favoriteService } from './FavoriteService';
import { cartService } from './CartService';
import { orderService } from './OrderService';
import { reviewService } from './ReviewService';
import { userService } from './userService';

// Export all services
export {
  categoryService,
  productService,
  favoriteService,
  cartService,
  orderService,
  reviewService,
  userService,
};

// Export service classes for type checking
export { CategoryService } from './CategoryService';
export { ProductService } from './ProductService';
export { FavoriteService } from './FavoriteService';
export { CartService } from './CartService';
export { OrderService } from './OrderService';
export { ReviewService } from './ReviewService';

// Export types
export * from '../types/marketplace';

// Legacy compatibility - combined service object
export const marketplaceService = {
  categories: categoryService,
  products: productService,
  favorites: favoriteService,
  cart: cartService,
  orders: orderService,
  reviews: reviewService,
};

export default marketplaceService;