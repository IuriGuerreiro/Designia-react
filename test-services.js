// Quick test to validate service imports and structure
// This file can be deleted after testing

console.log('Testing marketplace services...');

try {
  // Test if we can import services without errors
  const { productService, categoryService, favoriteService, cartService, orderService } = require('./src/services/index.ts');
  
  console.log('✓ All services imported successfully');
  console.log('✓ ProductService instance:', typeof productService.getProducts);
  console.log('✓ CategoryService instance:', typeof categoryService.getCategories);
  console.log('✓ FavoriteService instance:', typeof favoriteService.toggleFavorite);
  console.log('✓ CartService instance:', typeof cartService.getCart);
  console.log('✓ OrderService instance:', typeof orderService.getOrders);
  
} catch (error) {
  console.error('✗ Error importing services:', error.message);
}

// Test types import
try {
  const types = require('./src/types/marketplace.ts');
  console.log('✓ Types imported successfully');
} catch (error) {
  console.error('✗ Error importing types:', error.message);
}

console.log('Service test completed!');