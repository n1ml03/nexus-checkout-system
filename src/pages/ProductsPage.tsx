import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { Search, Package, Plus } from "lucide-react";
import BarcodeScanner from "@/components/products/BarcodeScanner";
import AddProductForm from "@/components/products/AddProductForm";
import EditProductForm from "@/components/products/EditProductForm";
import DeleteConfirmationDialog from "@/components/common/DeleteConfirmationDialog";
import ProductCard from "@/components/products/ProductCard";
import LoadingState from "@/components/ui/loading-state";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { useTranslation } from "react-i18next";
import {
  useProducts,
  useProductByBarcode,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct
} from "@/queries/useProducts";

const ProductsPage = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [barcodeToAdd, setBarcodeToAdd] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Hooks
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const { isMobile } = useBreakpoint();
  const { t } = useTranslation();

  // Fetch products from the database
  const { data: products = [], isLoading } = useProducts();

  // Filter products based on search term
  const filteredProducts = useMemo(() =>
    products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm) ||
      product.sku?.includes(searchTerm)
    ),
    [products, searchTerm]
  );

  // Event handlers
  const handleAddToCart = useCallback((product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url,
    });
    toast.success(t("cart.added_to_cart", { product: product.name }));
  }, [addItem]);

  // Setup mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const handleProductFound = useCallback(async (barcode: string) => {
    try {
      // Use the barcode query hook with enabled: true to force the query
      const { data: existingProduct } = await useProductByBarcode(barcode, { enabled: true }).refetch();

      if (existingProduct) {
        // Product exists, add to cart
        handleAddToCart(existingProduct);
      }
    } catch (error) {
      // Product doesn't exist, show add product form
      setBarcodeToAdd(barcode);
      setShowAddProduct(true);
    }
  }, [handleAddToCart]);

  const handleSaveNewProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await createProductMutation.mutateAsync(product);

      addItem({
        id: newProduct.id,
        name: newProduct.name,
        price: newProduct.price,
        quantity: 1,
        image: newProduct.image_url,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [addItem, createProductMutation]);

  const handleEditProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowEditProduct(true);
  }, []);

  const handleDeleteProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setShowDeleteConfirmation(true);
  }, []);

  const handleUpdateProduct = useCallback(async (id: string, updatedProduct: Omit<Product, 'id'>) => {
    try {
      await updateProductMutation.mutateAsync({ id, data: updatedProduct });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [updateProductMutation]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedProduct) return;

    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      setShowDeleteConfirmation(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }, [selectedProduct, deleteProductMutation]);

  return (
    <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("nav.products")}</h1>

        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`${t("common.search")} ${t("nav.products")}...`}
              className="pl-8 w-full h-9 sm:h-10 text-sm sm:text-base sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            className="flex items-center gap-1 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3"
            onClick={() => setShowAddProduct(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("product.add")}</span>
            <span className="sm:hidden">{t("common.add")}</span>
          </Button>

          <BarcodeScanner onDetected={handleProductFound} />
        </div>
      </div>

      {isLoading ? (
        <LoadingState message={t("product.loading_products")} fullPage />
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-2 font-semibold">{t("product.no_products")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("ui.try_adjusting")}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowAddProduct(true)}
          >
            {t("ui.add_new")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      {/* Add Product Form Dialog */}
      <AddProductForm
        barcode={barcodeToAdd}
        isOpen={showAddProduct}
        onClose={() => {
          setShowAddProduct(false);
          setBarcodeToAdd("");
        }}
        onSave={handleSaveNewProduct}
      />

      {/* Edit Product Form Dialog */}
      <EditProductForm
        product={selectedProduct}
        isOpen={showEditProduct}
        onClose={() => setShowEditProduct(false)}
        onSave={handleUpdateProduct}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title={t("product.delete")}
        description={t("common.confirm") + `: ${t("common.delete")} "${selectedProduct?.name}"? ${t("common.warning")}: ${t("common.info")}.`}
      />
    </div>
  );
};

export default ProductsPage;
