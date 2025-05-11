import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

/**
 * ScanToPayPage Component
 *
 * Note: This component contains several functions, state variables, and imports that are defined
 * but not currently used in the UI. These are kept for future implementation of additional features
 * and to maintain the component's planned functionality. They will be connected to UI elements in future updates.
 *
 * The unused elements include:
 * - Functions for handling customer selection
 * - Functions for applying discounts
 * - Functions for managing scan modes
 * - Functions for handling payment method selection
 * - State variables for advanced features like favorites, loyalty points, etc.
 * - Imports for UI components that will be used in future enhancements
 *
 * This approach allows for easier implementation of planned features while maintaining
 * a clean and functional current version.
 */
import { useOrder } from "@/contexts/OrderContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BarcodeScanner from "@/components/products/BarcodeScanner";
import QRCodePayment from "@/components/payments/QRCodePayment";
import { supabase } from "@/services/db/db-client";
import { useTranslation } from "react-i18next";
import {
  Trash,
  Plus,
  Minus,
  QrCode,
  ArrowRight,
  ShoppingCart,
  Loader2,
  Scan,
  Receipt,
  Tag,
  Info,
  Package,
  User,
  Search,
  Clock,
  Heart,
  Star,
  Percent,
  CreditCard,
  History,
  Filter,
  Users,
  Wallet,
  BadgePercent,
  CircleDollarSign,
  ReceiptText,
  CheckCircle2,
  CircleEllipsis,
  ChevronRight,
  ChevronLeft,
  BarChart4,
  Camera,
  Keyboard,
  Zap,
  X,
  Check,
  AlertCircle,
  FileText,
  Download,
  Share2,
  RefreshCw,
  Copy,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

// Define interfaces for new features
interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastVisit?: string;
}

interface SavedPaymentMethod {
  id: string;
  name: string;
  type: 'qr' | 'card' | 'wallet';
  isDefault?: boolean;
}

interface ProductCategory {
  id: string;
  name: string;
}

interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  code?: string;
}

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

// We'll fetch real data from Supabase instead of using mock data

const ScanToPayPage = () => {
  const { currentOrder, addItem, removeItem, updateQuantity, subtotal, completeOrder } = useOrder();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Original state
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentlyScanned, setRecentlyScanned] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showProductInfo, setShowProductInfo] = useState<string | null>(null);

  // New state for enhanced features
  const [paymentStep, setPaymentStep] = useState<'scan' | 'review' | 'payment' | 'complete'>('scan');
  const [selectedCategory, setSelectedCategory] = useState<string>('1'); // Default to 'All'
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState<boolean>(false);
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerProfile[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SavedPaymentMethod | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [discountCode, setDiscountCode] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [tipPercentage, setTipPercentage] = useState<number>(0);
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  const [showReceiptPreview, setShowReceiptPreview] = useState<boolean>(false);
  const [paymentProgress, setPaymentProgress] = useState<number>(0);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  // Additional state for enhanced scanning features
  const [scanMode, setScanMode] = useState<'single' | 'continuous'>('single');
  const [showScanHistory, setShowScanHistory] = useState<boolean>(false);
  const [scanHistory, setScanHistory] = useState<{barcode: string, timestamp: number, product?: any}[]>([]);
  const [showManualEntry, setShowManualEntry] = useState<boolean>(false);
  const [manualBarcode, setManualBarcode] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStats, setScanStats] = useState<{
    totalScans: number;
    successfulScans: number;
    failedScans: number;
  }>({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0
  });

  // State for customer search dialog
  const [customerSearchOpen, setCustomerSearchOpen] = useState<boolean>(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>("");

  // State for payment method selection
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState<boolean>(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<any[]>([
    { id: 'qr-code', name: 'QR Code', icon: <QrCode className="h-4 w-4" /> },
    { id: 'mobile-banking', name: 'Mobile Banking', icon: <Smartphone className="h-4 w-4" /> },
    { id: 'e-wallet', name: 'E-Wallet', icon: <Wallet className="h-4 w-4" /> }
  ]);

  // Refs for animations and focus management
  const manualBarcodeInputRef = useRef<HTMLInputElement>(null);
  const customerSearchInputRef = useRef<HTMLInputElement>(null);

  const handleProductFound = async (barcode: string) => {
    // Set recently scanned barcode for animation
    setRecentlyScanned(barcode);

    // Update scan statistics
    setScanStats(prev => ({
      ...prev,
      totalScans: prev.totalScans + 1
    }));

    // Clear the animation after 2 seconds
    setTimeout(() => {
      setRecentlyScanned(null);
    }, 2000);

    // Check if product exists in our database
    const { data: existingProduct, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Product not found
        toast.error(t("scanToPay.productNotFound", { barcode }));

        // Play error sound
        const audio = new Audio('/sounds/error-beep.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));

        // Update scan history and stats
        setScanHistory(prev => [
          { barcode, timestamp: Date.now() },
          ...prev.slice(0, 9) // Keep only the 10 most recent scans
        ]);

        setScanStats(prev => ({
          ...prev,
          failedScans: prev.failedScans + 1
        }));
      } else {
        toast.error(`Error searching product: ${error.message}`);
      }
      return;
    }

    // Product found, add to order
    addItem({
      id: existingProduct.id,
      name: existingProduct.name,
      price: existingProduct.price,
      quantity: 1,
      image: existingProduct.image_url,
    });

    // Update scan history and stats
    setScanHistory(prev => [
      {
        barcode,
        timestamp: Date.now(),
        product: existingProduct
      },
      ...prev.slice(0, 9) // Keep only the 10 most recent scans
    ]);

    setScanStats(prev => ({
      ...prev,
      successfulScans: prev.successfulScans + 1
    }));

    // Play success sound
    const audio = new Audio('/sounds/beep-success.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));

    // Show success toast with product info
    toast.success(
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-md overflow-hidden bg-muted">
          {existingProduct.image_url ? (
            <img
              src={existingProduct.image_url}
              alt={existingProduct.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">{t("scanToPay.productAdded", { product: existingProduct.name })}</p>
          <p className="text-xs text-muted-foreground">${existingProduct.price.toFixed(2)}</p>
        </div>
      </div>
    );

    // If in continuous scan mode, keep scanning
    if (scanMode === 'continuous' && isScanning) {
      // Continue scanning automatically
      console.log("Continuing scan in continuous mode");
    }
  };

  // Function to handle product not found
  const handleProductNotFound = (barcode: string) => {
    toast.info(
      <div className="flex flex-col gap-1">
        <p>{t("scanToPay.productNotFound", { barcode })}</p>
        <p className="text-xs">{t("scanToPay.addToProducts")}</p>
      </div>
    );

    // Navigate to products page
    navigate("/products");
  };

  // Effect to initialize default payment method
  useEffect(() => {
    // Set default payment method since we don't have a payment_methods table yet
    setSelectedPaymentMethod({
      id: '1',
      name: 'QR Code Payment',
      type: 'qr',
      isDefault: true
    });
  }, []);

  // Effect to handle payment completion
  useEffect(() => {
    if (showQRPayment) {
      // This effect is intentionally simplified to avoid unnecessary animations
      // In a future update, we'll implement a proper payment progress animation
      console.log("QR Payment view is now visible");
    }
  }, [showQRPayment]);

  // Function to search customers
  const searchCustomers = async (query: string) => {
    if (!query.trim()) {
      setCustomerSearchResults([]);
      return;
    }

    try {
      // Search customers in Supabase
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(5);

      if (error) {
        console.error('Error searching customers:', error);
        // Use mock data if there's an error
        const mockCustomers: CustomerProfile[] = [
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',

          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+0987654321',

          }
        ];
        setCustomerSearchResults(mockCustomers.filter(c =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.email.toLowerCase().includes(query.toLowerCase())
        ));
        return;
      }

      // Format the results
      const formattedResults: CustomerProfile[] = data.map(customer => ({
        id: customer.id,
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone || undefined
      }));

      setCustomerSearchResults(formattedResults);
    } catch (error) {
      console.error('Error in searchCustomers:', error);
      setCustomerSearchResults([]);
    }
  };

  // Function to apply discount code - will be connected to UI in future updates
  const applyDiscountCode = async () => {
    if (!discountCode.trim()) {
      toast.error(t("scanToPay.discount.code"));
      return;
    }

    try {
      // Since we don't have a discounts table yet, simulate a discount
      // In a real app, we would check the database
      const mockDiscount: Discount = {
        id: '1',
        name: 'WELCOME10',
        type: 'percentage',
        value: 10,
        code: discountCode.toUpperCase()
      };

      setSelectedDiscount(mockDiscount);
      toast.success(t("scanToPay.discount.applied", { name: mockDiscount.name }));
    } catch (error) {
      console.error('Error in applyDiscountCode:', error);
      toast.error(t("common.error"));
    }
  };

  // Function to calculate total with discounts and tip
  const calculateTotal = () => {
    let total = subtotal;

    // Apply discount if selected
    if (selectedDiscount) {
      if (selectedDiscount.type === 'percentage') {
        total = total * (1 - selectedDiscount.value / 100);
      } else {
        total = Math.max(0, total - selectedDiscount.value);
      }
    }



    // Add tip
    total += tipAmount;

    return total;
  };

  // Function to update tip based on percentage
  const updateTipFromPercentage = (percentage: number) => {
    setTipPercentage(percentage);
    setTipAmount(Math.round((subtotal * percentage / 100) * 100) / 100);
  };

  // Function to add favorite item to order
  const addFavoriteToOrder = (item: FavoriteItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });

    toast.success(`Added ${item.name} to order`);
  };

  // Function to filter products by category
  const filterProductsByCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);

    // Since we don't have a categories table yet, use hardcoded categories
    const categoryNames: Record<string, string> = {
      '1': 'All',
      '2': 'Electronics',
      '3': 'Clothing',
      '4': 'Food',
      '5': 'Beverages'
    };

    if (categoryId !== '1' && categoryNames[categoryId]) {
      toast.info(`Filtered by ${categoryNames[categoryId]}`);
    }
  };

  const handleProceedToPayment = () => {
    if (currentOrder.length === 0) {
      toast.error("Please scan at least one product before proceeding to payment");
      return;
    }

    // Generate a more meaningful order ID with date prefix
    const date = new Date();
    const datePrefix = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newOrderId = `ORD-${datePrefix}-${randomSuffix}`;
    setOrderId(newOrderId);

    // Update payment step
    setPaymentStep('review');
    setShowQRPayment(true);

    // Play sound effect
    const audio = new Audio('/sounds/proceed-payment.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  // Function to show product details
  const toggleProductInfo = (productId: string) => {
    if (showProductInfo === productId) {
      setShowProductInfo(null);
    } else {
      setShowProductInfo(productId);
    }
  };

  // Function to proceed to final payment after review
  const proceedToFinalPayment = () => {
    setPaymentStep('payment');

    // Reset payment progress for animation
    setPaymentProgress(0);

    toast.info(t("scanToPay.proceedingToPayment"));
  };

  // Handle manual barcode entry
  const handleManualBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      try {
        // Check if product exists in our database first
        const { data: existingProduct, error } = await supabase
          .from('products')
          .select('*')
          .eq('barcode', manualBarcode.trim())
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Product not found
            toast.error(t("scanToPay.productNotFound", { barcode: manualBarcode.trim() }));
          } else {
            toast.error(`Error searching product: ${error.message}`);
          }
        } else {
          // Product found, proceed with handling
          handleProductFound(manualBarcode.trim());
        }
      } catch (error) {
        console.error('Error in handleManualBarcodeSubmit:', error);
        toast.error(t("common.error"));
      } finally {
        setManualBarcode("");
        setShowManualEntry(false);
      }
    }
  };

  // These functions are defined but not currently used in the UI
  // They are kept for future implementation of additional features

  // Function to handle scan mode changes (single vs continuous)
  const handleScanModeChange = (mode: 'single' | 'continuous') => {
    setScanMode(mode);
    toast.info(`Scan mode changed to ${mode}`);
  };

  // Function to handle scanning state changes
  const handleScanningStateChange = (isActive: boolean) => {
    setIsScanning(isActive);
    toast.info(isActive ? "Scanning started" : "Scanning paused");
  };

  // Function to handle customer selection
  const handleCustomerSelection = (customer: CustomerProfile) => {
    setSelectedCustomer(customer);
    setCustomerName(customer.name);
    setCustomerEmail(customer.email);
    setCustomerSearchOpen(false);
    toast.success(t("scanToPay.customer.selected", { name: customer.name }));
  };

  // Function to handle payment method selection
  const handlePaymentSelection = (method: any) => {
    setSelectedPaymentMethod({
      id: method.id,
      name: method.name,
      type: method.id as 'qr' | 'card' | 'wallet',
      isDefault: false
    });
    setPaymentMethodDialogOpen(false);
  };

  const handlePaymentComplete = async () => {
    try {
      // Update payment step
      setPaymentStep('complete');

      // Add to transaction history
      const newTransaction = {
        id: orderId,
        date: new Date().toISOString(),
        amount: calculateTotal(),
        items: currentOrder.length,
        customer: selectedCustomer?.name || customerName || 'Guest',
        paymentMethod: selectedPaymentMethod?.name || 'QR Code Payment'
      };

      setTransactionHistory(prev => [newTransaction, ...prev]);

      // Complete the order in the database with the selected payment method
      await completeOrder(selectedPaymentMethod?.id || "qr-code");

      toast.success(t("scanToPay.paymentSuccessful"));

      // Delay navigation to show completion state, then redirect to products page to continue shopping
      setTimeout(() => {
        navigate("/products");
      }, 2000);
    } catch (error) {
      console.error('Error completing payment:', error);
      toast.error(t("scanToPay.failedToComplete"));
    }
  };

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("scanToPay.title")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("scanToPay.description")}
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Left column - Scanned items */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2 px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-1 sm:gap-2">
                <span>{t("scanToPay.scannedItems")}</span>
                {recentlyScanned && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Badge variant="default" className="bg-success-500 text-white animate-pulse text-[10px] sm:text-xs h-5 sm:h-6">
                      <Scan className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                      Scanned
                    </Badge>
                  </motion.div>
                )}
              </CardTitle>
              <div className="w-full sm:w-auto">
                <BarcodeScanner
                  onDetected={handleProductFound}
                  onProductNotFound={handleProductNotFound}
                  buttonLabel={t("scanToPay.scanProduct")}
                  buttonVariant="default"
                />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <AnimatePresence mode="wait" key="order-status">
                {currentOrder.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-4 sm:py-6 text-center"
                  >
                    <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {t("scanToPay.noItemsScanned")}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="items"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    {currentOrder.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 border rounded-lg hover:bg-accent/10 transition-colors"
                        onClick={() => toggleProductInfo(item.id)}
                      >
                        <div className="flex gap-2 sm:gap-3">
                          {/* Product image */}
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {item.image ? (
                              <motion.img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Product info */}
                          <div className="flex-1 space-y-0.5 sm:space-y-1">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <p className="font-medium text-sm sm:text-base line-clamp-1">{item.name}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleProductInfo(item.id);
                                }}
                              >
                                <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <p className="text-xs sm:text-sm font-semibold">
                                ${item.price.toFixed(2)}
                              </p>
                              <span className="text-[10px] sm:text-xs text-muted-foreground">
                                × {item.quantity}
                              </span>
                              <span className="text-[10px] sm:text-xs font-medium ml-auto">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>

                            {/* Expanded product info */}
                            <AnimatePresence mode="wait">
                              {showProductInfo === item.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t text-[10px] sm:text-xs text-muted-foreground">
                                    <p>{t("scanToPay.productInfo.productId")}: {item.id}</p>
                                    {item.image && (
                                      <p className="truncate">{t("scanToPay.productInfo.image")}: {item.image}</p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center space-x-1 sm:space-x-2 mt-2 sm:mt-0">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 sm:h-9 sm:w-9 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, item.quantity - 1);
                            }}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 sm:h-9 sm:w-9 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.id, item.quantity + 1);
                            }}
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 sm:h-9 sm:w-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                          >
                            <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
              <div className="text-lg sm:text-xl font-semibold w-full sm:w-auto text-center sm:text-left">
                {t("scanToPay.total")}: ${subtotal.toFixed(2)}
              </div>
              <Button
                onClick={handleProceedToPayment}
                disabled={currentOrder.length === 0}
                className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto h-10 sm:h-12 text-sm sm:text-base"
              >
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                {t("scanToPay.payWithQRCode")}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right column - QR Payment */}
        <AnimatePresence mode="wait">
          {showQRPayment && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-1 sm:gap-2">
                    <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t("scanToPay.payment")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  {/* Optional customer info */}
                  <div className="space-y-2 mb-3 sm:mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="customerName" className="text-xs sm:text-sm font-medium">
                          {t("scanToPay.customerNameOptional")}
                        </label>
                        <input
                          id="customerName"
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full p-1.5 sm:p-2 mt-1 border rounded-md text-xs sm:text-sm h-8 sm:h-10"
                          placeholder={t("scanToPay.enterCustomerName")}
                        />
                      </div>
                      <div>
                        <label htmlFor="customerEmail" className="text-xs sm:text-sm font-medium">
                          {t("scanToPay.customerEmailOptional")}
                        </label>
                        <input
                          id="customerEmail"
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full p-1.5 sm:p-2 mt-1 border rounded-md text-xs sm:text-sm h-8 sm:h-10"
                          placeholder={t("scanToPay.enterEmailForReceipt")}
                        />
                      </div>
                    </div>
                  </div>

                  <QRCodePayment
                    orderId={orderId}
                    amount={calculateTotal()}
                    onComplete={handlePaymentComplete}
                    customerName={customerName}
                    customerEmail={customerEmail}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScanToPayPage;
