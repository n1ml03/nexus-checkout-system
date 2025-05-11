import React, { useState } from 'react';
import { Product } from '@/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Edit,
  Trash2,
  MoreVertical,
  Package,
  Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  showActions?: boolean;
  className?: string;
  isMobile?: boolean;
}

/**
 * Reusable product card component
 */
const ProductCard = React.memo(({
  product,
  onAddToCart,
  onEdit,
  onDelete,
  showActions = true,
  className,
  isMobile = false
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isCardTapped, setIsCardTapped] = useState(false);
  const { t } = useTranslation();

  const handleAddToCart = () => {
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleCardTap = () => {
    // Toggle card expanded state on mobile tap
    setIsCardTapped(prev => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn("h-full", className)}
    >
      <Card
        className="h-full overflow-hidden flex flex-col border-border/40 hover:border-primary/30 transition-colors"
        tabIndex={0}
        role="button"
        aria-label={`${product.name}, $${product.price.toFixed(2)}`}
        onClick={handleCardTap}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleCardTap();
          }
        }}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <motion.img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
              animate={{
                scale: isHovered || isCardTapped ? 1.05 : 1
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Package className="h-12 w-12 text-muted-foreground" />
              </motion.div>
            </div>
          )}

          {/* {product.stock <= 5 && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              {t("products.low_stock", { count: product.stock })}
            </Badge>
          )} */}

          {/* Product actions dropdown */}
          {/* {showActions && onEdit && onDelete && (
            <AnimatePresence>
              {(isHovered || isCardTapped) && (
                <motion.div
                  className="absolute top-2 right-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="animate-scale-in">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEdit(product);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t("actions.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(product);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("actions.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              )}
            </AnimatePresence>
          )} */}
        </div>

        <CardHeader className="pb-2 pt-3 sm:pt-6 px-3 sm:px-6">
          <CardTitle className="line-clamp-1 text-base sm:text-heading-sm">{product.name}</CardTitle>
          <motion.p
            className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400"
            animate={{
              scale: isAdded ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            ${product.price.toFixed(2)}
          </motion.p>
        </CardHeader>

        <CardContent className="pb-0 px-3 sm:px-6 flex-grow">
          <motion.p
            className="text-xs sm:text-sm text-muted-foreground"
            style={{
              WebkitLineClamp: isCardTapped ? 'unset' : (isMobile ? 2 : 3),
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {product.description}
          </motion.p>
          <motion.div
            className="mt-2 flex flex-wrap gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {product.category && (
              <Badge variant="outline" className="text-[10px] sm:text-xs h-5 sm:h-6">
                {product.category}
              </Badge>
            )}
            {product.sku && !isMobile && (
              <Badge variant="outline" className="text-[10px] sm:text-xs h-5 sm:h-6">
                SKU: {product.sku}
              </Badge>
            )}
          </motion.div>
        </CardContent>

        <CardFooter className="pt-3 sm:pt-4 px-3 sm:px-6 pb-3 sm:pb-6 flex flex-col sm:flex-row gap-2">
          <div className="flex gap-1 sm:gap-2 w-full">
            <Button
              className="flex-1 flex items-center gap-1 sm:gap-2 relative overflow-hidden h-9 sm:h-10 text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={isAdded}
            >
              <AnimatePresence mode="wait">
                {isAdded ? (
                  <motion.div
                    key="added"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="flex items-center gap-1 sm:gap-2"
                  >
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t("cart.added")}
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="flex items-center gap-1 sm:gap-2"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {t("cart.add")}
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {showActions && onEdit && (
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product);
                  }}
                  aria-label={t("actions.edit_product")}
                >
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Quick checkout button that appears only on mobile when product is added */}
          {isMobile && isAdded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full"
            >
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-1 h-9 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  // Navigate to checkout
                  window.location.href = '/checkout';
                }}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                {t("cart.checkout_now")}
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
