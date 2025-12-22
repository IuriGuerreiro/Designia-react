import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { MoreHorizontal, Plus, Search, Loader2, Edit, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { getSellerProducts, deleteProduct } from '../../api/productsApi'
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog' // Assuming we have this or I'll create a simple one
import type { Product } from '../../types'

export function SellerProductList() {
  const page = 1 // TODO: Implement pagination
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seller-products', page],
    queryFn: () => getSellerProducts(page),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Product deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['seller-products'] })
      setDeleteId(null)
    },
    onError: () => {
      toast.error('Failed to delete product')
    },
  })

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId)
    }
  }

  const getStatusBadge = (product: Product) => {
    if (product.stock_quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    // Assuming we might have 'is_active' later, for now just Active
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
        Active
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return <div className="text-center text-red-500 py-10">Failed to load products.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog, inventory, and pricing.
          </p>
        </div>
        <Button asChild>
          <Link to="/seller/products/new">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4 gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.results.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                    {product.primary_image || (product.images && product.images.length > 0) ? (
                      <img
                        src={
                          product.primary_image ||
                          product.images?.find(i => i.is_primary)?.image ||
                          product.images?.[0]?.image
                        }
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                        No Img
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{product.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {product.slug}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    parseFloat(product.price)
                  )}
                </TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>{getStatusBadge(product)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to={`/seller/products/${product.slug}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/products/${product.slug}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" /> View Live
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(product.slug)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {data?.results.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
