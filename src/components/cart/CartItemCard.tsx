import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/contexts/CartContext";
import { Minus, Plus, Trash, Heart, MessageSquare, ZoomIn, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-breakpoint";
import {
  Dialog,
  DialogContent,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onSaveForLater?: (id: string) => void;
  onAddNote?: (id: string, note: string) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onSaveForLater,
  onAddNote
}) => {
  const { t } = useTranslation();
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [note, setNote] = useState(item.note || '');
  const [isRemoving, setIsRemoving] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const isMobile = useIsMobile();

  const handleRemove = () => {
    setIsRemoving(true);
    // Delay actual removal to allow animation to complete
    setTimeout(() => {
      onRemove(item.id);
    }, 300);
  };

  const handleSaveNote = () => {
    if (onAddNote) {
      onAddNote(item.id, note);
    }
    setIsNoteDialogOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {!isRemoving && (
          <motion.div
            key={`item-${item.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden">
              <CardContent className={`p-2 sm:p-6 ${isMobile ? 'pb-1.5' : ''}`}>
                <div className="flex gap-2 sm:gap-4">
                  {/* Product Image */}
                  <div
                    className="h-16 w-16 sm:h-24 sm:w-24 bg-muted rounded-md shrink-0 overflow-hidden cursor-pointer relative group"
                    onClick={() => setIsImageDialogOpen(true)}
                  >
                    {item.image ? (
                      <>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="text-white h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                {/* Product Details */}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium leading-tight text-xs sm:text-base mb-0.5 sm:mb-1 truncate pr-2">
                      {item.name}
                    </h3>

                    {isMobile ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 sm:h-8 sm:w-8"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          {onAddNote && (
                            <DropdownMenuItem onClick={() => setIsNoteDialogOpen(true)}>
                              <MessageSquare className="h-3 w-3 mr-1.5" />
                              {t("cart.add_note")}
                            </DropdownMenuItem>
                          )}
                          {onSaveForLater && (
                            <DropdownMenuItem onClick={() => onSaveForLater(item.id)}>
                              <Heart className="h-3 w-3 mr-1.5" />
                              {t("cart.save_for_later")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={handleRemove}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="h-3 w-3 mr-1.5" />
                            {t("cart.remove")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={handleRemove}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-2">
                    <p className="text-muted-foreground text-[10px] sm:text-sm">{formatCurrency(item.price)}</p>
                    {item.note && (
                      <div className="bg-muted text-[8px] sm:text-xs px-1 sm:px-2 py-0 sm:py-0.5 rounded-full">
                        {t("cart.has_note")}
                      </div>
                    )}
                  </div>

                  {/* Mobile layout - Quantity and Total in one row */}
                  {isMobile ? (
                    <div className="flex items-center justify-between mt-1">
                      {/* Quantity Controls - Smaller for mobile */}
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-r-none"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-2 w-2" />
                        </Button>
                        <span className="px-1.5 h-6 flex items-center justify-center border-y bg-background text-[10px]">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 rounded-l-none"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-2 w-2" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <p className="text-[10px] font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop layout - Item Total */}
                      <p className="text-sm mb-3">
                        <span className="text-muted-foreground">{t("cart.item_total")}: </span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                      </p>

                      {/* Desktop layout - Actions Row */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-4 h-8 flex items-center justify-center border-y bg-background">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Additional Actions */}
                        <div className="flex items-center gap-1">
                          {onAddNote && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setIsNoteDialogOpen(true)}
                              title={t("cart.add_note")}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}

                          {onSaveForLater && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onSaveForLater(item.id)}
                              title={t("cart.save_for_later")}
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Image Zoom Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className={`${isMobile ? 'max-w-[90vw]' : 'sm:max-w-md'} flex items-center justify-center p-0 overflow-hidden`}>
          <DialogClose className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
            <span className="sr-only">{t("common.close")}</span>
          </DialogClose>
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      {onAddNote && (
        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogContent className={`${isMobile ? 'max-w-[90vw] p-4' : 'sm:max-w-md'}`}>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 pr-6">{t("cart.add_note_for")} {item.name}</h3>
            <textarea
              className="w-full p-2 border rounded-md min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("cart.note_placeholder")}
            />
            <div className="flex justify-end gap-2 mt-3 sm:mt-4">
              <Button
                variant="outline"
                onClick={() => setIsNoteDialogOpen(false)}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSaveNote}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              >
                {t("common.save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CartItemCard;
