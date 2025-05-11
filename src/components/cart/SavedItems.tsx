import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/contexts/CartContext";
import { ShoppingCart, Trash, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-breakpoint";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SavedItemsProps {
  items: CartItem[];
  onMoveToCart: (id: string) => void;
  onRemove: (id: string) => void;
}

const SavedItems: React.FC<SavedItemsProps> = ({
  items,
  onMoveToCart,
  onRemove
}) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
        <CardTitle className={isMobile ? 'text-base' : ''}>{t("cart.saved_for_later")} ({items.length})</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:gap-4 px-3 sm:px-6 pb-3 sm:pb-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 sm:gap-3 p-2 rounded-md hover:bg-muted/50"
          >
            <div className={`${isMobile ? 'h-14 w-14' : 'h-16 w-16'} bg-muted rounded-md shrink-0 overflow-hidden`}>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} rounded-full bg-primary/10 flex items-center justify-center`}>
                    <span className="text-primary font-medium">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-grow min-w-0">
              <h4 className="font-medium text-xs sm:text-sm truncate">{item.name}</h4>
              <p className="text-muted-foreground text-[10px] sm:text-xs">{formatCurrency(item.price)}</p>
            </div>

            {isMobile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onMoveToCart(item.id)}>
                    <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                    {t("cart.move_to_cart")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRemove(item.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="h-3.5 w-3.5 mr-2" />
                    {t("cart.remove")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => onMoveToCart(item.id)}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  {t("cart.move_to_cart")}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-destructive hover:text-destructive"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash className="h-3 w-3 mr-1" />
                  {t("cart.remove")}
                </Button>
              </div>
            )}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SavedItems;
