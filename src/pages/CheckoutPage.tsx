
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useOrder } from "@/contexts/OrderContext";
import {
  Package,
  QrCode,
  CreditCard,
  ArrowRight,
  ChevronLeft,
  Truck,
  ShoppingBag,
  CheckCircle,
  MapPin,
  User,
  Mail,
  Phone,
  HelpCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import QRCodePayment from "@/components/payments/QRCodePayment";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-breakpoint";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { completeOrder } = useOrder();
  const [loading, setLoading] = useState(false);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [progressValue, setProgressValue] = useState(50);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const tax = subtotal * 0.1;
  // Removed shipping fee
  const total = subtotal + tax;

  // Update progress bar when changing steps
  useEffect(() => {
    setProgressValue(showQRPayment ? 100 : 50);
  }, [showQRPayment]);

  const handleCheckout = async () => {
    setLoading(true);

    // Generate a more meaningful order ID with date prefix
    const date = new Date();
    const datePrefix = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newOrderId = `ORD-${datePrefix}-${randomSuffix}`;
    setOrderId(newOrderId);

    // Show QR code payment
    setShowQRPayment(true);
    setLoading(false);
  };

  const handlePaymentComplete = async () => {
    try {
      // Create the order in the database
      await completeOrder("qr-code");

      // Clear the cart and navigate to products page to continue shopping
      clearCart();
      toast.success(t("order.payment_success"));
      navigate("/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete order");
    }
  };

  if (items.length === 0) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-semibold text-xl">{t("ui.empty_cart")}</h2>
          <p className="text-muted-foreground">{t("ui.add_products")}</p>
        </div>
        <Button onClick={() => navigate("/products")}>{t("ui.browse_products")}</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 pb-6 sm:pb-10">
      {/* Checkout Header with Progress */}
      <div className="space-y-2 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("cart.checkout")}</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">{t("checkout.complete")}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/cart")}
            className="hidden sm:flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("checkout.return")}
          </Button>
        </div>

        {/* Mobile back button */}
        <div className="sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/cart")}
            className="flex items-center gap-1 h-7 text-xs px-2"
          >
            <ChevronLeft className="h-3 w-3" />
            {t("checkout.return")}
          </Button>
        </div>

        {/* Checkout Progress */}
        <div className="space-y-1 sm:space-y-2 mt-1 sm:mt-0">
          <div className="flex justify-between text-[10px] sm:text-xs md:text-sm">
            <span className="font-medium">{showQRPayment ? t("checkout.payment") : t("checkout.shipping")}</span>
            <span className="text-muted-foreground">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-1 sm:h-1.5 md:h-2" />
          <div className="flex justify-between text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
            <span>{t("checkout.shipping")}</span>
            <span>{t("checkout.payment")}</span>
          </div>
        </div>
      </div>

      <TooltipProvider>
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-12">
          {/* Left Column - Shipping Information (6 columns on large screens) */}
          <div className={`space-y-4 sm:space-y-6 lg:col-span-6 ${showQRPayment && isMobile ? "hidden" : ""} ${showQRPayment ? "hidden lg:block" : ""}`}>
            {/* Shipping Information */}
            <Card className={showQRPayment ? "opacity-60" : ""}>
              <CardHeader className="pb-2 px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">{t("checkout.shipping")}</CardTitle>
                      <CardDescription className="text-[10px] sm:text-xs">{t("checkout.free_shipping")}</CardDescription>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                        <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-xs">{t("checkout.help.shipping_info")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                {/* Mobile-optimized accordion for shipping details */}
                <div className="block sm:hidden">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                      <span className="text-sm font-medium">{t("checkout.enter_shipping_details")}</span>
                      <div className="h-5 w-5 rounded-full border flex items-center justify-center group-open:rotate-180 transition-transform">
                        <ChevronLeft className="h-3 w-3 rotate-90" />
                      </div>
                    </summary>
                    <div className="pt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="first-name-mobile" className="flex items-center gap-1 text-xs">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {t("common.first_name")}
                          </Label>
                          <Input
                            id="first-name-mobile"
                            placeholder="John"
                            disabled={showQRPayment}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="last-name-mobile" className="text-xs">{t("common.last_name")}</Label>
                          <Input
                            id="last-name-mobile"
                            placeholder="Doe"
                            disabled={showQRPayment}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email-mobile" className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {t("common.email")}
                        </Label>
                        <Input
                          id="email-mobile"
                          type="email"
                          placeholder="john.doe@example.com"
                          disabled={showQRPayment}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="phone-mobile" className="flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {t("common.phone")}
                        </Label>
                        <Input
                          id="phone-mobile"
                          placeholder="(123) 456-7890"
                          disabled={showQRPayment}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="address-mobile" className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {t("common.address")}
                        </Label>
                        <Input
                          id="address-mobile"
                          placeholder="123 Main St"
                          disabled={showQRPayment}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="city-mobile" className="text-xs">{t("common.city")}</Label>
                          <Input
                            id="city-mobile"
                            placeholder="New York"
                            disabled={showQRPayment}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="postal-code-mobile" className="text-xs">{t("common.postal_code")}</Label>
                          <Input
                            id="postal-code-mobile"
                            placeholder="10001"
                            disabled={showQRPayment}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="country-mobile" className="text-xs">{t("common.country")}</Label>
                        <Input
                          id="country-mobile"
                          placeholder="United States"
                          disabled={showQRPayment}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </details>
                </div>

                {/* Desktop shipping form */}
                <div className="hidden sm:block">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="first-name" className="flex items-center gap-1 text-xs sm:text-sm">
                        <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                        {t("common.first_name")}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground ml-1" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">{t("checkout.help.shipping_address")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="first-name"
                        placeholder="John"
                        disabled={showQRPayment}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="last-name" className="text-xs sm:text-sm">{t("common.last_name")}</Label>
                      <Input
                        id="last-name"
                        placeholder="Doe"
                        disabled={showQRPayment}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1 text-xs sm:text-sm">
                      <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      {t("common.email")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground ml-1" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">{t("checkout.help.email_receipt")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      disabled={showQRPayment}
                      className="h-8 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1 text-xs sm:text-sm">
                      <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      {t("common.phone")}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground ml-1" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">{t("checkout.help.phone_contact")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(123) 456-7890"
                      disabled={showQRPayment}
                      className="h-8 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-1 text-xs sm:text-sm">
                      <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                      {t("common.address")}
                    </Label>
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      disabled={showQRPayment}
                      className="h-8 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="city" className="text-xs sm:text-sm">{t("common.city")}</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        disabled={showQRPayment}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="postal-code" className="text-xs sm:text-sm">{t("common.postal_code")}</Label>
                      <Input
                        id="postal-code"
                        placeholder="10001"
                        disabled={showQRPayment}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="country" className="text-xs sm:text-sm">{t("common.country")}</Label>
                    <Input
                      id="country"
                      placeholder="United States"
                      disabled={showQRPayment}
                      className="h-8 sm:h-10 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{t("checkout.standard_delivery")}</span>
                </div>
                <Badge variant="outline" className="text-[10px] sm:text-xs h-5 sm:h-6">
                  {t("checkout.delivery_time")}
                </Badge>
              </CardFooter>
            </Card>
          </div>

        {/* Right Column - Payment Methods (6 columns on large screens) */}
        <div className={`lg:col-span-6 ${showQRPayment ? "col-span-full" : ""} ${isMobile && !showQRPayment ? "mt-2" : ""}`}>
          <AnimatePresence mode="wait">
            {showQRPayment ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="sticky top-20 w-full">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-xl">{t("checkout.payment")}</CardTitle>
                        <CardDescription className="text-[10px] sm:text-xs">{t("checkout.secure_payment")}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                            <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-xs">{t("checkout.help.payment_methods")}</p>
                        </TooltipContent>
                      </Tooltip>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQRPayment(false)}
                        className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                        {t("ui.back")}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <QRCodePayment
                      orderId={orderId}
                      amount={total}
                      onComplete={handlePaymentComplete}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="sticky top-20 w-full">
                  <CardHeader className="pb-3 px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-xl">{t("ui.order_summary")}</CardTitle>
                          <CardDescription className="text-[10px] sm:text-xs">{t("checkout.free_shipping")}</CardDescription>
                        </div>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                            <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-xs">{t("checkout.help.order_summary")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 pt-0 px-4 sm:px-6">
                    {/* Products List */}
                    <div>
                      {/* Mobile-optimized product list with collapsible details */}
                      <div className="block sm:hidden mb-3">
                        <details className="group">
                          <summary className="flex items-center justify-between cursor-pointer list-none py-2 border-b">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{t("cart.items", { count: items.length })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">${subtotal.toFixed(2)}</span>
                              <div className="h-5 w-5 rounded-full border flex items-center justify-center group-open:rotate-180 transition-transform">
                                <ChevronLeft className="h-3 w-3 rotate-90" />
                              </div>
                            </div>
                          </summary>
                          <div className="pt-2 space-y-2">
                            {items.map((item) => (
                              <div key={item.id} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                                <div className="flex items-center gap-2">
                                  <div className="h-10 w-10 bg-muted rounded-md shrink-0 overflow-hidden">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-xs line-clamp-1">{item.name}</p>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className="text-[10px] h-4">
                                        ${item.price.toFixed(2)}
                                      </Badge>
                                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                                    </div>
                                  </div>
                                </div>
                                <p className="font-medium text-xs">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>

                      {/* Desktop product list */}
                      <div className="hidden sm:block max-h-48 sm:max-h-60 overflow-y-auto pr-2 space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between py-2 border-b border-border last:border-0">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-muted rounded-md shrink-0 overflow-hidden">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-xs sm:text-base line-clamp-1">{item.name}</p>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Badge variant="outline" className="text-[10px] sm:text-xs h-4 sm:h-5">
                                    ${item.price.toFixed(2)}
                                  </Badge>
                                  <p className="text-xs sm:text-sm text-muted-foreground">x{item.quantity}</p>
                                </div>
                              </div>
                            </div>
                            <p className="font-medium text-xs sm:text-base">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Price Calculation */}
                      <div className="space-y-2 sm:space-y-3 bg-muted/30 p-2.5 sm:p-3 md:p-5 rounded-lg">
                        <div className="flex justify-between text-[10px] sm:text-xs md:text-sm">
                          <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] sm:text-xs md:text-sm">
                          <span className="text-muted-foreground">{t("cart.tax")}</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm">
                          <span className="text-muted-foreground">{t("cart.shipping")}</span>
                          <Badge variant="outline" className="text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-2 py-0 sm:py-0.5 h-3.5 sm:h-4 md:h-5 bg-green-50 text-green-600 border-green-200">
                            {t("checkout.free_shipping")}
                          </Badge>
                        </div>
                        <Separator className="my-1.5 sm:my-2 md:my-3" />
                        <div className="flex justify-between font-bold text-sm sm:text-base md:text-lg">
                          <span>{t("cart.total")}</span>
                          <span>${total.toFixed(2)}</span>
                        </div>

                        <Button
                          className="w-full flex items-center gap-1 sm:gap-2 h-9 sm:h-10 md:h-12 text-xs sm:text-sm md:text-base mt-2 sm:mt-3 md:mt-4"
                          onClick={handleCheckout}
                          disabled={loading}
                        >
                          {loading ? (
                            t("ui.processing")
                          ) : (
                            <>
                              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                              {t("checkout.payment_methods")}
                              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 ml-1" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Need Help Section */}
                    <div className="pt-1 sm:pt-2 flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground justify-center">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                        <span>{t("checkout.secure_checkout")}</span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="link" size="sm" className="h-5 sm:h-6 text-[10px] sm:text-xs text-muted-foreground p-0">
                            {t("checkout.help.need_help")}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p className="text-xs">{t("checkout.help.contact_support")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </TooltipProvider>
    </div>
  );
};

export default CheckoutPage;
