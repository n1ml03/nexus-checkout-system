import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import {
  ShoppingCart,
  Package,
  Sparkles,
  Info,
  X,
  Star,
  Eye,
  ThumbsUp,
  TrendingUp
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-breakpoint";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductRecommendationsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  isLoading?: boolean;
}

interface RecommendationReason {
  icon: React.ReactNode;
  text: string;
}

const getRecommendationReasons = (product: Product, t: any): RecommendationReason[] => {
  // In a real app, this would come from the recommendation engine
  const reasons: RecommendationReason[] = [];

  // Add some mock reasons based on product properties
  if (product.category === 'Electronics') {
    reasons.push({
      icon: <ThumbsUp className="h-4 w-4 text-blue-500" />,
      text: t("cart.reason_cart_match", "Based on items in your cart")
    });
  }

  if (product.price < 50) {
    reasons.push({
      icon: <Star className="h-4 w-4 text-yellow-500" />,
      text: t("cart.reason_popular", "Popular with customers like you")
    });
  } else {
    reasons.push({
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      text: t("cart.reason_trending", "Trending in this category")
    });
  }

  return reasons;
};

const RecommendationsSkeleton = () => {
  const isMobile = useIsMobile();
  const itemWidth = isMobile ? "w-[140px]" : "w-[200px]";
  const itemHeight = isMobile ? "h-24" : "h-32";

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 sm:gap-4 min-w-max">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${itemWidth} flex flex-col gap-1.5 sm:gap-2`}>
            <Skeleton className={`${itemHeight} w-full rounded-md`} />
            <Skeleton className="h-3 sm:h-4 w-3/4" />
            <Skeleton className="h-3 sm:h-4 w-1/2" />
            <div className="flex gap-1.5 sm:gap-2 mt-1">
              <Skeleton className="h-7 sm:h-8 w-full" />
              <Skeleton className="h-7 sm:h-8 w-7 sm:w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  products,
  onAddToCart,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hiddenProducts, setHiddenProducts] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  if ((products.length === 0 || products.every(p => hiddenProducts.has(p.id))) && !isLoading) {
    return null;
  }

  const visibleProducts = products.filter(p => !hiddenProducts.has(p.id));

  const hideProduct = (id: string) => {
    setHiddenProducts(prev => new Set([...prev, id]));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          {t("cart.recommendations")}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {t("cart.recommendations_description") || "Products you might be interested in"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <RecommendationsSkeleton />
        ) : (
          <ScrollArea className="w-full" type="always">
            <div className="flex gap-3 sm:gap-4 pb-4 min-w-max">
              {visibleProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${isMobile ? 'w-[140px]' : 'w-[200px]'} flex flex-col relative group`}
                >
                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 sm:h-6 sm:w-6 bg-background/80 backdrop-blur-sm rounded-full"
                              onClick={() => hideProduct(product.id)}
                            >
                              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("cart.hide_recommendation")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div
                      className={`${isMobile ? 'h-24' : 'h-32'} bg-muted rounded-md shrink-0 overflow-hidden mb-1.5 sm:mb-2 cursor-pointer relative group`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      {product.image_url ? (
                        <>
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                        </div>
                      )}

                      {/* Category badge */}
                      {product.category && (
                        <Badge variant="secondary" className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 text-[9px] sm:text-xs px-1 sm:px-2 py-0 sm:py-0.5">
                          {product.category}
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-medium text-xs sm:text-sm line-clamp-1">{product.name}</h4>
                    <p className="text-muted-foreground text-[10px] sm:text-xs mb-1.5 sm:mb-2">{formatCurrency(product.price)}</p>

                    <div className="flex gap-1.5 sm:gap-2 mt-auto">
                      <Button
                        variant="default"
                        size="sm"
                        className="text-[10px] sm:text-xs flex-grow h-7 sm:h-8"
                        onClick={() => onAddToCart(product)}
                      >
                        <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                        {t("cart.add")}
                      </Button>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("cart.why_recommended")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Recommendation reasons - hide on mobile to save space */}
                    {!isMobile && (
                      <div className="mt-2">
                        {getRecommendationReasons(product, t).slice(0, 1).map((reason, index) => (
                          <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                            {reason.icon}
                            <span>{reason.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className={`${isMobile ? 'max-w-[90vw] p-4' : 'sm:max-w-[425px]'}`}>
          <DialogHeader className={isMobile ? 'pb-2 space-y-1' : ''}>
            <DialogTitle className={isMobile ? 'text-base' : ''}>{selectedProduct?.name}</DialogTitle>
            {selectedProduct?.description && (
              <DialogDescription className={isMobile ? 'text-xs' : ''}>
                {selectedProduct.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className={`grid gap-3 ${isMobile ? 'py-2' : 'gap-4 py-4'}`}>
            {selectedProduct?.image_url && (
              <div className={`${isMobile ? 'h-36' : 'h-48'} bg-muted rounded-md overflow-hidden`}>
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Price</p>
                <p className={`${isMobile ? 'text-base' : 'text-lg'} font-bold`}>{formatCurrency(selectedProduct?.price || 0)}</p>
              </div>

              {selectedProduct?.category && (
                <Badge variant="outline" className={isMobile ? 'text-xs px-2 py-0' : ''}>
                  {selectedProduct.category}
                </Badge>
              )}
            </div>

            <div>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium mb-1 sm:mb-2`}>{t("cart.why_recommended")}</p>
              <div className="space-y-1 sm:space-y-2">
                {selectedProduct && getRecommendationReasons(selectedProduct, t).map((reason, index) => (
                  <div key={index} className={`flex items-center gap-1.5 sm:gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {reason.icon}
                    <span>{reason.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <DialogClose asChild>
              <Button
                variant="outline"
                className={isMobile ? 'h-8 text-xs' : ''}
              >
                {t("common.close")}
              </Button>
            </DialogClose>
            <Button
              className={isMobile ? 'h-8 text-xs' : ''}
              onClick={() => {
                if (selectedProduct) {
                  onAddToCart(selectedProduct);
                  setSelectedProduct(null);
                }
              }}
            >
              <ShoppingCart className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1.5 sm:mr-2`} />
              {t("cart.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductRecommendations;
