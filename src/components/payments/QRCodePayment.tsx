import { useState, useEffect, useCallback, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generatePaymentLink, processPayment } from "@/lib/payment";
import {
  Loader2,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Share2,
  Smartphone,
  Wallet,
  CreditCard,
  QrCode,
  ArrowRight,
  Download,
  ShieldCheck,
  Info,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-breakpoint";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QRCodePaymentProps {
  orderId: string;
  amount: number;
  onComplete: () => void;
  customerName?: string;
  customerEmail?: string;
}

type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';
type PaymentMethod = 'qr-code' | 'mobile-banking' | 'e-wallet';

const QRCodePayment = ({
  orderId,
  amount,
  onComplete,
  customerName,
  customerEmail
}: QRCodePaymentProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // Payment state
  const [paymentLink, setPaymentLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qr-code');
  const [transactionId, setTransactionId] = useState<string>("");

  // UI state
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('qr-code');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);

  // Generate payment link for QR code
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true);
        const link = generatePaymentLink(orderId, amount);
        setPaymentLink(link);
      } catch (error) {
        console.error("Error generating payment link:", error);
        toast.error("Failed to generate payment QR code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    generateQRCode();
  }, [orderId, amount]);

  // Countdown timer for payment expiration
  useEffect(() => {
    if (paymentStatus !== 'pending' && paymentStatus !== 'processing') {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (paymentStatus === 'pending' || paymentStatus === 'processing') {
            setPaymentStatus('failed');
            toast.error("Payment time expired. Please try again.");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus]);

  // Auto-check payment status has been removed
  // Payments now require manual verification via the "I've Completed the QR Payment" button

  // Format time left as MM:SS
  const formattedTimeLeft = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Calculate progress percentage for the timer
  const progressPercentage = useMemo(() => {
    return (timeLeft / 300) * 100;
  }, [timeLeft]);

  // Handle manual payment verification
  const handleVerifyPayment = useCallback(() => {
    checkPaymentStatus();
  }, []);

  // Check payment status - only triggered by manual verification button
  const checkPaymentStatus = async () => {
    try {
      setIsVerifying(true);
      setPaymentStatus('processing');

      // In a real implementation, this would call an API to check the payment status
      // Map local payment method to the payment library's supported methods
      const paymentMethodMap = {
        'qr-code': 'qr-code',
        'mobile-banking': 'card',
        'e-wallet': 'momo'
      } as const;

      // Process payment only when the user has clicked the verify button
      // No automatic payment processing for any payment method
      const result = await processPayment(paymentMethodMap[paymentMethod], amount);

      if (result.success) {
        // Store transaction ID for receipt
        setTransactionId(result.transactionId);

        // Update status and show success animation
        setPaymentStatus('completed');
        setShowConfetti(true);

        // Play success sound
        const audio = new Audio('/sounds/payment-success.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));

        toast.success("Payment verified successfully!");

        // Delay completion to show success animation
        setTimeout(() => {
          // Show receipt first if we have customer info
          if (customerName || customerEmail) {
            setShowReceipt(true);
            // Complete after 3 seconds of showing receipt
            setTimeout(() => {
              onComplete();
            }, 3000);
          } else {
            // Complete immediately if no customer info
            onComplete();
          }
        }, 2000);
      } else {
        setPaymentStatus('failed');
        toast.error("Payment verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setPaymentStatus('failed');
      toast.error("Failed to verify payment. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Generate a downloadable receipt
  const generateReceipt = () => {
    const date = new Date().toLocaleString();
    const receiptData = {
      orderId,
      transactionId,
      amount,
      date,
      customerName: customerName || 'Guest',
      customerEmail: customerEmail || 'Not provided',
      paymentMethod: paymentMethod === 'qr-code' ? 'QR Code Payment' :
                     paymentMethod === 'mobile-banking' ? 'Mobile Banking' : 'E-Wallet'
    };

    // In a real app, you would generate a proper PDF receipt
    // For this demo, we'll just create a text version
    const receiptText = `
      PAYMENT RECEIPT
      ------------------------------
      Order ID: ${receiptData.orderId}
      Transaction ID: ${receiptData.transactionId}
      Date: ${receiptData.date}
      Amount: $${amount.toFixed(2)}
      Payment Method: ${receiptData.paymentMethod}

      Customer: ${receiptData.customerName}
      Email: ${receiptData.customerEmail}

      Thank you for your payment!
    `;

    // Create a blob and download link
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Receipt downloaded successfully");
  };

  // Copy payment link to clipboard
  const copyPaymentLink = () => {
    navigator.clipboard.writeText(paymentLink)
      .then(() => toast.success("Payment link copied to clipboard"))
      .catch(() => toast.error("Failed to copy payment link"));
  };

  // Regenerate QR code
  const regenerateQRCode = () => {
    setIsLoading(true);
    setPaymentStatus('pending');
    setTimeLeft(300);

    // Generate a new payment link
    const link = generatePaymentLink(orderId, amount);
    setPaymentLink(link);
    setIsLoading(false);

    toast.info("QR code has been refreshed");
  };

  // Share payment link
  const sharePaymentLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Payment for Order ${orderId}`,
          text: `Please complete payment of $${amount.toFixed(2)} for order ${orderId}`,
          url: paymentLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      copyPaymentLink();
    }
  };

  // Function to render confetti effect
  const renderConfetti = () => {
    if (!showConfetti) return null;

    // Create an array of confetti pieces
    const confettiPieces = Array.from({ length: 50 }).map((_, i) => {
      const size = Math.random() * 10 + 5;
      const x = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const duration = Math.random() * 1 + 1;
      const color = [
        '#FF5252', '#FF4081', '#E040FB', '#7C4DFF',
        '#536DFE', '#448AFF', '#40C4FF', '#18FFFF',
        '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41',
        '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
      ][Math.floor(Math.random() * 16)];

      return (
        <motion.div
          key={i}
          initial={{
            y: -20,
            x: `${x}%`,
            opacity: 1,
            scale: 0
          }}
          animate={{
            y: '120vh',
            x: `${x + (Math.random() * 20 - 10)}%`,
            opacity: [1, 1, 0],
            rotate: Math.random() * 360,
            scale: 1
          }}
          transition={{
            duration: duration,
            delay: delay,
            ease: 'easeOut'
          }}
          style={{
            position: 'absolute',
            top: 0,
            width: size,
            height: size,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            backgroundColor: color
          }}
        />
      );
    });

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confettiPieces}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center space-y-4 w-full">
        {/* Render confetti effect when payment is completed */}
        {renderConfetti()}

        <Card className="w-full overflow-hidden border-2">
          <CardHeader className="pb-2 bg-muted/30 px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">{t("checkout.payment")}</CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs">{t("checkout.secure_checkout")}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Badge variant={
                  paymentStatus === 'completed' ? 'default' :
                  paymentStatus === 'failed' ? 'destructive' :
                  paymentStatus === 'processing' ? 'outline' : 'secondary'
                } className="px-1.5 sm:px-2 py-0.5 sm:py-1 h-5 sm:h-6 text-[10px] sm:text-xs">
                  {paymentStatus === 'completed' ? t("order.completed") :
                  paymentStatus === 'failed' ? t("order.cancelled") :
                  paymentStatus === 'processing' ? t("order.processing") : t("order.pending")}
                </Badge>
              </div>
            </div>

            {paymentStatus === 'pending' && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] sm:text-xs">
                  <span className="flex items-center gap-0.5 sm:gap-1">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {t("scanToPay.qrCode.timeRemaining")}
                  </span>
                  <span className="font-medium">{formattedTimeLeft}</span>
                </div>
                <Progress value={progressPercentage} className="h-1 sm:h-1.5 rounded-full" />
              </div>
            )}
          </CardHeader>

        <CardContent className="pt-2 flex flex-col items-center px-3 sm:px-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-48 w-48 sm:h-64 sm:w-64 flex items-center justify-center"
              >
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
              </motion.div>
            ) : showReceipt ? (
              <motion.div
                key="receipt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full p-3 sm:p-4 border rounded-lg bg-muted/30"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base sm:text-lg font-semibold">Payment Receipt</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={generateReceipt}
                    >
                      <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-medium">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-medium">{transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium">
                        {paymentMethod === 'qr-code' ? 'QR Code Payment' :
                         paymentMethod === 'mobile-banking' ? 'Mobile Banking' : 'E-Wallet'}
                      </span>
                    </div>
                    {customerName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="font-medium">{customerName}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 sm:pt-4 border-t">
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-1.5 sm:mb-2" />
                    </div>
                    <p className="text-center text-xs sm:text-sm text-muted-foreground">
                      Thank you for your payment!
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : paymentStatus === 'completed' ? (
              <motion.div
                key="completed"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="h-48 w-48 sm:h-64 sm:w-64 flex flex-col items-center justify-center space-y-3 sm:space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
                >
                  <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-green-500" />
                </motion.div>
                <motion.div
                  className="space-y-1.5 sm:space-y-2 text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <p className="text-base sm:text-lg font-medium">Payment Completed!</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Transaction ID: {transactionId}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateReceipt}
                    className="mt-1.5 sm:mt-2 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Download Receipt
                  </Button>
                </motion.div>
              </motion.div>
            ) : paymentStatus === 'failed' ? (
              <motion.div
                key="failed"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="h-48 w-48 sm:h-64 sm:w-64 flex flex-col items-center justify-center space-y-3 sm:space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
                >
                  <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-destructive" />
                </motion.div>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="text-base sm:text-lg font-medium text-center"
                >
                  Payment Failed
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateQRCode}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Try Again
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="qrcode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <Tabs
                  defaultValue="qr-code"
                  value={activeTab}
                  onValueChange={(value) => {
                    setActiveTab(value);
                    setPaymentMethod(value as PaymentMethod);
                  }}
                  className="w-full"
                >
                  <div className="flex items-center justify-between mb-2">
                    {/* Mobile-optimized payment method tabs */}
                    <TabsList className="grid grid-cols-3 p-0.5 sm:p-1 h-10 sm:h-10 w-full">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TabsTrigger
                            value="qr-code"
                            className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-md text-[10px] sm:text-xs h-9 sm:h-8 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-medium"
                          >
                            <QrCode className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
                            <span className="text-[9px] sm:text-xs">{t("scanToPay.qrCode.title")}</span>
                          </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-[10px] sm:text-xs">{t("checkout.help.qr_payment")}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TabsTrigger
                            value="mobile-banking"
                            className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-md text-[10px] sm:text-xs h-9 sm:h-8 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-medium"
                          >
                            <Smartphone className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
                            <span className="text-[9px] sm:text-xs">{t("checkout.mobile_banking")}</span>
                          </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-[10px] sm:text-xs">{t("checkout.help.mobile_banking")}</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <TabsTrigger
                            value="e-wallet"
                            className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 rounded-md text-[10px] sm:text-xs h-9 sm:h-8 w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-medium"
                          >
                            <Wallet className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5" />
                            <span className="text-[9px] sm:text-xs">{t("checkout.e_wallet")}</span>
                          </TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-[10px] sm:text-xs">{t("checkout.help.e_wallet")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TabsList>
                  </div>

                  <TabsContent value="qr-code" className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white p-2 sm:p-4 rounded-lg shadow-md border-2 border-primary/10 mb-2 sm:mb-3"
                    >
                      <div className="relative">
                        <QRCodeSVG
                          value={paymentLink}
                          size={isMobile ? 160 : 200}
                          level="H"
                          className="mx-auto p-1 sm:p-2"
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/80 flex items-center justify-center">
                            <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">
                      <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>{t("scanToPay.qrCode.scan")}</span>
                    </div>
                  </TabsContent>

                  <TabsContent value="mobile-banking" className="space-y-3 sm:space-y-4">
                    <div className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <h3 className="font-medium text-sm sm:text-base">Bank Transfer Details</h3>
                      </div>

                      {/* Mobile-optimized bank details */}
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 sm:border-0 sm:pb-0">
                          <span className="text-muted-foreground">Account Name:</span>
                          <span className="font-medium">Nexus Checkout</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 sm:border-0 sm:pb-0">
                          <span className="text-muted-foreground">Account Number:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium font-mono">1234567890</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 rounded-full"
                              onClick={() => {
                                navigator.clipboard.writeText('1234567890');
                                toast.success("Account number copied");
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 sm:border-0 sm:pb-0">
                          <span className="text-muted-foreground">Bank:</span>
                          <span className="font-medium">Example Bank</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <span className="text-muted-foreground">Reference:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium font-mono">{orderId}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 rounded-full"
                              onClick={() => {
                                navigator.clipboard.writeText(orderId);
                                toast.success("Order ID copied");
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1.5 sm:pt-2 text-[10px] sm:text-xs text-muted-foreground">
                        Please include the order ID as reference when making the transfer.
                      </div>

                      <div className="pt-3 sm:pt-4">
                        <Button
                          className="w-full h-12 sm:h-10 text-xs sm:text-sm"
                          onClick={handleVerifyPayment}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                              Verifying Payment...
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 sm:gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              I've Completed the Bank Transfer
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="e-wallet" className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        className="h-auto py-4 sm:py-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                      >
                        <Wallet className="h-6 w-6 sm:h-6 sm:w-6 text-[#ae2070]" />
                        <span>Momo</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-4 sm:py-4 flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                      >
                        <Wallet className="h-6 w-6 sm:h-6 sm:w-6 text-[#0068ff]" />
                        <span>ZaloPay</span>
                      </Button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                      Select an e-wallet to continue with payment
                    </p>

                    <div className="pt-1.5 sm:pt-2">
                      <Button
                        className="w-full h-12 sm:h-10 text-xs sm:text-sm"
                        onClick={handleVerifyPayment}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                            Verifying Payment...
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            I've Completed the E-Wallet Payment
                          </div>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {(paymentStatus === 'pending' || paymentStatus === 'processing') && (
          <CardFooter className="flex flex-col space-y-3 sm:space-y-4 px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="text-center space-y-1.5 sm:space-y-2 w-full">
              <p className="text-xs sm:text-sm text-muted-foreground">
                {activeTab === 'qr-code'
                  ? 'Scan the QR code with your banking app or e-wallet'
                  : activeTab === 'mobile-banking'
                  ? 'Make a transfer using the details above'
                  : 'Select an e-wallet to continue'
                }
              </p>
              <p className="font-medium text-base sm:text-lg">
                Amount: ${amount.toFixed(2)}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Order ID: {orderId}
              </p>
            </div>

            {activeTab === 'qr-code' && (
              <>
                {/* Mobile-optimized action buttons */}
                <div className="grid grid-cols-3 gap-1 w-full sm:hidden">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyPaymentLink}
                    className="h-10 w-full rounded-md flex flex-col items-center justify-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-[9px]">{t("scanToPay.qrCode.copy")}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={sharePaymentLink}
                    className="h-10 w-full rounded-md flex flex-col items-center justify-center gap-1"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="text-[9px]">{t("scanToPay.qrCode.share")}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={regenerateQRCode}
                    className="h-10 w-full rounded-md flex flex-col items-center justify-center gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-[9px]">{t("scanToPay.qrCode.refresh")}</span>
                  </Button>
                </div>

                {/* Desktop action buttons */}
                <div className="hidden sm:grid grid-cols-3 gap-2 w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyPaymentLink}
                        className="h-10 rounded-md text-xs"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {t("scanToPay.qrCode.copy")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">{t("scanToPay.qrCode.copy")}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={sharePaymentLink}
                        className="h-10 rounded-md text-xs"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        {t("scanToPay.qrCode.share")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">{t("scanToPay.qrCode.share")}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={regenerateQRCode}
                        className="h-10 rounded-md text-xs"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("scanToPay.qrCode.refresh")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">{t("scanToPay.qrCode.refresh")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}

            <div className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground pt-1.5 sm:pt-2">
              <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-500" />
              <span>{t("checkout.secure_payment")}</span>
            </div>

            {activeTab === 'qr-code' && (
              <Button
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="w-full h-12 sm:h-12 text-sm sm:text-base mt-3 sm:mt-2 rounded-md"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    {t("scanToPay.qrCode.verifying")}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    {t("checkout.completed_payment")}
                  </div>
                )}
              </Button>
            )}
          </CardFooter>
        )}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default QRCodePayment;
