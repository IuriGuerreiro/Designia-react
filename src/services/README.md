# Marketplace Services Architecture

This document describes the reorganized service architecture for the marketplace application.

## Architecture Overview

The services have been restructured to follow a **single responsibility principle** with one service per Django model/domain:

- **Centralized Endpoints**: All API endpoints are defined in `config/api.ts`
- **Dedicated Services**: Each service handles one specific domain
- **Type Safety**: All types are centralized in `types/marketplace.ts`
- **Singleton Pattern**: Each service uses singleton pattern for consistency

## Service Structure

### 1. CategoryService
**File**: `services/CategoryService.ts`
**Responsibility**: Handle all category-related operations
**Methods**:
- `getCategories()` - Get all categories
- `getCategory(slug)` - Get category by slug
- `getCategoryProducts(slug, filters?)` - Get products in category

### 2. ProductService
**File**: `services/ProductService.ts`
**Responsibility**: Handle all product-related operations
**Methods**:
- `getProducts(filters?)` - Get products with pagination
- `getProduct(slug)` - Get product by slug
- `createProduct(productData)` - Create new product
- `updateProduct(slug, productData)` - Update product
- `deleteProduct(slug)` - Delete product
- `trackClick(slug)` - Track product clicks
- `getProductReviews(slug)` - Get product reviews
- `addProductReview(slug, reviewData)` - Add product review
- `getMyProducts()` - Get user's products

### 3. FavoriteService
**File**: `services/FavoriteService.ts`
**Responsibility**: Handle all favorite-related operations
**Methods**:
- `toggleFavorite(productSlug)` - Toggle product favorite status
- `getFavorites()` - Get user's favorites
- `isProductFavorited(productId)` - Check if product is favorited
- `addToFavorites(productSlug)` - Add product to favorites
- `removeFromFavorites(productSlug)` - Remove product from favorites

### 4. CartService
**File**: `services/CartService.ts`
**Responsibility**: Handle all cart-related operations
**Methods**:
- `getCart()` - Get user's cart
- `addItem(productId, quantity)` - Add item to cart
- `updateItem(itemId, quantity)` - Update cart item quantity
- `removeItem(itemId)` - Remove item from cart
- `clearCart()` - Clear entire cart
- `getCartItemCount()` - Get total item count
- `getCartTotal()` - Get cart total amount

### 5. OrderService
**File**: `services/OrderService.ts`
**Responsibility**: Handle all order-related operations
**Methods**:
- `getOrders()` - Get user's orders
- `getOrder(orderId)` - Get order by ID
- `createOrderFromCart(orderData)` - Create order from cart
- `updateOrderStatus(orderId, status)` - Update order status
- `cancelOrder(orderId)` - Cancel order
- `getOrderTracking(orderId)` - Get order tracking info
- `getOrdersByStatus(status)` - Get orders by status

## Usage Examples

### Import Services
```typescript
// Import individual services
import { productService, categoryService, favoriteService } from '../services';

// Import types
import { Product, Category, ProductListItem } from '../types/marketplace';
```

### Use Services
```typescript
// Get products
const response = await productService.getProducts();
const products = response.results || response; // Handle pagination

// Get categories
const categories = await categoryService.getCategories();

// Toggle favorite
const result = await favoriteService.toggleFavorite(productSlug);

// Add to cart
const cartItem = await cartService.addItem(productId, quantity);
```

## Error Handling

All services include comprehensive error handling:

- **Authentication Errors (401)**: Clear error messages with login guidance
- **Permission Errors (403)**: Ownership validation messages
- **Not Found Errors (404)**: Resource not found messages
- **Validation Errors (400)**: Input validation messages
- **Server Errors (500)**: Generic server error handling

## Debugging

All services include detailed console logging:
- Request start/end logging
- Parameter logging
- Response data analysis
- Error details with context

To enable debugging, check browser console for logs prefixed with service names.

## Migration from Old Service

**Before (old marketplaceService.ts)**:
```typescript
import { productService, categoryService } from '../services/marketplaceService';
import { type Product } from '../services/marketplaceService';
```

**After (new architecture)**:
```typescript
import { productService, categoryService } from '../services';
import { type Product } from '../types/marketplace';
```

## Configuration

All API endpoints are centralized in `config/api.ts`:
- Easy to maintain and update
- Single source of truth for URLs
- Function-based endpoints for parameterized URLs

## Benefits

1. **Single Responsibility**: Each service handles one domain
2. **Type Safety**: Centralized type definitions
3. **Maintainability**: Easy to find and update service methods
4. **Testing**: Each service can be tested independently
5. **Debugging**: Comprehensive logging per service
6. **Error Handling**: Consistent error handling across services
7. **Scalability**: Easy to add new services or extend existing ones

## Legacy Support

The `services/index.ts` file provides:
- Individual service exports
- Legacy `marketplaceService` object for backward compatibility
- All type exports from `types/marketplace.ts`

This ensures existing code continues to work while new code can use the improved architecture.