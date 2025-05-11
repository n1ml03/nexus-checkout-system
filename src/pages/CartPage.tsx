
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import {
  QrCode,
  ShoppingCart as CartIcon,
  Tag,
  ArrowRight,
  Check,
  Loader2,
  ShoppingBag
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import CartItemCard from "@/components/cart/CartItemCard";
import CartSkeleton from "@/components/cart/CartSkeleton";
import SavedItems from "@/components/cart/SavedItems";
import RecentlyViewed from "@/components/cart/RecentlyViewed";
import ProductRecommendations from "@/components/cart/ProductRecommendations";
import { Product } from "@/types";
import { useIsMobile } from "@/hooks/use-breakpoint";

const CartPage = () => {
  const {
    items,
    savedItems,
    recentlyViewed,
    recommendations,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    applyDiscount,
    clearDiscount,
    saveForLater,
    moveToCart,
    removeSavedItem,
    addNote,
    isLoading,
    addItem
  } = useCart();
  const { t } = useTranslation();
  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const isMobile = useIsMobile();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) return;

    setIsApplyingDiscount(true);
    setTimeout(() => {
      applyDiscount(discountCode);
      setIsApplyingDiscount(false);
    }, 800);
  };

  const tax = subtotal * 0.1;
  const shipping = subtotal > 0 ? 5 : 0;
  const total = subtotal + tax + shipping - discount;

  if (isInitialLoading) {
    return <CartSkeleton itemCount={3} />;
  }

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">{t("ui.shopping_cart")}</h1>
          <p className="text-xs sm:text-base text-muted-foreground">
            {items.length === 0
              ? t("ui.empty_cart")
              : t("ui.items_in_cart", { count: items.length })}
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive hover:bg-destructive/10 text-[10px] sm:text-sm h-7 sm:h-10 mt-1 sm:mt-0"
            onClick={clearCart}
          >
            {t("ui.clear_cart")}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 gap-3 sm:gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-muted flex items-center justify-center"
              >
                <CartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              </motion.div>
              <div className="text-center space-y-1">
                <h2 className="font-semibold text-lg sm:text-xl">{t("ui.empty_cart")}</h2>
                <p className="text-sm sm:text-base text-muted-foreground">{t("ui.add_products")}</p>
              </div>
              <Button size="sm" className="h-9 sm:h-10 text-xs sm:text-sm" asChild>
                <Link to="/products">
                  {t("ui.browse_products")}
                  <ArrowRight className="ml-1 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Show recommendations even when cart is empty */}
          <div className="space-y-6">
            <ProductRecommendations
              products={recommendations}
              onAddToCart={(product: Product) => {
                const cartItem = {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  image: product.image_url,
                  category: product.category
                };
                addItem(cartItem);
              }}
            />

            {recentlyViewed.length > 0 && (
              <RecentlyViewed
                products={recentlyViewed}
                onAddToCart={(product: Product) => {
                  const cartItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image: product.image_url,
                    category: product.category
                  };
                  addItem(cartItem);
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Order Summary Toggle */}
          {isMobile && (
            <div className="mb-3">
              <Button
                variant="outline"
                className="w-full flex justify-between items-center py-1.5 h-auto"
                onClick={() => setShowOrderSummary(!showOrderSummary)}
              >
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span className="font-medium text-xs">{t("ui.order_summary")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs">{formatCurrency(total)}</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transform transition-transform ${showOrderSummary ? 'rotate-180' : ''}`}
                  >
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Button>
            </div>
          )}

          <div className="grid gap-3 sm:gap-6 lg:grid-cols-12">
            {/* Mobile Order Summary (Collapsible) */}
            {isMobile && (
              <AnimatePresence>
                {showOrderSummary && (
                  <motion.div
                    className="col-span-12 mb-2"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="space-y-2 p-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                          <span>{formatCurrency(subtotal)}</span>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between text-green-600 text-xs">
                            <span className="flex items-center gap-0.5">
                              <Tag className="h-2.5 w-2.5" />
                              {t("cart.discount")}
                            </span>
                            <span>-{formatCurrency(discount)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{t("cart.tax")}</span>
                          <span>{formatCurrency(tax)}</span>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{t("cart.shipping")}</span>
                          <span>{formatCurrency(shipping)}</span>
                        </div>

                        <div className="border-t pt-2 flex justify-between font-bold text-xs">
                          <span>{t("cart.total")}</span>
                          <span>{formatCurrency(total)}</span>
                        </div>

                        {/* Discount Code Input */}
                        <div className="w-full flex gap-1 pt-1.5">
                          <Input
                            placeholder={t("cart.discount_code")}
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            className="flex-grow h-7 text-[10px]"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] whitespace-nowrap px-2"
                            onClick={handleApplyDiscount}
                            disabled={isApplyingDiscount || !discountCode.trim()}
                          >
                            {isApplyingDiscount ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : discount > 0 ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              t("cart.apply")
                            )}
                          </Button>
                        </div>

                        {/* Checkout Button */}
                        <Button className="w-full flex gap-1 h-8 text-[10px] mt-1.5" asChild>
                          <Link to="/checkout">
                            <QrCode className="h-3 w-3" />
                            {t("checkout.pay_with_qr")}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            <div className="lg:col-span-8 space-y-3 sm:space-y-6">
              {/* Cart Items */}
              <div className="space-y-2 sm:space-y-4">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                    onSaveForLater={saveForLater}
                    onAddNote={addNote}
                  />
                ))}
              </div>

              {/* Saved Items */}
              {savedItems.length > 0 && (
                <SavedItems
                  items={savedItems}
                  onMoveToCart={moveToCart}
                  onRemove={removeSavedItem}
                />
              )}

              {/* Mobile Checkout Button (Fixed at Bottom) */}
              {isMobile && (
                <div className="fixed bottom-16 left-0 right-0 p-2 bg-background border-t z-10 shadow-lg">
                  <Button className="w-full flex gap-1 h-10 text-xs" asChild>
                    <Link to="/checkout">
                      <QrCode className="h-3.5 w-3.5 mr-1" />
                      {t("checkout.proceed_to_checkout")} ({formatCurrency(total)})
                    </Link>
                  </Button>
                </div>
              )}

              {/* Product Recommendations */}
              <ProductRecommendations
                products={recommendations}
                onAddToCart={(product: Product) => {
                  const cartItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    image: product.image_url,
                    category: product.category
                  };
                  addItem(cartItem);
                }}
              />

              {/* Recently Viewed Products */}
              {recentlyViewed.length > 0 && (
                <RecentlyViewed
                  products={recentlyViewed}
                  onAddToCart={(product: Product) => {
                    // Convert Product to CartItem
                    const cartItem = {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      image: product.image_url,
                      category: product.category
                    };
                    // Use the addItem function from the existing cart context
                    addItem(cartItem);
                  }}
                />
              )}

              {/* Add padding at the bottom to account for fixed checkout button on mobile */}
              {isMobile && <div className="h-16"></div>}
            </div>

            {/* Desktop Order Summary */}
            {!isMobile && (
              <div className="lg:col-span-4">
                <div className="sticky top-20 space-y-4">
                  {/* Order Summary */}
                  <Card>
                    <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                      <CardTitle className="text-base sm:text-lg">{t("ui.order_summary")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-green-600 text-sm sm:text-base">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {t("cart.discount")}
                          </span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">{t("cart.tax")}</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>

                      <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-muted-foreground">{t("cart.shipping")}</span>
                        <span>{formatCurrency(shipping)}</span>
                      </div>

                      <div className="border-t pt-3 sm:pt-4 flex justify-between font-bold text-sm sm:text-base">
                        <span>{t("cart.total")}</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 sm:gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
                      {/* Discount Code Input */}
                      <div className="w-full flex gap-1 sm:gap-2">
                        <Input
                          placeholder={t("cart.discount_code")}
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          className="flex-grow h-9 sm:h-10 text-xs sm:text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 sm:h-10 text-xs sm:text-sm"
                          onClick={handleApplyDiscount}
                          disabled={isApplyingDiscount || !discountCode.trim()}
                        >
                          {isApplyingDiscount ? (
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                          ) : discount > 0 ? (
                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            t("cart.apply")
                          )}
                        </Button>
                      </div>

                      {/* Checkout Button */}
                      <Button className="w-full flex gap-1 sm:gap-2 h-10 sm:h-11 text-xs sm:text-sm" asChild>
                        <Link to="/checkout">
                          <QrCode className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {t("checkout.pay_with_qr")}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>

                  {/* Continue Shopping Button */}
                  <Button
                    variant="outline"
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                    asChild
                  >
                    <Link to="/products">
                      {t("cart.continue_shopping")}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
