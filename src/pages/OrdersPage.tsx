
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Loader2,
  QrCode,
  ShoppingBag,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/queries/useOrders";
import OrderDetailsDialog from "@/components/orders/OrderDetailsDialog";
import { useTranslation } from "react-i18next";

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

const OrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Use the orders query hook
  const { data: orders = [], isLoading } = useOrders();

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Generate a readable order name from the order ID and date
  const getOrderName = (order: Order) => {
    // Check if the order ID follows the new format (ORD-YYYYMMDD-XXXX)
    if (order.id.startsWith('ORD-') && order.id.length > 13) {
      try {
        // Extract date and unique part
        const parts = order.id.split('-');
        if (parts.length === 3) {
          const dateStr = parts[1];
          const uniqueId = parts[2];

          // Parse date if it's in the expected format
          if (dateStr.length === 8) {
            const year = dateStr.substring(0, 4);
            const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-indexed
            const day = dateStr.substring(6, 8);

            const monthName = new Date(parseInt(year), month).toLocaleString('default', { month: 'short' });
            return `Order #${uniqueId} - ${monthName} ${day}`;
          }
        }
      } catch (e) {
        // If any parsing error occurs, fall back to the default format
      }
    }

    // Fallback for old format or parsing errors
    // Extract the unique part from the order ID (after the "ORD-" prefix)
    const uniqueId = order.id.startsWith('ORD-') ? order.id.substring(4, 8) : order.id.substring(0, 4);

    // Get date components
    const date = new Date(order.created_at);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();

    // Create a readable order name
    return `Order #${uniqueId.toUpperCase()} - ${month} ${day}`;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("nav.orders")}</h1>
        <p className="text-muted-foreground">
          {t("order.details")}
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>{t("order.recent")}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t("order.details")}
            </p>
          </div>
          <Button asChild variant="default" size="lg" className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm">
            <Link to="/scan-to-pay" className="flex items-center justify-center gap-2">
              <QrCode className="h-5 w-5 sm:h-4 sm:w-4" />
              {t("checkout.pay_with_qr")}
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <h2 className="font-semibold text-xl">{t("ui.no_orders")}</h2>
                <p className="text-muted-foreground">{t("ui.create_orders")}</p>
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                <Button variant="outline" asChild className="h-12 text-base">
                  <Link to="/products">{t("ui.browse_products")}</Link>
                </Button>
                <Button asChild className="h-12 text-base">
                  <Link to="/scan-to-pay" className="flex items-center justify-center gap-2">
                    <QrCode className="h-5 w-5" />
                    {t("checkout.pay_with_qr")}
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {/* Desktop view - Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("order.details")}</TableHead>
                      <TableHead>{t("order.date")}</TableHead>
                      <TableHead>{t("order.status")}</TableHead>
                      <TableHead className="text-right">{t("order.total")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleOrderClick(order)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-primary" />
                            <span>{getOrderName(order)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            ID: {order.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(order.created_at)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={order.status === 'completed' ? 'default' : 'outline'}
                            className={`capitalize ${order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <div className="flex items-center justify-end gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            {order.total.toFixed(2)}
                            <ChevronRight className="h-4 w-4 ml-1 text-muted-foreground" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view - Card list */}
              <div className="md:hidden space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 active:bg-muted transition-colors relative"
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      <span>Tap to view</span>
                    </div>

                    <div className="flex items-start justify-between mb-3 mt-6 sm:mt-0">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        <span className="font-medium">{getOrderName(order)}</span>
                      </div>
                      <Badge
                        variant={order.status === 'completed' ? 'default' : 'outline'}
                        className={`capitalize ${order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}`}
                      >
                        {order.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(order.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-lg font-semibold">
                        <DollarSign className="h-4 w-4" />
                        {order.total.toFixed(2)}
                        <ChevronRight className="h-5 w-5 ml-1 text-primary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default OrdersPage;
