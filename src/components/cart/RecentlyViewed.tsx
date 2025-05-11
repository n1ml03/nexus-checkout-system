import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { ShoppingCart, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-breakpoint";

interface RecentlyViewedProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  isLoading?: boolean;
}

const RecentlyViewedSkeleton = () => {
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5 sm:gap-2">
          <Skeleton className="h-20 sm:h-24 w-full rounded-md" />
          <Skeleton className="h-3 sm:h-4 w-3/4" />
          <Skeleton className="h-3 sm:h-4 w-1/2" />
          <Skeleton className="h-7 sm:h-8 w-full mt-1" />
        </div>
      ))}
    </div>
  );
};

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  products,
  onAddToCart,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  if (products.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
        <CardTitle className={isMobile ? 'text-base' : ''}>{t("cart.recently_viewed")}</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        {isLoading ? (
          <RecentlyViewedSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <div className={`${isMobile ? 'h-20' : 'h-24'} bg-muted rounded-md shrink-0 overflow-hidden mb-1.5 sm:mb-2`}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-muted-foreground`} />
                    </div>
                  )}
                </div>

                <h4 className="font-medium text-xs sm:text-sm line-clamp-1">{product.name}</h4>
                <p className="text-muted-foreground text-[10px] sm:text-xs mb-1.5 sm:mb-2">{formatCurrency(product.price)}</p>

                <Button
                  variant="outline"
                  size="sm"
                  className={`text-[10px] sm:text-xs mt-auto ${isMobile ? 'h-7 py-0' : ''}`}
                  onClick={() => onAddToCart(product)}
                >
                  <ShoppingCart className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'} mr-1`} />
                  {t("cart.add")}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentlyViewed;
