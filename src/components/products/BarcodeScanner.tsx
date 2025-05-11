
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Barcode,
  X,
  Plus,
  Loader2,
  Camera,
  Smartphone,
  Zap,
  ZapOff,
  RotateCw,
  Copy,
  Scan
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType, Result } from '@zxing/library';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ScannedBarcode {
  value: string;
  format: string;
  timestamp: number;
}

interface ScanStatistics {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  scansByFormat: Record<string, number>;
  lastScanTime: number | null;
  averageScanTime: number | null;
}

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onProductNotFound?: (barcode: string) => void;
  onBulkScan?: (barcodes: string[]) => void;
  buttonLabel?: string;
  buttonVariant?: "default" | "outline" | "secondary";
  showIcon?: boolean;
  initialMode?: 'single' | 'continuous';
  maxBulkScans?: number;
  enableHistory?: boolean;
  historyLimit?: number;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onDetected,
  onProductNotFound,
  onBulkScan,
  buttonLabel = "Scan Product",
  buttonVariant = "outline",
  showIcon = true,
  initialMode = 'single',
  maxBulkScans = 50,
  enableHistory = true,
  historyLimit = 10
}) => {
  const { t } = useTranslation();
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual' | 'bulk'>('camera');
  const [operationMode, setOperationMode] = useState<'single' | 'continuous'>(initialMode);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [scanGuideVisible, setScanGuideVisible] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('scanner');
  const [showSettings, setShowSettings] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scanDelay, setScanDelay] = useState(500); // ms between scans

  // Barcode state
  const [manualBarcode, setManualBarcode] = useState('');
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [lastScannedFormat, setLastScannedFormat] = useState<string | null>(null);
  const [searchingProduct, setSearchingProduct] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScannedBarcode[]>([]);
  const [bulkScannedBarcodes, setBulkScannedBarcodes] = useState<ScannedBarcode[]>([]);
  const [scanStats, setScanStats] = useState<ScanStatistics>({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0,
    scansByFormat: {},
    lastScanTime: null,
    averageScanTime: null
  });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanAttempts = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const scanStartTimeRef = useRef<number | null>(null);
  const scanTimesRef = useRef<number[]>([]);
  const continuousModeRef = useRef<boolean>(initialMode === 'continuous');
  const lastDetectedBarcodeRef = useRef<string | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);

  // Function to provide haptic feedback if available
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      // Short vibration for 100ms
      navigator.vibrate(100);
    }
  };

  // Toggle flashlight
  const toggleFlashlight = async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      // Check if torch is supported (non-standard property)
      if ((capabilities as any).torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashlightOn } as any]
        });
        setFlashlightOn(!flashlightOn);
      } else {
        toast.error("Flashlight not supported on this device");
      }
    } catch (error) {
      console.error("Error toggling flashlight:", error);
      toast.error("Failed to toggle flashlight");
    }
  };

  // Switch camera between front and back
  const switchCamera = () => {
    const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(newFacing);

    // Restart scanning with new camera
    if (scanning) {
      stopScanning();
      setTimeout(() => startScanning(), 300);
    }
  };

  // Function to toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!dialogRef.current) return;

    if (!document.fullscreenElement) {
      dialogRef.current.requestFullscreen().catch(err => {
        toast.error("Fullscreen mode is not supported by your browser");
      });
      setFullscreenMode(true);
    } else {
      document.exitFullscreen();
      setFullscreenMode(false);
    }
  };

  // Function to apply camera zoom
  const applyCameraZoom = async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      // Check if zoom is supported
      if ((capabilities as any).zoom) {
        const min = (capabilities as any).zoom.min || 1;
        const max = (capabilities as any).zoom.max || 10;

        // Scale our zoom level to the camera's capabilities
        const scaledZoom = min + (zoomLevel * (max - min));

        await track.applyConstraints({
          advanced: [{ zoom: scaledZoom } as any]
        });

        toast.success(`Zoom level set to ${zoomLevel.toFixed(1)}x`);
      } else {
        toast.error("Zoom is not supported on this device");
      }
    } catch (error) {
      console.error("Error applying zoom:", error);
    }
  };

  // Function to update scan statistics
  const updateScanStats = (barcode: string, format: string, success: boolean) => {
    const now = Date.now();
    const scanTime = scanStartTimeRef.current ? now - scanStartTimeRef.current : null;

    if (scanTime) {
      scanTimesRef.current.push(scanTime);
      // Keep only the last 20 scan times for average calculation
      if (scanTimesRef.current.length > 20) {
        scanTimesRef.current.shift();
      }
    }

    setScanStats(prev => {
      const newScansByFormat = { ...prev.scansByFormat };
      if (format) {
        newScansByFormat[format] = (newScansByFormat[format] || 0) + 1;
      }

      return {
        totalScans: prev.totalScans + 1,
        successfulScans: success ? prev.successfulScans + 1 : prev.successfulScans,
        failedScans: !success ? prev.failedScans + 1 : prev.failedScans,
        scansByFormat: newScansByFormat,
        lastScanTime: now,
        averageScanTime: scanTimesRef.current.length > 0
          ? scanTimesRef.current.reduce((a, b) => a + b, 0) / scanTimesRef.current.length
          : prev.averageScanTime
      };
    });

    // Reset scan start time for next scan
    scanStartTimeRef.current = null;
  };

  const startScanning = async () => {
    try {
      setScanning(true);
      setCameraError(null);
      scanAttempts.current = 0;
      scanStartTimeRef.current = Date.now();
      continuousModeRef.current = operationMode === 'continuous';

      // If in bulk mode, clear previous scans
      if (scanMode === 'bulk') {
        setBulkScannedBarcodes([]);
      }

      // First, try to directly access the camera to ensure it's working
      try {
        console.log("Attempting to access camera directly...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }
        });

        // If we get here, camera access was successful
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          console.log("Camera accessed successfully, video element updated");
        }

        // Initialize the barcode reader with expanded formats for better compatibility
        const hints = new Map();
        const formats = [
          // 1D Product
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_128,

          // 1D Industrial
          BarcodeFormat.CODE_93,
          BarcodeFormat.CODABAR,
          BarcodeFormat.ITF,

          // 2D
          BarcodeFormat.QR_CODE,
          BarcodeFormat.DATA_MATRIX,
          BarcodeFormat.AZTEC,
          BarcodeFormat.PDF_417,

          // Other
          BarcodeFormat.MAXICODE,
          BarcodeFormat.RSS_14,
          BarcodeFormat.RSS_EXPANDED
        ];
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        hints.set(DecodeHintType.TRY_HARDER, true);
        hints.set(DecodeHintType.ASSUME_GS1, false);

        // Create a new reader instance with enhanced settings
        const reader = new BrowserMultiFormatReader(hints, scanDelay); // configurable timeout
        readerRef.current = reader;

        // Get video constraints with preferred camera
        const constraints = {
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }
        };

        // Start continuous scanning with improved error handling
        try {
          // Reset the video element's srcObject to ensure ZXing can access it properly
          if (videoRef.current) {
            // Stop the previous stream if it exists
            if (videoRef.current.srcObject) {
              const oldStream = videoRef.current.srcObject as MediaStream;
              oldStream.getTracks().forEach(track => track.stop());
            }
          }

          await reader.decodeFromConstraints(
            constraints,
            videoRef.current!,
            (result: Result | null, error: Error | undefined) => {
              if (result) {
                // Barcode detected
                const barcode = result.getText();
                const format = result.getBarcodeFormat();
                const formatName = BarcodeFormat[format];
                const now = Date.now();

                // In continuous mode, prevent duplicate scans within a short time window
                if (continuousModeRef.current &&
                    barcode === lastDetectedBarcodeRef.current &&
                    now - lastDetectionTimeRef.current < 2000) {
                  return; // Skip duplicate scan
                }

                // Update references for duplicate detection
                lastDetectedBarcodeRef.current = barcode;
                lastDetectionTimeRef.current = now;

                // Provide haptic feedback on successful scan
                triggerHapticFeedback();

                // Play sound if enabled
                if (soundEnabled) {
                  const audio = new Audio('/sounds/beep-success.mp3');
                  audio.volume = 0.3;
                  audio.play().catch(e => console.log('Audio play failed:', e));
                }

                // Store format information
                setLastScannedFormat(formatName);

                // Update scan statistics
                updateScanStats(barcode, formatName, true);

                // Handle the detected barcode based on the current mode
                if (scanMode === 'bulk') {
                  // In bulk mode, add to the list of scanned barcodes
                  const scannedBarcode: ScannedBarcode = {
                    value: barcode,
                    format: formatName,
                    timestamp: now
                  };

                  setBulkScannedBarcodes(prev => {
                    // Check if this barcode is already in the list
                    if (!prev.some(b => b.value === barcode)) {
                      const newBarcodes = [...prev, scannedBarcode];

                      // Show toast notification
                      toast.success(
                        <div className="flex items-center gap-2">
                          <Scan className="h-4 w-4" />
                          <div>
                            <p className="font-medium">Barcode scanned</p>
                            <p className="text-xs text-muted-foreground">
                              {barcode} ({newBarcodes.length}/{maxBulkScans})
                            </p>
                          </div>
                        </div>
                      );

                      // If we've reached the maximum, stop scanning
                      if (newBarcodes.length >= maxBulkScans) {
                        stopScanning();
                        toast.info(`Maximum of ${maxBulkScans} barcodes reached`);
                      }

                      return newBarcodes;
                    }
                    return prev;
                  });

                  // In continuous mode, keep scanning
                  if (!continuousModeRef.current) {
                    stopScanning();
                  }
                } else {
                  // In regular mode, process the barcode
                  handleBarcodeDetected(barcode, formatName);
                }
              }

              if (error && !(error instanceof TypeError)) {
                // Ignore TypeError as it's often just a frame without a barcode
                scanAttempts.current++;
                console.log("Scan attempt error:", error);

                // If we've had too many errors, show a helpful message
                if (scanAttempts.current > 50) {
                  console.error("Multiple scanning errors:", error);
                  setCameraError("Having trouble scanning? Try adjusting lighting or distance.");
                  scanAttempts.current = 0;

                  // Update scan statistics for failed scan
                  updateScanStats("", "", false);
                }
              }
            }
          );

          // Store the stream for cleanup and flashlight control
          if (videoRef.current && videoRef.current.srcObject) {
            streamRef.current = videoRef.current.srcObject as MediaStream;
            console.log("Stream stored for cleanup and control");

            // Apply zoom if set
            if (zoomLevel !== 1) {
              applyCameraZoom();
            }

            // Check if flashlight was previously on and try to restore it
            if (flashlightOn) {
              try {
                const track = streamRef.current.getVideoTracks()[0];
                const capabilities = track.getCapabilities();

                if ((capabilities as any).torch) {
                  await track.applyConstraints({
                    advanced: [{ torch: true } as any]
                  });
                }
              } catch (e) {
                console.log("Could not restore flashlight state:", e);
                setFlashlightOn(false);
              }
            }
          } else {
            console.warn("Video element has no srcObject after decodeFromConstraints");
          }
        } catch (error) {
          console.error("Error starting barcode scanner:", error);

          // Fallback: If ZXing fails to initialize the camera, we'll use our direct stream
          if (streamRef.current && videoRef.current) {
            console.log("Using fallback camera stream");
            videoRef.current.srcObject = streamRef.current;

            // We can't scan barcodes without ZXing, so show an error
            setCameraError("Barcode scanner initialization failed, but camera is working. Please try again.");
          } else {
            setCameraError("Failed to start barcode scanner. Please try again.");
          }

          setScanning(false);
        }
      } catch (cameraError) {
        console.error("Error accessing camera directly:", cameraError);
        setCameraError("Could not access camera. Please check permissions and ensure no other app is using your camera.");
        toast.error(t("scanToPay.barcodeScanner.permissionDenied"));
        setScanning(false);
      }
    } catch (error) {
      console.error("Unexpected error in startScanning:", error);
      setCameraError("An unexpected error occurred. Please try again.");
      toast.error(t("scanToPay.barcodeScanner.initFailed"));
      setScanning(false);
    }
  };

  const handleBarcodeDetected = (barcode: string, format: string = 'UNKNOWN') => {
    // In continuous mode, don't stop scanning
    if (!continuousModeRef.current) {
      stopScanning();
    }

    // Add to scan history if enabled
    if (enableHistory) {
      const scannedBarcode: ScannedBarcode = {
        value: barcode,
        format: format,
        timestamp: Date.now()
      };

      setScanHistory(prev => {
        // Check if this barcode is already in the history
        if (!prev.some(b => b.value === barcode)) {
          return [scannedBarcode, ...prev].slice(0, historyLimit); // Keep limited history
        }
        return prev;
      });
    }

    setLastScannedBarcode(barcode);

    // Search for the product
    searchProduct(barcode);
  };

  const searchProduct = (barcode: string) => {
    setSearchingProduct(true);

    // Simulate network delay for better UX
    setTimeout(() => {
      try {
        // Search for product using the provided barcode
        onDetected(barcode);
        setSearchingProduct(false);

        // In continuous mode, don't close the dialog
        if (!continuousModeRef.current) {
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Error processing barcode:", error);
        toast.error("Failed to process barcode. Please try again.");
        setSearchingProduct(false);
      }
    }, 600);
  };

  const stopScanning = () => {
    console.log("Stopping scanner...");

    // Stop the ZXing reader
    if (readerRef.current) {
      try {
        readerRef.current.reset();
        console.log("ZXing reader reset");
      } catch (e) {
        console.error("Error resetting ZXing reader:", e);
      }
      readerRef.current = null;
    }

    // Stop the camera stream
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log(`Track ${track.kind} stopped`);
        });
      } catch (e) {
        console.error("Error stopping media tracks:", e);
      }
      streamRef.current = null;
    }

    // Also ensure video element is cleared
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
        console.log("Video element stream cleared");
      } catch (e) {
        console.error("Error clearing video element:", e);
      }
    }

    // Reset flashlight state
    setFlashlightOn(false);
    setScanning(false);

    // If in fullscreen mode, exit
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error("Error exiting fullscreen:", err);
      });
      setFullscreenMode(false);
    }

    console.log("Scanner stopped completely");
  };

  // Function to process bulk scanned barcodes
  const processBulkScans = () => {
    if (bulkScannedBarcodes.length === 0) {
      toast.error("No barcodes have been scanned");
      return;
    }

    // Extract barcode values
    const barcodes = bulkScannedBarcodes.map(b => b.value);

    // Call the bulk scan handler if provided
    if (onBulkScan) {
      onBulkScan(barcodes);
      toast.success(`Processed ${barcodes.length} barcodes`);
      setBulkScannedBarcodes([]);
      setIsOpen(false);
    } else {
      // If no bulk handler, process the first barcode
      searchProduct(barcodes[0]);
      toast.info("Bulk processing not configured, using first barcode");
    }
  };

  // Function to export scan history
  const exportScanHistory = () => {
    if (scanHistory.length === 0) {
      toast.error("No scan history to export");
      return;
    }

    try {
      // Create CSV content
      const csvContent = [
        "Barcode,Format,Timestamp",
        ...scanHistory.map(scan =>
          `"${scan.value}","${scan.format}","${new Date(scan.timestamp).toISOString()}"`)
      ].join("\n");

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode-scan-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Scan history exported successfully");
    } catch (error) {
      console.error("Error exporting scan history:", error);
      toast.error("Failed to export scan history");
    }
  };

  // Function to clear scan history
  const clearScanHistory = () => {
    setScanHistory([]);
    toast.success("Scan history cleared");
  };

  // Function to handle manual barcode entry
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      // Add to scan history
      const newScanItem: ScannedBarcode = {
        value: manualBarcode,
        format: 'MANUAL',
        timestamp: Date.now()
      };

      // Check if this barcode is already in the history
      if (!scanHistory.some(item => item.value === manualBarcode)) {
        setScanHistory(prev => [newScanItem, ...prev].slice(0, historyLimit));
      }

      setLastScannedBarcode(manualBarcode);
      setLastScannedFormat('MANUAL');
      searchProduct(manualBarcode);
    }
  };

  // Handle adding a new product when not found
  const addNewProduct = () => {
    if (lastScannedBarcode) {
      // If onProductNotFound callback is provided, use it
      if (onProductNotFound) {
        onProductNotFound(lastScannedBarcode);
      } else {
        // Otherwise use the default behavior
        onDetected(lastScannedBarcode);
      }
      setIsOpen(false);
    }
  };

  // Function to use a previously scanned barcode from history
  const useHistoryBarcode = (barcode: ScannedBarcode) => {
    setLastScannedBarcode(barcode.value);
    setLastScannedFormat(barcode.format || 'HISTORY');
    searchProduct(barcode.value);
  };

  // Effect to check camera permissions when dialog opens
  useEffect(() => {
    if (isOpen && !scanning) {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Browser doesn't support getUserMedia");
        setCameraError("Your browser doesn't support camera access. Please try a different browser.");
        return;
      }

      // Just check if we can access the camera without actually starting it
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          // We got access, now stop the stream immediately
          stream.getTracks().forEach(track => track.stop());
          console.log("Camera permission check passed");
        })
        .catch(error => {
          console.error("Camera permission check failed:", error);
          setCameraError("Camera access denied. Please check your browser permissions.");
        });
    }
  }, [isOpen]);

  // Cleanup function when component unmounts
  useEffect(() => {
    return () => {
      console.log("Component unmounting, cleaning up resources");
      if (readerRef.current) {
        try {
          readerRef.current.reset();
        } catch (e) {
          console.error("Error cleaning up reader:", e);
        }
      }

      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach(track => track.stop());
        } catch (e) {
          console.error("Error cleaning up stream:", e);
        }
      }

      if (videoRef.current && videoRef.current.srcObject) {
        try {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        } catch (e) {
          console.error("Error cleaning up video element:", e);
        }
      }
    };
  }, []);

  return (
    <>
      <Button
        variant={buttonVariant}
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        {showIcon && <Barcode className="h-4 w-4" />}
        <span className="hidden sm:inline">{buttonLabel}</span>
        <span className="sm:hidden">Scan</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          // Stop scanning when dialog is closed
          stopScanning();
        }
        setIsOpen(open);
      }}>
        <DialogContent className="sm:max-w-4xl w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{t("scanToPay.barcodeScanner.title")}</span>
              {lastScannedFormat && lastScannedBarcode && (
                <Badge variant="outline" className="ml-2">
                  {lastScannedFormat}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {t("scanToPay.barcodeScanner.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait" key="scanner">
              {scanning ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted"
                >
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover"
                    playsInline
                    muted
                    autoPlay
                    style={{
                      transform: 'scaleX(1)', // Ensure correct orientation
                      maxHeight: 'calc(100vh - 300px)' // Prevent overflow on smaller screens
                    }}
                  ></video>

                  {/* Animated scanning guide */}
                  {scanGuideVisible && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <motion.div
                        className="w-1/2 h-1/2 border-4 border-primary rounded-lg"
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                      <motion.div
                        className="absolute w-full h-[3px] bg-primary/70"
                        initial={{ top: "25%" }}
                        animate={{ top: ["25%", "75%", "25%"] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      />
                    </motion.div>
                  )}

                  {/* Camera controls */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm"
                      onClick={toggleFlashlight}
                    >
                      {flashlightOn ? (
                        <ZapOff className="h-4 w-4 text-yellow-300" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm"
                      onClick={switchCamera}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm"
                      onClick={stopScanning}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="absolute bottom-4 left-2 right-2 flex justify-center">
                    <p className="text-sm font-medium text-white bg-black/70 px-4 py-2 rounded-full">
                      {t("scanToPay.barcodeScanner.centerBarcode")}
                    </p>
                  </div>
                </motion.div>
              ) : cameraError ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-destructive">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-destructive">{t("scanToPay.barcodeScanner.cameraError")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{cameraError}</p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCameraError(null);
                          startScanning();
                        }}
                        className="w-full"
                      >
                        {t("scanToPay.barcodeScanner.tryAgain")}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : lastScannedBarcode && !searchingProduct ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{t("scanToPay.barcodeScanner.scannedBarcode")}</span>
                        {lastScannedFormat && (
                          <Badge variant="outline">{lastScannedFormat}</Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-center p-4 bg-muted rounded-md">
                        <p className="font-mono text-center text-xl select-all">{lastScannedBarcode}</p>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(lastScannedBarcode || '');
                            toast.success(t("scanToPay.barcodeScanner.copiedToClipboard"));
                          }}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {t("scanToPay.barcodeScanner.copy")}
                        </Button>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setLastScannedBarcode(null);
                          startScanning();
                        }}
                      >
                        {t("scanToPay.barcodeScanner.scanAgain")}
                      </Button>
                      <Button onClick={addNewProduct}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("scanToPay.barcodeScanner.addProduct")}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : searchingProduct ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center py-8 gap-2"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">{t("scanToPay.barcodeScanner.searchingProduct")}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="options"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      onClick={startScanning}
                      className="flex flex-col items-center py-6 h-auto"
                    >
                      <Camera className="h-8 w-8 mb-2" />
                      <span>{t("scanToPay.barcodeScanner.cameraScan")}</span>
                    </Button>
                  </div>

                  {/* Recent scans section */}
                  {scanHistory.length > 0 && (
                    <div className="mt-2">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            {t("scanToPay.barcodeScanner.recentScans")}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {scanHistory.map((barcode, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80 transition-colors"
                            onClick={() => useHistoryBarcode(barcode)}
                          >
                            {barcode.value.length > 12 ? barcode.value.substring(0, 10) + '...' : barcode.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual entry form - always visible when not scanning */}
            {!scanning && (
              <>
                <div className="relative mt-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t("scanToPay.barcodeScanner.manualEntry")}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleManualSearch} className="flex gap-2">
                  <div className="grid flex-1 gap-2">
                    <Label htmlFor="barcode-input">
                      {t("scanToPay.barcodeScanner.barcodeNumber")}
                    </Label>
                    <Input
                      id="barcode-input"
                      placeholder={t("scanToPay.barcodeScanner.enterBarcode")}
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                    />
                  </div>
                  <div className="self-end">
                    <Button type="submit" disabled={searchingProduct || !manualBarcode.trim()}>
                      {t("scanToPay.barcodeScanner.search")}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                stopScanning();
                setIsOpen(false);
              }}
            >
              {t("scanToPay.barcodeScanner.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarcodeScanner;
