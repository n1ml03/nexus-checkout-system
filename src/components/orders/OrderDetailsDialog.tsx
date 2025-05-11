import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ShoppingBag,
  Calendar,
  Clock,
  DollarSign,
  Barcode,
  Package,
  Info,
  ChevronDown,
  Maximize2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
  barcode?: string;
  description?: string;
  image_url?: string;
  sku?: string;
  category?: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  items?: OrderItem[];
}

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Handle scroll animation
  useEffect(() => {
    if (!open) return;

    // Show scroll indicator for 3 seconds when dialog opens
    setShowScrollIndicator(true);
    const timer = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [open]);

  // Handle product click
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  };

  // Close product detail view
  const closeProductDetail = () => {
    setShowProductDetail(false);
  };

  if (!order) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Generate a readable order name from the order ID and date
  const getOrderName = (order: Order) => {
    // Check if the order ID follows the new format (ORD-YYYYMMDD-XXXX)
    if (order.id.startsWith("ORD-") && order.id.length > 13) {
      try {
        // Extract date and unique part
        const parts = order.id.split("-");
        if (parts.length === 3) {
          const dateStr = parts[1];
          const uniqueId = parts[2];

          // Parse date if it's in the expected format
          if (dateStr.length === 8) {
            const year = dateStr.substring(0, 4);
            const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-indexed
            const day = dateStr.substring(6, 8);

            const monthName = new Date(
              parseInt(year),
              month
            ).toLocaleString("default", { month: "short" });
            return `Order #${uniqueId} - ${monthName} ${day}`;
          }
        }
      } catch (e) {
        // If any parsing error occurs, fall back to the default format
      }
    }

    // Fallback for old format or parsing errors
    // Extract the unique part from the order ID (after the "ORD-" prefix)
    const uniqueId = order.id.startsWith("ORD-")
      ? order.id.substring(4, 8)
      : order.id.substring(0, 4);

    // Get date components
    const date = new Date(order.created_at);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();

    // Create a readable order name
    return `Order #${uniqueId.toUpperCase()} - ${month} ${day}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-4 sm:p-6 w-[95vw] sm:w-auto overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShoppingBag className="h-5 w-5" />
              {getOrderName(order)}
            </DialogTitle>
            <DialogDescription>
              Order details and product information
            </DialogDescription>
          </DialogHeader>

          {/* Order Summary - Responsive grid that stacks on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Order ID</p>
              <p className="text-sm text-muted-foreground font-mono break-all">{order.id}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Status</p>
              <Badge
                variant={order.status === "completed" ? "default" : "outline"}
                className={`capitalize text-sm py-1 px-2 ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : ""
                }`}
              >
                {order.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Time</p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formatTime(order.created_at)}
              </p>
            </div>
            <div className="space-y-2 col-span-1 sm:col-span-2 pt-2">
              <p className="text-sm font-medium">Total Amount</p>
              <p className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {order.total.toFixed(2)}
              </p>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="flex items-center justify-between py-2">
            <div className="text-lg font-semibold">Products</div>
            {showScrollIndicator && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md animate-pulse">
                <ChevronDown className="h-3 w-3" />
                <span>Scroll to see more</span>
              </div>
            )}
          </div>

          {order.items && order.items.length > 0 ? (
            <div className="relative">
              <ScrollArea
                className="h-[350px] rounded-md border"
                ref={scrollAreaRef}
              >
                <div className="divide-y w-full">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`p-4 hover:bg-muted/50 active:bg-muted transition-colors overflow-hidden cursor-pointer`}
                      onClick={() => item.product && handleProductClick(item.product)}
                    >
                      <div className="flex items-start gap-3 w-full overflow-hidden">
                        <div className="h-16 w-16 rounded-md bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden relative group">
                          {item.product?.image_url ? (
                            <>
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="h-5 w-5 text-white" />
                              </div>
                            </>
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="font-medium text-base mb-1 truncate">{item.product?.name || "Unknown Product"}</div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                            <div className="text-sm">
                              <span className="font-medium">Qty:</span> {item.quantity}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Price:</span> ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>

                          {item.product?.barcode && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                              <Barcode className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{item.product.barcode}</span>
                            </div>
                          )}

                          {item.product?.category && (
                            <div className="text-xs text-muted-foreground mt-1 truncate">
                              <span className="font-medium">Category:</span> {item.product.category}
                            </div>
                          )}

                          {item.product?.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              <span className="font-medium">Description:</span> {item.product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] py-8 text-center border rounded-md">
              <Info className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {!order.items ? "Loading product details..." : "No product details available"}
              </p>
            </div>
          )}

          <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-12 text-base order-2 sm:order-1"
            >
              Close
            </Button>
            <Button
              variant="default"
              onClick={() => window.print()}
              className="w-full sm:w-auto h-12 text-base order-1 sm:order-2"
            >
              Print Order Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <AnimatePresence>
        {showProductDetail && selectedProduct && (
          <Dialog open={showProductDetail} onOpenChange={closeProductDetail}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Product Image */}
                <div className="relative w-full h-[250px] bg-muted">
                  {selectedProduct.image_url ? (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                    onClick={closeProductDetail}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                      <p className="text-lg font-semibold">${selectedProduct.price.toFixed(2)}</p>
                    </div>

                    {selectedProduct.category && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                        <p className="text-lg">{selectedProduct.category}</p>
                      </div>
                    )}

                    {selectedProduct.barcode && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Barcode</h3>
                        <p className="text-lg font-mono">{selectedProduct.barcode}</p>
                      </div>
                    )}

                    {selectedProduct.sku && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                        <p className="text-lg font-mono">{selectedProduct.sku}</p>
                      </div>
                    )}
                  </div>

                  {selectedProduct.description && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                      <p className="text-sm">{selectedProduct.description}</p>
                    </div>
                  )}

                  <div className="mt-6">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={closeProductDetail}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default OrderDetailsDialog;
